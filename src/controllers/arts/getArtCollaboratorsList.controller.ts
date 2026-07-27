
import { fetchPixelartLocation, getArtCollaboratorsList } from "../../database/functions/fetching/arts.js"
import { getRoomMembers } from "../../database/functions/fetching/rooms.js"
import Pivot_User_PrivateRoom from "../../database/models/Pivot_User_PrivateRoom.model.js"
import { uuidToBuffer } from "../../functions/elaboration.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { artCollaboratorsListFetchingQuerystring } from "../../objects/validationSchemas/arts.js"
import { fastifyController } from "../../types/global.js"
/*
devo poter vedere i collaboratori anche se la pixelart non è mia e non ho i 
permessi per modificarla.
*/

const artCollaboratorsListFetchingController: fastifyController = async (request, reply) => {

    const { artId } = request.query as artCollaboratorsListFetchingQuerystring
    const internalUser = request.internalUser!
    const bufferizedArtId = uuidToBuffer(artId)

    try {

        let isRoomMember = false
        const artLocation = await fetchPixelartLocation(bufferizedArtId)

        if (!artLocation) {
            reply.status(HttpStatusCode.UNAUTHORIZED).send({
                error: serverAPIErrorCode.FETCH_ART_COLLABORATORS_LIST__ART_NOT_FOUND
            })
            return
        }

        if (artLocation.roomOwnerPk === internalUser.id) {
            isRoomMember = true
        }

        if (!isRoomMember) {
            const membership = await Pivot_User_PrivateRoom.findOne({
                where: {
                    roomId: artLocation.roomPk,
                    userId: internalUser.id
                },
                attributes: ['id']
            })
            isRoomMember = !!membership
        }

        if (!isRoomMember) {
            reply.status(HttpStatusCode.UNAUTHORIZED).send({
                error: serverAPIErrorCode.FETCH_ART_COLLABORATORS_LIST__ART_NOT_FOUND
            })
            return
        }

        const collaborators = (await getArtCollaboratorsList(artLocation.artPk)).map(c => ([c.userId, c.username]))
        reply.send({ collaborators })

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        request.log.error({ err }, "ER_SERVING_ART_COLLABORATORS_LIST")
        return
    }

}

export {
    artCollaboratorsListFetchingController,
}
