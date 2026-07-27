// private_rooms.data.js
import { uuidToBuffer } from "../../functions/elaboration.js"

const fakePrivateRooms = [
    { id: 1, creatorId: 2, name: 'City Assets', description: 'Stanza per la creazione di tile e background sci-fi.', uuidv7: uuidToBuffer('019ce64b-0101-7a11-8c21-9c4f6e2a1001'), createdAt: new Date() },
    { id: 2, creatorId: 3, name: 'Bosco Incantato Top-Down', description: 'Collaborazione per GDR stile Stardew Valley.', uuidv7: uuidToBuffer('019ce64b-0102-7a11-8c21-9c4f6e2a1002'), createdAt: new Date() },
    { id: 3, creatorId: 1, name: 'UI & Menù di Gioco', description: 'Progettazione bottoni, icone e interfacce retro.', uuidv7: uuidToBuffer('019ce64b-0103-7a11-8c21-9c4f6e2a1003'), createdAt: new Date() },
]
export { fakePrivateRooms }