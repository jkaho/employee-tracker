// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');

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
                    `INSERT INTO role(title, salary, department_id) VALUES ('${answers.roleTitle}', ${answers.roleSalary}, ${departmentId})`, (err, res) => {
                        if (err) throw err;
                        console.log(`Role successfully added!\nRole: ${answers.roleTitle}\nSalary: ${answers.roleSalary}\nDepartment: ${departmentName}`);
                        setTimeout(actionMenu, 2000);
                    }
                );
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
                    employeeRole = 'No existing role'
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
                viewDepartmentMenu();
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
        switch(answer.viewEmployees) {
            case 'View all':
                viewEmployeeAll();
                break;
            case 'View by role':
                viewEmployeeByRoleMenu();
                break;
            case 'View by department':
                viewEmployeeByDepartmentMenu();
                break;
            case 'View by manager':
                viewEmployeeByManagerMenu();
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
        if (res.length > 1) {
            console.table(res);
        } else {
            console.log('There is no employee data to display.')
        };
        setTimeout(viewMenu, 2000);
    });
};

// VIEW EMPLOYEE BY ROLE MENU 
const viewEmployeeByRoleMenu = () => {
    inquirer.prompt([
        {
            name: 'allOrEach',
            type: 'list',
            message: 'How would you like to view employees?',
            choices: [
                'View by all roles',
                'View by individual role',
                'Go back to view employee menu'
            ]
        }
    ]).then((answer) => {
        switch(answer.allOrEach) {
            case 'View by all roles':
                viewEmployeeByRoleAll();
                break;
            case 'View by individual role':
                viewEmployeeByRoleEach();
                break;
            default:
                viewEmployeeMenu();
                break;
        };
    });
};

// View employee data by all roles
const viewEmployeeByRoleAll = () => {
    let query = 'SELECT role.title AS role, A.id, A.first_name, A.last_name, role.salary, department.name AS department, B.first_name AS manager_first, B.last_name AS manager_last ';
    query += 'FROM employee A ';
    query += 'LEFT JOIN role ON A.role_id = role.id ';
    query += 'LEFT JOIN department ON role.id = department.id ';
    query += 'LEFT JOIN employee B ON A.manager_id = B.id ';
    query += 'ORDER BY role';
    connection.query(query, (err, res) => {
        if (err) throw err;
        if (res.length > 1) {
            console.table(res);
        } else {
            console.log('There is no employee data to display.')
        };
        setTimeout(viewMenu, 2000);
    });
};

// View employee data by each role
const viewEmployeeByRoleEach = () => {
    roleTitles = [];
    connection.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        if (res < 1) {
            console.log('There are no roles to display.');
            setTimeout(viewMenu, 2000);
        } else {
            res.forEach((item) => {
                roleTitles.push(`${item.id} | ${item.title}`);
            });

            inquirer.prompt([
                {
                    name: 'roleSelect',
                    type: 'list',
                    message: 'Select role to view employees:',
                    choices: roleTitles
                }
            ]).then((answer) => {
                let roleId = parseInt(answer.roleSelect.split('|').splice(0, 1).join('').trim());

                let query = 'SELECT role.title AS role, A.id, A.first_name, A.last_name, role.salary, department.name AS department, B.first_name AS manager_first, B.last_name AS manager_last ';
                query += 'FROM employee A ';
                query += 'LEFT JOIN role ON A.role_id = role.id ';
                query += 'LEFT JOIN department ON role.id = department.id ';
                query += 'LEFT JOIN employee B ON A.manager_id = B.id ';
                query += `WHERE role.id = ${roleId}`;
                connection.query(query, (err, res) => {
                    if (err) throw err;
                    if (res.length < 1) {
                        console.log('There is no employee data for this role.');
                    } else {
                        console.table(res);
                    }
                    setTimeout(viewMenu, 2000);
                });
            });
        };
    });
};

