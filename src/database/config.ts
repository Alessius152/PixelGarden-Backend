
import { Sequelize, PoolOptions } from "sequelize"

const {
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_NAME,
} = process.env

const poolConfig: PoolOptions = {
    max: 5, // Numero massimo di connessioni nel pool
    min: 0, // Numero minimo di connessioni nel pool
    acquire: 20000, // Tempo massimo (ms) per ottenere una connessione prima di un errore
    idle: 10000, // Tempo massimo (ms) che una connessione può rimanere inattiva prima di essere rilasciata
}

const databaseInterface = new Sequelize({
    host: DATABASE_HOST,
    port: parseInt(DATABASE_PORT || ''),
    username: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    dialect: 'mysql',
    logging: true,
    pool: poolConfig,
})

export default databaseInterface
