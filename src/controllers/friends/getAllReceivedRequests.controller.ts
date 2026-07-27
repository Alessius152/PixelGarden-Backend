
import { getPortionOfFriendshipRequestsList } from "../../database/functions/fetching/friends.js"
import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"

const getAllReceivedRequestsController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { cursor } = request.query as { cursor: string }

    try {

        let bufferizedCursor: Buffer

        if (cursor === '0') {
            bufferizedCursor = Buffer.alloc(16, 0)
        }
        else {
            bufferizedCursor = uuidToBuffer(cursor)
        }

        const { result, nextCursor, isTheLastPage } = await getPortionOfFriendshipRequestsList(bufferizedCursor, internalUser.id, 'r')

        const formattedWithDebufferizedUuids = result.map(req => ({ ...req, requestId: bufferToUuid(req.requestId) }))

        reply.send({
            result: formattedWithDebufferizedUuids,
            nextCursor,
            isTheLastPage
        })

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })

        request.log.error({ err }, 'ER_DURING_SENDED_F_REQS_FETCHING')
        return
    }


}

export {
    getAllReceivedRequestsController,
}
