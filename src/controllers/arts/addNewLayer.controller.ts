
import { uuidv7 } from "uuidv7"
import ArtLayer from "../../database/models/ArtLayer.model.js"
import Pivot_User_Pixelart from "../../database/models/Pivot_User_Pixelart.js"
import Pixelart from "../../database/models/Pixelart.model.js"
import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { artLayerAddingBody } from "../../objects/validationSchemas/arts.js"
import { fastifyController } from "../../types/global.js"
import { json, LOCK, Sequelize, Transaction } from "sequelize"
import databaseInterface from "../../database/config.js"
import WorkingLayer from "../../database/models/WorkingLayer.model.js"
import { getWRoomChannel } from "../../ably/utils.js"
import { notification__workingRoom__newArtLayerCreated } from "../../types/ablyNotifications.js"
import { realtimeWorkingRoomNotificationKeys } from "../../ably/objects/workingRoomNotificationKeys.js"
import PrivateRoom from "../../database/models/PrivateRoom.model.js"
import jwt from 'jsonwebtoken'
import { layersEditingToken } from "../../types/jwt.js"

const artLayerAddingController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { artId, layerName, artLayersEditingToken } = request.body as artLayerAddingBody

    const bufferizedArtId = uuidToBuffer(artId)
    let transaction: Transaction | null = null

    try {

        const decoded = jwt.verify(artLayersEditingToken, process.env.JWT_SECRET__ART_LAYERS_EDITING!, { algorithms: ['HS256'] }) as { editableLayers: Array<string> }

        const artRecord = await Pixelart.findOne({
            where: { artId: bufferizedArtId },
            attributes: ['id', 'width', 'height'],
            include: {
                model: WorkingLayer,
                as: 'referencedWorkingLayer',
                attributes: ['roomId'],
                include: [{
                    model: PrivateRoom,
                    as: 'privateRoom',
                    attributes: ['uuidv7']
                }]
            }
        })

        if (!artRecord) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.ADD_NEW_ART_LAYER__ART_NOT_FOUND
            })
            return
        }

        const collaborationRecord = await Pivot_User_Pixelart.findOne({
            where: {
                artId: artRecord.dataValues.id,
                userId: internalUser.id
            },
            attributes: ['id']
        })

        if (!collaborationRecord) {
            reply.status(HttpStatusCode.UNAUTHORIZED).send({
                error: serverAPIErrorCode.ADD_NEW_ART_LAYER__YOU_ARE_NOT_COLLABORATOR
            })
            return
        }

        transaction = await databaseInterface.transaction()

        const result = await ArtLayer.findOne({
            attributes: [
                [Sequelize.fn('MAX', Sequelize.col('orderIndex')), 'maxOrder']
            ],
            where: {
                artId: artRecord.dataValues.id
            },
            lock: transaction.LOCK.UPDATE,
            transaction,
        })

        const layerId = uuidv7()
        const lastRenderingLayer = result ? Number(result.dataValues.maxOrder) : null
        const nextRendering = (lastRenderingLayer === null ? (-1) : lastRenderingLayer) + 1

        const layerRecord = await ArtLayer.create({
            artId: artRecord.dataValues.id,
            layerName: layerName.length ? layerName : `layer-${nextRendering}`,
            uuid: uuidToBuffer(layerId),
            orderIndex: nextRendering,
            ownerId: internalUser.id
        }, { transaction })

        await transaction.commit()

        const roomUuid = bufferToUuid(artRecord.dataValues.referencedWorkingLayer.privateRoom.uuidv7)

        const newLayersEditingToken = jwt.sign(({
            editableLayers: [...decoded.editableLayers, layerId],
            layersOwner: internalUser.userIdentification.userId,
            artId,
            roomId: roomUuid
        }) as layersEditingToken, process.env.JWT_SECRET__ART_LAYERS_EDITING!, {
            algorithm: 'HS256',
            expiresIn: '15m'
        })

        reply.send({
            newLayersEditingToken,
            metadata: [layerId, layerRecord.dataValues.layerName, layerRecord.dataValues.orderIndex]
        })

        const roomChannel = getWRoomChannel(roomUuid)
        const packet: notification__workingRoom__newArtLayerCreated = {
            headers: {
                rtClientId: internalUser.userIdentification.stringUuidv7,
                userAt: internalUser.userIdentification.userId
            },
            artId,
            layerData: {
                dim: [artRecord.dataValues.width, artRecord.dataValues.height],
                name: layerRecord.dataValues.layerName,
                orderIndex: nextRendering,
                uuid: layerId,
                owner: [internalUser.username, internalUser.userIdentification.userId]
            }
        }
        await roomChannel.publish({
            name: realtimeWorkingRoomNotificationKeys.ADDED_NEW_ART_LAYER,
            data: packet
        })

    }
    catch (err) {
        if (transaction) {
            await transaction.rollback()
        }
        if (err instanceof jwt.JsonWebTokenError) {
            reply.status(HttpStatusCode.BAD_REQUEST).send({
                error: serverAPIErrorCode.ADD_NEW_ART_LAYER__THERE_IS_NO_AUTHENTICATION
            })
        }
        else if (err instanceof jwt.TokenExpiredError) {
            reply.status(HttpStatusCode.UNAUTHORIZED).send({
                error: serverAPIErrorCode.ADD_NEW_ART_LAYER__THERE_IS_NO_AUTHENTICATION
            })
        } else {
            reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
                error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
            })
        }
        request.log.error({ err }, "ER_CREATING_NEW_ART_LAYER")
        return
    }

}

export {
    artLayerAddingController,
}
