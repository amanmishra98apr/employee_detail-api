const Sequelize = require("sequelize");
const database = process.env[process.env.Environment + 'DB_NAME'];
const username = process.env[process.env.Environment + 'USER_NAME'];
const password = process.env[process.env.Environment + 'USER_PASSWORD'];
const server = process.env[process.env.Environment + 'SERVER'];
const sequelize = new Sequelize(database, username, password, {
    host: server,
    port: 1433,
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: true,
            enableArithAbort: true,
            requestTimeout: 30000,
            freezeTableName: true
        }
    }
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
module.exports = { sequelize };