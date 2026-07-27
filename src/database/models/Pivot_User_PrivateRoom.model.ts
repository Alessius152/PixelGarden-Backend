

import databaseInterface from "../config.js"
import { databaseTablesName } from "../../objects/constants.js"
import { DataTypes } from "sequelize"
import PrivateRoom from "./PrivateRoom.model.js"
import User from "./User.model.js"

const Pivot_User_PrivateRoom = databaseInterface.define(
    'Pivot_User_PrivateRoom',
    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id',
        },

        membershipId: {
            type: "binary(16)",
            unique: true,
            allowNull: false,
        },

        roomId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PrivateRoom,
                key: 'id'
            },
        },

        //id of the member
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            },
        }

    },
    {
        freezeTableName: true,
        tableName: databaseTablesName.PIVOT_FOR_ROOM_MEMBERS,
        updatedAt: false,
        deletedAt: false,

        indexes: [
            {
                unique: true,
                fields: ['roomId', 'userId']
            }
        ]
    }
)

export default Pivot_User_PrivateRoom

