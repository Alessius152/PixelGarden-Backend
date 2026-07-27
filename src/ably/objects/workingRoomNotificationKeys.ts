

const realtimeWorkingRoomNotificationKeys = {

    /*questa notifica viene inviata quando io mi trovo in una stanza di lavoro e un membro, nel suo working layer, crea una 
    nuova pixelart.*/
    NEW_ART_CREATED: 'member-created-new-art',

    ADDED_NEW_ART_LAYER: 'added-new-art-layer',
    NEW_COLLABS_ADDED: 'new-collabs-added-to-art',

    NEW_STROKE_APPROVED: (roomId: string, artId: string) => `new-stroke-approved-${roomId}-${artId}`

}

export {
    realtimeWorkingRoomNotificationKeys,
}

