import { Sequelize } from "sequelize"
import User from "../../models/User.model.js"

async function checkUserExistanceByFirebaseUid(id: string) {
    
    const user = await User.findOne({
        attributes: ['id', 'uuidv7', 'username', 'userId'],
        where: {
            firebaseUid: id,
        }
    })

    if (user) {
        const { id, uuidv7, username, userId } = user.dataValues
        return {
            user: { id, uuidv7, username, userId }
        }
    }

    return null
}

async function checkUserExistanceByBufferizedUserUUID(bufferizedV7: Buffer) {
    const user = await User.findOne({
        attributes: ['id', 'uuidv7', 'username'],
        where: Sequelize.where(
            Sequelize.col('uuidv7'),
            bufferizedV7
        )
    })

    if (user) {
        const { id, uuidv7, username } = user.dataValues
        return {
            user: { id, uuidv7, username }
        }
    }

    return null

}

export {
    checkUserExistanceByFirebaseUid,
    checkUserExistanceByBufferizedUserUUID,
}
