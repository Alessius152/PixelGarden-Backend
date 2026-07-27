
const realtimeHomepageNotificationKeys = {

    /*questo evento viene inviato quando un utente invia una richiesta di amicizia
    immagina due utenti A e B
    A manda richiesta a B
    il mio server effettuerà un emit verso il canale di B dicendo
    "A ti ha mandato una richiesta di amicizia.*/
    RECEIVED_NEW_FRIENDSHIP_REQUEST: 'friendship-request-received',

    /*questo evento viene emesso quando un utente risponde ad una richiesta di amiciza ricevuta,
    e l'utente che l'ha mandata riceve questo evento, che dice esplicitamente se ha accettato
    o rifiutato, portando l'app del client ad agire a seconda della risposta.*/
    RECEIVED_FRIENDSHIP_REQUEST_CANNOT_BE_CONSUMED: 'received-friendship-request-cannot-be-consumed',

    FRIEND_HAS_CANCELED_FRIENDSHIP_BETWEEN_YOU: 'friend-has-canceled-relation-betw-you',

    RECEIVED_NEW_ROOM_JOIN_INVITE: 'received-new-room-join-invite'

}

export {
    realtimeHomepageNotificationKeys,
}