// VIEW EMPLOYEE BY DEPARTMENT MENU 
const viewEmployeeByDepartmentMenu = () => {
    inquirer.prompt([
        {
            name: 'allOrEach',
            type: 'list',
            message: 'How would you like to view employees?',
            choices: [
                'View by all departments',
                'View by individual department',
                'Go back to view employee menu'
            ]
        }
    ]).then((answer) => {
        switch(answer.allOrEach) {
            case 'View by all departments':
                viewEmployeeByDepartmentAll();
                break;
            case 'View by individual department':
                viewEmployeeByDepartmentEach();
                break;
            default:
                viewEmployeeMenu();
                break;
        };
    });
};

// View employee data by all departments
const viewEmployeeByDepartmentAll = () => {
    let query = 'SELECT department.name AS department, A.id, A.first_name, A.last_name, role.title AS role, role.salary, B.first_name AS manager_first, B.last_name AS manager_last ';
    query += 'FROM employee A ';
    query += 'LEFT JOIN role ON A.role_id = role.id ';
    query += 'LEFT JOIN department ON role.id = department.id ';
    query += 'LEFT JOIN employee B ON A.manager_id = B.id ';
    query += 'ORDER BY department';
    connection.query(query, (err, res) => {
        if (err) throw err;
        if (res.length > 1) {
            console.table(res);
        } else {
            console.log('There is no employee data to display.')
        };
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
        if (res.length > 1) {
            console.table(res);
        } else {
            console.log('There is no employee data to display.')
        };
        setTimeout(viewMenu, 2000);
    });
};

// View roles
const viewRoles = () => {
    let query = 'SELECT * FROM role';
    connection.query(query, (err, res) => {
        if (err) throw err;
        if (res.length > 1) {
            console.table(res);
        } else {
            console.log('There is no role data to display.')
        };
        setTimeout(viewMenu, 2000);
    });
};

// VIEW DEPARTMENT MENU 
const viewDepartmentMenu = () => {
    inquirer.prompt([
        {
            name: 'viewDepartmentAction',
            type: 'list', 
            message: 'What would you like to view?',
            choices: [
                'View all departments',
                'View total utilized budget of a department',
                'Go back to view menu'
            ]
        }
    ]).then((answer) => {
        switch(answer.viewDepartmentAction) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View total utilized budget of a department':
                viewDepartmentBudget();
                break;
            default: 
                viewMenu();
                break;
        };
    });
};

// View all departments
const viewDepartments = () => {
    let query = 'SELECT * FROM department';
    connection.query(query, (err, res) => {
        if (err) throw err;
        if (res.length > 1) {
            console.table(res);
        } else {
            console.log('There is no department data to display.')
        };
        setTimeout(viewMenu, 2000);
    });
};

