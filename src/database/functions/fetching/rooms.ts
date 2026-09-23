import { Model, Op, QueryTypes, Sequelize } from "sequelize"
import PrivateRoom from "../../models/PrivateRoom.model.js"
import { paginationLimits } from "../../../objects/constants/cursorBasedPagination.js"
import { bufferToUuid } from "../../../functions/elaboration.js"
import databaseInterface from "../../config.js"
import { databaseTablesName } from "../../../objects/constants.js"
import PRoomMembershipJoinInvites from "../../models/PRoomMembershipJoinInvites.model.js"
import Pivot_User_PrivateRoom from "../../models/Pivot_User_PrivateRoom.model.js"

async function getPortionOfOwnerRooms(ownerId: number, cursorUuid: Buffer, cursorName: string) {
    const result = await PrivateRoom.findAll({
        attributes: ['uuidv7', 'name', 'description', 'createdAt'],
        where: {
            creatorId: ownerId,
            [Op.or]: [
                { uuidv7: { [Op.gt]: cursorUuid } },
                {
                    uuidv7: cursorUuid,
                    name: { [Op.gt]: cursorName }
                }
            ]
        },
        order: [['uuidv7', 'ASC'], ['name', 'ASC']],
        limit: paginationLimits.roomsList.my + 1
    })

    const page = result.slice(0, paginationLimits.roomsList.my)

    const formattedList = page.map(r => ({
        roomId: bufferToUuid(r.dataValues.uuidv7),
        name: r.dataValues.name,
        description: r.dataValues.description,
        creationTime: r.dataValues.createdAt,

        members: {
            total: Math.floor(Math.random() * (1 - 12) + 12),
            activeNow: Math.floor(Math.random() * (1 - 12) + 12)
        }
    }))

    const lastElement = page[page.length - 1] || null
    const isTheLastPage = result.length <= paginationLimits.roomsList.my
    const nextCursor = !lastElement ? ({ cursor1: '0', cursor2: '' }) : ({
        cursor1: bufferToUuid(lastElement.dataValues.uuidv7),
        cursor2: lastElement.dataValues.name
    })

    return { result: formattedList, nextCursor, isTheLastPage }
}

/*il nome di questa funzione è confusionario. in poche parole
prendo in input:
    lo uuid di un utente (friend_uuid)
    un cursore {cursor1: uuid, cursor2: room_name}
e relativamente all'utente che fa la richiesta (authenticatedd_user), prendo una parte della room
appartenenti a friend_uuid in cui authenticatedd_user è membro.

un sottoinsieme delle room di cui authenticatedd_user fa parte, e per di più paginata con cursore.*/
async function getPortionOfRoomsOfAFriendWhereImIn(friendId: number, internalUserId: number, cursor1: Buffer, cursor2: string) {

    const prt = databaseTablesName.PRIVATE_ROOMS
    const rmt = databaseTablesName.PIVOT_FOR_ROOM_MEMBERS

    const query = `
select
    ${prt}.name, 
    ${prt}.description, 
    ${prt}.uuidv7, 
    ${prt}.createdAt
from ${prt}
join ${rmt} 
    on ${rmt}.roomId = ${prt}.id
where ${prt}.creatorId = :friendPk
  and ${rmt}.userId = :internalUserId
  and (${prt}.name, ${prt}.uuidv7) > (:cursor2, :cursor1)
order by ${prt}.name asc, ${prt}.uuidv7 asc
limit ${paginationLimits.roomsList.ofFriends + 1};
    `

    const result = await databaseInterface.query<{ name: string, description: string, uuidv7: Buffer, createdAt: Date }>(
        query, {
        replacements: {
            friendPk: friendId,
            internalUserId,
            cursor1,
            cursor2
        },
        type: QueryTypes.SELECT
    })

    const page = result.slice(0, paginationLimits.roomsList.ofFriends)
    const formattedResult = page.map(r => ({
        name: r.name,
        description: r.description,
        roomId: bufferToUuid(r.uuidv7),
        creationTime: r.createdAt,

        members: {
            total: Math.floor(Math.random() * (1 - 12) + 12),
            activeNow: Math.floor(Math.random() * (1 - 12) + 12)
        }
    }))
    const lastElement = formattedResult[formattedResult.length - 1]
    const isTheLastPage = result.length <= paginationLimits.roomsList.ofFriends
    const nextCursor = isTheLastPage ? ({ cursor1: '0', cursor2: '' }) : ({
        cursor1: lastElement.roomId,
        cursor2: lastElement.name
    })

    return {
        result: formattedResult,
        nextCursor,
        isTheLastPage
    }

}

