// pixelarts.data.js
import { uuidToBuffer } from "../../functions/elaboration.js"
import { uuidv7 } from 'uuidv7'

const fakePixelarts = [
    // Pixelart legata al Working Layer 1 (Stanza 1, gestita inizialmente da Alexander)
    { id: 1, workingLayerId: 1, artId: uuidToBuffer("019e64a8-3890-7e87-8e9f-0bdb1515edbe"), name: 'Samurai', logicPixelSize: 8, width: 64, height: 64 },
    // Pixelart legata al Working Layer 3 (Stanza 2, gestita inizialmente da Elena)
    { id: 2, workingLayerId: 3, artId: uuidToBuffer(uuidv7()), name: 'Albero Antico', logicPixelSize: 16, width: 128, height: 128 }
]
export { fakePixelarts }