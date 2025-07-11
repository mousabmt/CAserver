-- Organizations table 
CREATE TABLE if not exists organizations (
    org_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    hashed_password varchar(255) not null,
    description TEXT,
    location VARCHAR(40),
    is_private BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    role TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE if not exists users (
    acc_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    hashed_password varchar(255) not null,
    total_cb int
);
create table if not exists team_leaders(
    acc_id integer references users(acc_id),
    leader_id SERIAL PRIMARY key,
    leader_cb integer,
    is_assigned boolean,
    role TEXT CHECK (role IN ('member', 'leader')),

    org_id integer references organizations(org_id)


);

create table if not exists members(
    acc_id integer references users(acc_id),
    member_id SERIAL PRIMARY key,
    member_cb integer,
    is_assigned boolean,
    role TEXT CHECK (role IN ('member', 'leader')),

    leader_id integer references team_leaders(leader_id),
    org_id integer references organizations(org_id)


);

create table if not exists tasks(
    task_id SERIAL PRIMARY key,
    task_start TIMESTAMP,
    task_end TIMESTAMP,
    is_mandatory boolean,
    cb_points integer,
    org_id integer references organizations(org_id)
);
create table if not exists user_tasks(
task_id integer references tasks(task_id),
acc_id integer references users(acc_id),
org_id integer references organizations(org_id)    
);

