

import databaseInterface from "../config.js"
import { databaseTablesName } from "../../objects/constants.js"
import { DataTypes } from "sequelize"
import Pixelart from "./Pixelart.model.js"
import User from "./User.model.js"

//questo modello simboleggia la collaborazione di un utente su una pixelart

const Pivot_User_Pixelart = databaseInterface.define(
    'Pivot_User_Pixelart',
    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id',
        },

        artId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Pixelart,
                key: 'id'
            },
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            },
        },

    },
    {
        freezeTableName: true,
        tableName: databaseTablesName.PIVOT_FOR_PIXELARTS_COLLABORATORS,
        updatedAt: false,
        deletedAt: false,

        indexes: [
            {
                unique: true,
                fields: ['artId', 'userId']
            }
        ]
    }
)

export default Pivot_User_Pixelart

