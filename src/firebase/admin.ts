
import admin from 'firebase-admin'
import serviceAccount from './serviceAccount.js'

admin.initializeApp({
    credential: admin.credential.cert({
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
        projectId: serviceAccount.project_id,
    })
})

const firebaseAuth = admin.auth()

export {
    firebaseAuth
}