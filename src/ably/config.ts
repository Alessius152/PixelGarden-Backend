import Ably from 'ably'
const ablyRestClient = new Ably.Rest({ key: process.env.ABLY_API_KEY })
export {
    ablyRestClient
}