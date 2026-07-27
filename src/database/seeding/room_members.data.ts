// room_members.data.js (Pivot_User_PrivateRoom)
import { uuidToBuffer } from "../../functions/elaboration.js"
import { uuidv7 } from 'uuidv7'

const fakeRoomMembers = [
    // Stanza 1 (Creata da Alexander, partecipa il suo amico Marco)
    { id: 1, roomId: 1, userId: 2, membershipId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexander (Creatore)
    { id: 2, roomId: 1, userId: 4, membershipId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Marco (Amico)

    // Stanza 2 (Creata da Elena, partecipa Alexander)
    { id: 3, roomId: 2, userId: 3, membershipId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Elena (Creatore)
    { id: 4, roomId: 2, userId: 2, membershipId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexander (Amico)

    // Stanza 3 (Creata da Alexius, partecipa Alexander)
    { id: 5, roomId: 3, userId: 1, membershipId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexius (Creatore)
    { id: 6, roomId: 3, userId: 2, membershipId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexander (Amico)
]
export { fakeRoomMembers }