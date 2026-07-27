
import { getReceivedRoomJoiningInvites } from "../../database/functions/fetching/rooms.js"
import { uuidToBuffer } from "../../functions/elaboration.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"

const receivedJoiningInvitesFetchingController: fastifyController = async (request, reply) => {

    const { cursor } = request.query as { cursor: string }
    const internalUser = request.internalUser!

    try {

        const bufferizedCursor = (cursor === '0') ? Buffer.alloc(16, 0) : uuidToBuffer(cursor)
        const { result, nextCursor, isTheLastPage, totalRecords } = await getReceivedRoomJoiningInvites(internalUser.id, bufferizedCursor)

        reply.send({ result, nextCursor, isTheLastPage, totalRecords })

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_FETCHING_RECEIVED_ROOM_JOINING_INVITES')
        return
    }

}

export {
    receivedJoiningInvitesFetchingController,
}
