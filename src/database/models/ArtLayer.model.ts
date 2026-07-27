import { DataTypes } from "sequelize"
import databaseInterface from "../config.js"
import { databaseTablesName } from "../../objects/constants.js"
import Pixelart from "./Pixelart.model.js"
import User from "./User.model.js"

/*per la demo non sarà un albero ma una lista
si chiamerà comunque layer tree ma la feature
importante da presentare a fine anno è consiste
in spostare i layer, crearli e lavorarci, non 
conta nulla se li sposto all'interno di una 
lista o di un albero. Gli applausi vanno all'
architettura Cloudflare<->Ably<->Fastify*/

const ArtLayer = databaseInterface.define(
    'ArtLayer',
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
            }
        },

        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },

        layerName: {
            type: DataTypes.STRING(32),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 32]
            }
        },
        
        //DEMO: parentId è sempre null, non si tratta di un tree ma di una list.
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: databaseTablesName.ART_LAYER,
                key: 'id'
            }
        },

        uuid: {
            type: 'binary(16)', 
            unique: true,
            allowNull: false,
        },

        orderIndex: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    },
    {
        freezeTableName: true,
        tableName: databaseTablesName.ART_LAYER,
        timestamps: true, 
        indexes: [
            {
                fields: ['artId', 'parentId', 'orderIndex'] 
            }
        ]
    }
)

ArtLayer.belongsTo(ArtLayer, { as: 'parent', foreignKey: 'parentId' })
ArtLayer.hasMany(ArtLayer, { as: 'children', foreignKey: 'parentId' })

export default ArtLayer