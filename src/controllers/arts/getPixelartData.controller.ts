
import Pivot_User_PrivateRoom from "../../database/models/Pivot_User_PrivateRoom.model.js"
import Pixelart from "../../database/models/Pixelart.model.js"
import PrivateRoom from "../../database/models/PrivateRoom.model.js"
import User from "../../database/models/User.model.js"
import WorkingLayer from "../../database/models/WorkingLayer.model.js"
import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { artDataFetchingQuerystring } from "../../objects/validationSchemas/arts.js"
import { fastifyController } from "../../types/global.js"

const pixelartDataFetchingController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { artId } = request.query as artDataFetchingQuerystring
    const bufferizedArtId = uuidToBuffer(artId)

    try {

        let isRoomMember = false

        const artLocation = (await Pixelart.findOne({
            where: {
                artId: bufferizedArtId
            },
            attributes: ['id', 'name', 'width', 'height', 'logicPixelSize', 'artId'],
            include: {
                model: WorkingLayer,
                as: 'referencedWorkingLayer',
                attributes: ['roomId', 'detentorId'],
                include: [{
                    model: PrivateRoom,
                    as: 'privateRoom',
                    attributes: ['creatorId', 'uuidv7']
                }, {
                    model: User,
                    as: 'wLayerOwner',
                    attributes: ['id', 'userId']
                }]
            },
            raw: true,
            nest: true
        })) as unknown as {
            id: number, name: string, width: number, height: number, logicPixelSize: number, artId: Buffer,
            referencedWorkingLayer: {
                roomId: number,
                privateRoom: { creatorId: number, uuidv7: Buffer },
                wLayerOwner: { id: number, userId: string }
            }
        }

        if (!artLocation) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.FETCH_PIXELART_METADATA__ART_NOT_FOUND
            })
            return
        }

        if (!(artLocation.referencedWorkingLayer && artLocation.referencedWorkingLayer.privateRoom)) {
            reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
                error: serverAPIErrorCode.FETCH_PIXELART_METADATA__ART_NOT_FOUND
            })
            return
        }

        isRoomMember = artLocation.referencedWorkingLayer.privateRoom.creatorId === internalUser.id

        if (!isRoomMember) {
            isRoomMember = !!(await Pivot_User_PrivateRoom.findOne({
                where: {
                    roomId: artLocation.referencedWorkingLayer.roomId,
                    userId: internalUser.id
                }
            }))
        }

        if (!isRoomMember) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.FETCH_PIXELART_METADATA__ART_NOT_FOUND
            })
            return
        }

        const { artId, name, width, height, logicPixelSize } = artLocation

        reply.send({
            artId: bufferToUuid(artId),
            metadata: { name, width, height, logicPixelSize },
            artOwner: [artLocation.referencedWorkingLayer.wLayerOwner.userId]
        })

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, "ER_SERVING_ART_DATA")
        return
    }

}

export {
    pixelartDataFetchingController,
}
