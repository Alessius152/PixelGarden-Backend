
import PrivateRoom from "../../database/models/PrivateRoom.model.js"
import PRoomMembershipJoinInvites from "../../database/models/PRoomMembershipJoinInvites.model.js"
import { uuidToBuffer } from "../../functions/elaboration.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"

const sentJoinInviteCancelingController: fastifyController = async (request, reply) => {

    const { inviteId } = request.body as { inviteId: string }
    const internalUser = request.internalUser!

    const bufferizedInviteId = uuidToBuffer(inviteId)

    try {

        const invite = await PRoomMembershipJoinInvites.findOne({
            where: {
                inviteId: bufferizedInviteId,
                inviter: internalUser.id
            },
            include: {
                model: PrivateRoom,
                as: 'room',
                attributes: ['name'],
            },
            attributes: ['id', 'invitee', 'roomId']
        })

        if (!invite) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.CANCEL_ROOM_JOIN_INVITE__INVITE_NOT_FOUND
            })
            return
        }

        const { invitee, roomId } = invite.dataValues
        const room = invite.dataValues.room

        await invite.destroy({})
        reply.send({})

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_CANCELING_ROOM_SENT_JOIN_INVITE')
        return
    }

}

export {
    sentJoinInviteCancelingController,
}