// View department budget
const viewDepartmentBudget = () => {
    departmentNames = ['No existing departments in database'];
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        if (res < 1) {
            console.log('There is no department data to display.');
            setTimeout(viewMenu, 2000);
        } else {
            if (departmentNames[0] === 'No existing departments in database') {
                departmentNames.splice(0, 1);
            };
            res.forEach((item) => {
                departmentNames.push(`${item.id} | ${item.name}`)
            });

            inquirer.prompt([
                {
                    name: 'departmentName',
                    type: 'list',
                    message: 'Select one of the following departments to view budget:',
                    choices: departmentNames
                }
            ]).then((answer) => {
                let departmentId = parseInt(answer.departmentName.split(' ').splice(0, 1));
                let departmentName = answer.departmentName.split(' ').splice(2).join(' ').trim();

                connection.query(`SELECT SUM(salary) AS total_utilized_budget FROM role WHERE department_id = ${departmentId}`, (err, res) => {
                    if (err) throw err;
                    console.table(res);
                    setTimeout(viewMenu, 2000);
                });
            })
        };
    });
};

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
    let method;
    let employee;
    let employeeRoleId;
    let employeeRole;
    let employeeId;
    let managerId;
    let managerName;
    employeeNames = ['No existing employees in database'];

    const updateEmployeePromise = (answer) => {
        if (method === 'input') {
            employeeId = parseInt(answer.employee);
        } else {
            employeeId = parseInt(answer.employee.split(' ').splice(0, 1));
        };
        connection.query(
            `SELECT * FROM employee WHERE id = ${employeeId}`, (err, res) => {
                if (err) throw err;
                employee = res[0].first_name + ' ' + res[0].last_name;
                
                if (res[0].role_id !== null) {
                    employeeRoleId = parseInt(res[0].role_id);
                } else {
                    employeeRoleId = null;
                }

                if (res[0].manager_id !== null) {
                    managerId = parseInt(res[0].manager_id);
                } else {
                    managerId = null;
                }
    
                if (typeof(managerId) === "object") {
                    managerName = 'No manager';
                    managerId = 'N/A';
                } else {
                    connection.query(`SELECT * FROM employee WHERE id = ${managerId}`, (err, res) => {
                        if (err) throw err;
                        managerName = res[0].first_name + ' ' + res[0].last_name;
                    });  
                };
    
                connection.query(
                    `SELECT * FROM role WHERE id = ${employeeRoleId}`, (err, res) => {
                        if (err) throw err;
                        if (res.length > 0) {
                            employeeRole = res[0].title;
                        } else {
                            employeeRole = 'no existing role'
                        };
    
                        inquirer.prompt([
                            {
                                name: 'updateEmployee',
                                type: 'list',
                                message: `----------UPDATE EMPLOYEE MENU (${employee}, ${employeeRole})----------\nWhat data would you like to update?`,
                                choices: [
                                    'Employee name',
                                    'Employee role',
                                    'Employee manager',
                                    'Go back'
                                ]
                            }
                        ])
                        .then((answer) => {
                            // Continue to functions
                            switch(answer.updateEmployee) {
                                case 'Employee name':
                                    updateEmployeeName(employeeId, employee);
                                    break;
                                case 'Employee role':
                                    updateEmployeeRole(employeeId, employee, employeeRole);
                                    break;
                                case 'Employee manager':
                                    updateEmployeeManager(employeeId, managerId, managerName);
                                    break;
                                default:
                                    updateMenu();
                                    break;
                            };
                        });
                    }
                );
            }
        );
    };

    let query = 'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name ';
    query += 'FROM employee ';
    query += 'LEFT JOIN role ON employee.role_id = role.id ';
    query += 'LEFT JOIN department ON role.department_id = department.id';

    connection.query(query, (err, res) => {
        if (err) throw err;
        if (res.length < 1) {
            inquirer.prompt([
                {
                    name: 'noEmployees',
                    type: 'list',
                    message: 'There are no existing employees in the database...',
                    choices: ['Go back to update menu']
                }
            ]).then(() => {
                updateMenu();
            });
        } else {
            if (employeeNames[0] === 'No existing employees in database') {
                employeeNames.splice(0, 1);
            };
            res.forEach((item) => {
                employeeNames.push(`${item.id} | ${item.first_name} ${item.last_name} | ${item.title} | ${item.name}`);
            });

            inquirer.prompt([
                {
                    name: 'inputOrView',
                    type: 'list',
                    message: 'Select one of the following:',
                    choices: [
                        'Find employee by id',
                        'View all employees'
                    ]
                }
            ]).then((answer) => {
                switch(answer.inputOrView) {
                    case 'Find employee by id':
                        method = 'input';
                        inquirer.prompt([
                            {
                                name: 'employee',
                                type: 'input',
                                message: 'What is the id of the employee you would like to update?',
                            }
                        ]).then((answer) => updateEmployeePromise(answer));
                        break;
                    case 'View all employees':
                        method = 'list';
                        inquirer.prompt([
                            {
                                name: 'employee',
                                type: 'list',
                                message: 'Select one of the following employees to update:',
                                choices: employeeNames
                            }
                        ]).then((answer) => updateEmployeePromise(answer));
                        break;
                    default: 
                        updateMenu();
                        break;
                };
            })
        };
    });
};

