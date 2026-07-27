
import { getPortionOfFriendsList } from "../../database/functions/fetching/friends.js"
import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"
import { friendsListCursor_forDatabase } from "../../types/tieBreakCursors.js"

const friendsListFetchingController: fastifyController = async (request, reply) => {
    
    const { cursor1, cursor2 } = request.query as { cursor1: string, cursor2: string }
    const internalUser = request.internalUser!

    let bufferizedCursor2: Buffer

    if (cursor2 === '0') {
        bufferizedCursor2 = Buffer.alloc(16, 0)
    }
    else {
        bufferizedCursor2 = uuidToBuffer(cursor2)
    }

    try {

        const cursor: friendsListCursor_forDatabase = {
            username: cursor1,
            relationId: bufferizedCursor2,
        }
        const { result, nextCursor, isTheLastPage, totalRecords } = await getPortionOfFriendsList(cursor, internalUser.id)

        reply.send({
            result,
            nextCursor: { cursor1: nextCursor.username, cursor2: nextCursor.relationId },
            isTheLastPage,
            totalRecords
        })

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_DURING_FRIENDS_LIST_FETCH')
        return
    }

}

export {
    friendsListFetchingController,
}
