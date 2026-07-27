
import { DataTypes } from "sequelize"
import databaseInterface from "../config.js"
import { databaseTablesName } from "../../objects/constants.js"

/*
spiegazione approfondita modello
uuid: identificatore globale utente
username: univoco anche esso ma per robustezza affiancato da uuidv7
firebaseUid: serve solo ed esclusivamente a capire se l'utente è autenticato o meno lato api
*/

const User = databaseInterface.define(
    'User',
    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id',
        },

        // identificativo di un utente esposto pubblicamente sull'app frontend
        uuidv7: {
            type: "binary(16)",
            unique: true,
            allowNull: false,
        },

        firebaseUid: {
            type: DataTypes.STRING({ length: 255 }),
            unique: true,
            allowNull: false,
        },

        username: {
            type: DataTypes.STRING({ length: 32 }),
            unique: false,
            allowNull: false,
        },

        userId: {
            //32 + @ = 33
            type: DataTypes.STRING({ length: 33 }),
            unique: true,
            allowNull: false,
        },

        isOnline: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }

    },
    {
        freezeTableName: true,
        tableName: databaseTablesName.USERS,
        updatedAt: false,
        deletedAt: false,
    }
)

export default User
