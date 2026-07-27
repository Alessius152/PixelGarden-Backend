
import { FastifyInstance } from "fastify"

import { checkFirebaseToken, checkFirebaseUIDFamiliarity } from "../middlewares/auth.js"
import { filteredUsersSchema } from "../objects/validationSchemas/search.js"
import { filteredUsersController } from "../controllers/search/filteredUsers.controller.js"

export default async function router(fastify: FastifyInstance) {

    fastify.get(
        '/filteredUsers',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: filteredUsersSchema
        },
        filteredUsersController,
    )

}

