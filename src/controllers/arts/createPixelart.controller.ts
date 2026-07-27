import { Transaction } from "sequelize"
import { uuidv7 } from 'uuidv7'

import { realtimeWorkingRoomNotificationKeys } from "../../ably/objects/workingRoomNotificationKeys.js"
import { getWRoomChannel } from "../../ably/utils.js"

import databaseInterface from "../../database/config.js"
import ArtLayer from "../../database/models/ArtLayer.model.js"
import Pivot_User_Pixelart from "../../database/models/Pivot_User_Pixelart.js"
import Pixelart from "../../database/models/Pixelart.model.js"
import PrivateRoom from "../../database/models/PrivateRoom.model.js"
import WorkingLayer from "../../database/models/WorkingLayer.model.js"

import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"

import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { pixelartCreationBody } from "../../objects/validationSchemas/arts.js"

import { notification__workingRoom__newArtCreated } from "../../types/ablyNotifications.js"
import { fastifyController } from "../../types/global.js"

const pixelartCreationController: fastifyController = async (request, reply) => {

    const { workingLayerId, artData } = request.body as pixelartCreationBody
    const internalUser = request.internalUser!
    const bufferizedWLayerId = uuidToBuffer(workingLayerId)

    let transaction: Transaction | null = null

    try {
        const wLayer = await WorkingLayer.findOne({
            where: {
                wLayerId: bufferizedWLayerId,
            },
            attributes: ['id', 'detentorId', 'roomId'],
            include: {
                model: PrivateRoom,
                foreignKey: 'roomId',
                as: 'privateRoom',
                attributes: ['uuidv7']
            },
        })

        const layerExists = wLayer && (wLayer.dataValues.detentorId === internalUser.id) && (wLayer.dataValues.privateRoom)

        if (!layerExists) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.CREATE_PIXELART__WORKING_LAYER_NOT_FOUND
            })
            return
        }

        const artId = uuidv7()
        const bufferizedArtId = uuidToBuffer(artId)
        transaction = await databaseInterface.transaction()

        const pixelart = await Pixelart.create({
            workingLayerId: wLayer.dataValues.id,
            artId: bufferizedArtId,
            name: artData.name,
            logicPixelSize: artData.logicPixelSize,
            width: artData.width,
            height: artData.height
        }, { transaction })

        await Pivot_User_Pixelart.create({
            artId: pixelart.dataValues.id,
            userId: internalUser.id
        }, { transaction })

        const layer0Uuid = uuidv7()
        await ArtLayer.create({
            artId: pixelart.dataValues.id,
            layerName: 'layer-0',
            parentId: null,
            uuid: uuidToBuffer(layer0Uuid),
            orderIndex: 0,
            ownerId: internalUser.id
        }, { transaction })

        await transaction.commit()

        reply.send({
            createdAt: pixelart.dataValues.createdAt,
            artId, width: artData.width, height: artData.height, scale: artData.logicPixelSize,
        })

        const roomUuid = bufferToUuid(wLayer.dataValues.privateRoom.dataValues.uuidv7)
        const channel = getWRoomChannel(roomUuid)
        const packet: notification__workingRoom__newArtCreated = {
            headers: {
                rtClientId: internalUser.userIdentification.stringUuidv7,
                userAt: internalUser.userIdentification.userId
            },
            roomId: roomUuid,
            workingLayerId: workingLayerId,
            artData: {
                artId,
                name: artData.name,
                width: artData.width,
                height: artData.height,
                logicPixelSize: artData.logicPixelSize,
            },
            createdAt: pixelart.dataValues.createdAt
        }
        await channel.publish({
            name: realtimeWorkingRoomNotificationKeys.NEW_ART_CREATED,
            data: packet
        })

        return

    } catch (err) {
        if (transaction) {
            await transaction.rollback()
        }

        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, "ER_CREATING_PIXELART")
        return
    }

}

export {
    pixelartCreationController,
}
