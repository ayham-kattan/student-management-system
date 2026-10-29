CREATE TABLE IF NOT EXISTS students (
  student_id   INT          NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(100) NOT NULL,
  phone        VARCHAR(20)  NULL,
  department   VARCHAR(50)  NULL,
  created_date DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id),
  UNIQUE KEY uq_students_email (email),
  KEY idx_students_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
