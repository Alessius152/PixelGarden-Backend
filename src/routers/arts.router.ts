

import { FastifyInstance } from "fastify"
import { checkFirebaseToken, checkFirebaseUIDFamiliarity } from "../middlewares/auth.js"
import { pixelartsListFetchingController } from "../controllers/arts/getPixelartsList.controller.js"
import { artCollaboratorsListFetchingSchema, artLayerAddingSchema, artLayersListFetchingSchema, collaboratorsAddingSchema, pixelartCreationSchema, pixelartDataFetchingSchema, pixelartsListFetchingSchema, strokeApprovingSchema } from "../objects/validationSchemas/arts.js"
import { artCollaboratorsListFetchingController } from "../controllers/arts/getArtCollaboratorsList.controller.js"
import { pixelartDataFetchingController } from "../controllers/arts/getPixelartData.controller.js"
import { pixelartCreationController } from "../controllers/arts/createPixelart.controller.js"
import { artLayerAddingController } from "../controllers/arts/addNewLayer.controller.js"
import { artLayersListFetchingController } from "../controllers/arts/getLayersList.controller.js"
import { collaboratorsAddingController } from "../controllers/arts/addCollaborators.controller.js"
import { strokeApprovingController } from "../controllers/arts/approveStroke.controller.js"

export default async function router(fastify: FastifyInstance) {

    fastify.get('/pixelartsList',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: pixelartsListFetchingSchema
        },
        pixelartsListFetchingController
    )

    fastify.post('/createPixelart',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: pixelartCreationSchema
        },
        pixelartCreationController,
    )

    fastify.get('/getArtCollaboratorsList',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: artCollaboratorsListFetchingSchema
        },
        artCollaboratorsListFetchingController
    )

    fastify.get('/getPixelartData',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: pixelartDataFetchingSchema,
        },
        pixelartDataFetchingController
    )

    fastify.post('/addNewLayer', 
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: artLayerAddingSchema
        },
        artLayerAddingController
    )

    fastify.get('/getLayersList',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: artLayersListFetchingSchema
        },
        artLayersListFetchingController
    )

    fastify.post('/addCollaborators', 
        {
            preHandler: [checkFirebaseToken,checkFirebaseUIDFamiliarity],
            schema: collaboratorsAddingSchema
        },
        collaboratorsAddingController
    )

    fastify.post('/approveStroke',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: strokeApprovingSchema
        },
        strokeApprovingController
    )

}

