
import Friendship from "../../database/models/Friendship.model.js"
import Pivot_User_PrivateRoom from "../../database/models/Pivot_User_PrivateRoom.model.js"
import PrivateRoom from "../../database/models/PrivateRoom.model.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"
import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"
import PRoomMembershipJoinInvites from "../../database/models/PRoomMembershipJoinInvites.model.js"
import { uuidv7 } from "uuidv7"
import { membersAddingBody } from "../../objects/validationSchemas/rooms.js"
import { getUserNotificationsChannel } from "../../ably/utils.js"
import { Op, Transaction, UniqueConstraintError } from "sequelize"
import databaseInterface from "../../database/config.js"
import User from "../../database/models/User.model.js"
import { notification__homepageNotificationsChannel__newFriendshipRequestReceived, notification__homepageNotificationsChannel__newRoomJoinInvite } from "../../types/ablyNotifications.js"
import { realtimeHomepageNotificationKeys } from "../../ably/objects/homeNotificationKeys.js"

/*
tests da fare

- utente che invita due amici non membri
- utente che invita due amici, di cui uno già membro
- utente che invita due amici, entrambi già membri
- utente che invita due utenti non amici

non ha senso controllare che io voglia invitare me stesso nella
stanza perché io appoggio l'elaborazione di questa API 
sull'esistenza dei relationId, degli uuidv7 legati all'amicizia.

L'API è come un firewall che impedisce la creazione di un relationId
quando provo a inviare una richiesta di amicizia a me stesso.

Quindi per aggirare il sistema dovrei avere un relationId che fino
a prova contraria è totalmente impossibile da generare.
*/

const membersAddingController: fastifyController = async (request, reply) => {

    const { roomId, commit } = request.body as membersAddingBody
    const internalUser = request.internalUser!

    let transaction: Transaction | null = null

    try {

        transaction = await databaseInterface.transaction()

        const room = await PrivateRoom.findOne({
            attributes: ['id', 'name'],
            where: {
                uuidv7: uuidToBuffer(roomId),
                creatorId: internalUser.id
            },
            transaction
        })

        if (!room) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.GENERIC_ROOM_NOT_FOUND
            })
            return
        }

        const { add } = commit
        const addWithoutDuplicates = [...(new Set(add))]

        if (!addWithoutDuplicates.length) {
            reply.status(HttpStatusCode.UNPROCESSABLE_ENTITY).send({
                error: serverAPIErrorCode.ADD_MEMBERS_IN_A_ROOM__SPECIFIED_NON_VALID_MEMBERS
            })
            return
        }

        const relations = (await Friendship.findAll({
            attributes: ['user1', 'user2'],
            where: {
                relationId: addWithoutDuplicates.map(uuid => uuidToBuffer(uuid)),
                [Op.or]: [
                    { user1: internalUser.id },
                    { user2: internalUser.id }
                ]
            },
            raw: true,
            transaction
        })) as unknown as Array<{ user1: number, user2: number }>

        if (!relations.length) {
            reply.status(HttpStatusCode.UNPROCESSABLE_ENTITY).send({
                error: serverAPIErrorCode.ADD_MEMBERS_IN_A_ROOM__NON_OF_THESE_RELATIONS_EXISTS
            })
            return
        }

        const filteredFriends = relations.map(({ user1, user2 }) => (user1 === internalUser.id) ? user2 : user1)

        const friendsUuid = (
            (await User.findAll({
                attributes: [['id', 'friendPk'], ['uuidv7', 'friendUuid']],
                where: {
                    id: filteredFriends
                },
                raw: true,
                transaction,
            })) as unknown as Array<{ friendPk: number, friendUuid: Buffer }>
        ).map(({ friendPk, friendUuid }) => ({
            friendPk,
            friendUuid: bufferToUuid(friendUuid)
        }))

        const members = (await Pivot_User_PrivateRoom.findAll({
            attributes: ['id', 'userId'],
            where: {
                roomId: room.dataValues.id
            },
            raw: true,
            transaction
        })) as unknown as Array<{ id: number, userId: number }>

        const filteredFriendsByNonMember = filteredFriends.filter(pk => !members.some(({ id, userId }) => userId === pk))

        if (!filteredFriendsByNonMember.length) {
            reply.status(HttpStatusCode.UNPROCESSABLE_ENTITY).send({
                error: serverAPIErrorCode.ADD_MEMBERS_IN_A_ROOM__SPECIFIED_NON_VALID_MEMBERS
            })
            return
        }

        const alreadyInvited = (await PRoomMembershipJoinInvites.findAll({
            attributes: ['invitee'],
            where: {
                roomId: room.dataValues.id,
                inviter: internalUser.id,
                invitee: filteredFriendsByNonMember
            },
            raw: true,
            transaction
        })) as unknown as Array<{ invitee: number }>

        const filteredByNonAlreadyInvited = filteredFriendsByNonMember.filter(pk => !alreadyInvited.some(({ invitee }) => invitee === pk))

        if (!filteredByNonAlreadyInvited.length) {
            reply.status(HttpStatusCode.UNPROCESSABLE_ENTITY).send({
                error: serverAPIErrorCode.ADD_MEMBERS_IN_A_ROOM__SPECIFIED_NON_VALID_MEMBERS
            })
            return
        }

        const mapInvitedFriendToInviteUuid: Record<number, string> = {}

        const invites = filteredByNonAlreadyInvited.map(user => {
            const uuid = uuidv7()
            mapInvitedFriendToInviteUuid[user] = uuid
            const bfrzd = uuidToBuffer(uuid)
            return {
                inviteId: bfrzd,
                roomId: room.dataValues.id,
                inviter: internalUser.id,
                invitee: user,
            }
        })

        await PRoomMembershipJoinInvites.bulkCreate(invites, { transaction })
        await transaction.commit()

        reply.send({
            invitesSent: invites.length
        })

        for (const { friendPk, friendUuid } of friendsUuid) {
            if (!mapInvitedFriendToInviteUuid[friendPk]) continue
            
            const notificationsChannelName = getUserNotificationsChannel(friendUuid)
            const payload: notification__homepageNotificationsChannel__newRoomJoinInvite = {
                from: [internalUser.username, internalUser.userIdentification.userId],
                inviteId: mapInvitedFriendToInviteUuid[friendPk],
                roomName: room.dataValues.name
            }
            notificationsChannelName.publish(realtimeHomepageNotificationKeys.RECEIVED_NEW_ROOM_JOIN_INVITE, payload)
        }

        return

    }
    catch (err) {
        if (transaction) {
            await transaction.rollback()
        }
        if (err instanceof UniqueConstraintError) {
            reply.status(HttpStatusCode.CONFLICT).send({
                error: serverAPIErrorCode.ADD_MEMBERS_IN_A_ROOM__SOME_USER_ALREADY_INVITED
            })
        } else {
            reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
                error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
            })
        }
        request.log.error({ err }, 'ER_ADDING_ROOM_MEMBERS')
        return
    }

}

export {
    membersAddingController,
}
