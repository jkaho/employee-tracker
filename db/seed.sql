-- Pre-populates department values --
INSERT INTO department(name) VALUES('Accounting and Finance');

INSERT INTO department(name) VALUES('Marketing');

INSERT INTO department(name) VALUES('Human Resource Management');

INSERT INTO department(name) VALUES('Information Technology');

-- Pre-populates role values --
INSERT INTO role(title, salary, department_id)
VALUES('Accounting Manager', 80000, 1);

INSERT INTO role(title, salary, department_id)
VALUES('Accountant', 60000, 1);

INSERT INTO role(title, salary, department_id)
VALUES('Marketing Manager', 100000, 2);

INSERT INTO role(title, salary, department_id)
VALUES('Marketing Specialist', 70000, 2);

INSERT INTO role(title, salary, department_id)
VALUES('HR Manager', 90000, 3);

INSERT INTO role(title, salary, department_id)
VALUES('HR Administrator', 60000, 3);

INSERT INTO role(title, salary, department_id)
VALUES('IT Manager', 95000, 4);

INSERT INTO role(title, salary, department_id)
VALUES('IT Consultant', 75000, 4);

-- Pre-populates employee values --
INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES('Samantha', 'Smith', 1, null);

INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES('Jack', 'Tang', 2, 1);

INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES('Amelia', 'Thompson', 2, 1);

INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES('Eliza', 'Wilkinson', 3, null);

INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES('Brie', 'Singh', 4, 3);

INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES('Chris', 'Rodriguez', 4, 3);

INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES('Tyler', 'McHatton', 5, null);

INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES('Billy', 'Kwon', 6, 5);

INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES('Mandy', 'Antonov', 7, null);

INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES('Kai', 'Murasaki', 8, 7);

INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES('Ben', 'Rossi', 8, 7);