-- 1. Users Table
create database if not exists quiz_app_db;
use quiz_app_db;

-- 1. Users Table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    fullName VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    password VARCHAR(255) NOT NULL,
    refreshToken VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Quizzes Table
CREATE TABLE Quizzes (
    quiz_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_by INT NOT NULL, -- Matches 'user_id' type (INT)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES Users(user_id)
        ON DELETE CASCADE
);

-- 3. Questions Table
CREATE TABLE Questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL, -- Matches 'quiz_id' type (INT)
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES Quizzes(quiz_id)
        ON DELETE CASCADE
);

-- 4. Options Table
CREATE TABLE Options (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL, -- Matches 'question_id' type (INT)
    text VARCHAR(1000) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    
    FOREIGN KEY (question_id) REFERENCES Questions(question_id)
        ON DELETE CASCADE
);

-- 5. QuizAttempts Table
CREATE TABLE QuizAttempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- Matches 'user_id' type (INT)
    quiz_id INT NOT NULL, -- Matches 'quiz_id' type (INT)
    score INT NOT NULL DEFAULT 0,
    totalQuestions INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES Quizzes(quiz_id)
        ON DELETE CASCADE,
        
    UNIQUE KEY uk_user_quiz (user_id, quiz_id)
);

-- 6. SubmittedAnswers Table
CREATE TABLE SubmittedAnswers (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL, -- Matches 'attempt_id' type (INT)
    question_id INT NOT NULL, -- Matches 'question_id' type (INT)
    option_id INT NOT NULL, -- Matches 'option_id' type (INT)
    
    FOREIGN KEY (attempt_id) REFERENCES QuizAttempts(attempt_id)
        ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES Questions(question_id)
        ON DELETE CASCADE, 
    FOREIGN KEY (option_id) REFERENCES Options(option_id)
        ON DELETE CASCADE
);