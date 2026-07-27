# PixelGarden - Applicazione Realtime Collaborativa

**🖋️Nota di sviluppo**<br>
<span style="text-align: center; color: darkgray;">
*Questo repository è stato strutturato e pulito metodicamente da zero. Una volta definiti l'architettura solida e i requisiti finali del progetto, ho preferito consolidare la cronologia per garantire una codebase pulita, pronta per la produzione e priva di commit di prova o tentativi intermedi.*
</span>

## Descrizione dell'applicazione 
L'idea dell'app è molto semplice. Si tratta di una piattaforma dove utenti, tramita la loro lista di amicizie, possono collaborare su disegni pixelart sulla base di un permesso in una stanza virtuale

## Architettura del sistema
Per far crescere questo progetto ho dovuto sviluppare due software distinti e applicare a entrambi servizi cloud esterni.

1. **Frontend** 
   ![React](https://img.shields.io/badge/React-%2361DBFB.svg?style=for-the-badge&logo=react&logoColor=black) 
   ![Chakra UI](https://img.shields.io/badge/Chakra%20UI-%2338B2AC.svg?style=for-the-badge&logo=chakraui&logoColor=white) 
   ![React Query](https://img.shields.io/badge/React%20Query-%23FFB96D.svg?style=for-the-badge&logo=reactquery&logoColor=black)

2. **Backend** 
   ![Node.js](https://img.shields.io/badge/Node.js-%23339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white) 
   ![Fastify](https://img.shields.io/badge/Fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white) 
   ![MySQL](https://img.shields.io/badge/MySQL-%2300758F.svg?style=for-the-badge&logo=mysql&logoColor=white) 
   ![Redis](https://img.shields.io/badge/Redis-%23DC382D.svg?style=for-the-badge&logo=redis&logoColor=white)

3. **Servizi Cloud autogestiti** 
   ![Firebase Authentication](https://img.shields.io/badge/Firebase%20Auth-%23FFA611.svg?style=for-the-badge&logo=firebase&logoColor=black) 
   ![Cloudflare R2](https://img.shields.io/badge/Cloudflare%20R2-%23F48120.svg?style=for-the-badge&logo=cloudflare&logoColor=white) 
   ![Ably](https://img.shields.io/badge/Ably-%23FF5416.svg?style=for-the-badge&logo=ably&logoColor=white)
   
## Struttura logica del funzionamento dell'applicazione
Un utente, alla base di tutto, è collegato alle seguenti entità
1. Lista di amici
2. Lista di stanze 👉🏽 *Con questo ci si riferisce sia alle stanze create da un utente, sia quelle create dai suoi amici delle quali fa parte.*

### Membership di un utente per una stanza
Quando un utente diventa membro di una stanza, sia che ne sia creatore, sia che non ne sia, possiede una membership per quella stanza, e la singola membership è un'entità che serve come badge per il server a scaricare alcuni dati da esso.
1. Dati relativi alla stanza
    1. Lista dei membri 👉🏽 *In una stanza, ogni membro ha il proprio **working layer**, ciò vale a dire che se un'utente crea una Pixelart, essa sarà legata non solo alla stanza, ma nello specifico al working layer associato alla membership di esso.*
    2. Lista delle Pixelart per ogni membro
2. Dati relativi a una Pixelart
    1. Lista dei layer di una Pixelart 👉🏽 *Un layer di un disegno appartiene ad un solo collaboratore del disegno stesso.*
    2. Lista dei collaboratori di una Pixelart

Con la sola membership non possiamo fare cose più mirate, come ad esempio espellere un utente o modificare una pixelart **direttamente**.

### Rapporto utente-disegno
- Un utente che crea una pixelart, ne è sia creatore che collaboratore.<br>
- Un utente che diventa collaboratore di una pixelart, viene autorizzato a essere definito tale dal creatore di essa.<br>

Quando si ha il titolo di collaboratore di una pixelart, per il server siamo autorizzati a eseguire queste azioni
1. Creazione di un layer del disegno
2. Modifica di un layer del disegno 👉🏽 *Il vero e proprio disegno collaborativo*
3. Spostamento di un layer proprietario nella lista dei layer.
