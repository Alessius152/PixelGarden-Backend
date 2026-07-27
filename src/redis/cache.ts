import { userAuth } from "./types.js"
import { redisClient } from "./config.js"
import { cacheKeys } from "./maps.js"
import { FastifyBaseLogger } from "fastify"

const isRedisKeepGoing = () => {
    return !!(redisClient && redisClient.isReady)
}

const saveUserByFirebaseUid = async (log: FastifyBaseLogger, uid: string, user: userAuth) => {

    if (!isRedisKeepGoing()) {
        return null
    }

    const client = redisClient
    if (!client || !client.isReady) return null

    try {
        const cacheKey = `${cacheKeys.userAuth}:${uid}`
        await client.set(cacheKey, JSON.stringify(user), {
            expiration: {
                type: 'EX',
                value: 60 * 5
            },
        })
    }
    catch (err) {
        log.error({ err }, '[redis] save')
        return null
    }

}

const getUserByFirebaseUid: (log: FastifyBaseLogger, uid: string) => Promise<null | userAuth> = async (log, uid) => {

    if (!isRedisKeepGoing()) {
        return null
    }

    const client = redisClient
    if (!client || !client.isReady) return null

    try {
        const cacheKey = `${cacheKeys.userAuth}:${uid}`
        const saved = await client.get(cacheKey)

        if (saved) {
            return JSON.parse(saved) as userAuth
        }

        return null
    }
    catch (err) {
        log.error({ err }, '[redis] fetch')
        return null
    }

}

export const cache = {
    saveUserByFirebaseUid,
    getUserByFirebaseUid
}
