
import databaseInterface from "../../database/config.js"
import FriendshipRequest from "../../database/models/FriendshipRequest.model.js"
import { uuidToBuffer } from "../../functions/elaboration.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"

const friendshipSentRequestCancelingController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { requestId } = request.body as { requestId: string }
    const bufferizedReqId = uuidToBuffer(requestId)
    const transaction = await databaseInterface.transaction()

    try {

        const requestRecord = await FriendshipRequest.findOne({
            where: {
                requestId: bufferizedReqId,
                senderId: internalUser.id
            },
            attributes: ['id', 'senderId'],
            transaction,
            lock: transaction.LOCK.UPDATE
        })

        if (!requestRecord) {
            await transaction.rollback()
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.CANCEL_SENT_FSHIP_REQ__REQ_NOT_FOUND
            })
            return
        }

        await requestRecord.destroy({ transaction })
        await transaction.commit()

        reply.send({
            deleted: true
        })
        return

    }
    catch (err) {
        await transaction.rollback()
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_CANCELING_SENT_F_REQ')
        return
    }

}

export {
    friendshipSentRequestCancelingController,
}
