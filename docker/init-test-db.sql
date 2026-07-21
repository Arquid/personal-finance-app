-- Runs once, when the postgres container first initializes its data directory.
-- POSTGRES_DB (finance_db) is created automatically by the base image;
-- this adds the second database used by the backend's test suite.
CREATE DATABASE finance_test_db OWNER finance_user;
GRANT ALL PRIVILEGES ON DATABASE finance_test_db TO finance_user;
