import { WorkflowEntrypoint } from "cloudflare:workers";
import { FastifySchema } from "fastify"
import { jwtStringSchema } from "./global.js";

const pixelartsListFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['workingLayerId'],
        properties: {
            workingLayerId: {
                type: 'string',
                format: 'uuid'
            }
        },
        additionalProperties: false
    }
}
export type pixelartsListFetchingQuery = {
    workingLayerId: string;
}

const pixelartCreationSchema: FastifySchema = {

    body: {
        type: 'object',
        required: ['workingLayerId', 'artData'],
        properties: {
            workingLayerId: { type: 'string', format: 'uuid' },
            artData: {
                type: 'object',
                required: ['name', 'logicPixelSize', 'width', 'height'],
                properties: {
                    name: { type: 'string', minLength: 2, maxLength: 32 },
                    logicPixelSize: { type: 'integer', minimum: 2, maximum: 32 },
                    width: { type: 'integer', minimum: 1, maximum: 1024 },
                    height: { type: 'integer', minimum: 1, maximum: 1024 }
                }
            }
        },
        additionalProperties: false
    }
}

export type pixelartCreationBody = {
    workingLayerId: string;
    artData: {
        name: string;
        logicPixelSize: number;
        width: number;
        height: number;
    }
}

const artCollaboratorsListFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['artId'],
        properties: {
            artId: {
                type: 'string',
                format: 'uuid'
            }
        },
        additionalProperties: false
    }
}

export type artCollaboratorsListFetchingQuerystring = {
    artId: string
}

const pixelartDataFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['artId'],
        properties: {
            artId: {
                type: 'string',
                format: 'uuid'
            }
        },
        additionalProperties: false
    }
}

export type artDataFetchingQuerystring = {
    artId: string
}

const artLayerAddingSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['artId', 'layerName', 'artLayersEditingToken'],
        properties: {
            artId: {
                type: 'string',
                format: 'uuid'
            },
            layerName: { type: 'string', maxLength: 32 },
            artLayersEditingToken: {
                type: 'string',
                pattern: jwtStringSchema //jwt format without bearer
            }
        },
        additionalProperties: false
    }
}
export type artLayerAddingBody = {
    artId: string,
    layerName: string,
    artLayersEditingToken: string
}

const artLayersListFetchingSchema: FastifySchema = {
    querystring: {
        type: 'object',
        required: ['artId', 'cursor'],
        properties: {
            artId: {
                type: 'string',
                format: 'uuid'
            },
            cursor: {
                type: 'integer',
                minimum: -1
            }
        },
        additionalProperties: false
    }
}
export type artLayersListFetchingQuerystring = {
    artId: string,
    cursor: number,
}

const collaboratorsAddingSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['artId', 'commit'],
        properties: {
            artId: { type: 'string', format: 'uuid' },
            commit: {
                type: 'array',
                minItems: 1,
                maxItems: 16,
                uniqueItems: true,
                items: {
                    type: 'string',
                    format: 'uuid'
                }
            }
        },
        additionalProperties: false
    }
}
export type artCollaboratorsAddingBody = {
    artId: string,
    commit: Array<string>
}

/*questo è il v1, che utilizzava json per trasportare le sub-image, cioè le porzioni di disegno
modificate. Estremamente inefficiente
Adesso voglio introdurre il v2 dove metto i pixel come array binario e il resto come headers X-**/
// const strokeApprovingSchema: FastifySchema = {
//     body: {
//         type: 'object',
//         required: ['editingToken', 'layerId', 'x', 'y', 'w', 'h', 'pixels'],
//         properties: {
//             editingToken: { type: 'string', pattern: jwtStringSchema },
//             layerId: { type: 'string', format: 'uuid' },
//             x: { type: 'integer', minimum: 0 },
//             y: { type: 'integer', minimum: 0 },
//             w: { type: 'integer', minimum: 1 },
//             h: { type: 'integer', minimum: 1 },
//             pixels: {
//                 type: 'array',
//                 items: {
//                     type: 'integer',
//                     minimum: 0,
//                     maximum: 255
//                 }
//             }
//         }
//     }
// }
// export type strokeApprovingBody = {
//     editingToken: string,
//     layerId: string,
//     x: number,
//     y: number,
//     w: number,
//     h: number,
//     pixels: Array<number>
// }

const strokeApprovingSchema = {
    headers: {
        type: 'object',
        required: ['x-editing-token', 'x-layer-id', 'x-pos-x', 'x-pos-y', 'x-width', 'x-height'],
        properties: {
            'x-editing-token': { type: 'string', pattern: jwtStringSchema },
            'x-layer-id': { type: 'string', format: 'uuid' },
            'x-pos-x': { type: 'integer' },
            'x-pos-y': { type: 'integer' },
            'x-width': { type: 'integer' },
            'x-height': { type: 'integer' }
        }
    },
}
export type strokeApprovingHeaders = {
    'x-editing-token': string,
    'x-layer-id': string,
    'x-pos-x': number,
    'x-pos-y': number,
    'x-width': number,
    'x-height': number,
}

export {
    pixelartsListFetchingSchema,
    pixelartCreationSchema,
    artCollaboratorsListFetchingSchema,
    pixelartDataFetchingSchema,
    artLayerAddingSchema,
    artLayersListFetchingSchema,
    collaboratorsAddingSchema,
    strokeApprovingSchema,
}
