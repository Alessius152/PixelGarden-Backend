
enum serverAPIErrorCode {

    INTERNAL_SERVER_ERROR,

    AUTH__MISSING_TOKEN,
    AUTH__INVALID_TOKEN_STRUCTURE,
    AUTH__ERR_VERIFING_FIREBASE_TOKEN,
    AUTH__UNEXISTANT_USER /*questo errore si presenta in questa dinamica:
    un utente ha un token firebase valido. e esegue una http request al
    server. L'autenticazione funziona che il server per dire che un utente
    è loggato nell'app, non solo deve avere il token firebase, ma lo uid
    codificato in esso deve anche essere presente nel database locale a
    questo server ed essere collegato ad uno username, un at (@my_user)
    e uno uuidv7 (classico record del modello User), nel caso in cui
    nel database non venisse trovato un utente, da questo errore, come per
    dire "un utente con metà autenticazione eseguita vuole accedere, ma non
    ha l'account"*/,

    COMPLETE_AUTH__ALREADY_AUTHED /*voglio registrarmi tramite l'endpoint 
    /completeAuthenticatio per registrare il mio uid nel database e assegnare
    ad esso dei dati quali username e userId (@user) ma il server trova già un
    account con quello uid estrapolato dal firebase token. di conseguenza,
    questo errore è accompagnato dal payload http che mostra i dati pubblici
    del profilo.*/,
    COMPLETE_AUTH__USER_ID_ALREADY_EXISTS,

    SEND_FSHIP_REQ__CANNOT_SEND_TO_YOURSELF /*quando l'utente tenta di mandare
    una richiesta di amicizia a se stesso.*/,
    SEND_FSHIP_REQ__DESTINATARY_DOESNT_EXISTS,
    SEND_FSHIP_REQ__ALREADY_FRIENDS,
    SEND_FSHIP_REQ__REQ_BETWEEN_YOU_ALREADY_EXISTS /*la richiesta tra me e un utente
    al quale la voglio mandare, esiste già.*/,

    ANSWER_TO_FSHIP_REQ__SPECIFIED_REQ_DOESNT_EXISTS,

    CANCEL_SENT_FSHIP_REQ__REQ_NOT_FOUND,

    CANCEL_FRIENDSHIP__RELATION_NOT_FOUND,

    GENERIC_ROOM_NOT_FOUND, /*più api possono dover genericamente "modificare i dati di una stanza",
    ma se questa stanza non viene trovata, ho un errore generico per quella situazione.
    lato frontend andrò a dare un messaggio diverso per ogni tipo di operazione.
    
    esempio
    -Impossibile cancellare la stanza (non esistente).
    -La stanza alla quale vuoi aggiungere membri non esiste.
    -Impossibile completare l'azione. la stanza non esiste.*/

    CREATE_NEW_ROOM__ROOM_NAME_UNIQUENESS_VIOLATION /*qui l'utente ha tentato di creare una stanza
    di lavoro, con un nome il quale è stato già usato da lui per un altra sua stanza.
    due utenti distinti possono avere due stanze con lo stesso nome, 
    uno stesso utente non può avere due stanze con lo stesso nome.*/,

    /*i prossimi due errori non sono mai usati nel backend.
    Solo nel frontend per simulare errori backend.
    Perché "simulare" errori backend? Perche questi due errori nel
    backend non si vedranno mai grazie agli schema di fastify che validano i 
    dati prima di arrivare al controller.
    Lato client però ho comunque bisogno che mi appaia un messaggio di errore per dirmi
    che i dati non sono corretti così, e che ci sono dei limiti di lunghezza.*/
    CREATE_NEW_ROOM__ROOM_NAME_OUT_OF_LENGTH,
    CREATE_NEW_ROOM__ROOM_DESCRIPTION_OUT_OF_LENGTH,

    FETCH_ROOMS_WHICHIN_USER_IS_MEMBER__FRIENDSHIP_NOT_FOUND,

    ADD_MEMBERS_IN_A_ROOM__NON_OF_THESE_RELATIONS_EXISTS,
    ADD_MEMBERS_IN_A_ROOM__NON_OF_THESE_RELATIONS_ARE_YOURS,
    ADD_MEMBERS_IN_A_ROOM__SPECIFIED_NON_VALID_MEMBERS,
    ADD_MEMBERS_IN_A_ROOM__SOME_USER_ALREADY_INVITED,

    CANCEL_ROOM_JOIN_INVITE__INVITE_NOT_FOUND,

    OBTAIN_ABLY_TKN_TO_ENTER_PV_ROOM_CHANNEL__ROOM_NOT_FOUND,
    OBTAIN_ABLY_TKN_TO_ENTER_PV_ROOM_CHANNEL__UNABLE_TO_ACCESS_THE_ROOM,

    FETCH_ROOM_DETAILS__MEMBERSHIP_NOT_FOUND,

    GET_PIXELARTS_LIST__LAYER_NOT_FOUND,

    CREATE_PIXELART__WORKING_LAYER_NOT_FOUND,

    FETCH_ART_COLLABORATORS_LIST__ART_NOT_FOUND,

    FETCH_PIXELART_METADATA__ART_NOT_FOUND,

    ANSWER_TO_ROOM_JOIN_INVITE__INVITE_NOT_FOUND,
    ANSWER_TO_ROOM_JOIN_INVITE__ALREADY_MEMBER,

    GET_ART_CREATION_AUTHORIZATION__WORKING_LAYER_NOT_FOUND,

    ADD_NEW_ART_LAYER__ART_NOT_FOUND,
    ADD_NEW_ART_LAYER__YOU_ARE_NOT_COLLABORATOR,
    ADD_NEW_ART_LAYER__THERE_IS_NO_AUTHENTICATION,

}

export {
    serverAPIErrorCode,
}
