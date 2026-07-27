// friendship_requests.data.js
import { uuidToBuffer } from "../../functions/elaboration.js"
import { uuidv7 } from 'uuidv7'

const fakeFriendshipRequests = [
    // Richiesta RICEVUTA da Alexander (da mostrare in UI come notifica)
    { id: 1, requestId: uuidToBuffer(uuidv7()), senderId: 7, receiverId: 2, pairKey: '2_7', createdAt: new Date() }, // Alice ti chiede l'amicizia
    // Richiesta INVIATA da Alexander
    { id: 2, requestId: uuidToBuffer(uuidv7()), senderId: 2, receiverId: 8, pairKey: '2_8', createdAt: new Date() }, // Chiedi l'amicizia a Matteo
]
export { fakeFriendshipRequests }