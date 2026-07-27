
import { FastifyInstance } from "fastify"

import { checkFirebaseToken, checkFirebaseUIDFamiliarity } from "../middlewares/auth.js"
import {
    friendshipDeletingSchema,
    friendshipRequestAnsweringSchema,
    friendshipRequestSendingSchema,
    friendshipSentRequestCancelingSchema,
    friendsListFetchingSchema,
    receivedRequestsFetchingSchema,
    sendedRequestsFetchingSchema
} from "../objects/validationSchemas/friends.js"

import { sendFriendshipRequestController } from "../controllers/friends/sendFriendshipRequest.controller.js"
import { getAllSendedRequestsController } from "../controllers/friends/getAllSendedRequests.controller.js"
import { answerToFriendshipRequestController } from "../controllers/friends/answerToFriendshipRequest.controller.js"
import { getAllReceivedRequestsController } from "../controllers/friends/getAllReceivedRequests.controller.js"
import { friendsListFetchingController } from "../controllers/friends/friendsListFetching.controller.js"
import { friendshipSentRequestCancelingController } from "../controllers/friends/cancelSentFriendshipRequest.controller.js"

export default async function router(fastify: FastifyInstance) {

    fastify.get(
        '/getAllSendedRequests',
        {
            schema: sendedRequestsFetchingSchema,
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
        },
        getAllSendedRequestsController
    )

    fastify.get(
        '/getAllReceivedRequests',
        {
            schema: receivedRequestsFetchingSchema,
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
        },
        getAllReceivedRequestsController
    )

    fastify.get(
        '/friendsList',
        {
            schema: friendsListFetchingSchema,
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
        },
        friendsListFetchingController
    )

    fastify.post(
        '/sendFriendshipRequest',
        {
            schema: friendshipRequestSendingSchema,
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
        },
        sendFriendshipRequestController,
    )

    fastify.post(
        '/answerToFriendshipRequest',
        {
            schema: friendshipRequestAnsweringSchema,
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
        },
        answerToFriendshipRequestController,
    )

    // fastify.delete(
    //     '/cancelFriendship',
    //     {
    //         schema: friendshipDeletingSchema,
    //         preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity]
    //     },
    //     friendshipDeletingController
    // )

    fastify.delete(
        '/cancelSentFriendshipRequest',
        {
            schema: friendshipSentRequestCancelingSchema,
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
        },
        friendshipSentRequestCancelingController
    )

}

