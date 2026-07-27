const usernameValidation = {
    type: 'string',
    minLength: 8,
    maxLength: 32,
    pattern: '^[A-Za-z][A-Za-z0-9_]*$'
}
export type usernameValidation = string;

const userIdValidation = {
    type: 'string',
    minLength: 3,
    maxLength: 32,
    pattern: '^[a-z][a-z0-9_]*$'
}
export type userIdValidation = string;

/*
essendo che per molte paginazioni, forse tutte, uso lo uuidv7 codificato in binario
nel database, e non un numero intero come sarebbe lo snowflake id, all'inizio lo 0
non è confrontabile con un buffer binario, quindi se l'utente parte da 0 gli concedo
di dire che il cursore è 0, poi alloco un buffer rappresentante lo 0 per confrontarlo
con gli altri in maniera tale che ritorni la prima pagina.
*/
const validatorOfCursorBasedPaginationStartingIndex = {
    anyOf: [
        { type: 'string', format: 'uuid' }, // qualsiasi UUID
        { type: 'string', const: '0' }      // letteralmente '0'
    ],
}
export type validatorOfCursorBasedPaginationStartingIndex = string;

const validatorOfPrivateRoomName = {
    type: 'string',
    minLength: 12,
    maxLength: 48
}
export type validatorOfPrivateRoomName = string;

const validatorOfRoomDescription = {
    anyOf: [
        { type: 'string', maxLength: 380 },
    ]
}
export type validatorOfRoomDescription = string;

export const jwtStringSchema = '^[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+$'

export {
    usernameValidation,
    userIdValidation,
    validatorOfCursorBasedPaginationStartingIndex,
    validatorOfPrivateRoomName,
    validatorOfRoomDescription,
}