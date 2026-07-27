
import { DataTypes } from "sequelize"
import databaseInterface from "../config.js"
import { databaseTablesName } from "../../objects/constants.js"
import User from "./User.model.js"
import PrivateRoom from "./PrivateRoom.model.js"

const PRoomMembershipJoinInvites = databaseInterface.define(
    'PRoomMembershipJoinInvites',
    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id',
        },

        inviteId: {
            type: "binary(16)",
            unique: true,
            allowNull: false,
        },

        inviter: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },

        roomId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PrivateRoom,
                key: 'id'
            }
        },

        invitee: {
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
        tableName: databaseTablesName.PRIVATE_ROOM_JOIN_INVITES,
        updatedAt: false,
        deletedAt: false,
        indexes: [
            {
                unique: true,
                fields: ['inviter', 'invitee', 'roomId'],
            },
        ],
    }
)

export default PRoomMembershipJoinInvites
