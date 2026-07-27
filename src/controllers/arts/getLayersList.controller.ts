
import { Op } from "sequelize"
import ArtLayer from "../../database/models/ArtLayer.model.js"
import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { artLayersListFetchingQuerystring } from "../../objects/validationSchemas/arts.js"
import { fastifyController } from "../../types/global.js"
import { paginationLimits } from "../../objects/constants/cursorBasedPagination.js"
import { checkArtAccessToDownload } from "../../database/functions/fetching/arts.js"
import User from "../../database/models/User.model.js"
import { newLayersEditingAccessToken } from "../../cloudflare/workers/utils/jwt.js"

const artLayersListFetchingController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { artId, cursor } = request.query as artLayersListFetchingQuerystring

    const bufferizedArtId = uuidToBuffer(artId)

    try {

        const artAccess = await checkArtAccessToDownload(bufferizedArtId, internalUser.id)

        if (!artAccess) {
            reply.status(HttpStatusCode.UNAUTHORIZED).send({
                error: ''
            })
            return
        }

        const collection = await ArtLayer.findAll({
            where: {
                artId: artAccess.artPk,
                orderIndex: { [Op.gt]: cursor }
            },
            include: {
                model: User,
                as: 'layerOwner',
                attributes: ['userId', 'username']
            },
            order: [['orderIndex', 'asc']],
            limit: paginationLimits.artLayersList + 1,
            attributes: [['layerName', 'name'], 'uuid', 'orderIndex'],
            raw: true,
            nest: true
        }) as unknown as Array<{
            name: string, uuid: Buffer, orderIndex: number,
            layerOwner: { userId: string, username: string }
        }>

        const hasMore = collection.length > paginationLimits.artLayersList

        if (hasMore) {
            collection.pop()
        }

        const nextCursor = hasMore ? collection[collection.length - 1].orderIndex : null
        const formatted = collection.map(({ name, uuid, orderIndex, layerOwner }) => ({
            metadata: [bufferToUuid(uuid), name, orderIndex],
            owner: [layerOwner.username, layerOwner.userId]
        }))

        const layersEditingToken = (cursor === -1) ? newLayersEditingAccessToken(
            internalUser,
            collection.filter(layer => layer.layerOwner.userId === internalUser.userIdentification.userId).map(layer => bufferToUuid(layer.uuid)),
            { roomUuid: bufferToUuid(artAccess.roomUuid), artUuid: bufferToUuid(artAccess.artUuid) }
        ) : null

        reply.send({
            layers: formatted,
            hasMore,
            nextCursor,
            layersEditingToken,
        })

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, "ER_SERVING_ART_LAYERS_LIST")
        return
    }

}

export {
    artLayersListFetchingController,
}
