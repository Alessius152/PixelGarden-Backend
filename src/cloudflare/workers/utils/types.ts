
type artLayersDownloadDecodedToken = {
    user: {
        at: string,
        uuid: string,
    },
    membership: {
        roomId: string,
    }
}

type artLayersEditingDecodedToken = {
    editableLayers: Array<string>, //array of uuidv7s
    roomId: string,
    artId: string,
    layersOwner: string,
}

export {
    artLayersDownloadDecodedToken,
    artLayersEditingDecodedToken,
}
