import { artLayerDownloadingController } from "./controllers/arts/downloadArtLayer.controller.js"
import { artLayerEditingController } from "./controllers/arts/editArtLayer.controller.js"
import { getCorsHeaders } from "./cors.js"

export interface Env {
    ALL_ARTS_LAYERS_BUCKET: R2Bucket
    ART_LAYER_DOWNLOAD_SECRET: string,
    ART_LAYERS_EDITING_SECRET: string,
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const corsHeaders = getCorsHeaders(request)

        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

        const url = new URL(request.url), pathname = url.pathname

        try {
            if (request.method === 'GET') {
                if (pathname === '/health') {
                    return new Response(JSON.stringify({ status: 'ok', engine: 'native' }), {
                        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    })
                }
                if (pathname === '/downloadArtLayer') return artLayerDownloadingController(corsHeaders, request, env)
            }

            if (request.method === 'POST') {
                if (pathname === '/editArtLayer') return artLayerEditingController(corsHeaders, request, env)
            }

            return new Response("Not Found", { status: 404, headers: corsHeaders })

        } catch (e: any) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }
    }
}