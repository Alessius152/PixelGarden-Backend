
//in questo file ci sono le funzioni relative al database dell'applicazione.

import databaseInterface from "../config.js"

import User from "../models/User.model.js"
import FriendshipRequest from "../models/FriendshipRequest.model.js"
import Friendship from "../models/Friendship.model.js"
import PrivateRoom from "../models/PrivateRoom.model.js"
import Pivot_User_PrivateRoom from "../models/Pivot_User_PrivateRoom.model.js"
import PRoomMembershipJoinInvites from "../models/PRoomMembershipJoinInvites.model.js"
import { FastifyBaseLogger } from "fastify"
import WorkingLayer from "../models/WorkingLayer.model.js"
import Pixelart from "../models/Pixelart.model.js"
import Pivot_User_Pixelart from "../models/Pivot_User_Pixelart.js"
import ArtLayer from "../models/ArtLayer.model.js"

async function databaseInitialization(log: FastifyBaseLogger, sync: boolean = false): Promise<{ error: any } | true> {

    try {

        await databaseInterface.authenticate()
        defineRelations()
        await synchronizeModels(log, sync)

        return true
    }
    catch (err) {
        log.error({ err }, '[database sync] databaseInitialization()')
        return { error: err }
    }

}

async function synchronizeModels(log: FastifyBaseLogger, sync: boolean = false): Promise<{ error: any } | true> {

    try {

        await databaseInterface.query('SET FOREIGN_KEY_CHECKS = 0;')
        await User.sync({ force: sync })
        await FriendshipRequest.sync({ force: sync })
        await Friendship.sync({ force: true })
        await PrivateRoom.sync({ force: sync })
        await Pivot_User_PrivateRoom.sync({ force: sync })
        await PRoomMembershipJoinInvites.sync({ force: sync })
        await Pixelart.sync({ force: sync })
        await WorkingLayer.sync({ force: sync })
        await Pivot_User_Pixelart.sync({ force: sync })
        await databaseInterface.query('SET FOREIGN_KEY_CHECKS = 1;')
        await databaseInterface.sync({ force: sync })

        return true

    }
    catch (err) {
        log.error({ err }, '[database sync] synchronizeModels()')
        return { error: err }
    }

}

function defineRelations() {

    User.hasMany(FriendshipRequest, { foreignKey: 'senderId', as: 'sentRequests', })
    FriendshipRequest.belongsTo(User, { foreignKey: 'senderId', as: 'sender' })

    User.hasMany(FriendshipRequest, { foreignKey: 'receiverId', as: 'receivedRequests', })
    FriendshipRequest.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' })

    User.hasMany(PrivateRoom, { foreignKey: 'creatorId', as: 'createdRooms' })
    PrivateRoom.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' })

    User.belongsToMany(PrivateRoom, { through: 'Pivot_User_PrivateRoom', foreignKey: 'userId', otherKey: 'roomId', as: 'rooms' })
    PrivateRoom.belongsToMany(User, { through: 'Pivot_User_PrivateRoom', foreignKey: 'roomId', otherKey: 'userId', as: 'members' })

    User.hasMany(Pivot_User_PrivateRoom, {foreignKey: 'userId', as: 'memberships'})
    Pivot_User_PrivateRoom.belongsTo(User, {foreignKey: 'userId', as: 'member'})
    Pivot_User_PrivateRoom.belongsTo(PrivateRoom, {foreignKey: 'roomId', as: 'room'})

    User.hasMany(PRoomMembershipJoinInvites, { foreignKey: 'inviter', as: 'sentRoomJoiningInvites' })
    PRoomMembershipJoinInvites.belongsTo(User, { foreignKey: 'inviter', as: 'sender' })

    User.hasMany(PRoomMembershipJoinInvites, { foreignKey: 'invitee', as: 'receivedRoomJoiningInvites' })
    PRoomMembershipJoinInvites.belongsTo(User, { foreignKey: 'invitee', as: 'receiver' })

    PrivateRoom.hasMany(PRoomMembershipJoinInvites, { foreignKey: 'id', as: 'specificRoomInvites' })
    PRoomMembershipJoinInvites.belongsTo(PrivateRoom, { foreignKey: 'roomId', as: 'room' })

    User.hasMany(WorkingLayer, {foreignKey: 'detentorId', as: 'ownedWorkingLayers'})
    WorkingLayer.belongsTo(User, {foreignKey: 'detentorId', as: 'wLayerOwner'})

    PrivateRoom.hasMany(WorkingLayer, { foreignKey: 'roomId', as: 'workingLayers' })
    WorkingLayer.belongsTo(PrivateRoom, { foreignKey: 'roomId', as: 'privateRoom' })

    User.hasMany(ArtLayer, {foreignKey: 'ownerId', as: 'ownedLayers'})
    ArtLayer.belongsTo(User, {foreignKey: 'ownerId', as: 'layerOwner'})

    WorkingLayer.hasMany(Pixelart, {foreignKey: 'workingLayerId', as: 'containedPixelarts'})
    Pixelart.belongsTo(WorkingLayer, {foreignKey: 'workingLayerId', as: 'referencedWorkingLayer'})
    
    Pixelart.hasMany(ArtLayer, {foreignKey: 'artId', as: 'artLayers'})
    ArtLayer.belongsTo(Pixelart, {foreignKey: 'artId', as: 'pixelartContainer'})

}

export {
    databaseInitialization,
}