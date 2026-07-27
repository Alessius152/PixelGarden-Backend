
import { fetchUsersByFilter } from "../../database/functions/fetching/search.js"
import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"

const filteredUsersController: fastifyController = async (request, reply) => {

    const { query, cursor } = request.query as { query: string, cursor: string }

    try {

        let bufferizedCursor

        if (cursor === '0') {
            bufferizedCursor = Buffer.alloc(16, 0)
        }
        else {
            bufferizedCursor = uuidToBuffer(cursor)
        }

        const { firsts, totalRecords, isTheLastPage, nextCursor } = await fetchUsersByFilter(query, bufferizedCursor)

        const formatted = firsts.map(user => ({ ...user, uuid: bufferToUuid(user.uuid) }))

        reply.send({
            firsts: formatted, totalRecords, isTheLastPage,
            nextCursor: (!nextCursor) ? nextCursor : bufferToUuid(nextCursor)
        })

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_FETCHING_FILTERED_USERS')
        return
    }

}

export {
    filteredUsersController,
}
