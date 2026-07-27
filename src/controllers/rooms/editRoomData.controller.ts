
import PrivateRoom from "../../database/models/PrivateRoom.model.js"
import { uuidToBuffer } from "../../functions/elaboration.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { fastifyController } from "../../types/global.js"

const roomDataEditingController: fastifyController = async (request, reply) => {

    const { roomId, newName, newDescription } = request.body as { roomId: string, newName?: string, newDescription?: string | null }
    const internalUser = request.internalUser!

    const bufferizedRoomId = uuidToBuffer(roomId)

    try {

        const room = await PrivateRoom.findOne({
            where: {
                uuidv7: bufferizedRoomId,
                creatorId: internalUser.id
            },
            attributes: ['id', 'name', 'description']
        })

        if (!room) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.GENERIC_ROOM_NOT_FOUND
            })
            return
        }

        const updateObj: { name?: string, description?: string|null } = {}

        if ((newName) && (room.dataValues.name !== newName)) {
            updateObj['name'] = newName
        }
        if (('newDescription' in (request.body as any)) && (room.dataValues.description !== newDescription)) {
            updateObj['description'] = newDescription || null
        }

        const fieldsToEdit = Object.keys(updateObj).length

        if (fieldsToEdit) {
            await room.update(updateObj)
        }

        reply.send({ editedFields: fieldsToEdit })
        return

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_EDITING_ROOM_DATA')
        return
    }
}

export {
    roomDataEditingController,
}
