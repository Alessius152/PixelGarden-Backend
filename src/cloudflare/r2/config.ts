
import { S3Client } from "@aws-sdk/client-s3"

if(! (
    process.env.CLOUDFLARE_R2_S3_API
    && process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
    && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY_ID
)){
    console.log("WARN: cloudflare r2 env variables not found")
}

const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_S3_API || '',
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY_ID || ''
    }
})

export {
    s3Client
}
