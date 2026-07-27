
import { getPortionOfOwnerRooms } from "../../database/functions/fetching/rooms.js"
import { uuidToBuffer } from "../../functions/elaboration.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"

const getMyRoomsController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { cursor1, cursor2 } = request.query as { cursor1: string, cursor2: string }

    const bufferizedCursor = (cursor1 === '0') ? Buffer.alloc(16, 0) : uuidToBuffer(cursor1)

    try {

        const { isTheLastPage, nextCursor, result } = await getPortionOfOwnerRooms(internalUser.id, bufferizedCursor, cursor2)

        reply.send({ result, nextCursor, isTheLastPage })

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_FETCHING_OWN_ROOMS_LIST')
    }

}

export {
    getMyRoomsController
}
