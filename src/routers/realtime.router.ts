
import { FastifyInstance } from "fastify"
import { checkFirebaseToken, checkFirebaseUIDFamiliarity } from "../middlewares/auth.js"
import { ablyTokenObtainingSchema } from "../objects/validationSchemas/realtime.js"
import { obtainAblyTokenController } from "../controllers/realtime/token/obtainAblyToken.controller.js"

export default async function router(fastify: FastifyInstance) {

    fastify.get(
        '/ably/token',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: ablyTokenObtainingSchema
        },
        obtainAblyTokenController
    )

}
