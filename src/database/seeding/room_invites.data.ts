// room_invites.data.js
import { uuidToBuffer } from "../../functions/elaboration.js"
import { uuidv7 } from 'uuidv7'

const fakeRoomInvites = [
    // Invito RICEVUTO da Alexander: Sara (sua amica) lo invita a una sua stanza (che non compare ancora nelle sue stanze)
    // Nota: Sara ha una sua stanza ipotetica (es: id 4, non creata nel seed o creata apposta) o semplicemente l'invito è visibile in UI.
    { id: 1, inviteId: uuidToBuffer(uuidv7()), inviter: 5, roomId: 2, invitee: 2, createdAt: new Date() }
]
export { fakeRoomInvites }