
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { strokeApprovingHeaders } from "../../objects/validationSchemas/arts.js"
import { fastifyController } from "../../types/global.js"

import jwt from 'jsonwebtoken'
import zlib from 'zlib'
import { layersEditingToken } from "../../types/jwt.js"
import { uuidToBuffer } from "../../functions/elaboration.js"
import ArtLayer from "../../database/models/ArtLayer.model.js"
import { newLayersEditingAccessToken } from "../../cloudflare/workers/utils/jwt.js"
import { getWRoomChannel } from "../../ably/utils.js"
import { notification__workingRoom__newStrokeBeenApproved } from "../../types/ablyNotifications.js"
import { realtimeWorkingRoomNotificationKeys } from "../../ably/objects/workingRoomNotificationKeys.js"
import { IncomingHttpHeaders } from "http"
import Pixelart from "../../database/models/Pixelart.model.js"

const MAX_PAYLOAD = 1024 * 512

/*
in linea di principio in un downloading token dovrebbero sempre 
esserci i layer coerenti con quelli del database. Perché i layer
li posso modificare solo io essendo miei. Ma paradossalmente 
il fatto che il layer che voglio modificare non sia nel token 
identificato negli editableLayers potrebbe non voler dire per 
forza che non posso modificarlo.
Rimane una best practice quella di verificare sempre e comunque 
il database cosa dice. Magari ottimizziamo con la cache

jwt non decodificato:
    401;
layer record non esiste:
    se si trovava negli editable layers:
        404 con nuovo token di editing;
    404;
se non si trovava negli editable layers:
    200 con nuovo token di editing;
ably emit;
200;
*/
const strokeApprovingController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const {
        "x-editing-token": editingToken,
        "x-layer-id": layerId,
        "x-width": w,
        "x-height": h,
        "x-pos-x": x,
        "x-pos-y": y
    } = request.headers as IncomingHttpHeaders & strokeApprovingHeaders

    const compressedBuffer = request.body as Buffer

    if ((w * h) > 500 * 500) {
        reply.status(HttpStatusCode.BAD_REQUEST).send({ error: '' })
        return
    }

    if (compressedBuffer.length > MAX_PAYLOAD) {
        reply.status(HttpStatusCode.PAYLOAD_TOO_LARGE).send({ error: '' })
        return
    }

    let editingAuthorizationPayload: layersEditingToken

    try {
        editingAuthorizationPayload = jwt.verify(editingToken, process.env.JWT_SECRET__ART_LAYERS_EDITING!, { algorithms: ['HS256'] }) as layersEditingToken
    }
    catch (err) {
        reply.status(HttpStatusCode.UNAUTHORIZED).send({ error: 1 })
        return
    }

    const bufferizedLayerId = uuidToBuffer(layerId)
    const { editableLayers, artId, layersOwner, roomId } = editingAuthorizationPayload

    /*sono sicuro che il token abbia solo i layer di quell'utente, e non quelli di altri.
    Se una pixelart ha 10 layer e l'utente B ne ha creati solo 3 di questi 10, lui decodificando
    il token, accederà solo a quei 3 layer.*/
    // console.log("token di modifica layer appartenente a " + internalUser.userIdentification.userId, editingAuthorizationPayload)

    if (!(layersOwner === internalUser.userIdentification.userId)) {
        reply.status(HttpStatusCode.UNAUTHORIZED).send({ error: 2 })
        return
    }

    let newEditingToken: string | null = null

    try {

        const layerRecord = await ArtLayer.findOne({
            where: { ownerId: internalUser.id, uuid: bufferizedLayerId },
            attributes: ['id'],
            include: {
                model: Pixelart,
                as: 'pixelartContainer',
                attributes: ['width', 'height']
            }
        })

        if (!layerRecord) {
            if (editableLayers.includes(layerId)) {
                newEditingToken = newLayersEditingAccessToken(
                    internalUser,
                    editableLayers.filter(uuid => uuid !== layerId),
                    { roomUuid: roomId, artUuid: artId }
                )
            }
            reply.status(HttpStatusCode.NOT_FOUND).send({ error: '', newEditingToken })
            return
        }

        const { width: artW, height: artH } = layerRecord.dataValues.pixelartContainer

        if ((x < 0) || (y < 0) || (w <= 0) || (h <= 0) || ((x + w) > artW) || ((y + h) > artH)) {
            reply.status(HttpStatusCode.BAD_REQUEST).send({ error: 3 })
            return
        }

        if (!editableLayers.includes(layerId)) {
            newEditingToken = newLayersEditingAccessToken(
                internalUser,
                [...editableLayers, layerId],
                { roomUuid: roomId, artUuid: artId }
            )
        }

        reply.send({ approved: true, newEditingToken })

        const channel = getWRoomChannel(roomId)
        const packet: notification__workingRoom__newStrokeBeenApproved = {
            headers: [internalUser.userIdentification.stringUuidv7, internalUser.userIdentification.userId],
            layerId,
            square: [w, h, x, y],
            pixels: compressedBuffer.toString('base64')
        }
        channel.publish({
            name: realtimeWorkingRoomNotificationKeys.NEW_STROKE_APPROVED(roomId, artId),
            data: packet,
            clientId: internalUser.userIdentification.stringUuidv7
        })

        return

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, "ER_APPROVING_STROKE")
        return
    }

}

export {
    strokeApprovingController,
}
