

import { DataTypes } from "sequelize"
import databaseInterface from "../config.js"
import { databaseTablesName } from "../../objects/constants.js"
import WorkingLayer from "./WorkingLayer.model.js"

const Pixelart = databaseInterface.define(
    'Pixelart',
    {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id',
        },

        workingLayerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: WorkingLayer,
                key: 'id'
            }
        },

        /*l'id dell'utente che detiene la pixelart è implicito, potrei eseguire una join su quella tabella.
        
        Magari in futuro potrei inserire anche qui quel valore, perché anche se duplicato, renderebbe, in caso
        ci fosse bisogno di trovare il proprietario di quella Pixelart su quel layer, l'accesso molto più rapido
        essendo mancante la join.
        
        per adesso mi accontento di fare la join.*/

        artId: {
            type: "binary(16)",
            unique: true,
            allowNull: false,
        },

        name: {
            type: DataTypes.STRING({ length: 32 }),
            unique: false,
            allowNull: false,
        },

        logicPixelSize: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 2, max: 32, }
        },

        width: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 1024 }
        },

        height: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 1024 }
        }

    },
    {
        freezeTableName: true,
        tableName: databaseTablesName.PIXELARTS,
        updatedAt: false,
        deletedAt: false,
    }
)

export default Pixelart

