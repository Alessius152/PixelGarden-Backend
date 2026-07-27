// working_layers.data.js
import { uuidToBuffer } from "../../functions/elaboration.js"
import { uuidv7 } from 'uuidv7'

const newUUID = () => uuidToBuffer(uuidv7())

const fakeWorkingLayers = [
    // Ogni membro della stanza ha un record WorkingLayer univoco per quella stanza
    { id: 1, wLayerId: newUUID(), roomId: 1, detentorId: 2, createdAt: new Date() }, // Alexander nella Stanza 1
    { id: 2, wLayerId: newUUID(), roomId: 1, detentorId: 4, createdAt: new Date() }, // Marco nella Stanza 1
    
    { id: 3, wLayerId: newUUID(), roomId: 2, detentorId: 3, createdAt: new Date() }, // Elena nella Stanza 2
    { id: 4, wLayerId: newUUID(), roomId: 2, detentorId: 2, createdAt: new Date() }, // Alexander nella Stanza 2
    
    { id: 5, wLayerId: newUUID(), roomId: 3, detentorId: 1, createdAt: new Date() }, // Alexius nella Stanza 3
    { id: 6, wLayerId: newUUID(), roomId: 3, detentorId: 2, createdAt: new Date() }, // Alexander nella Stanza 3
]
export { fakeWorkingLayers }