// Update employee name 
const updateEmployeeName = (employeeId, employee) => {
    inquirer.prompt([
        {
            name: 'updateFirstName',
            type: 'input',
            message: 'Update first name:',
        },
        {
            name: 'updateLastName',
            type: 'input',
            message: 'Update last name:',
        }
    ])
    .then((answers) => {
        let query = 'UPDATE employee ';
        query += 'SET first_name = ?, last_name = ? WHERE id = ?'
        connection.query(query, [answers.updateFirstName, answers.updateLastName, employeeId], (err, res) => {
            if (err) throw err;
            console.log(`Employee (id: ${employeeId}) name successfully updated!`);
            connection.query(
                `SELECT * FROM employee WHERE id = ${employeeId}`, (err, res) => {
                    if (err) throw err;
                    console.log(`${employee} (previous name) ---> ${res[0].first_name} ${res[0].last_name} (updated name)\n`);
                    setTimeout(updateMenu, 2000);
                }
            );
        });
    });
};

// Update employee role 
const updateEmployeeRole = (employeeId, employee, employeeRole) => {
    roles = [];
    roleTitles = ['No existing roles in database'];
    connection.query(
        'SELECT * FROM role', (err, res) => {
            if (err) throw err;
            if (res.length < 1) {
                inquirer.prompt([
                    {
                        name: 'noRoles',
                        type: 'list',
                        message: 'There are no existing roles in the database...',
                        choices: ['Go back to update menu']
                    }
                ]).then(() => {
                    updateMenu();
                });
            } else {
                if (roleTitles[0] === 'No existing roles in database') {
                    roleTitles.splice(0, 1);
                };
                res.forEach((item) => {
                    roles.push(item);
                    roleTitles.push(`${item.id} | ${item.title}`);
                });

                inquirer.prompt([
                    {
                        name: 'updateRole',
                        type: 'list',
                        message: 'New role:',
                        choices: roleTitles
                    }
                ])
                .then((answer) => {
                    let roleId = parseInt(answer.updateRole.split(' ').splice(0, 1));
                    let query = 'UPDATE employee ';
                    query += 'SET role_id = ? WHERE id = ?'
                    connection.query(query, [roleId, employeeId], (err, res) => {
                        if (err) throw err;
                        console.log(`Employee (id: ${employeeId} | ${employee}) role successfully updated!`);
                        connection.query(
                            `SELECT * FROM role WHERE id = ${roleId}`, (err, res) => {
                                if (err) throw err;
                                console.log(`${employeeRole} (previous role) ---> ${res[0].title} (updated role)\n`);
                                setTimeout(updateMenu, 2000);
                            }
                        );
                    });
                });
            };
        }
    );
};

// Update employee manager
const updateEmployeeManager = (employeeId, managerId, managerName) => {
    employees = [];
    employeeNames = ['No existing employees in database'];

    connection.query(
        'SELECT * FROM employee', (err, res) => {
            if (err) throw err;
            if (res.length < 1) {
                inquirer.prompt([
                    {
                        name: 'noEmployees',
                        type: 'list',
                        message: 'There are no existing employees in the database...',
                        choices: ['Go back to update menu']
                    }
                ]).then(() => {
                    updateMenu();
                });
            } else {
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
                        name: 'updateManager',
                        type: 'list',
                        message: `Employee's current manager: ${managerName} (id: ${managerId})\nNew manager:`,
                        choices: employeeNames
                    }
                ]).then((answer) => {
                    let newManagerId;
                    if (answer.updateManager === 'No manager') {
                        newManagerId = null;
                    } else {
                        newManagerId = parseInt(answer.updateManager.split(' ').splice(0, 1));
                    }
                    connection.query(
                        'UPDATE employee SET manager_id = ? WHERE id = ?', [newManagerId, employeeId], (err, res) => {
                            if (err) throw err;
                            console.log(`Employee manager successfully updated!`);
    
                            if (newManagerId !== null) {
                                console.log(`${managerName} (previous manager) ---> ${answer.updateManager.split(2)} (updated manager)\n`);
                            } else {
                                console.log(`${managerName} (previous manager) ---> No manager (updated manager)\n`);
                            }
                            setTimeout(updateMenu, 2000);
                        }
                    );
                });
            };
        }
    );
};

