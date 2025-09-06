require("dotenv").config()
const { Sequelize } = require("sequelize")
const { createPool } = require("mysql2")
const mysql = require('mysql2/promise');


const conn_option = {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PWD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    // dialect: 'mysql', // for mysql 
    dialect: 'postgres',
    logging: true,
    dialectOptions: { // this is for postgresql
        ssl: {
            require: true,
            rejectUnauthorized: false, // for self-signed certs
        },
    },
    // logging: isDevelopment, // ensure this is a boolean
};


//  For Mysql connection not postgresql
// async function createDatabaseIfNotExists() {
//     const connection = await mysql.createConnection({
//         host: conn_option.host,
//         port: conn_option.port,
//         user: conn_option.username,
//         password: conn_option.password,
//     });

//     await connection.query(`CREATE DATABASE IF NOT EXISTS \`${conn_option.database}\`;`);
//     await connection.end();
// }



const conn = new Sequelize(conn_option)


// const pool = createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PWD,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

module.exports = {
    conn: conn,
    // createDatabaseIfNotExists
    // pool
}