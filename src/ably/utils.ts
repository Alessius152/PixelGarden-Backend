import { ablyRestClient } from "./config.js"

const notificationsChannelNamePlaceholder = '&_&'
const workingRoomChannelNamePlaceholder = '&_&'
const notificationsChannelName = `pvt:user:${notificationsChannelNamePlaceholder}:notifications`
const workingRoomChannelName = `wroom:${workingRoomChannelNamePlaceholder}`

const getUserNotificationsChannel = (userUuid: string)=>{
    return ablyRestClient.channels.get(
        notificationsChannelName.replace(notificationsChannelNamePlaceholder, userUuid)
    )
}

const getWRoomChannel = (roomUuid: string)=>{
    return ablyRestClient.channels.get(
        workingRoomChannelName.replace(workingRoomChannelNamePlaceholder, roomUuid)
    )
}

export {
    notificationsChannelName,
    getUserNotificationsChannel,
    workingRoomChannelName,
    getWRoomChannel,
}
