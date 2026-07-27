import { FastifySchema } from "fastify"
import { usernameValidation, validatorOfCursorBasedPaginationStartingIndex } from "./global.js"

//api /friends/sendFriendshipRequest
const friendshipRequestSendingSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['destinataryUuid'],
        properties: {
            destinataryUuid: {
                type: 'string',
                format: 'uuid',
            }
        },
        additionalProperties: false
    }
}
export type friendshipRequestSendingBody = {
    destinataryUuid: string;
}

//api /friends/getAllSendedRequests
const sendedRequestsFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['cursor'],
        properties: {
            cursor: validatorOfCursorBasedPaginationStartingIndex
        },
        additionalProperties: false
    }
}
export type sendedRequestsFetchingQuery = {
    cursor: number;
}

//api /friends/getAllReceivedRequests
const receivedRequestsFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['cursor'],
        properties: {
            cursor: validatorOfCursorBasedPaginationStartingIndex
        },
        additionalProperties: false
    }
}
export type receivedRequestsFetchingQuery = {
    cursor: number;
}

//api /friends/answerToFriendshipRequest
const friendshipRequestAnsweringSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['requestId', 'answer'],
        properties: {
            requestId: {
                type: 'string',
                format: 'uuid',
            },
            answer: {
                type: 'boolean' //true: accept ; false: reject
            }
        },
        additionalProperties: false
    }
}
export type friendshipRequestAnsweringBody = {
    requestId: string;
    answer: boolean;
}

//api /friends/friendsList
const friendsListFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['cursor1', 'cursor2'],
        properties: {
            cursor1: {
                anyOf: [
                    usernameValidation,
                    { type: 'string', maxLength: 0 }
                ]
            },
            cursor2: validatorOfCursorBasedPaginationStartingIndex
        },
        additionalProperties: false
    }
}
export type friendsListFetchingQuery = {
    cursor1: string; // Sarà lo username o stringa vuota
    cursor2: number; // Il relationId numerico per spezzare i pareggi alfabetici
}

//api /friends/cancelFriendship
const friendshipDeletingSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['relationId'],
        properties: {
            relationId: {
                type: 'string',
                format: 'uuid',
            }
        },
        additionalProperties: false
    }
}
export type friendshipDeletingBody = {
    relationId: string;
}

//api /friends/cancelSentRequest
const friendshipSentRequestCancelingSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['requestId'],
        properties: {
            requestId: {
                type: 'string',
                format: 'uuid'
            }
        },
        additionalProperties: false
    }
}
export type friendshipSentRequestCancelingBody = {
    requestId: string;
}

export {
    friendsListFetchingSchema,
    friendshipDeletingSchema,
    friendshipRequestAnsweringSchema,
    friendshipRequestSendingSchema,
    receivedRequestsFetchingSchema,
    sendedRequestsFetchingSchema,
    friendshipSentRequestCancelingSchema,
}