// UPDATE ROLE MENU 
const updateRoleMenu = () => {
    let roles = [];
    let roleTitles = ['No existing roles in database'];
    let roleId;
    let roleTitle;
    let roleSalary;
    let departmentId;
    let departmentName;

    let query = 'SELECT role.id, role.title, role.salary, role.department_id, department.name ';
    query += 'FROM role ';
    query += 'LEFT JOIN department ON role.department_id = department.id';

    connection.query(query, (err, res) => {
        if (err) throw err;
        if (res.length < 1) {
            inquirer.prompt([
                {
                    name: 'noRoles',
                    type: 'list',
                    message: 'There are no existing roles in the database...',
                    choices: ['Go back to update menu']
                }
            ]).then(() => {
                updateMenu();
            });
        } else {
            if (roleTitles[0] === 'No existing roles in database') {
                roleTitles.splice(0, 1);
            }
            res.forEach(({ id, title, salary, department_id, name }) => {
                roles.push({id, title, salary, department_id});
                roleTitles.push(`${id} | ${title} | $${salary}/yr | ${name}`);
            });

            inquirer.prompt([
                {
                    name: 'updateRole',
                    type: 'list',
                    message: 'Select a role to update:',
                    choices: roleTitles
                }
            ])
            .then((answer) => {
                roleId = parseInt(answer.updateRole.split('|').splice(0, 1).join('').trim());
                roleTitle = answer.updateRole.split('|').splice(1, 1).join('').trim();
                roleSalary = answer.updateRole.split('|').splice(2, 1).join('').trim();
                departmentName = answer.updateRole.split('|').splice(3, 1).join('').trim();
                roles.forEach((role) => {
                    if (role.id === roleId) {
                        departmentId = role.department_id;
                    };
                });

                inquirer.prompt([
                    {
                        name: 'updateRoleAction',
                        type: 'list',
                        message: 'What would you like to update?',
                        choices: [
                            'Update title',
                            'Update salary',
                            'Update department',
                            'Go back to update menu'
                        ]
                    }
                ]).then((answer) => {
                    switch(answer.updateRoleAction) {
                        case 'Update title':
                            updateRoleTitle(roleId, roleTitle);
                            break;
                        case 'Update salary':
                            updateRoleSalary(roleId, roleSalary);
                            break;
                        case 'Update department':
                            updateRoleDepartment(roleId, departmentId, departmentName);
                            break;
                        default:
                            updateMenu();
                            break;
                    };
                });      
            });
        };
    });
};

// Update role title
const updateRoleTitle = (roleId, roleTitle) => {
    inquirer.prompt([
        {
            name: 'updateRoleTitle',
            type: 'input',
            message: 'New role title:'
        }
    ])
    .then((answer) => {
        connection.query(`UPDATE role SET title = '${answer.updateRoleTitle}' WHERE id = ${roleId}`, (err, res) => {
            if (err) throw err;
            console.log(`Role (id: ${roleId}) title successfully updated!`);

            connection.query(`SELECT * FROM role WHERE id = ${roleId}`, (err, res) => {
                if (err) throw err;
                console.log(`${roleTitle} (previous title) ---> ${res[0].title} (updated title)`);
                setTimeout(updateMenu, 2000);
            });
        });
    });
};

// Update role salary
const updateRoleSalary = (roleId, roleSalary) => {
    inquirer.prompt([
        {
            name: 'updateRoleSalary',
            type: 'input',
            message: 'New salary:'
        }
    ])
    .then((answer) => {
        let newSalary = parseInt(answer.updateRoleSalary);
        connection.query(`UPDATE role SET salary = ${newSalary} WHERE id = ${roleId}`, (err, res) => {
            if (err) throw err;
            console.log(`Role (id: ${roleId}) successfully updated!`);

            connection.query(`SELECT salary FROM role WHERE id = ${roleId}`, (err, res) => {
                if (err) throw err;
                console.log(`${roleSalary} (previous salary) ---> $${res[0].salary}/yr (updated salary)`)
            });
        });
    });
};

