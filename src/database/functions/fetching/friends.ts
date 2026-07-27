
import { Op, QueryTypes } from "sequelize"
import { bufferToUuid } from "../../../functions/elaboration.js"
import { databaseTablesName } from "../../../objects/constants.js"
import { friendsListCursor_asInput, friendsListCursor_forDatabase } from "../../../types/tieBreakCursors.js"
import databaseInterface from "../../config.js"
import Friendship from "../../models/Friendship.model.js"
import { paginationLimits } from "../../../objects/constants/cursorBasedPagination.js"


/*requestId deve essere crescente e univoco*/


/*
side indica
    s = se voglio le richieste inviate
    r = se voglio le richieste ricevute

startingPoint sarebbe lo uuidv7 bufferizzato, cioè il requestId
*/
async function getPortionOfFriendshipRequestsList(startingPoint: Buffer, internalUserId: number, side: 's' | 'r') {

    const internalUserSideField = (side === 's') ? 'senderId' : 'receiverId'
    const otherSideUserField = (side === 's') ? 'receiverId' : 'senderId'

    const fetchingQuery = `
    select requestId, u.username as ${side === 's' ? 'receiver' : 'sender'}, u.userId as ${side === 's' ? 'receiverId' : 'senderId'}
    from ${databaseTablesName.FRIENDSHIP_REQUESTS}
    join users u on ${otherSideUserField} = u.id 
    where ${internalUserSideField} = :internalUserId 
    and requestId > :requestId
    order by requestId limit ${paginationLimits.friendshipRequestsList.sent + 1}
    `

    const result = (await databaseInterface.query(fetchingQuery, {
        replacements: {
            internalUserId,
            requestId: startingPoint
        },
        type: QueryTypes.SELECT
    })) as Array<{ requestId: Buffer }> // altra prop riferita all'[utente a cui ho mandato / utente che ha ricevute] la richieste di amicizia

    const isTheLastPage = result.length <= paginationLimits.friendshipRequestsList.sent
    const nextCursor = (!isTheLastPage) ? (bufferToUuid(result[result.length - 2].requestId)) : 0

    return { result: result.slice(0, paginationLimits.friendshipRequestsList.sent), nextCursor, isTheLastPage }

}
async function getPortionOfFriendsList(
    startingPoint: friendsListCursor_forDatabase,
    internalUserId: number
) {
    const fetchingQuery = `
        select
            u.isOnline as isOnline,
            u.userId as friendId,
            u.username as friend,
            f.relationId
        from (
            select user2 as friendId, relationId
            from friendships
            where user1 = :fetcherId

            union all

            select user1 as friendId, relationId
            from friendships
            where user2 = :fetcherId
        ) f
        join users u on u.id = f.friendId
        where (u.username, f.relationId) > (:cursor1, :cursor2)
        order by u.username, f.relationId
        limit ${paginationLimits.friendsList + 1};
    `;

    const result = await databaseInterface.query<{
        relationId: Buffer,
        friend: string,
        friendId: string,
        isOnline: boolean
    }>(
        fetchingQuery,
        {
            replacements: {
                cursor1: startingPoint.username,
                cursor2: startingPoint.relationId,
                fetcherId: internalUserId,
            },
            type: QueryTypes.SELECT,
        }
    );

    const totalRecords = await Friendship.count({
        where: {
            [Op.or]: [
                { user1: internalUserId },
                { user2: internalUserId }
            ]
        }
    });

    // Gestione sicura del lastElement
    let lastElement = null;
    const isTheLastPage = result.length <= paginationLimits.friendsList;
    if (!isTheLastPage) {
        lastElement = result[result.length - 1];
    }

    const nextCursor: friendsListCursor_asInput = isTheLastPage
        ? { username: '', relationId: '0' }
        : { username: lastElement!.friend, relationId: bufferToUuid(lastElement!.relationId) };

    // Mappatura dei risultati reali
    const mappedResults = result
        .slice(0, paginationLimits.friendsList)
        .map(record => ({
            relationId: bufferToUuid(record.relationId),
            friend: record.friend,
            friendId: record.friendId,
            isOnline: record.isOnline
        }));

    return {
        result: mappedResults,
        nextCursor,
        isTheLastPage,
        totalRecords,
    };
}

async function getAllFriendsOfASpecificUser(userId: number, friendAttrs?: Array<string>) {

    const columns = friendAttrs?.map(v => `u.${v}`).join(',') || 'u.*'

    const query = `
    select ${columns}
    from friendships f
    join users u 
        on f.user1 = :internalUserId
        and u.id = f.user2
    union all
    select ${columns}
    from friendships f
    join users u 
        on f.user2 = :internalUserId
        and u.id = f.user1;
    `

    const [result] = await databaseInterface.query(query, {
        replacements: {
            internalUserId: userId
        },
    })

    return result

}

export {
    getAllFriendsOfASpecificUser,
    getPortionOfFriendsList,
    getPortionOfFriendshipRequestsList,
}
