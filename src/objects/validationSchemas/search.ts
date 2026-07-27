import { FastifySchema } from "fastify"
import { usernameValidation, validatorOfCursorBasedPaginationStartingIndex } from "./global.js"

//api /search/filteredUsers
const filteredUsersSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['query', 'cursor'],
        properties: {
            query: { ...usernameValidation, minLength: 1 },
            cursor: validatorOfCursorBasedPaginationStartingIndex,
        },
        additionalProperties: false
    }
}

export type filteredUsersQuery = {
    query: string;
    cursor: string;
}

export {
    filteredUsersSchema,
}