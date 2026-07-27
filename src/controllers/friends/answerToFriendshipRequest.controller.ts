
import { uuidv7 } from "uuidv7"

import databaseInterface from "../../database/config.js"
import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"

import Friendship from "../../database/models/Friendship.model.js"
import FriendshipRequest from "../../database/models/FriendshipRequest.model.js"
import User from "../../database/models/User.model.js"
import { getUserNotificationsChannel } from "../../ably/utils.js"
import { realtimeHomepageNotificationKeys } from "../../ably/objects/homeNotificationKeys.js"
import { Model } from "sequelize"

const answerToFriendshipRequestController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { requestId, answer } = request.body as { requestId: string, answer: boolean }

    const bufferizedReqId = uuidToBuffer(requestId)
    const transaction = await databaseInterface.transaction()

    try {

        const requestRecord = await FriendshipRequest.findOne({
            where: {
                requestId: bufferizedReqId,
                receiverId: internalUser.id
            },
            attributes: ['id', 'requestId', 'senderId'],
            include: {
                model: User,
                attributes: ['uuidv7', 'username', 'userId', 'isOnline'],
                as: 'sender'
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        })


        if (!requestRecord) {
            await transaction.rollback()
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.ANSWER_TO_FSHIP_REQ__SPECIFIED_REQ_DOESNT_EXISTS
            })
            return
        }

        const sender = { ...requestRecord.dataValues.sender.dataValues }
        const { senderId } = requestRecord.dataValues
        const responseObj: Record<string, any> = { answer }

        await requestRecord.destroy({ transaction })

        let friendshipRecord: Model<any, any> | null = null
        let uuidFriendship = uuidv7()

        if (answer) {
            /*qui posso fare generatePairKey() ma qui ho necessità di controllare i due id 
            ordinati in ordine crescente.*/
            const sorted = [internalUser.id, senderId].sort((a, b) => a - b)
            const pairKey = sorted.join('_')

            // const uuid = uuidv7()
            const relationId = uuidToBuffer(uuidFriendship)
            friendshipRecord = await Friendship.create(
                {
                    pairKey,
                    relationId,
                    user1: sorted[0],
                    user2: sorted[1],

                },
                { transaction }
            )

            responseObj.friendship = {}
            responseObj.friendship.startingDate = friendshipRecord.dataValues.createdAt

            const { username, userId, isOnline } = sender

            responseObj.friendship.newFriend = {
                friend: username,
                friendId: userId,
                isOnline,
                relationId: uuidFriendship
            }
        }

        await transaction.commit()
        reply.send(responseObj)

        const senderChannel = getUserNotificationsChannel(bufferToUuid(requestRecord.dataValues.sender.dataValues.uuidv7))
        const notificationPayload = {
            request: requestId,
            with: { answer },
            friend: friendshipRecord ? {
                friend: internalUser.username,
                friendId: internalUser.userIdentification.userId,
                isOnline: 1,
                relationId: uuidFriendship
            } : null,
        }

        senderChannel.publish(realtimeHomepageNotificationKeys.RECEIVED_FRIENDSHIP_REQUEST_CANNOT_BE_CONSUMED, notificationPayload)

    }
    catch (err: any) {
        await transaction.rollback()
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_DURING_F_REQ_ANSWER')
    }

}

export {
    answerToFriendshipRequestController,
}
