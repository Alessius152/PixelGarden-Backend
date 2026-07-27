
import { Model, ModelCtor, SequelizeScopeError, Transaction } from "sequelize"
import PRoomMembershipJoinInvites from "../../database/models/PRoomMembershipJoinInvites.model.js"
import { uuidToBuffer } from "../../functions/elaboration.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { receivedJoinInvitesAnsweringBody } from "../../objects/validationSchemas/rooms.js"
import { fastifyController } from "../../types/global.js"
import databaseInterface from "../../database/config.js"
import Pivot_User_PrivateRoom from "../../database/models/Pivot_User_PrivateRoom.model.js"

import { uuidv7 } from 'uuidv7'
import WorkingLayer from "../../database/models/WorkingLayer.model.js"

const receivedJoinInviteAnsweringController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { inviteId, answer } = request.body as receivedJoinInvitesAnsweringBody

    const bufferizedInviteId = uuidToBuffer(inviteId)
    let transaction: Transaction | null = null

    try {

        const inviteRecord = await PRoomMembershipJoinInvites.findOne({
            where: { inviteId: bufferizedInviteId },
            attributes: ['id', 'inviter', 'invitee', 'roomId']
        })

        if ((!inviteRecord) || (inviteRecord.dataValues.invitee !== internalUser.id)) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.ANSWER_TO_ROOM_JOIN_INVITE__INVITE_NOT_FOUND
            })
            return
        }

        // const { inviter, invitee } = inviteRecord.dataValues
        const roomId = inviteRecord.dataValues.roomId

        // if (!(invitee === internalUser.id)) {
        //     reply.status(HttpStatusCode.NOT_FOUND).send({
        //         error: serverAPIErrorCode.ANSWER_TO_ROOM_JOIN_INVITE__INVITE_NOT_FOUND
        //     })
        //     return
        // } //just comment perché non so come mai ho fatto il controllo qui se l'ho già fatto sopra.

        let membershipRecord: Model<any, any> | null = null

        if (answer) {
            transaction = await databaseInterface.transaction()

            await inviteRecord.destroy({ transaction })

            membershipRecord = await Pivot_User_PrivateRoom.create({
                membershipId: uuidToBuffer(uuidv7()),
                roomId,
                userId: internalUser.id
            }, { transaction })

            await WorkingLayer.create({
                wLayerId: uuidToBuffer(uuidv7()),
                roomId,
                detentorId: internalUser.id
            }, { transaction })

            await transaction.commit()
        }
        else {
            await inviteRecord.destroy()
        }

        const answeredAt = membershipRecord?.dataValues.createdAt || null

        reply.send({ answeredAt })
        return

    }
    catch (err) {
        if (transaction) {
            await transaction.rollback()
        }

        request.log.error({ err }, "ER_ANSWERING_ROOM_JOIN_INVITE")

        if ((err as SequelizeScopeError).name === 'SequelizeUniqueConstraintError') {
            reply.status(HttpStatusCode.CONFLICT).send({
                error: serverAPIErrorCode.ANSWER_TO_ROOM_JOIN_INVITE__ALREADY_MEMBER
            })
            return
        }

        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        return
    }

}

export {
    receivedJoinInviteAnsweringController,
}
