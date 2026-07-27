
import { DataTypes } from "sequelize"
import databaseInterface from "../config.js"

import User from "./User.model.js"
import { databaseTablesName } from "../../objects/constants.js"

/*
requestId: 
    uno snowflake id univoco per richiesta.
pairKey:
    la stessa spiegazione del file Friendship.model.ts
*/

const FriendshipRequest = databaseInterface.define(
    'FriendshipRequest',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id',
        },

        requestId: {
            type: "binary(16)",
            unique: true,
            allowNull: false,
        },

        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },
        receiverId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },
        pairKey: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        }
    },
    {
        createdAt: true,
        updatedAt: false,
        deletedAt: false,
        freezeTableName: true,
        tableName: databaseTablesName.FRIENDSHIP_REQUESTS,
    }
)

export default FriendshipRequest
