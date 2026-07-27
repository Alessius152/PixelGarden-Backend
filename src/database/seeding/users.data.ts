import { uuidToBuffer } from "../../functions/elaboration.js"
import { uuidv7 } from 'uuidv7'

const randomFirebaseUid = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 28; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const fakeUsers = [
    // I tuoi due account di test (NON TOCCATI)
    { id: 1, username: 'Alexius152', userId: '@mangiami', uuidv7: uuidToBuffer(uuidv7()), firebaseUid: '4F1iqfYIGpO2o5qAMg0czfxntpO2', isOnline: true },
    { id: 2, username: 'Alexander', userId: '@alexandres', uuidv7: uuidToBuffer(uuidv7()), firebaseUid: '4jAg0iJKfPUoXIlnZizBqieZCg63', isOnline: true },
    
    // Utenti fittizi con nickname realistici e vari
    { id: 3, username: 'Elena.v', userId: '@elenav', uuidv7: uuidToBuffer(uuidv7()), firebaseUid: randomFirebaseUid(), isOnline: false },
    { id: 4, username: 'Mark99', userId: '@mark99', uuidv7: uuidToBuffer(uuidv7()), firebaseUid: randomFirebaseUid(), isOnline: true },
    { id: 5, username: 'Sara_Pixelartist122', userId: '@sara23249802', uuidv7: uuidToBuffer(uuidv7()), firebaseUid: randomFirebaseUid(), isOnline: false },
    { id: 6, username: 'Davide_R', userId: '@davider', uuidv7: uuidToBuffer(uuidv7()), firebaseUid: randomFirebaseUid(), isOnline: true },
    { id: 7, username: 'Alice188283', userId: '@aliceee', uuidv7: uuidToBuffer(uuidv7()), firebaseUid: randomFirebaseUid(), isOnline: false },
    { id: 8, username: 'Teo_PIXELARTIST', userId: '@teok', uuidv7: uuidToBuffer(uuidv7()), firebaseUid: randomFirebaseUid(), isOnline: false },
    { id: 9, username: 'Mario_rossi', userId: '@mariorossi', uuidv7: uuidToBuffer(uuidv7()), firebaseUid: randomFirebaseUid(), isOnline: false },
    { id: 10, username: 'Leo_04', userId: '@leo04', uuidv7: uuidToBuffer(uuidv7()), firebaseUid: randomFirebaseUid(), isOnline: false },
]

export { fakeUsers }