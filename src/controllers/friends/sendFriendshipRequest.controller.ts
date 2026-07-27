
import { UniqueConstraintError } from "sequelize"
import { uuidv7 } from "uuidv7"

import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"
import { generatePairKey } from "../../functions/generations.js"
import { normalizeDateToItalian, uuidToBuffer } from "../../functions/elaboration.js"

import Friendship from "../../database/models/Friendship.model.js"
import FriendshipRequest from "../../database/models/FriendshipRequest.model.js"
import { checkUserExistanceByBufferizedUserUUID } from "../../database/functions/fetching/authentication.js"
import { getUserNotificationsChannel } from "../../ably/utils.js"
import { realtimeHomepageNotificationKeys } from "../../ably/objects/homeNotificationKeys.js"
import { notification__homepageNotificationsChannel__newFriendshipRequestReceived } from "../../types/ablyNotifications.js"

const sendFriendshipRequestController: fastifyController = async (request, reply) => {

    const { destinataryUuid } = request.body as { destinataryUuid: string }
    const internalUser = request.internalUser!

    if (destinataryUuid === internalUser.userIdentification.stringUuidv7) {
        reply.status(HttpStatusCode.CONFLICT).send({
            error: serverAPIErrorCode.SEND_FSHIP_REQ__CANNOT_SEND_TO_YOURSELF
        })
        return
    }

    try {

        const bufferizedDestinataryUuid = uuidToBuffer(destinataryUuid)
        const destinataryUser = await checkUserExistanceByBufferizedUserUUID(bufferizedDestinataryUuid)

        if (!destinataryUser) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.SEND_FSHIP_REQ__DESTINATARY_DOESNT_EXISTS
            })
            return
        }

        const requestUuid = uuidv7()
        const requestId = uuidToBuffer(requestUuid)
        const pairKey = generatePairKey(internalUser.id, destinataryUser.user.id)
        const lessThan = internalUser.id < destinataryUser.user.id
        const user1 = lessThan ? internalUser.id : destinataryUser.user.id
        const user2 = lessThan ? destinataryUser.user.id : internalUser.id

        const friendshipRecord = await Friendship.findOne({
            where: { user1, user2 }
        })

        if (friendshipRecord) {
            reply.status(HttpStatusCode.CONFLICT).send({
                error: serverAPIErrorCode.SEND_FSHIP_REQ__ALREADY_FRIENDS
            })
            return
        }

        const requestRecord = await FriendshipRequest.create({
            requestId,
            senderId: internalUser.id,
            receiverId: destinataryUser.user.id,
            pairKey,


        })

        reply.send({
            creationTime: normalizeDateToItalian(requestRecord.dataValues.createdAt),
            relationId: requestUuid
        })

        const channel = getUserNotificationsChannel(destinataryUuid)
        const notificationPayload: notification__homepageNotificationsChannel__newFriendshipRequestReceived = {
            from: {
                username: internalUser.username,
                userId: internalUser.userIdentification.userId
            },
            requestId: requestUuid,
            sentAt: requestRecord.dataValues.createdAt
        }

        channel.publish(realtimeHomepageNotificationKeys.RECEIVED_NEW_FRIENDSHIP_REQUEST, notificationPayload)

    }
    catch (err) {
        if (err instanceof UniqueConstraintError) {
            if (err.errors[0]?.instance instanceof FriendshipRequest) {
                reply.status(HttpStatusCode.CONFLICT).send({
                    error: serverAPIErrorCode.SEND_FSHIP_REQ__REQ_BETWEEN_YOU_ALREADY_EXISTS
                })
                return
            }
        }
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_DURING_F_REQ_SENDING')
        return
    }

}

export {
    sendFriendshipRequestController,
}