async function getSentRoomJoiningInvites(internalUserId: number, cursor: Buffer) {

    const query = `select 
    inviteId,
    ${databaseTablesName.PRIVATE_ROOM_JOIN_INVITES}.createdAt,
    u.username as invitee,
    pr.name as room
from ${databaseTablesName.PRIVATE_ROOM_JOIN_INVITES} 
join ${databaseTablesName.USERS} u on u.id = invitee
join ${databaseTablesName.PRIVATE_ROOMS} pr on pr.id = roomId
where (inviter = :internalUserId) and (inviteId > :cursor)
order by inviteId asc
limit ${paginationLimits.roomJoinInvites.sent + 1}
    `
    const result = await databaseInterface.query<{
        inviteId: Buffer,
        createdAt: Date,
        invitee: string,
        room: string
    }>(query, {
        replacements: { internalUserId, cursor },
        type: QueryTypes.SELECT
    })

    const totalRecords = await PRoomMembershipJoinInvites.count({
        where: { inviter: internalUserId },
    })

    if (!result.length) {
        return { result: [], nextCursor: '0', isTheLastPage: true, totalRecords }
    }

    const formattedResult = result.slice(0, paginationLimits.roomJoinInvites.sent).map((invite) => (
        { ...invite, inviteId: bufferToUuid(invite.inviteId) }
    ))
    const lastElement = formattedResult[formattedResult.length - 1]
    const isTheLastPage = result.length <= paginationLimits.roomJoinInvites.sent
    const nextCursor = isTheLastPage ? '0' : lastElement.inviteId

    return { result: formattedResult, nextCursor, isTheLastPage, totalRecords }

}

async function getReceivedRoomJoiningInvites(internalUserId: number, cursor: Buffer) {

    const query = `select 
        inviteId, 
        u.username as inviterUname, 
        u.userId as inviterUserId, 
        pr.name, 
        ${databaseTablesName.PRIVATE_ROOM_JOIN_INVITES}.createdAt
from ${databaseTablesName.PRIVATE_ROOM_JOIN_INVITES}
join ${databaseTablesName.USERS} u on u.id = inviter
join ${databaseTablesName.PRIVATE_ROOMS} pr on pr.id = roomId
where (
    (invitee = :internalUserId)
    and (inviteId > :cursor)
)
limit ${paginationLimits.roomJoinInvites.received + 1};`

    const result = await databaseInterface.query<{
        inviteId: Buffer,
        inviterUname: string,
        inviterUserId: string,
        roomId: string,
        createdAt: Date
    }>(query, {
        replacements: { internalUserId, cursor },
        type: QueryTypes.SELECT
    })

    const totalRecords = await PRoomMembershipJoinInvites.count({
        where: { invitee: internalUserId },
    })

    if (!result.length) {
        return { result: [], nextCursor: '0', isTheLastPage: true, totalRecords }
    }

    const formattedResult = result.slice(0, paginationLimits.roomJoinInvites.received).map(invite => (
        { ...invite, inviteId: bufferToUuid(invite.inviteId) }
    ))
    const lastElement = formattedResult[formattedResult.length - 1]
    const isTheLastPage = result.length <= paginationLimits.roomJoinInvites.received
    const nextCursor = isTheLastPage ? '0' : lastElement.inviteId

    return { result: formattedResult, nextCursor, isTheLastPage, totalRecords }

}

/*questa funzione si usa quando voglio entrare in una stanza per lavorare e si occupa di verificare che io ne sia membro
membro vuol dire solo una delle seguenti cose:
    - ne sono il creatore
    - non ne sono il creatore MA ne sono membro
*/
async function checkMembership(internalUserId: number, roomId: Buffer): Promise<null | { room: { id: number, creatorId: number, name: string, description: string, uuidv7: Buffer } }> {
    const room = await PrivateRoom.findOne({
        where: {
            uuidv7: roomId
        },
        attributes: ['id', 'creatorId', 'name', 'description', 'uuidv7']
    })

    if (!room) return null

    const { id, creatorId, name, description, uuidv7 } = room.dataValues

    if (room.dataValues.creatorId === internalUserId) return {
        room: { id, creatorId, name, description, uuidv7 }
    }

    const membership = await Pivot_User_PrivateRoom.findOne({
        where: {
            roomId: room.dataValues.id,
            userId: internalUserId
        },
        attributes: ['id']
    })

    if (!membership) return null

    return {
        room: { id, creatorId, name, description, uuidv7 }
    }
}

async function getRoomMembers(roomPk: number) {

    const query = `select rm.userId, u.username, u.userId, u.id as userPk, rm.membershipId
from ${databaseTablesName.PIVOT_FOR_ROOM_MEMBERS} rm
join ${databaseTablesName.USERS} u on u.id = rm.userId
where rm.roomId = :roomPk;`

    const result = await databaseInterface.query<{ userPk: number, username: string, userId: string, membershipId: string }>(query, {
        replacements: { roomPk },
        type: QueryTypes.SELECT
    })

    return result

}

async function getJustRoomMembersPk(roomPk: number) {

    const query = `select u.id as userPk
from ${databaseTablesName.PIVOT_FOR_ROOM_MEMBERS} rm
join ${databaseTablesName.USERS} u on u.id = rm.userId
where rm.roomId = :roomPk;`

    const result = await databaseInterface.query<{ userPk: number }>(query, {
        replacements: { roomPk },
        type: QueryTypes.SELECT
    })

    return result

}

async function getRoomWorkingLayers(roomPk: number) {

    const query = `select wl.wLayerId as layerId, u.id as userPk
from working_layers wl 
join users u on wl.detentorId = u.id
where wl.roomId = :roomPk
`

    const result = await databaseInterface.query<{ layerId: Buffer, userPk: number }>(query, {
        replacements: { roomPk },
        type: QueryTypes.SELECT
    })

    return result

}

export {
    getPortionOfOwnerRooms,
    getPortionOfRoomsOfAFriendWhereImIn,
    getSentRoomJoiningInvites,
    getReceivedRoomJoiningInvites,
    checkMembership,
    getRoomMembers,
    getJustRoomMembersPk,
    getRoomWorkingLayers,
}
