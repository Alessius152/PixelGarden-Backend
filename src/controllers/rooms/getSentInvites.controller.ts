
import { getSentRoomJoiningInvites } from "../../database/functions/fetching/rooms.js"
import { uuidToBuffer } from "../../functions/elaboration.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"

const sentJoiningInvitesFetchingController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { cursor } = request.query as { cursor: string }

    let bufferizedCursor = (cursor === '0') ? Buffer.alloc(16, 0) : uuidToBuffer(cursor)

    try {

        const { result, nextCursor, isTheLastPage,totalRecords } = await getSentRoomJoiningInvites(internalUser.id, bufferizedCursor)

        reply.send({ result, nextCursor, isTheLastPage,totalRecords })

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_FETCHING_SENT_ROOM_JOINING_INVITES')
        return
    }

}

export {
    sentJoiningInvitesFetchingController,
}
