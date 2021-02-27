-- Pre-populates department values --
INSERT INTO department(name) VALUES('accounting and finance');

INSERT INTO department(name) VALUES('marketing');

INSERT INTO department(name) VALUES('human resource management');

INSERT INTO department(name) VALUES('information technology');

-- Pre-populates role values --
INSERT INTO role(title, salary, department_id)
VALUES('accounting manager', 80000, 1);

INSERT INTO role(title, salary, department_id)
VALUES('accountant', 60000, 1);

INSERT INTO role(title, salary, department_id)
VALUES('marketing manager', 100000, 2);

INSERT INTO role(title, salary, department_id)
VALUES('marketing specialist', 70000, 2);

INSERT INTO role(title, salary, department_id)
VALUES('hr manager', 90000, 3);

INSERT INTO role(title, salary, department_id)
VALUES('hr administrator', 60000, 3);

INSERT INTO role(title, salary, department_id)
VALUES('it manager', 95000, 4);

INSERT INTO role(title, salary, department_id)
VALUES('it consultant', 75000, 4);

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