import { Env } from "../../index.js"
import { errors, jwtVerify } from 'jose'
import { isUUIDv7, isValidUserAt } from "../../utils/validations.js"
import { artLayersDownloadDecodedToken } from "../../utils/types.js"
import { voidJson } from "../../utils/constants.js"

const artLayerDownloadingController = async (corsHeaders: HeadersInit, request: Request, env: Env) => {
    const jsonHeaders = {
        ...corsHeaders,
        "Content-Type": "application/json"
    }

    const auth = request.headers.get('Authorization')
    if (!auth) return new Response(voidJson, { status: 401, headers: jsonHeaders })

    const [prefix, token, other] = auth.split(' ')
    const params = new URL(request.url).searchParams
    const artId = params.get('artId')
    const layerId = params.get('layerId')
    const userId = params.get('userId')

    if (!(layerId && isUUIDv7(layerId))) return new Response(voidJson, { status: 400, headers: jsonHeaders })
    if (!(artId && isUUIDv7(artId))) return new Response(voidJson, { status: 400, headers: jsonHeaders })
    if (!(userId && isValidUserAt(userId))) return new Response(voidJson, { status: 400, headers: jsonHeaders })
    if (!((prefix === "Bearer") && token.trim() && (!other))) return new Response(voidJson, { status: 400, headers: jsonHeaders })

    let jwtPayload: artLayersDownloadDecodedToken

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(env.ART_LAYER_DOWNLOAD_SECRET),
            { algorithms: ['HS256'] }
        )
        jwtPayload = payload as artLayersDownloadDecodedToken
    } catch (err) {
        if (err instanceof errors.JWTExpired) return new Response('{"error":"token_expired"}', { status: 401, headers: jsonHeaders })
        return new Response(voidJson, { status: 401, headers: jsonHeaders })
    }

    try {
        const { membership: { roomId } } = jwtPayload
        const objectName = `${roomId}_${artId}_${layerId}_${userId}.png`
        const object = await env.ALL_ARTS_LAYERS_BUCKET.get(objectName)

        if (object !== null) {
            const headers = new Headers(corsHeaders)

            object.writeHttpMetadata(headers)
            headers.set('etag', object.httpEtag)
            headers.set('Cache-Control', 'no-cache')

            return new Response(object.body, { status: 200, headers })
        }

        return new Response(voidJson, {
            status: 404, headers: jsonHeaders,
        })
    }
    catch (err) { return new Response(voidJson, { status: 500, headers: jsonHeaders }) }
}

export {
    artLayerDownloadingController
}