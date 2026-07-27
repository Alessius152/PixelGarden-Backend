const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://seconds-happens-towers-msg.trycloudflare.com"
]

function getCorsHeaders(request: Request): HeadersInit {
    const origin = request.headers.get("Origin")
    const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
    }
}

export {
    getCorsHeaders
}