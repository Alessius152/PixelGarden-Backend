
import { Op } from "sequelize"
import { getPortionOfRoomsOfAFriendWhereImIn } from "../../database/functions/fetching/rooms.js"
import Friendship from "../../database/models/Friendship.model.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"
import { uuidToBuffer } from "../../functions/elaboration.js"

const getRoomsWhereImInController: fastifyController = async (request, reply) => {

    const { relationId, cursor1, cursor2 } = request.query as { relationId: string, cursor1: string, cursor2: string }
    const internalUser = request.internalUser!

    const bufferizedRelationId = uuidToBuffer(relationId)

    try {

        const friendshipRecord = await Friendship.findOne({
            attributes: ['user1','user2'],
            where: {
                relationId: bufferizedRelationId,
                [Op.or]: [
                    { user1: internalUser.id },
                    { user2: internalUser.id }
                ]
            }
        })

        if (!friendshipRecord) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.FETCH_ROOMS_WHICHIN_USER_IS_MEMBER__FRIENDSHIP_NOT_FOUND
            })
            return
        }

        const otherUser = (friendshipRecord.dataValues.user1 === internalUser.id) ?
            friendshipRecord.dataValues.user2 : friendshipRecord.dataValues.user1

        const bufferizedCursor1 = (cursor1 === '0') ? Buffer.alloc(16, 0) : uuidToBuffer(cursor1)
        const { result, isTheLastPage, nextCursor } = await getPortionOfRoomsOfAFriendWhereImIn(otherUser, internalUser.id, bufferizedCursor1, cursor2)

        reply.send({ result, isTheLastPage, nextCursor })
        return

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_DURING_FRIENDS_ROOM_WHERE_REQNT_IS_IN_FETCH')
        return
    }

}

export {
    getRoomsWhereImInController,
}
