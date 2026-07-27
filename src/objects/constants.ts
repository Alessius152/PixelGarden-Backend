
const HTTP_SERVER_PORT = parseInt(process.env.HTTP_SERVER_PORT!)
const JWT_PREFIX = 'Bearer'

const databaseTablesName = {
    USERS: 'users',
    FRIENDSHIP_REQUESTS: 'friendship_requests',
    FRIENDSHIPS: 'friendships',
    PRIVATE_ROOMS: 'private_rooms',
    PIVOT_FOR_ROOM_MEMBERS: 'room_members',
    PRIVATE_ROOM_JOIN_INVITES: 'proom_join_invites',
    WORKING_LAYERS: 'working_layers',
    PIXELARTS: 'pixelarts',
    PIVOT_FOR_PIXELARTS_COLLABORATORS: 'pixelarts_collaborators',
    ART_LAYER: 'arts_layers'
}

export {
    HTTP_SERVER_PORT,
    JWT_PREFIX,
    databaseTablesName,
}
