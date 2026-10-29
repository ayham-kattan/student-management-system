// Load local .env for hosts/ports; variables already set (Docker, CI) win.
require('dotenv').config({ quiet: true });

// Tests always use their own database and Redis index so they never touch dev data.
process.env.DB_NAME = process.env.DB_NAME_TEST || 'student_db_test';
process.env.REDIS_DB = process.env.REDIS_DB_TEST || '1';
