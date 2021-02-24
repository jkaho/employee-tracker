// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

// Database components
let departments = [];
let departmentNames = ['No existing departments in database'];
let roles = [];
let roleTitles = ['No existing roles in database'];
let employees = [];
let employeeNames = ['No existing employees in database'];

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

// ACTION MENU 
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
                'Delete data',
                'Exit'
            ]
        }
    ])
    .then((answer) => {
        // Continue to next menu
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
            case 'Exit':
                console.log('Application shutting down...');
                setTimeout(() => {
                    connection.end();
                }, 2000);
                break;
            default:
                console.log('Invalid action');
                break;
        }
    });
};

// ADD EMPLOYEE/ROLE/DEPARTMENT MENU 
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
        // Continue to functions
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

// Function for adding a department
const addDepartment = () => {
    inquirer.prompt([
        {
            name: 'departmentName',
            type: 'input',
            message: 'New department name:'
        }
    ])
    .then((answer) => {
        connection.query(
            `INSERT INTO department(name) VALUES('${answer.departmentName}')`,
            (err, res) => {
                if (err) throw err;
                console.log(`'${answer.departmentName}' department successfully added to database!`);
                setTimeout(actionMenu, 2000);
            }
        );
    });
};

// Function for adding a role
const addRole = () => {
    connection.query(
        'SELECT * FROM department', (err, res) => {
            if (err) throw err;
            if (departmentNames[0] === 'No existing departments in database') {
                departmentNames.splice(0, 1);
            }
            res.forEach(({ id, name }) => {
                departments.push({id, name});
                departmentNames.push(`${id} | ${name}`);
            });

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
                let departmentId = '';
                let splitAnswer = answers.roleDepartment.split(' ');
                let departmentName = splitAnswer.splice(2).join(' ').trim();
                for (let i = 0; i < departments.length; i++) {
                    if (departments[i].name === departmentName) {
                        departmentId = departments[i].id;
                    }
                }
                connection.query(
                    `INSERT INTO role(title, salary, department_id) VALUES ('${answers.roleTitle}', '${answers.roleSalary}', '${departmentId}')`, (err, res) => {
                        if (err) throw err;
                        console.log(`Role successfully added!\nRole: ${answers.roleTitle}\nSalary: ${answers.roleSalary}\nDepartment: ${departmentName}`);
                        setTimeout(actionMenu, 2000);
                    }
                )
            });
        }
    );    
};

// Function for adding an employee
const addEmployee = () => {
    connection.query(
        'SELECT * FROM role', (err, res) => {
            if (err) throw err;
            if (roleTitles[0] === 'No existing roles in database') {
                roleTitles.splice(0, 1);
            }
            res.forEach(({ id, title, salary, department_id }) => {
                roles.push({id, title, salary, department_id});
                roleTitles.push(title);
            });

            inquirer.prompt([
                {
                    name: 'employeeFirstName',
                    type: 'input',
                    message: 'New employee first name:'
                },
                {
                    name: 'employeeLastName',
                    type: 'input',
                    message: 'New employee last name:'
                },
                {
                    name: 'employeeRole',
                    type: 'list',
                    message: 'New employee role:',
                    choices: roleTitles
                }
            ])
            .then((answers) => {
                let employeeFirstName = answers.employeeFirstName;
                let employeeLastName = answers.employeeLastName;
                let employeeRole = answers.employeeRole;
                let roleId = '';
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].title === answers.employeeRole) {
                        roleId = roles[i].id;
                    }
                }
                connection.query(
                    'SELECT * FROM employee', (err, res) => {
                        if (err) throw err;
                        if (employeeNames[0] === 'No existing employees in database') {
                            employeeNames.splice(0, 1);
                        }
                        res.forEach(({ id, first_name, last_name, role_id, manager_id }) => {
                            employees.push({id, first_name, last_name, role_id, manager_id});
                            employeeNames.push(`${id} | ${first_name} ${last_name}`);
                        });
                        employeeNames.push('No manager');

                        inquirer.prompt([
                            {
                                name: 'employeeManager',
                                type: 'list',
                                message: 'New employee manager:',
                                choices: employeeNames
                            }
                        ])
                        .then((answer) => {    
                            let managerId = '';
                            let splitAnswer = answer.employeeManager.split(' ');
                            let managerName = '';                      
                            if (answer.employeeManager === 'No existing employees in database' || answer.employeeManager == 'No manager') {
                                managerId = null;
                                managerName = 'No existing managers'
                            } else {
                                managerName = splitAnswer.splice(2, splitAnswer.length).join(' ');  
                                for (let i = 0; i < employees.length; i++) {
                                    if (employees[i].id === parseInt(answer.employeeManager.split(' ')[0])) {
                                        managerId = employees[i].id;
                                    }
                                }
                            }

                            query = 'INSERT INTO employee(first_name, last_name, role_id, manager_id) ';
                            query += `VALUES('${employeeFirstName}', '${employeeLastName}', ${roleId}, ${managerId})`
                            connection.query(query, (err, res) => {
                                if (err) throw err;
                                console.log(`Employee successfully added!\nName: ${employeeFirstName} ${employeeLastName}\nRole: ${employeeRole}\nManager: ${managerName}`);
                                setTimeout(actionMenu, 2000);
                            });
                        });
                    }
                );
            });
        }
    );
};


// VIEW EMPLOYEE/ROLE/DEPARTMENT MENU 
const viewMenu = () => {
    inquirer.prompt([
        {
            name: 'viewAction',
            type: 'list',
            message: '----------VIEW MENU----------\nWhat would you like to do?',
            choices: [
                'View employees',
                'View roles',
                'View departments',
                'Go back'
            ]
        }
    ])
    .then((answer) => {
        // Continue to functions
        switch(answer.addAction) {
            case 'Add an employee':
                viewEmployeeMenu();
                break;
            case 'Add a role':
                viewRoleMenu();
                break;
            case 'Add a department':
                viewDepartmentMenu();
                break;
            default:
                actionMenu();
                break;
        }
    });
};

