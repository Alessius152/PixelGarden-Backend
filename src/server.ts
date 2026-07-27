
/*
spiegazioni importanti:

nei log il prefisso [ndl] significa non-default-log, perché di base li gestisce fastify con pino,
ma se voglio loggare una rottura 500 del server, lo faccio a mano con request.log.





logica stanze: se A ha una stanza con B e C e B esce
le sue pixelart devono esserci sempre, 
passano in eredità a A che è il creatore


*/

import 'dotenv/config'

import Fastify from 'fastify'
import cors from '@fastify/cors'
import fs from 'fs'

import { HTTP_SERVER_PORT } from './objects/constants.js'
import { databaseInitialization } from './database/functions/synchronization.js'

import userRouter from './routers/user.router.js'
import authenticationRouter from './routers/authentication.router.js'
import searchRouter from './routers/search.router.js'
import friendsRouter from './routers/friends.router.js'
import roomsRouter from './routers/rooms.router.js'
import realtimeRouter from './routers/realtime.router.js'
import artsRouter from './routers/arts.router.js'

import { connectRedis } from './redis/config.js'
import { seedInDatabase } from './database/seeding/seeder.js'

// import { seedFriendships } from './testing/seed-friendshipts'
// import { seedPrivateRooms } from './testing/seed-private-rooms'

const loggingStream = fs.createWriteStream('./logs/server.log', { flags: 'a' })
const fastify = Fastify({
    logger: {
        level: 'info',
        stream: loggingStream
    }
})

fastify.addContentTypeParser('application/octet-stream', { parseAs: 'buffer' }, (req, body, done) => {
    done(null, body)
})

fastify.register(cors, {
    origin: [
        'http://localhost:5173',
        'http://192.168.1.55:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
        'http://localhost:4000',
        "https://seconds-happens-towers-msg.trycloudflare.com",
    ]
})
fastify.register(userRouter, { prefix: '/user' })
fastify.register(authenticationRouter, { prefix: '/auth' })
fastify.register(searchRouter, { prefix: '/search' })
fastify.register(friendsRouter, { prefix: '/friends' })
fastify.register(roomsRouter, { prefix: '/rooms' })
fastify.register(realtimeRouter, { prefix: '/realtime' })
fastify.register(artsRouter, { prefix: '/arts' })

const startServer = async () => {

    try {
        const HTTP_SERVER_HOST = process.env.HTTP_SERVER_HOST || '127.0.0.1'

        await databaseInitialization(fastify.log, true)
        await seedInDatabase()

        connectRedis(fastify.log)
        await fastify.listen({ port: HTTP_SERVER_PORT, host: HTTP_SERVER_HOST })

        fastify.log.info({ host: process.env.HTTP_SERVER_HOST, port: HTTP_SERVER_PORT }, 'server online')

    }
    catch (err) {
        fastify.log.error({ err }, 'error starting server')
    }
}

startServer()
