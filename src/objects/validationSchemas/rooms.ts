import { FastifySchema } from "fastify"
import { validatorOfCursorBasedPaginationStartingIndex, validatorOfPrivateRoomName, validatorOfRoomDescription } from "./global.js"

// --- ROOM CREATION ---
const roomCreationSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['roomData'],
        properties: {
            roomData: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: validatorOfPrivateRoomName,
                    description: validatorOfRoomDescription
                }
            }
        }
    }
}
export type roomCreationBody = {
    roomData: {
        name: string;
        description?: string;
    }
}

// --- OWN ROOMS FETCHING ---
const ownRoomsFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['cursor1', 'cursor2'],
        properties: {
            cursor1: validatorOfCursorBasedPaginationStartingIndex,
            cursor2: {
                oneOf: [
                    { type: 'string', minLength: 0, maxLength: 0 },
                    validatorOfPrivateRoomName
                ]
            }
        }
    }
}
export type ownRoomsFetchingQuery = {
    cursor1: string;
    cursor2: string; // Nome stanza o stringa vuota
}

// --- ROOMS WHERE IM IN FETCHING ---
const roomsWhereImInFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['relationId', 'cursor1', 'cursor2'],
        properties: {
            relationId: {
                type: 'string',
                format: 'uuid',
            },
            cursor1: validatorOfCursorBasedPaginationStartingIndex,
            cursor2: {
                oneOf: [
                    { type: 'string', minLength: 0, maxLength: 0 },
                    validatorOfPrivateRoomName
                ]
            }
        }
    }
}
export type roomsWhereImInFetchingQuery = {
    relationId: string;
    cursor1: string;
    cursor2: string;
}

// --- MEMBERS ADDING ---
const membersAddingSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['roomId', 'commit'],
        properties: {
            roomId: {
                type: 'string',
                format: 'uuid'
            },
            commit: {
                type: 'object',
                required: ['add'],
                properties: {
                    add: {
                        type: 'array',
                        minItems: 1,
                        maxItems: 16,
                        items: {
                            type: 'string',
                            format: 'uuid'
                        }
                    },
                }
            }
        }
    }
}
export type membersAddingBody = {
    roomId: string;
    commit: {
        add: string[];
    }
}

// --- MEMBERS REMOVING ---
const membersRemovingSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['roomId', 'commit'],
        properties: {
            roomId: {
                type: 'string',
                format: 'uuid'
            },
            commit: {
                type: 'object',
                required: ['remove'],
                properties: {
                    remove: {
                        type: 'array',
                        minItems: 1,
                        maxItems: 16,
                        items: {
                            type: 'string',
                            format: 'uuid'
                        }
                    }
                }
            }
        }
    }
}
export type membersRemovingBody = {
    roomId: string;
    commit: {
        remove: string[];
    }
}

// --- INVITES FETCHING (SENT/RECEIVED) ---
const sentJoiningInvitesFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['cursor'],
        properties: {
            cursor: validatorOfCursorBasedPaginationStartingIndex
        }
    }
}
export type sentJoiningInvitesFetchingQuery = {
    cursor: string;
}

const receivedJoiningInvitesFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['cursor'],
        properties: {
            cursor: validatorOfCursorBasedPaginationStartingIndex
        }
    }
}
export type receivedJoiningInvitesFetchingQuery = {
    cursor: string;
}

// --- ROOM DATA EDITING ---
const roomDataEditingSchema: FastifySchema = {
    body: {
        type: 'object',
        properties: {
            roomId: { type: 'string', format: 'uuid' },
            newName: validatorOfPrivateRoomName,
            newDescription: validatorOfRoomDescription,
        },
        additionalProperties: false,
        anyOf: [
            { required: ['roomId', 'newName'] },
            { required: ['roomId', 'newDescription'] },
            { required: ['roomId', 'newName', 'newDescription'] }
        ],
    }
}
export type roomDataEditingBody = {
    roomId: string;
    newName?: string;
    newDescription?: string;
}

// --- INVITE CANCELING ---
const sentJoinInviteCancelingSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['inviteId'],
        properties: {
            inviteId: {
                type: 'string',
                format: 'uuid'
            }
        },
        additionalProperties: false
    }
}
export type sentJoinInviteCancelingBody = {
    inviteId: string;
}

// --- INVITE ANSWER
const receivedJoinInviteAnsweringSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['inviteId', 'answer'],
        properties: {
            inviteId: {
                type: 'string',
                format: 'uuid'
            },
            answer: {
                type: 'boolean'
            }
        }
    }
}
export type receivedJoinInvitesAnsweringBody = {
    inviteId: string,
    answer: boolean
}

// --- ROOM MEMBERS FETCHING ---
const roomMembersFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['roomId'],
        properties: {
            roomId: { type: 'string', format: 'uuid' }
        },
        additionalProperties: false
    }
}
export type roomMembersFetchingQuery = {
    roomId: string;
}

// --- ROOM DETAILS FETCHING ---
const roomDetailsFetchingSchema: FastifySchema = {
    params: {
        type: 'object',
        required: ['roomId'],
        properties: {
            roomId: {
                type: 'string',
                format: 'uuid'
            }
        },
        additionalProperties: false
    }
}
export type roomDetailsFetchingParams = {
    roomId: string;
}

export {
    roomCreationSchema,
    ownRoomsFetchingSchema,
    roomsWhereImInFetchingSchema,
    membersAddingSchema,
    membersRemovingSchema,
    sentJoiningInvitesFetchingSchema,
    receivedJoiningInvitesFetchingSchema,
    roomDataEditingSchema,
    sentJoinInviteCancelingSchema,
    receivedJoinInviteAnsweringSchema,
    roomMembersFetchingSchema,
    roomDetailsFetchingSchema,
}