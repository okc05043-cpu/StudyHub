CREATE DATABASE IF NOT EXISTS studyhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studyhub;

-- 정규화된 카테고리 테이블 (자료 유형)
CREATE TABLE IF NOT EXISTS categories (
  id   INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- 정규화된 과목 테이블
CREATE TABLE IF NOT EXISTS subjects (
  id   INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- 사용자
CREATE TABLE IF NOT EXISTS users (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname      VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 자료 게시글 (category_id, subject_id로 정규화)
CREATE TABLE IF NOT EXISTS posts (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  user_id        INT NOT NULL,
  category_id    INT NOT NULL,
  subject_id     INT NOT NULL,
  title          VARCHAR(200) NOT NULL,
  description    TEXT,
  download_count INT DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (subject_id)  REFERENCES subjects(id)
);

-- 첨부 파일 (posts와 1:N 관계)
CREATE TABLE IF NOT EXISTS files (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  post_id       INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name   VARCHAR(255) NOT NULL,
  file_size     INT NOT NULL,
  file_type     VARCHAR(100) NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 댓글
CREATE TABLE IF NOT EXISTS comments (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  post_id    INT NOT NULL,
  user_id    INT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)  ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE
);

-- 좋아요 (user-post 복합 PK)
CREATE TABLE IF NOT EXISTS likes (
  user_id    INT NOT NULL,
  post_id    INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 북마크 (user-post 복합 PK)
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id    INT NOT NULL,
  post_id    INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 초기 데이터
INSERT IGNORE INTO categories (name) VALUES
  ('족보'), ('강의자료'), ('정리노트'), ('과제'), ('기타');

INSERT IGNORE INTO subjects (name) VALUES
  ('데이터베이스'), ('웹프로그래밍'), ('알고리즘'), ('자료구조'),
  ('운영체제'), ('컴퓨터네트워크'), ('소프트웨어공학'), ('기타');
