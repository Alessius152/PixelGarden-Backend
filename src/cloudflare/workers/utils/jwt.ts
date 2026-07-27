
import jwt from 'jsonwebtoken'
import { bufferToUuid } from '../../../functions/elaboration.js'
import { FastifyRequest } from 'fastify'

const newLayersDownloadingAccessToken = () => { }

const newLayersEditingAccessToken = (internalUser_: FastifyRequest['internalUser'], collection: Array<string>, artAccess: {roomUuid: string, artUuid: string}) => {
    const internalUser = internalUser_!
    return jwt.sign({
        editableLayers: collection,
        roomId: artAccess.roomUuid,
        artId: artAccess.artUuid,
        layersOwner: internalUser.userIdentification.userId
    }, process.env.JWT_SECRET__ART_LAYERS_EDITING!, {
        algorithm: 'HS256', expiresIn: '15m'
    })
}

export {
    newLayersDownloadingAccessToken,
    newLayersEditingAccessToken
}
