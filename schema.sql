-- Organizations table 
CREATE TABLE if not exists organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    location VARCHAR(40),
    link VARCHAR(255)

);


CREATE TABLE if not exists users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    hashed_password varchar(255) not null,
    role varchar(20) default 'member' not null,
    org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE
);


-- CREATE TABLE if not exists tasks (
--     id SERIAL PRIMARY KEY,
--     title VARCHAR(50) NOT NULL,
--     description TEXT,
--     due_date DATE,
--     priority VARCHAR(50),
--     status VARCHAR(50) DEFAULT 'pending' ,
--     created_by integer references user(id) ON DELETE CASCADE,
--     assigned_to integer references user(id) on delete cascade,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Organization assigns task to a Team Leader
-- CREATE TABLE if not exists org_task_assignments (
--     id SERIAL PRIMARY KEY,
--     task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
--     assigned_to_team_leader_id INTEGER REFERENCES team_leaders(id) ON DELETE CASCADE,
--     assigned_by_org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
--     assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Team Leader assigns task to a Member
-- CREATE TABLE if not exists team_leader_task_assignments (
--     id SERIAL PRIMARY KEY,
--     task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
--     assigned_to_member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
--     assigned_by_team_leader_id INTEGER REFERENCES team_leaders(id) ON DELETE CASCADE,
--     assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
