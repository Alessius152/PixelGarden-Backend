import { JWT_PREFIX } from "../../objects/constants.js"
import { tokenValidationError } from "../../types/authentication.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"

type authorization = any
type token = { token: string }

function validateJWTHeaderStructure(authorizationHeader: authorization): token | tokenValidationError {

    /*
    questa funzione verifica semplicemente la struttura del jwt che deve essere esattamente
    Bearer <token>
    */

    if (!authorizationHeader) {
        return { error: serverAPIErrorCode.AUTH__MISSING_TOKEN }
    }

    const [prefix, token, other] = authorizationHeader.split(' ')

    if (!(
        (prefix === JWT_PREFIX) &&
        (token.trim()) &&
        (!other)
    )) {
        return { error: serverAPIErrorCode.AUTH__INVALID_TOKEN_STRUCTURE }
    }

    return { token }

}

export {
    validateJWTHeaderStructure,
}
