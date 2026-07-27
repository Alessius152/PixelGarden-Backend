
import { uuidv7 } from 'uuidv7'
import { UniqueConstraintError } from 'sequelize'

import { HttpStatusCode } from "../../objects/enums/http.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"

import { fastifyController } from "../../types/global.js"

import User from "../../database/models/User.model.js"
import { bufferToUuid, uuidToBuffer } from '../../functions/elaboration.js'
import { checkUserExistanceByFirebaseUid } from '../../database/functions/fetching/authentication.js'

const completeAuthenticationController: fastifyController = async (request, reply) => {

    const { username: insertedUsername, userId } = request.body as { username: string, userId: string }
    const { uid: firebaseUid } = request.firebaseProfile!

    try {

        const userExists = await checkUserExistanceByFirebaseUid(firebaseUid)

        if (userExists) {
            const { uuidv7: uuid, username, userId } = userExists.user

            reply.status(HttpStatusCode.CONFLICT).send({
                error: serverAPIErrorCode.COMPLETE_AUTH__ALREADY_AUTHED,
                user: { uuid: bufferToUuid(uuid), username, userId }
            })
            return
        }

        const uuid = uuidv7()
        const _uuidv7 = uuidToBuffer(uuid)
        const atUserId = `@${userId}`

        const registrationObj = {
            uuidv7: _uuidv7,
            firebaseUid,
            username: insertedUsername,
            userId: atUserId,
        }

        await User.create(registrationObj)

        reply.status(HttpStatusCode.CREATED).send({
            registered: true,
            user: { uuid, username: insertedUsername }
        })

        return

    }
    catch (err) {
        if (err instanceof UniqueConstraintError) {
            /*
            ATTENZIONE!, IMPORTANTE:
            qui attualmente sono sicuro che la chiave che porta alla duplicazione è 
            di sicuro userId, perché firebaseUid lo controllo già sopra, e, non è 
            tecnicamente possibile che arrivi alla create() con un firebaseUid pari a uno
            che già esiste nel db.
            */

            reply.status(HttpStatusCode.CONFLICT).send({
                error: serverAPIErrorCode.COMPLETE_AUTH__USER_ID_ALREADY_EXISTS
            })
        } else {
            reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
                error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
            })
        }
        request.log.error({ err }, "[ndl] completeAuthentication")
    }

}

export {
    completeAuthenticationController,
}
