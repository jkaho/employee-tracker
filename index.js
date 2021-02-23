// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

// Database components
let departments = [];
let departmentNames = [];
let roles = [];
let roleTitles = [];

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
    actionMenu();
});

const actionMenu = () => {
    inquirer.prompt([
        {
            name: 'action',
            type: 'list',
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
    });
};

const addMenu = () => {
    inquirer.prompt([
        {
            name: 'addAction',
            type: 'list',
            message: '----------ADD MENU----------\nWhat would you like to do?',
            choices: [
                'Add an employee',
                'Add a role',
                'Add a department',
                'Go back'
            ]
        }
    ])
    .then((answer) => {
        switch(answer.addAction) {
            case 'Add an employee':
                addEmployee();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add a department':
                addDepartment();
                break;
            default:
                actionMenu();
                break;
        }
    });
};

const addDepartment = () => {
    inquirer.prompt([
        {
            name: 'departmentName',
            type: 'input',
            message: 'New department name:'
        }
    ])
    .then((answer) => {
        // Format answer
        let departmentNameLower = answer.departmentName.toLowerCase();
        let departmentNameArr = departmentNameLower.split(' ');
        let departmentNameSentence = '';
        for (let i = 0; i < departmentNameArr.length; i++) {
            let substring = departmentNameArr[i].substring(0, 1).toUpperCase() + departmentNameArr[i].substring(1, departmentNameArr[i].length);
            if (i === departmentNameArr.length - 1) {
                departmentNameSentence += substring;
            } else {
                departmentNameSentence += substring + ' ';
            }
        }

        connection.query(
            `INSERT INTO department(name) VALUES('${departmentNameLower}')`,
            (err, res) => {
                if (err) throw err;
                console.log(`'${departmentNameSentence}' department successfully added to database!`);
            }
        )
    })
}

const addRole = () => {
    connection.query(
        'SELECT * FROM department', (err, res) => {
            if (err) throw err;
            res.forEach(({ id, name }) => {
                departments.push({id, name});
                departmentNames.push(`${id} | ${name}`);
            })
            inquirer.prompt([
                {
                    name: 'roleTitle',
                    type: 'input',
                    message: 'New role title:'
                },
                {
                    name: 'roleSalary',
                    type: 'input',
                    message: 'New role salary:'
                },
                {
                    name: 'roleDepartment',
                    type: 'list',
                    message: 'New role department:',
                    choices: departmentNames
                }
            ])
            .then((answers) => {
                // Format role title answer
                let roleTitleLower = answers.roleTitle.toLowerCase();
                let roleTitleArr = roleTitleLower.split(' ');
                let roleTitleSentence = '';
                for (let i = 0; i < roleTitleArr.length; i++) {
                    let substring = roleTitleArr[i].substring(0, 1).toUpperCase() + roleTitleArr[i].substring(1, roleTitleArr[i].length);
                    if (i === roleTitleArr.length - 1) {
                        roleTitleSentence += substring;
                    } else {
                        roleTitleSentence += substring + ' ';
                    }
                }

                let departmentId = '';
                let splitAnswer = answers.roleDepartment.split(' ');
                for (let i = 0; i < departments.length; i++) {
                    if (departments[i].name === splitAnswer[2]) {
                        departmentId = departments[i].id;
                    }
                }
                connection.query(
                    `INSERT INTO role(title, salary, department_id) VALUES ('${roleTitleLower}', '${answers.roleSalary}', '${departmentId}')`, (err, res) => {
                        if (err) throw err;
                        console.log(`Role successfully added!\nRole: ${roleTitleSentence}\nSalary: ${answers.roleSalary}\nDepartment: ${splitAnswer[2]}`);
                    }
                )
            });
        }
    );    
};
// const addEmployee = () => {
//     inquirer.prompt([
//         {
//             name: 'employeeFirstName',
//             type: 'input',
//             message: 'New employee first name:'
//         },
//         {
//             name: 'employeeLastName',
//             type: 'input',
//             message: 'New employee last name:'
//         }
//     ])
//     connection.query(
//         'INSERT INTO employee (first_name, last_name, role_id, manager_id)'
//     )
// }

