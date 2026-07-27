
type layersDownloadingToken = {
    user: {
        at: string, // user at
        uuid: string,
    },
    membership: {
        roomId: string, //room uuidv7
    }
}

type layersEditingToken = {
    editableLayers: Array<string>,
    roomId: string,
    artId: string,
    layersOwner: string, // user at
}

export type {
    layersDownloadingToken,
    layersEditingToken
}
