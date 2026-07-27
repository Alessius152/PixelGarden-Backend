
import { serverAPIErrorCode } from '../objects/apiErrors.js'

/*
attenzione: le stringhe possibile camel-case coincidono e devono coincidere con le key di 
serverResponseErrorCodes in responseErrorsMaps.ts
*/
type tokenValidationError = { error: serverAPIErrorCode }

export {
    tokenValidationError,
}
