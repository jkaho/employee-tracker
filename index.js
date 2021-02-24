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
    departments = [];
    departmentNames = ['No existing departments in database'];

    connection.query(
        'SELECT * FROM department', (err, res) => {
            if (err) throw err;
            if (res.length > 0) {
                if (departmentNames[0] === 'No existing departments in database') {
                    departmentNames.splice(0, 1);
                }
                res.forEach(({ id, name }) => {
                    departments.push({id, name});
                    departmentNames.push(`${id} | ${name}`);
                });
            }

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
                if (answers.roleDepartment === 'No existing departments in database') {
                    departmentId = null;
                    departmentName = 'No existing departments in database';
                } else {
                    for (let i = 0; i < departments.length; i++) {
                        if (departments[i].name === departmentName) {
                            departmentId = departments[i].id;
                        }
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
    roles = [];
    roleTitles = ['No existing roles in database'];
    employees = [];
    employeeNames = ['No existing employees in database'];

    connection.query(
        'SELECT * FROM role', (err, res) => {
            if (err) throw err;
            if (res.length > 0) {
                if (roleTitles[0] === 'No existing roles in database') {
                    roleTitles.splice(0, 1);
                }
                res.forEach(({ id, title, salary, department_id }) => {
                    roles.push({id, title, salary, department_id});
                    roleTitles.push(title);
                });
            }

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
                if (answers.employeeRole === 'No existing roles in database') {
                    roleId = null;
                } else {
                    for (let i = 0; i < roles.length; i++) {
                        if (roles[i].title === answers.employeeRole) {
                            roleId = roles[i].id;
                        }
                    }
                }
                connection.query(
                    'SELECT * FROM employee', (err, res) => {
                        if (err) throw err;
                        if (res.length > 0) {
                            if (employeeNames[0] === 'No existing employees in database') {
                                employeeNames.splice(0, 1);
                            }
                            res.forEach(({ id, first_name, last_name, role_id, manager_id }) => {
                                employees.push({id, first_name, last_name, role_id, manager_id});
                                employeeNames.push(`${id} | ${first_name} ${last_name}`);
                            });
                            employeeNames.push('No manager');
                        }

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
                                managerName = 'No existing manager'
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
        switch(answer.viewAction) {
            case 'View employees':
                viewEmployeeMenu();
                break;
            case 'View roles':
                viewRoles();
                break;
            case 'View departments':
                viewDepartments();
                break;
            default:
                actionMenu();
                break;
        }
    });
};

// VIEW EMPLOYEES MENU
const viewEmployeeMenu = () => {
    inquirer.prompt([
        {
            name: 'viewEmployees',
            type: 'list',
            message: '----------VIEW EMPLOYEES----------\nHow would you like to view employees?',
            choices: [
                'View all',
                'View by role',
                'View by department',
                'View by manager',
                'Go back'
            ]
        }
    ])
    .then((answer) => {
        // Continue to functions
        console.log(answer.viewEmployees)
        switch(answer.viewEmployees) {
            case 'View all':
                viewEmployeeAll();
                break;
            case 'View by role':
                viewEmployeeByRole();
                break;
            case 'View by department':
                viewEmployeeByDepartment();
                break;
            case 'View by manager':
                viewEmployeeByManager();
                break;
            default:
                viewMenu();
                break;
        }
    });
};

// View all employee data 
const viewEmployeeAll = () => {
    let query = 'SELECT A.id, A.first_name, A.last_name, role.title AS role, role.salary, department.name AS department, B.first_name AS manager_first, B.last_name AS manager_last ';
    query += 'FROM employee A ';
    query += 'LEFT JOIN role ON A.role_id = role.id ';
    query += 'LEFT JOIN department ON role.id = department.id ';
    query += 'LEFT JOIN employee B ON A.manager_id = B.id';
    connection.query(query, (err, res) => {
            if (err) throw err;
            console.table(res);
            setTimeout(viewMenu, 2000);
        }
    );
};

// View employee data by role
const viewEmployeeByRole = () => {
    let query = 'SELECT role.title AS role, A.id, A.first_name, A.last_name, role.salary, department.name AS department, B.first_name AS manager_first, B.last_name AS manager_last ';
    query += 'FROM employee A ';
    query += 'LEFT JOIN role ON A.role_id = role.id ';
    query += 'LEFT JOIN department ON role.id = department.id ';
    query += 'LEFT JOIN employee B ON A.manager_id = B.id ';
    query += 'ORDER BY role';
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        setTimeout(viewMenu, 2000);
    });
};

// View employee data by department
const viewEmployeeByDepartment = () => {
    let query = 'SELECT department.name AS department, A.id, A.first_name, A.last_name, role.title AS role, role.salary, B.first_name AS manager_first, B.last_name AS manager_last ';
    query += 'FROM employee A ';
    query += 'LEFT JOIN role ON A.role_id = role.id ';
    query += 'LEFT JOIN department ON role.id = department.id ';
    query += 'LEFT JOIN employee B ON A.manager_id = B.id ';
    query += 'ORDER BY department';
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        setTimeout(viewMenu, 2000);
    });
};

// View employee data by manager
const viewEmployeeByManager = () => {
    let query = 'SELECT B.id AS manager_id, B.first_name AS manager_first, B.last_name AS manager_last, A.id AS employee_id, A.first_name AS employee_first, A.last_name AS employee_last, role.title AS role, role.salary, department.name AS department ';
    query += 'FROM employee A ';
    query += 'LEFT JOIN role ON A.role_id = role.id ';
    query += 'LEFT JOIN department ON role.id = department.id ';
    query += 'JOIN employee B ON A.manager_id = B.id ';
    query += 'ORDER BY A.manager_id';
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        setTimeout(viewMenu, 2000);
    });
};

