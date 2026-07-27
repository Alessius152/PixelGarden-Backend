import { FastifySchema } from "fastify"
import { userIdValidation, usernameValidation } from "./global.js"

//api: /auth/completeAuthentication
const completeAuthSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['username', 'userId'],
        properties: {
            username: usernameValidation,
            userId: userIdValidation,
        }
    }
}

export type completeAuthBody = {
    username: string;
    userId: string | number;
}

export {
    completeAuthSchema, 
}