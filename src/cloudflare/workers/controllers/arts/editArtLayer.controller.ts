import { errors, jwtVerify } from "jose"
import { Env } from "../../index.js"
import { voidJson } from "../../utils/constants.js"
import { isUUIDv7 } from "../../utils/validations.js"
import { artLayersEditingDecodedToken } from "../../utils/types.js"

const artLayerEditingController = async (corsHeaders: HeadersInit, request: Request, env: Env) => {
    const jsonHeaders = {
        ...corsHeaders,
        "Content-Type": "application/json"
    }

    const auth = request.headers.get('Authorization')
    if (!auth) return new Response("[voidJson3]", { status: 401, headers: jsonHeaders })

    const [prefix, token, other] = auth.split(' ')
    if (!((prefix === "Bearer") && token.trim() && (!other))) return new Response(voidJson, { status: 400, headers: jsonHeaders })

    const { searchParams } = new URL(request.url)
    const layerId = searchParams.get('layerId')
    if (!(layerId && isUUIDv7(layerId))) return new Response(voidJson, { status: 400, headers: jsonHeaders })

    let jwtPayload: artLayersEditingDecodedToken

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(env.ART_LAYERS_EDITING_SECRET),
            { algorithms: ['HS256'] }
        )
        jwtPayload = payload as artLayersEditingDecodedToken
    }
    catch (err) {
        if (err instanceof errors.JWTExpired) return new Response('{"error":"token_expired"}', { status: 401, headers: jsonHeaders })
        return new Response("[voidJson1]", { status: 401, headers: jsonHeaders })
    }

    const { editableLayers, roomId, artId, layersOwner } = jwtPayload

    if (!(editableLayers.includes(layerId))) return new Response("[voidJson2]", { status: 401, headers: jsonHeaders })

    const pngStream = request.body
    if (!pngStream) return new Response(voidJson, { status: 400, headers: jsonHeaders })

    try {
        const objectKey = `${roomId}_${artId}_${layerId}_${layersOwner.replace('@', '')}.png`
        await env.ALL_ARTS_LAYERS_BUCKET.put(objectKey, pngStream, {
            httpMetadata: { contentType: "image/png" }
        })
        return new Response(voidJson, { status: 200, headers: jsonHeaders })
    }
    catch (err) {
        return new Response(voidJson, { status: 500, headers: jsonHeaders })
    }
}

export {
    artLayerEditingController
}