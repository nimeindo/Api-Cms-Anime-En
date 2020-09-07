const sequelize = new require("sequelize");
const env = require("dotenv");
env.config()

const DB_HOST_APP = process.env.DB_HOST_APP
const DB_PORT_APP= process.env.DB_PORT_APP
const DB_DATABASE_APP= process.env.DB_DATABASE_APP
const DB_USERNAME_APP= process.env.DB_USERNAME_APP
const DB_PASSWORD_APP= process.env.DB_PASSWORD_APP

const db = new sequelize(DB_DATABASE_APP, DB_USERNAME_APP , DB_PASSWORD_APP, {
    dialect: 'mysql',
    host: DB_HOST_APP,
    port: DB_PORT_APP,
    logging: false,
    define:{
        timestamps: false
    }

});

db.sync({});

module.exports = db; 