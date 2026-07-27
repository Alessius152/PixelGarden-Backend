
import { Model, ModelStatic, Op, Sequelize, Transaction, UniqueConstraintError } from "sequelize"
import Pivot_User_Pixelart from "../../database/models/Pivot_User_Pixelart.js"
import Pivot_User_PrivateRoom from "../../database/models/Pivot_User_PrivateRoom.model.js"
import Pixelart from "../../database/models/Pixelart.model.js"
import WorkingLayer from "../../database/models/WorkingLayer.model.js"
import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { artCollaboratorsAddingBody } from "../../objects/validationSchemas/arts.js"
import { fastifyController } from "../../types/global.js"
import databaseInterface from "../../database/config.js"
import PrivateRoom from "../../database/models/PrivateRoom.model.js"
import { getWRoomChannel } from "../../ably/utils.js"
import { notification__workingRoom__newCollaboratorsAdded } from "../../types/ablyNotifications.js"
import { realtimeWorkingRoomNotificationKeys } from "../../ably/objects/workingRoomNotificationKeys.js"
import User from "../../database/models/User.model.js"

const collaboratorsAddingController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { artId, commit } = request.body as artCollaboratorsAddingBody

    const bufferizedArtId = uuidToBuffer(artId)
    let transaction: Transaction | null = null

    try {

        transaction = await databaseInterface.transaction()

        const pixelart = await Pixelart.findOne({
            where: { artId: bufferizedArtId },
            attributes: ['id', 'workingLayerId', 'artId'],
            include: {
                model: WorkingLayer,
                as: 'referencedWorkingLayer',
                attributes: ['id', 'detentorId', 'roomId'],
                include: [{
                    model: PrivateRoom,
                    as: 'privateRoom',
                    attributes: ['uuidv7']
                }]
            },
            raw: true,
            nest: true,
            transaction
        }) as unknown as { id: number, artId: Buffer, workingLayerId: number, referencedWorkingLayer: { id: number, detentorId: number, roomId: number, privateRoom: { uuidv7: Buffer } } }

        if (!(pixelart && (pixelart.referencedWorkingLayer.detentorId === internalUser.id))) {
            await transaction.rollback()
            reply.status(HttpStatusCode.NOT_FOUND).send({ error: '' })
            return
        }

        const collaborators = await Pivot_User_Pixelart.findAll({
            where: { artId: pixelart.id },
            attributes: ['userId'],
            raw: true,
            transaction
        }) as unknown as Array<{ userId: number }>

        const collaboratorsPk = collaborators.map(c => Number(c.userId))

        const memberships = (await Pivot_User_PrivateRoom.findAll({
            where: {
                membershipId: { [Op.in]: commit.map(mId => uuidToBuffer(mId)) },
                roomId: pixelart.referencedWorkingLayer.roomId,
                userId: {
                    [Op.notIn]: collaboratorsPk.length ? collaboratorsPk : [-1]
                }
            },
            include: {
                model: User,
                as: 'member',
                attributes: ['userId', 'username']
            },
            attributes: ['userId'],
            raw: true,
            nest: true,
            transaction
        })) as unknown as Array<{ userId: number, member: {userId: string, username: string} }>

        if (!memberships.length) {
            await transaction.rollback()
            reply.status(HttpStatusCode.BAD_REQUEST).send({ error: '' })
            return
        }

        await Pivot_User_Pixelart.bulkCreate(
            memberships.map(m => ({
                userId: m.userId,
                artId: pixelart.id,
            })),
            { transaction }
        )

        await transaction.commit()

        reply.send({ count: memberships.length })

        const roomUuid = bufferToUuid(pixelart.referencedWorkingLayer.privateRoom.uuidv7)
        const roomChannel = getWRoomChannel(roomUuid)
        const packet: notification__workingRoom__newCollaboratorsAdded = {
            headers: {
                rtClientId: internalUser.userIdentification.stringUuidv7,
                userAt: internalUser.userIdentification.userId
            },
            artId: bufferToUuid(pixelart.artId),
            collaborators: memberships.map(m=>[m.member.userId, m.member.username])
        }
        await roomChannel.publish({
            name: realtimeWorkingRoomNotificationKeys.NEW_COLLABS_ADDED,
            data: packet
        })

    }
    catch (err) {
        if (transaction) {
            await transaction.rollback()
        }
        if (err instanceof UniqueConstraintError) {
            reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
                error: ''
            })
        }
        else {
            reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
                error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
            })
        }
        request.log.error({ err }, "ER_ADDING_ART_COLLABORATORS")
        return
    }

}

export {
    collaboratorsAddingController,
}
