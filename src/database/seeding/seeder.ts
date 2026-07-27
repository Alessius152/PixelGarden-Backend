import databaseInterface from "../config.js"
import User from "../models/User.model.js"
import Friendship from "../models/Friendship.model.js"
import FriendshipRequest from "../models/FriendshipRequest.model.js"
import PrivateRoom from "../models/PrivateRoom.model.js"
import Pivot_User_PrivateRoom from "../models/Pivot_User_PrivateRoom.model.js"
import PRoomMembershipJoinInvites from "../models/PRoomMembershipJoinInvites.model.js"
import WorkingLayer from "../models/WorkingLayer.model.js"
import Pixelart from "../models/Pixelart.model.js"
import ArtLayer from "../models/ArtLayer.model.js"
import Pivot_User_Pixelart from "../models/Pivot_User_Pixelart.js"

// Import dei dati
import { fakeUsers } from "./users.data.js"
import { fakeFriendships } from "./friendships.data.js"
import { fakeFriendshipRequests } from "./friendship_requests.data.js"
import { fakePrivateRooms } from "./private_rooms.data.js"
import { fakeRoomMembers } from "./room_members.data.js"
import { fakeRoomInvites } from "./room_invites.data.js"
import { fakeWorkingLayers } from "./working_layers.data.js"
import { fakePixelarts } from "./pixelarts.data.js"
import { fakeArtLayers } from "./art_layers.data.js"
import { fakePixelartCollaborators } from "./pivot_users_pixelarts.data.js"

const seedInDatabase = async () => {
    const transaction = await databaseInterface.transaction()
    const logging = false
    const c = { transaction, logging }
    try {
        // 1. Entità indipendenti o principali
        await User.bulkCreate(fakeUsers, c)
        await Friendship.bulkCreate(fakeFriendships, c)
        await FriendshipRequest.bulkCreate(fakeFriendshipRequests, c)
        await PrivateRoom.bulkCreate(fakePrivateRooms, c)
        
        // 2. Relazioni dipendenti dalle stanze/utenti
        await Pivot_User_PrivateRoom.bulkCreate(fakeRoomMembers, c)
        await PRoomMembershipJoinInvites.bulkCreate(fakeRoomInvites, c)
        await WorkingLayer.bulkCreate(fakeWorkingLayers, c)
        
        // 3. Strutture del disegno (Pixelart e Layer)
        await Pixelart.bulkCreate(fakePixelarts, c)
        await ArtLayer.bulkCreate(fakeArtLayers, c)
        await Pivot_User_Pixelart.bulkCreate(fakePixelartCollaborators, c)
        
        await transaction.commit()
        console.log("SEEDING COMPLETATO CON SUCCESSO! Ambiente di presentazione pronto.")
    }
    catch (err) {
        await transaction.rollback()
        console.error("ERROR SEEDING:", err)
    }
}

export { seedInDatabase }