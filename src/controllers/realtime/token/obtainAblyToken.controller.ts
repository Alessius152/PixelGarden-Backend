
import { capabilityOp, ErrorInfo } from "ably"
import { fastifyController } from "../../../types/global.js"
import { ablyRestClient } from "../../../ably/config.js"
import { checkMembership } from "../../../database/functions/fetching/rooms.js"
import { uuidToBuffer } from "../../../functions/elaboration.js"

const obtainAblyTokenController: fastifyController = async (request, reply) => {

    const { id: internalUserId, userIdentification, username } = request.internalUser!
    const { roomId } = request.query as { roomId?: string }

    const channelName = `pvt:user:${userIdentification.stringUuidv7}:notifications`

    const capabilities = {
        [channelName]: ['subscribe', 'presence'] as Array<capabilityOp>
    }

    let roomData: { name: string } | null = null

    console.log("handler di ottenimento token Ably")
    try {
        if (roomId) {
            console.log("si tratta di una stanza di lavoro")
            const membershipCheck = await checkMembership(internalUserId, uuidToBuffer(roomId))
            if (membershipCheck) {
                console.log("l'utente fa parte della stanza")
                const cName = `wroom:${roomId}`
                capabilities[cName] = (['subscribe', 'presence', 'publish'] as Array<capabilityOp>)
                roomData = {
                    name: membershipCheck.room.name
                }
            }
        }

        const tokenRequest = await ablyRestClient.auth.createTokenRequest({
            clientId: userIdentification.stringUuidv7,
            timestamp: new Date().getTime(),
            capability: JSON.stringify(capabilities),
            ttl: 1000 * 60 * 60,
        }) /*IMPORTANTE COMMENTO LEGATO A QUESTA RIGA: Un utente malintenzionato, che esegue la enter({username, userId}) lato client, e che 
        potrebbe mettere dati di un altro utente, è comunque vincolato dal fatto che lo uuidv7 dell'utente viene assegnato dal server, 
        esattamente in questa riga di codice. Quindi quando il client fa una chiamata api che modifica lo stato, ad esempio aggiornare un
        layer di una pixelart, controlla anche via middleware che i dati del client corrispondano con il clientId di Ably*/
        console.log("ecco le capability", JSON.stringify(tokenRequest.capability, null, 8))

        reply.send(tokenRequest)
    }
    catch (error) {
        const err = error as ErrorInfo
        reply.status(500).send({
            error: 'errorGeneratingToken',
        })
        request.log.error({ err, user: userIdentification.userId }, 'ER_SERVING_ABLY_TOKEN')
        return
    }

}

export {
    obtainAblyTokenController
}