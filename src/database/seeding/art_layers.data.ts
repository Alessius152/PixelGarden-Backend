// art_layers.data.js (La lista ordinata di livelli della Pixelart)
import { uuidToBuffer } from "../../functions/elaboration.js"
import { uuidv7 } from 'uuidv7'

const fakeArtLayers = [
    // Livelli per "Neon Samurai" (Pixelart 1)
    { id: 1, artId: 1, ownerId: 2, layerName: 'Sfondo_Città', parentId: null, uuid: uuidToBuffer("019e64a8-3890-7e87-8e9f-0bdde2f62218"), orderIndex: 0 },
    { id: 2, artId: 1, ownerId: 2, layerName: 'Lineart_Samurai', parentId: null, uuid: uuidToBuffer("019e64a8-3890-7e87-8e9f-0bde20c62f63"), orderIndex: 1 },
    { id: 3, artId: 1, ownerId: 4, layerName: 'Dettagli_Luci_Neon', parentId: null, uuid: uuidToBuffer("019e64a8-3890-7e87-8e9f-0bdff3923f05"), orderIndex: 2 }, // Di Marco!
    
    // Livelli per "Albero Antico" (Pixelart 2)
    { id: 4, artId: 2, ownerId: 3, layerName: 'Tronco_E_Rami', parentId: null, uuid: uuidToBuffer("019e64c6-938a-74b2-a0a8-d03a97574c8e"), orderIndex: 0 },
    { id: 5, artId: 2, ownerId: 2, layerName: 'Fogliame_Rosa_Sakura', parentId: null, uuid: uuidToBuffer(uuidv7()), orderIndex: 1 }, // Di Alexander!
]
export { fakeArtLayers }