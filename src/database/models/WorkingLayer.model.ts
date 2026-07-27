

import { DataTypes } from "sequelize"
import databaseInterface from "../config.js"
import { databaseTablesName } from "../../objects/constants.js"
import PrivateRoom from "./PrivateRoom.model.js"
import User from "./User.model.js"

const WorkingLayer = databaseInterface.define(
    'WorkingLayer',
    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id',
        },

        wLayerId: {
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
            }
        },

        detentorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },

    },
    {
        freezeTableName: true,
        tableName: databaseTablesName.WORKING_LAYERS,
        updatedAt: false,
        deletedAt: false,

        indexes: [
            {
                unique: true,
                fields: ['roomId', 'detentorId']
            }
        ]
    }
)

export default WorkingLayer

