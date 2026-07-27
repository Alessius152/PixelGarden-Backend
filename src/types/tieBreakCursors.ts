
/*
questo cursore serve per ottenere in ordine alfabetico la lista di amici
dell'utente senza rinunciare alla paginazione cursor based.

rinunciando alla paginazione cursor based sarei costretto a interrogare
il db utilizzando OFFSET, e non va bene.

relationId è il buffer che contiene lo uuidv7 delle relazione.
lo ritorno nella http reply perché potrei voler cancellare quell'
amicizia.
*/

type friendsListCursor_asInput = {
    username: string,
    relationId: string
}
type friendsListCursor_forDatabase = {
    username: string,
    relationId: Buffer,
}

export type {
    friendsListCursor_asInput,
    friendsListCursor_forDatabase,
}
