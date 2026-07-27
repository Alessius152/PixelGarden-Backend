
const {
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
} = process.env

const credentials = {
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    database: DATABASE_NAME,
    username: DATABASE_USERNAME,
    password: DATABASE_PASSWORD
}

export {
    credentials,
}
