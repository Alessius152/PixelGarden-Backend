
import { uuidv7 } from "uuidv7"
import PrivateRoom from "../../database/models/PrivateRoom.model.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"
import { uuidToBuffer } from "../../functions/elaboration.js"
import { Transaction, UniqueConstraintError } from "sequelize"
import databaseInterface from "../../database/config.js"
import WorkingLayer from "../../database/models/WorkingLayer.model.js"

const createNewPrivateRoomController: fastifyController = async (request, reply) => {

    const { roomData } = request.body as {
        roomData: {
            name: string,
            description?: string
        }
    }

    const internalUser = request.internalUser!
    let transaction: Transaction | null = null

    try {

        const roomUuid = uuidv7()
        const bufferizedRoomUuid = uuidToBuffer(roomUuid)

        transaction = await databaseInterface.transaction()

        const room = await PrivateRoom.create({
            uuidv7: bufferizedRoomUuid,
            creatorId: internalUser.id,
            name: roomData.name,
            description: roomData.description || null,
        }, { transaction })

        await WorkingLayer.create({
            wLayerId: uuidToBuffer(uuidv7()),
            roomId: room.dataValues.id,
            detentorId: internalUser.id
        }, { transaction })

        await transaction.commit()

        reply.status(HttpStatusCode.CREATED).send({
            roomCreation: room.dataValues.createdAt,
            roomId: roomUuid,
        })
        return

    }
    catch (err) {
        if (transaction) {
            await transaction.rollback()
        }
        if (err instanceof UniqueConstraintError) {
            const { path } = err.errors[0]
            if (path === `${serverAPIErrorCode.CREATE_NEW_ROOM__ROOM_NAME_UNIQUENESS_VIOLATION}`) {
                reply.status(HttpStatusCode.CONFLICT).send({
                    error: serverAPIErrorCode.CREATE_NEW_ROOM__ROOM_NAME_UNIQUENESS_VIOLATION
                })
                return
            }
            return
        }
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_DURING_ROOM_CREATION')
        return
    }

}

export {
    createNewPrivateRoomController,
}