// View roles
const viewRoles = () => {
    let query = 'SELECT * FROM role';
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        setTimeout(viewMenu, 2000);
    });
};

// View departments
const viewDepartments = () => {
    let query = 'SELECT * FROM department';
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        setTimeout(viewMenu, 2000);
    });
}

// UPDATE EMPLOYEE/ROLE/DEPARTMENT MENU
const updateMenu = () => {
    inquirer.prompt([
        {
            name: 'updateAction',
            type: 'list',
            message: '----------UPDATE MENU----------\nWhat would you like to update?',
            choices: [
                'Update an employee',
                'Update a role',
                'Update a department',
                'Go back'
            ]
        }
    ])
    .then((answer) => {
        // Continue to functions
        switch(answer.updateAction) {
            case 'Update an employee':
                updateEmployeeMenu();
                break;
            case 'Update a role':
                updateRoleMenu();
                break;
            case 'Update a department':
                updateDepartment();
                break;
            default:
                actionMenu();
                break;
        }
    });
};

// UPDATE EMPLOYEE MENU 
const updateEmployeeMenu = () => {
    let employee;

    inquirer.prompt([
        {
            name: 'employeeId',
            type: 'input',
            message: 'What is the id of the employee you would like to update?',
        }
    ])
    .then((answer) => {
        connection.query(
            `SELECT first_name, last_name FROM employee WHERE id = ${answer.employeeId}`, (err, res) => {
                if (err) throw err;
                employee = res[0].first_name + ' ' + res[0].last_name;

                inquirer.prompt([
                    {
                        name: 'updateEmployee',
                        type: 'list',
                        message: `----------UPDATE EMPLOYEE MENU (${employee})----------\nWhat data would you like to update?`,
                        choices: [
                            'Employee name',
                            'Employee role',
                            'Employee manager',
                            'All data',
                            'Go back'
                        ]
                    }
                ])
                .then((answer) => {
                    // Continue to functions
                    switch(answer.updateEmployee) {
                        case 'Employee name':
                            updateEmployeeName(parseInt(answer.employeeId));
                            break;
                        case 'Employee role':
                            updateEmployeeRole();
                            break;
                        case 'Employee manager':
                            updateEmployeeManager();
                            break;
                        case 'All data':
                            updateEmployeeAll();
                            break;
                        default:
                            updateMenu();
                            break;
                    }
                });
            }
        );
    });
};

// Update employee name 
const updateEmployeeName = (employeeId) => {
    inquirer.prompt([
        {
            name: 'newEmployeeFirst',
            type: 'input',
            message: 'Update first name:',
        },
        {
            name: 'newEmployeeLast',
            type: 'input',
            message: 'Update last name:',
        }
    ])
    let query = 'UPDATE employee ';
    query += 'SET first_name = ?'
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
    });
};