// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    // Your port
    port: 3306,
    // Your username
    user: 'root',
    // Your MySQL password
    password: 'pw',
    database: 'employee_db'
});

connection.connect((err) => {
    if (err) throw err;
});

const actionMenu = () => {
    inquirer.prompt([
        {
            name: 'action',
            type: 'rawlist',
            message: '----------MENU----------\nWhat would you like to do?',
            choices: [
                'Add data',
                'View data',
                'Update data',
                'Delete data'
            ]
        }
    ])
    .then((answer) => {
        switch(answer.action) {
            case 'Add data':
                addMenu();
                break;
            case 'View data':
                viewMenu();
                break;
            case 'Update data':
                updateMenu();
                break;
            case 'Delete data':
                deleteMenu();
                break;
            default:
                console.log('Invalid action');
                break;
        }
    })
}