// Update role department
const updateRoleDepartment = (roleId, departmentId, departmentName) => {
    departmentNames = ['No existing departments in database'];
    connection.query(`SELECT * FROM department`, (err, res) => {
        if (err) throw err;
        if (res.length < 1) {
            inquirer.prompt([
                {
                    name: 'noDepartments',
                    type: 'list',
                    message: 'There are no existing departments in the database...',
                    choices: ['Go back to update menu']
                }
            ]).then(() => updateMenu());
        } else {
            if (departmentNames[0] === 'No existing departments in database') {
                departmentNames.splice(0, 1);
            };
            res.forEach(({ id, name }) => {
                departmentNames.push(`${id} | ${name}`);
            });
        };

        inquirer.prompt([
            {
                name: 'updateRoleDepartment',
                type: 'list', 
            type: 'list', 
                type: 'list', 
                message: 'Select new department for role:',
                choices: departmentNames
            }
        ])
        .then((answer) => {
            updatedDepartmentId = parseInt(answer.updateRoleDepartment.split(' ').splice(0));
            updatedDepartmentName  = answer.updateRoleDepartment.split(' ').splice(2);
            connection.query(`UPDATE role SET department_id = ${updatedDepartmentId} WHERE id = ${roleId}`, (err, res) => {
                if (err) throw err;
                console.log(`Role (id: ${roleId}) department successfully updated!\n${departmentName} (previous department) ---> ${updatedDepartmentName} (updated department)`);
                setTimeout(updateMenu, 2000);
            }); 
        });
    });
};

// Update department name
const updateDepartment = () => {
    departmentNames = ['No existing departments in database'];

    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        if (res.length < 1) {
            inquirer.prompt([
                {
                    name: 'noDepartments',
                    type: 'list',
                    message: 'There are no existing departments in the database...',
                    choices: ['Go back to update menu']
                }
            ]).then(() => {
                updateMenu();
            });
        } else {
            if (departmentNames[0] === 'No existing departments in database') {
                departmentNames.splice(0, 1);
            };
            res.forEach(({ id, name }) => {
                departmentNames.push(`${id} | ${name}`);
            });

            inquirer.prompt([
                {
                    name: 'updateDepartment',
                    type: 'list',
                    message: 'Select department to update:',
                    choices: departmentNames
                }
            ])
            .then((answer) => {
                let departmentId = parseInt(answer.updateDepartment.split(' ').splice(0, 1));
                let departmentName = answer.updateDepartment.split(' ').splice(2).join(' ').trim();

                inquirer.prompt([
                    {
                        name: 'updatedDepartmentName',
                        type: 'input',
                        message: 'Update department name:'
                    }
                ])
                .then((answer) => {
                    let updatedDepartmentName = answer.updatedDepartmentName;

                    connection.query(`UPDATE department SET name = '${updatedDepartmentName}' WHERE id = ${departmentId}`, (err, res) => {
                        if (err) throw err;
                        console.log(`Department (id: ${departmentId}) name successfully updated!\n${departmentName} (previous name) ---> ${updatedDepartmentName} (updated name)\n`);
                        setTimeout(updateMenu, 2000);
                    });
                });
                
            });
        };
    });
};

// DELETE EMPLOYEE/ROLE/DEPARTMENT MENU 
const deleteMenu = () => {
    inquirer.prompt([
        {
            name: 'deleteAction',
            type: 'list',
            message: '----------DELETE MENU----------\nWhat would you like to delete?',
            choices: [
                'Delete an employee',
                'Delete a role',
                'Delete a department',
                'Delete ALL data',
                'Go back'
            ]
        }
    ])
    .then((answer) => {
        // Continue to functions
        switch(answer.deleteAction) {
            case 'Delete an employee':
                deleteEmployee();
                break;
            case 'Delete a role':
                deleteRole();
                break;
            case 'Delete a department':
                deleteDepartment();
                break;
            case 'Delete ALL data':
                deleteALLData();
                break;
            default:
                actionMenu();
                break;
        };
    });
};

