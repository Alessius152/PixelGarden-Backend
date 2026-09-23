import { Op } from "sequelize"
import { databaseTablesName } from "../../../objects/constants.js"
import databaseInterface from "../../config.js"
import User from "../../models/User.model.js"
import { paginationLimits } from "../../../objects/constants/cursorBasedPagination.js"

type userFilteringSearchRecord = { uuid: Buffer, username: string, userId: string }

async function fetchUsersByFilter(query: string, cursor: Buffer): Promise<{ totalRecords: number, firsts: Array<userFilteringSearchRecord>, nextCursor: null | Buffer, isTheLastPage: boolean }> {
    const filteringQuery = `
    select uuidv7 as uuid, username, userId
    from ${databaseTablesName.USERS} 
    where (
        (username like concat(:query, '%'))
        and (uuidv7 > :cursor)
    ) 
    limit ${paginationLimits.userFilteredSearch + 1};
    `
    const result = await databaseInterface.query(filteringQuery, {
        replacements: { query, cursor }
    })

    const totalRecords = await User.count({
        where: {
            username: {
                [Op.like]: query + '%'
            }
        }
    })

    let nextCursor
    let isTheLastPage

    if (result[0].length <= paginationLimits.userFilteredSearch) {
        nextCursor = null
        isTheLastPage = true
    }
    else {
        const { uuid } = result[0][result[0].length - 2] as unknown as { username: string, uuid: Buffer }
        nextCursor = uuid
        isTheLastPage = false
    }

    return {
        firsts: (result[0] as Array<userFilteringSearchRecord>).slice(0, paginationLimits.userFilteredSearch),
        totalRecords,
        nextCursor,
        isTheLastPage,
    }
}

export {
    fetchUsersByFilter,
}