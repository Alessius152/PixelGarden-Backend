import { checkUserExistanceByFirebaseUid } from "../database/functions/fetching/authentication.js"
import { firebaseAuth } from "../firebase/admin.js"
import { bufferToUuid, uuidToBuffer } from "../functions/elaboration.js"
import { validateJWTHeaderStructure } from "../functions/validations/integrity.js"
import { HttpStatusCode } from "../objects/enums/http.js"
import { serverAPIErrorCode } from "../objects/apiErrors.js"
import { fastifyPreHandler } from "../types/global.js"
import { cache } from "../redis/cache.js"
import { userAuth } from "../redis/types.js"

const checkFirebaseToken: fastifyPreHandler = async (request, reply) => {

    //la funzione ritorna il token estratto dall'header in caso sia valida la struttura ossea dell'authorization
    const token = validateJWTHeaderStructure(request.headers.authorization)

    if ('error' in token) {
        /*
        la condizione indica che è un oggetto
        non controllo che abbia la prop token all'interno perché
        io in caso di errore ritorno un tokenValidationError e l'unico
        caso in cui ritorno un oggetto, questo è un {token: string}
        */
        reply.status(HttpStatusCode.UNAUTHORIZED).send({ error: token.error })
        return
    }

    try {
        const decoded = await firebaseAuth.verifyIdToken(token.token)

        request.firebaseProfile = decoded
        return
    }
    catch (err: any) {
        const unauth = (
            err.code === 'auth/id-token-expired' ||
            err.code === 'auth/argument-error' ||
            err.code === 'auth/id-token-revoked'
        )
        const status = unauth ?
            HttpStatusCode.UNAUTHORIZED :
            HttpStatusCode.INTERNAL_SERVER_ERROR

        reply.status(status).send({
            error: serverAPIErrorCode.AUTH__ERR_VERIFING_FIREBASE_TOKEN,
            errorInfo: {
                code: err.code
            }
        })
        return
    }

}

const checkFirebaseUIDFamiliarity: fastifyPreHandler = async (request, reply) => {

    /*do per scontato che venga chiamato ed eseguito dopo un checkFirebaseToken()*/
    const { uid } = request.firebaseProfile!

    try {

        let userExists

        userExists = await cache.getUserByFirebaseUid(request.log, uid)

        if (userExists) {
            const { pk, userId, username, uuidv7 } = userExists
            request.internalUser = {
                id: pk,
                username,
                userIdentification: {
                    userId,
                    binUuidv7: uuidToBuffer(uuidv7),
                    stringUuidv7: uuidv7
                }
            }
            return
        }

        userExists = await checkUserExistanceByFirebaseUid(uid)

        if (!userExists) {
            reply.status(HttpStatusCode.NOT_FOUND).send({
                error: serverAPIErrorCode.AUTH__UNEXISTANT_USER
            })
            return
        }

        const { id, uuidv7, username, userId } = userExists.user
        const uuidv7string = bufferToUuid(uuidv7)

        const cacheVal: userAuth = {
            pk: id,
            userId,
            username,
            uuidv7: uuidv7string
        }

        try {
            await cache.saveUserByFirebaseUid(request.log, uid, cacheVal)
        }
        catch (err) {
            request.log.error({ err }, 'err caching auth')
        }

        request.internalUser = {
            id,
            userIdentification: {
                binUuidv7: uuidv7,
                stringUuidv7: uuidv7string,
                userId
            },
            username
        }

        return

    }
    catch (err: any) {
        request.log.error({ err }, 'error checking api authentication')
        reply.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            error: serverAPIErrorCode.INTERNAL_SERVER_ERROR
        })
        return
    }

}

export {
    checkFirebaseToken,
    checkFirebaseUIDFamiliarity,
}
