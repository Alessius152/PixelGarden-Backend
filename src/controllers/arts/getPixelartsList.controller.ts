
import { QueryTypes } from "sequelize"
import Pixelart from "../../database/models/Pixelart.model.js"
import WorkingLayer from "../../database/models/WorkingLayer.model.js"
import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { fastifyController } from "../../types/global.js"
import PrivateRoom from "../../database/models/PrivateRoom.model.js"
import Pivot_User_PrivateRoom from "../../database/models/Pivot_User_PrivateRoom.model.js"

const pixelartsListFetchingController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { workingLayerId: wlUuidv7 } = request.query as { workingLayerId: string }

    try {

        const workingLayer = await WorkingLayer.findOne({
            where: {
                wLayerId: uuidToBuffer(wlUuidv7)
            },
            attributes: ['id', 'roomId', 'detentorId']
        })

        if (!workingLayer) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.GET_PIXELARTS_LIST__LAYER_NOT_FOUND
            })
            return
        }

        let isAuthorizedToFetch = workingLayer.dataValues.detentorId === internalUser.id

        if (!isAuthorizedToFetch) {
            const room = await PrivateRoom.findByPk(workingLayer.dataValues.roomId, { attributes: ['id', 'creatorId'] })

            if (!room) {
                reply.status(HttpStatusCode.NOT_FOUND).send({
                    error: serverAPIErrorCode.GET_PIXELARTS_LIST__LAYER_NOT_FOUND
                })
                return
            }

            isAuthorizedToFetch = room.dataValues.creatorId === internalUser.id
        }

        if (!isAuthorizedToFetch) {
            isAuthorizedToFetch = !!(await Pivot_User_PrivateRoom.findOne({
                where: {
                    roomId: workingLayer.dataValues.roomId,
                    userId: internalUser.id
                }
            }))
        }

        if (!isAuthorizedToFetch) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.GET_PIXELARTS_LIST__LAYER_NOT_FOUND
            })
            return
        }

        const artsList = await Pixelart.findAll({
            where: {
                workingLayerId: workingLayer.dataValues.id
            },
            raw: true,
            type: QueryTypes.SELECT,
            attributes: ['name', 'height', 'width', 'logicPixelSize', 'artId']
        }) as unknown as Array<{ name: string, height: number, width: number, logicPixelSize: number, artId: Buffer }>

        reply.send({
            pixelarts: artsList.map(art => ({
                artId: bufferToUuid(art.artId),
                name: art.name,
                width: art.width,
                height: art.height,
                logicPixelSize: art.logicPixelSize
            }))
        })
        return
    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, 'ER_SERVING_ARTS_LIST')
        return
    }

}

export {
    pixelartsListFetchingController,
}