// Delete an employee
const deleteEmployee = () => {
    employeeNames = ['No existing employees in database'];
    let query = 'SELECT employee.id, employee.first_name, employee.last_name, department.name ';
    query += 'FROM employee ';
    query += 'LEFT JOIN role ON employee.role_id = role.id ';
    query += 'LEFT JOIN department ON role.department_id = department.id';
    connection.query(query, (err, res) => {
        if (err) throw err;
        if (res.length < 1) {
            inquirer.prompt([
                {
                    name: 'noEmployees',
                    type: 'list',
                    message: 'There are no existing employees in the database...',
                    choices: ['Go back to delete menu']
                }
            ]).then(() => deleteMenu());
        } else {
            if (employeeNames[0] === 'No existing employees in database') {
                employeeNames.splice(0, 1);
            };
            res.forEach((item) => {
                employeeNames.push(`${item.id} | ${item.first_name} ${item.last_name} | ${item.name}`)
            });

            inquirer.prompt([
                {
                    name: 'inputOrView',
                    type: 'list',
                    message: 'Select one of the following:',
                    choices: [
                        'Find employee by id',
                        'View all employees'
                    ]
                }
            ])
            .then((answer) => {
                switch(answer.inputOrView) {
                    case 'Find employee by id':
                        inquirer.prompt([
                            {
                                name: 'employeeId',
                                type: 'input',
                                message: 'Employee id:'
                            }
                        ])
                        .then((answer) => {
                            let employeeId = parseInt(answer.employeeId);
                            connection.query(`SELECT first_name, last_name FROM employee WHERE id = ${employeeId}`, (err, res) => {
                                if (err) throw err;
                                if (res.length < 1) {
                                    console.log(`Sorry! No employees with the id ${employeeId} found in the database.`);
                                    setTimeout(deleteMenu, 2000);
                                } else {
                                    let name = `${res[0].first_name} ${res[0].last_name}`;
                                    inquirer.prompt([
                                        {
                                            name: 'confirmation',
                                            type: 'confirm',
                                            message: `Are you sure you want to delete employee '${name}' (id: ${employeeId})?` 
                                        }
                                    ])
                                    .then((answer) => {
                                        if (answer.confirmation === true) {
                                            connection.query(`DELETE FROM employee WHERE id = ${employeeId}`, (err, res) => {
                                                if (err) throw err;
                                                console.log(`Employee ('${name}', id: ${employeeId}) successfully deleted.`);
                                                setTimeout(deleteMenu, 2000);
                                            });
                                        } else {
                                            deleteMenu();
                                        };
                                    });
                                };
                            });
                        });
                        break;
                    case 'View all employees':
                        inquirer.prompt([
                            {
                                name: 'employeeList',
                                type: 'list',
                                message: 'Select an employee to delete from the list:',
                                choices: employeeNames
                            }
                        ])
                        .then((answer) => {
                            let name = answer.employeeList.split(' ').slice(2, answer.employeeList.split(' ').length - 2).join(' ').trim();
                            let employeeId = parseInt(answer.employeeList.split(' ').splice(0, 1));
    
                            inquirer.prompt([
                                {
                                    name: 'confirmation',
                                    type: 'confirm', 
                                    message: `Are you sure you want to delete employee '${name}' (id: ${employeeId})?`
                                }
                            ])
                            .then((answer) => {
                                if (answer.confirmation === true) {
                                    connection.query(`DELETE FROM employee WHERE id = ${employeeId}`, (err, res) => {
                                        if (err) throw err;
                                        console.log(`Employee ('${name}', id: ${employeeId}) successfully deleted.`);
                                        setTimeout(deleteMenu, 2000);
                                    });
                                } else {
                                    deleteMenu();
                                };
                            });
                        });
                        break;
                    default:
                        deleteMenu();
                        break;
                };
            });
        };
    });
};

