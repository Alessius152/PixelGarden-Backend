import { createClient, RedisClientType } from 'redis'
import { FastifyBaseLogger } from 'fastify'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

let redisClient: ReturnType<typeof createClient> | null = null

async function connectRedis(log: FastifyBaseLogger): Promise<ReturnType<typeof createClient> | null> {
    if (redisClient) return redisClient

    const client = createClient({
        url: REDIS_URL,
        socket: {
            connectTimeout: 3000,
            reconnectStrategy: () => false // niente retry infinito
        }
    })

    client.on('error', (err) => {
        log.warn({ err }, 'redis error (ignored)')
    })

    client.on('ready', () => {
        log.info('redis connected')
    })

    client.on('end', () => {
        log.warn('redis connection closed')
    })

    try {
        await client.connect()
        redisClient = client
        return redisClient
    } catch (err) {
        log.warn({ err }, 'redis not available, continuing without it')
        redisClient = null
        return null
    }
}

export { redisClient, connectRedis }