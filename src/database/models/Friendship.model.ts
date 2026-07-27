

import { DataTypes } from "sequelize"
import databaseInterface from "../config.js"
import { databaseTablesName } from "../../objects/constants.js"
import User from "./User.model.js"

/*
Entità fittizia. serve a collegare User(N)-User(M) e non viene interpellata in chiamate
tipo hasMany() di associazione.

pairKey:
    quando devo registrare un amicizia, prendo id (pk) dei due utenti
    li ordino in ordine crescente e li concateno, questa è la pairKey.
    esempio: 31 manda richiesta a 12 e 12 accetta, pairKey = 12_31.
*/

const Friendship = databaseInterface.define(
    'Friendship',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id',
        },

        relationId: {
            type: "binary(16)",
            unique: true,
            allowNull: false,
        },

        user1: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },

        user2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },

    },
    {
        createdAt: true,
        updatedAt: false,
        deletedAt: false,
        freezeTableName: true,
        tableName: databaseTablesName.FRIENDSHIPS,
        indexes: [
            {
                fields: ['user1', 'user2'],
                unique: true,
            }
        ]
    }
)

export default Friendship

