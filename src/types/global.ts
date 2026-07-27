import { FastifyRequest, FastifyReply } from 'fastify'
import { HookHandlerDoneFunction } from 'fastify/types/hooks.js'

type fastifyPreHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void
type fastifyController = (request: FastifyRequest, reply: FastifyReply) => Promise<void> | void
type fastifyPreValidation = (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => Promise<void> | void

export type {
    fastifyPreHandler,
    fastifyController,
    fastifyPreValidation,
}
