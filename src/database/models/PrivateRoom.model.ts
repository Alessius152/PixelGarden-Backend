
import { DataTypes } from "sequelize"
import databaseInterface from "../config.js"
import { databaseTablesName } from "../../objects/constants.js"
import User from "./User.model.js"
import { serverAPIErrorCode } from "../../objects/apiErrors.js"

const PrivateRoom = databaseInterface.define(
    'PrivateRoom',
    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id',
        },

        uuidv7: {
            type: "binary(16)",
            unique: true,
            allowNull: false,
        },

        creatorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },

        name: {
            type: DataTypes.STRING({ length: 48 }),
            allowNull: false,
        },

        description: {
            type: DataTypes.STRING({ length: 380 }),
            allowNull: true,
        },

    },
    {
        freezeTableName: true,
        tableName: databaseTablesName.PRIVATE_ROOMS,
        updatedAt: false,
        deletedAt: false,

        indexes: [
            {
                name: `${serverAPIErrorCode.CREATE_NEW_ROOM__ROOM_NAME_UNIQUENESS_VIOLATION}`,
                unique: true,
                fields: ['creatorId', 'name'],
            },
        ]
    }
)

export default PrivateRoom
