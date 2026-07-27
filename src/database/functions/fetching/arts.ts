
import { QueryTypes } from "sequelize"
import { databaseTablesName } from "../../../objects/constants.js"
import databaseInterface from "../../config.js"
import Pivot_User_PrivateRoom from "../../models/Pivot_User_PrivateRoom.model.js"

type artLocation = {
    artPk: number,
    wLayerPk: number,
    roomPk: number,
    roomOwnerPk: number,
    wLayerOwnerPk: number,
}

type artLocationWithUuids = {
    artPk: number,
    wLayerPk: number,
    roomPk: number,
    roomOwnerPk: number,
    wLayerOwnerPk: number,
    roomUuid: Buffer,
    artUuid: Buffer
}

/*questa funzione è importante perché:
quando voglio scaricare dal server la lista di collaboratori di una pixelart, io fornisco semplicemente
lo uuidv7 della pixelart e dico al server "pescami la lista di collaboratori che lavorano su questa 
pixelart" e il server deve capire se posso vedere quella pixelart io utente.
Per farlo basta controllare se la stanza in cui si trova la pixelart è una stanza di cui io
faccio parte. Non è richiesto alcun requisito di ownership per nulla, la pixelart può anche non essere 
mia, perché non ci devo interagire per modificarne lo stato, quindi posso vedere i collaboratori anche
se non ne faccio parte.*/
async function fetchPixelartLocation(artId: Buffer) {

    const query = `select 
    p.id as artPk,
    p.workingLayerId as wLayerPk,
    wl.roomId as roomPk,
    wl.detentorId as wLayerOwnerPk,
    pr.creatorId as roomOwnerPk
from ${databaseTablesName.PIXELARTS} p
join ${databaseTablesName.WORKING_LAYERS} wl on wl.id = p.workingLayerId
join ${databaseTablesName.PRIVATE_ROOMS} pr on pr.id = wl.roomId
where artId = :artId;`

    const result = await databaseInterface.query<{ 
        artPk: number, wLayerPk: number, roomPk: number, wLayerOwnerPk: number, roomOwnerPk: number 
    }>(query, {
        replacements: { artId },
        type: QueryTypes.SELECT
    })

    if ((!result) || (result.length === 0)) {
        return null
    }

    return result[0]

}

async function fetchPixelartLocation_withArtMetadata(artId: Buffer) {

    const query = `select 
    p.id as artPk,
    p.workingLayerId as wLayerPk,
    wl.roomId as roomPk,
    pr.creatorId as roomOwnerPk,
    wl.detentorId as wLayerOwnerPk, p.name, p.width, p.height, p.logicPixelSize
from ${databaseTablesName.PIXELARTS} p
join ${databaseTablesName.WORKING_LAYERS} wl on wl.id = p.workingLayerId
join ${databaseTablesName.PRIVATE_ROOMS} pr on pr.id = wl.roomId
where artId = :artId;`

    const [result] = await databaseInterface.query<{
        artPk: number, wLayerPk: number, roomPk: number, roomOwnerPk: number,
        wLayerOwnerPk: number, name: string, width: number, height: number, logicPixelSize: number
    }>(query, {
        replacements: { artId },
        type: QueryTypes.SELECT
    })

    return result

}

async function fetchPixelartLocation_withUuids(artId: Buffer) {

    const query = `select 
    p.id as artPk,
    p.workingLayerId as wLayerPk,
    wl.roomId as roomPk,
    pr.creatorId as roomOwnerPk,
    wl.detentorId as wLayerOwnerPk, 
    pr.uuidv7 as roomUuid,
    p.artId as artUuid
from ${databaseTablesName.PIXELARTS} p
join ${databaseTablesName.WORKING_LAYERS} wl on wl.id = p.workingLayerId
join ${databaseTablesName.PRIVATE_ROOMS} pr on pr.id = wl.roomId
where artId = :artId;`

    const [result] = await databaseInterface.query<{
        artPk: number, wLayerPk: number, roomPk: number, roomOwnerPk: number,
        wLayerOwnerPk: number, roomUuid: Buffer, artUuid: Buffer, 
    }>(query, {
        replacements: { artId },
        type: QueryTypes.SELECT
    })

    return result

}

async function getArtCollaboratorsList(artPk: number) {

    const query = `select 
    u.username,
    u.userId
from ${databaseTablesName.PIVOT_FOR_PIXELARTS_COLLABORATORS} pc
join ${databaseTablesName.USERS} u on u.id = pc.userId
where pc.artId = :artPk;`

    const result = await databaseInterface.query<{ username: string, userId: string }>(query, {
        replacements: { artPk },
        type: QueryTypes.SELECT
    })

    return result

}

async function checkArtAccessToDownload(artId: Buffer, userPk: number): Promise<artLocationWithUuids | false> {
    const artLoc = await fetchPixelartLocation_withUuids(artId)

    if (!artLoc) {
        return false //art inesistente
    }

    if ((artLoc.roomOwnerPk === userPk) || (artLoc.wLayerOwnerPk === userPk)) {
        return artLoc
    }

    const membership = await Pivot_User_PrivateRoom.findOne({
        where: {
            roomId: artLoc.roomPk,
            userId: userPk
        },
        attributes: ['id']
    })

    if (membership) {
        return artLoc
    }

    return false
}

export {
    fetchPixelartLocation,
    fetchPixelartLocation_withArtMetadata,
    getArtCollaboratorsList,
    checkArtAccessToDownload,
}
