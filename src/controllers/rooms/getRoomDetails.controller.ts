
import { checkMembership, getRoomMembers, getRoomWorkingLayers } from "../../database/functions/fetching/rooms.js"
import User from "../../database/models/User.model.js"
import { bufferToUuid, uuidToBuffer } from "../../functions/elaboration.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"
import { HttpStatusCode } from "../../objects/enums/http.js"
import { fastifyController } from "../../types/global.js"
import jwt from 'jsonwebtoken'

//in questa api , nell'array che rappresenta i membri della stanza, il creatore sta sempre alla fine
const getRoomDetailsController: fastifyController = async (request, reply) => {

    const internalUser = request.internalUser!
    const { roomId } = request.params as { roomId: string }

    try {

        const membershipCheck = await checkMembership(internalUser.id, uuidToBuffer(roomId))

        if (!membershipCheck) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.FETCH_ROOM_DETAILS__MEMBERSHIP_NOT_FOUND
            })
            return
        }

        const { id, creatorId, name, description, uuidv7 } = membershipCheck.room

        const roomCreator = await User.findByPk(creatorId, { attributes: ['username', 'userId', ['id', 'userPk']] })

        if (!roomCreator) {
            reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send()
            return
        }

        const roomStringUuidv7 = bufferToUuid(uuidv7)
        const roomMembers = [...(await getRoomMembers(id)), roomCreator.dataValues]
        const workingLayers = Object.fromEntries((await getRoomWorkingLayers(id)).map(l => [l.userPk, bufferToUuid(l.layerId)]))

        const artsLayersDownloadingToken = jwt.sign(
            {
                user: {
                    at: internalUser.userIdentification.userId,
                    uuid: internalUser.userIdentification.stringUuidv7,
                },
                membership: {
                    roomId: roomStringUuidv7,
                },
            },
            process.env.JWT_SECRET__ART_LAYERS_DOWNLOAD!,
            {
                algorithm: 'HS256',
                expiresIn: '15m'
            }
        )

        reply.send({
            roomData: {
                basic: [roomStringUuidv7, name, description],
                layersDownloadingToken: artsLayersDownloadingToken,
                members: roomMembers.map(({ userId, username, userPk, membershipId }) => ([
                    userId, username,
                    {
                        mId: membershipId ? bufferToUuid(membershipId) : null,
                        wLayerId: workingLayers[userPk] || null
                    }
                ])),
            },
        })
        return

    }
    catch (err) {
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR,
        })
        request.log.error({ err }, 'ER_FETCHING_ROOM_DETAILS')
        return
    }

}

export {
    getRoomDetailsController,
}
