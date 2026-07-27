// friendships.data.js
import { uuidToBuffer } from "../../functions/elaboration.js"
import { uuidv7 } from 'uuidv7'

const fakeFriendships = [
    { user1: 1, user2: 2, relationId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexius e Alexander
    { user1: 2, user2: 3, relationId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexander ed Elena
    { user1: 2, user2: 4, relationId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexander e Marco
    { user1: 2, user2: 5, relationId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexander e Sara
    { user1: 1, user2: 6, relationId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexius e Davide (già esistente)

    // Nuove aggiunte per rendere Alexander amico di tutti (ID: 2)
    { user1: 2, user2: 6, relationId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexander e Davide
    { user1: 2, user2: 7, relationId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexander e Alice
    { user1: 2, user2: 8, relationId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexander e Teo
    { user1: 2, user2: 9, relationId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexander e Mario
    { user1: 2, user2: 10, relationId: uuidToBuffer(uuidv7()), createdAt: new Date() }, // Alexander e Leo
]

export { fakeFriendships }