// Delete a role 
const deleteRole = () => {
    roleTitles = ['No existing roles in database'];

    let query = 'SELECT role.id, role.title, role.salary, department.name ';
    query += 'FROM role ';
    query += 'JOIN department ON role.department_id = department.id';
    connection.query(query, (err, res) => {
        if (err) throw err;
        if (res.length > 0) {
            if (roleTitles[0] === 'No existing roles in database') {
                roleTitles.splice(0, 1);
            };
            res.forEach((item) => {
                roleTitles.push(`${item.id} | ${item.title} | ${item.salary} | ${item.name}`);
            });
        } else {
            inquirer.prompt([
                {
                    name: 'noRoles',
                    type: 'list',
                    message: 'There are no existing roles in the database...',
                    choices: ['Go back to delete menu']
                }
            ]).then(deleteMenu());
        };

        inquirer.prompt([
            {
                name: 'deleteRole',
                type: 'list',
                message: 'Select a role to delete:',
                choices: roleTitles
            }
        ])
        .then((answer) => {
            let roleId = parseInt(answer.deleteRole.split(' ').splice(0, 1));
            let roleName = answer.deleteRole.split(' ').slice(2, answer.deleteRole.split(' ').length - 4).join(' ').trim();

            connection.query(`DELETE FROM role WHERE id = ${roleId}`, (err, res) => {
                if (err) throw err;
                console.log(`Role ('${roleName}', id: ${roleId}) successfully deleted.`);
                setTimeout(deleteMenu, 2000);
            });
        })
    });
};

// Delete a department 
const deleteDepartment = () => {
    departmentNames = ['No existing departments in database'];

    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        if (res.length > 0) {
            if (departmentNames[0] === 'No existing departments in database') {
                departmentNames.splice(0, 1);
            };
            res.forEach((item) => {
                departmentNames.push(`${item.id} | ${item.name}`);
            });
        } else {
            inquirer.prompt([
                {
                    name: 'noDepartments',
                    type: 'list',
                    message: 'There are no existing departments in the database...',
                    choices: ['Go back to delete menu']
                }
            ]).then(deleteMenu());
        };

        inquirer.prompt([
            {
                name: 'deleteDepartment',
                type: 'list',
                message: 'Select a department to delete:',
                choices: departmentNames
            }
        ])
        .then((answer) => {
            let departmentId = parseInt(answer.deleteDepartment.split(' ').splice(0, 1));
            let departmentName = answer.deleteDepartment.split(' ').slice(2).join(' ').trim();

            connection.query(`DELETE FROM department WHERE id = ${departmentId}`, (err, res) => {
                if (err) throw err;
                console.log(`Department ('${departmentName}', id: ${departmentId}) successfully deleted.`);
                setTimeout(deleteMenu, 2000);
            });
        });
    });
};

// Delete ALL data from database 
const deleteALLData = () => {
    inquirer.prompt([
        {
            name: 'deleteConfirmOne',
            type: 'confirm',
            message: 'If you proceed, ALL records (employees, roles & departments) will be deleted. Are you sure you want to continue?'
        }
    ]).then((answer) => {
        if (answer.deleteConfirmOne === false) {
            console.log('Action cancelled. Returning to delete menu...');
            setTimeout(deleteMenu, 2000);
        } else {
            inquirer.prompt([
                {
                    name: 'deleteConfirmTwo', 
                    type: 'confirm',
                    message: 'Final warning. ALL your data will be erased, never to be retrieved again. Continue?'
                }
            ]).then((answer) => {
                if (answer.deleteConfirmTwo === false) {
                    console.log('Action cancelled. Returning to delete menu...');
                    setTimeout(deleteMenu, 2000);
                } else {
                    inquirer.prompt([
                        {
                            name: 'deleteValidation',
                            type: 'input',
                            message: `To delete all data records, enter 'I really do want to delete everything':`
                        }
                    ]).then((answer) => {
                        if (answer.deleteValidation === 'I really do want to delete everything') {
                            connection.query('DELETE FROM employee', (err, res) => {
                                if (err) throw err;
                                connection.query('DELETE FROM role', (err, res) => {
                                    if (err) throw err;
                                    connection.query('DELETE FROM department', (err, res) => {
                                        if (err) throw err;
                                        console.log('All data records successfully deleted.');
                                        setTimeout(deleteMenu, 2000); 
                                    });
                                });
                            });
                        };
                    });
                };
            });
        };
    });
};