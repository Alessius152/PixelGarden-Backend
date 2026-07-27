
type notification__homepageNotificationsChannel__newFriendshipRequestReceived = {
    from: { username: string, userId: string },
    requestId: string,
    sentAt: string
}

type notification__homepageNotificationsChannel__newRoomJoinInvite = {
    from: [string, string],//0=username, 1=userId
    roomName: string,
    inviteId: string,
}

/*questa notifica viene inviata quando io mi trovo in una stanza di lavoro e un membro, nel suo working layer, crea una 
nuova pixelart.*/
type notification__workingRoom__newArtCreated = {
    headers: {
        rtClientId: string,
        userAt: string
    },
    roomId: string,
    workingLayerId: string,
    artData: {
        artId: string,
        name: string,
        width: number,
        height: number,
        logicPixelSize: number,
    },
    createdAt: string
}

type notification__workingRoom__newArtLayerCreated = {
    headers: {
        rtClientId: string,
        userAt: string
    },
    artId: string,
    layerData: {
        dim: [number, number]/*0 = width, 1 = height*/,
        name: string,
        uuid: string,
        orderIndex: number,
        owner: [string, string]
    }
}

type notification__workingRoom__newCollaboratorsAdded = {
    headers: {
        rtClientId: string,
        userAt: string
    },
    artId: string,
    collaborators: Array<[string, string]> //first userId (@), second username
}

/*headers: 0 rtClientId, 1 userAt
location: 0 roomId, 1 artId, 2 layerId
square: 0 width, 1 height, 2 x, 3 y*/
type notification__workingRoom__newStrokeBeenApproved = {
    headers: [string, string],
    layerId: string,
    square: [number, number, number, number],
    pixels: string
}

export type {
    notification__homepageNotificationsChannel__newFriendshipRequestReceived,
    notification__homepageNotificationsChannel__newRoomJoinInvite,

    notification__workingRoom__newArtCreated,
    notification__workingRoom__newArtLayerCreated,
    notification__workingRoom__newCollaboratorsAdded,
    notification__workingRoom__newStrokeBeenApproved
}
