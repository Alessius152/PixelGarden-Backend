
import { FastifyInstance } from "fastify"
import { createNewPrivateRoomController } from "../controllers/rooms/createNewPrivateRoom.controller.js"
import { checkFirebaseToken, checkFirebaseUIDFamiliarity } from "../middlewares/auth.js"
import {
    membersAddingSchema,
    membersRemovingSchema,
    ownRoomsFetchingSchema,
    receivedJoiningInvitesFetchingSchema,
    receivedJoinInviteAnsweringSchema,
    roomCreationSchema,
    roomDataEditingSchema,
    roomDetailsFetchingSchema,
    roomMembersFetchingSchema,
    roomsWhereImInFetchingSchema,
    sentJoiningInvitesFetchingSchema,
    sentJoinInviteCancelingSchema
} from "../objects/validationSchemas/rooms.js"
import { getMyRoomsController } from "../controllers/rooms/getMyRooms.controller.js"
import { getRoomsWhereImInController } from "../controllers/rooms/getRoomsWhereImIn.controller.js"
import { membersAddingController } from "../controllers/rooms/addMembers.controller.js"
import { sentJoiningInvitesFetchingController } from "../controllers/rooms/getSentInvites.controller.js"
import { receivedJoiningInvitesFetchingController } from "../controllers/rooms/getReceivedInvites.controller.js"
import { roomDataEditingController } from "../controllers/rooms/editRoomData.controller.js"
import { sentJoinInviteCancelingController } from "../controllers/rooms/cancelInvite.controller.js"
import { roomMembersFetchingController } from "../controllers/rooms/getRoomMembers.controller.js"
import { getRoomDetailsController } from "../controllers/rooms/getRoomDetails.controller.js"
import { receivedJoinInviteAnsweringController } from "../controllers/rooms/answerToRoomJoinInvite.controller.js"

export default async function router(fastify: FastifyInstance) {

    fastify.post('/createNewRoom',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: roomCreationSchema
        },
        createNewPrivateRoomController,
    )

    fastify.post('/addMembers',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: membersAddingSchema
        },
        membersAddingController
    )

    // fastify.delete('/removeMembers',
    //     {
    //         preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
    //         schema: membersRemovingSchema
    //     },
    //     membersRemovingController
    // )

    fastify.get('/getMyRooms',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: ownRoomsFetchingSchema
        },
        getMyRoomsController
    )

    fastify.get('/getRoomsWhereImIn',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: roomsWhereImInFetchingSchema
        },
        getRoomsWhereImInController
    )

    fastify.get('/getSentInvites',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: sentJoiningInvitesFetchingSchema
        },
        sentJoiningInvitesFetchingController
    )

    fastify.get('/getReceivedInvites',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: receivedJoiningInvitesFetchingSchema,
        },
        receivedJoiningInvitesFetchingController
    )

    fastify.post('/editRoomData',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: roomDataEditingSchema
        },
        roomDataEditingController
    )

    fastify.delete('/cancelInvite',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: sentJoinInviteCancelingSchema
        },
        sentJoinInviteCancelingController
    )

    fastify.post(
        '/answerToJoinInvite',
        {
            preHandler: [checkFirebaseToken,checkFirebaseUIDFamiliarity],
            schema: receivedJoinInviteAnsweringSchema
        },
        receivedJoinInviteAnsweringController
    )

    fastify.get('/roomMembers',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: roomMembersFetchingSchema
        },
        roomMembersFetchingController,
    )

    fastify.get('/roomDetails/:roomId',
        {
            preHandler: [checkFirebaseToken, checkFirebaseUIDFamiliarity],
            schema: roomDetailsFetchingSchema
        },
        getRoomDetailsController
    )

}
