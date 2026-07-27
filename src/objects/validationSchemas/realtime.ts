import { FastifySchema } from "fastify"

const ablyTokenObtainingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        properties: {
            roomId: {
                type: 'string',
                format: 'uuid'
            }
        },
        additionalProperties: false
    }
}

export type ablyTokenObtainingQuery = {
    roomId?: string;
}

export {
    ablyTokenObtainingSchema
}