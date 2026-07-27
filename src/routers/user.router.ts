
import { FastifyInstance } from "fastify"
import { checkFirebaseToken, checkFirebaseUIDFamiliarity } from "../middlewares/auth.js"
import { bufferToUuid } from "../functions/elaboration.js"

export default async function router(fastify: FastifyInstance) {

    fastify.get(
        '/myAccountData',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity]
        },
        (request, reply) => {
            const { userIdentification, username } = request.internalUser!

            const uuid = bufferToUuid(userIdentification.binUuidv7)

            reply.status(200).send({
                userData: {
                    secondAuth: { uuid, username, userId: userIdentification.userId }
                }
            })
        }
    )

}
