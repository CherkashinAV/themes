ALTER TABLE users
ADD COLUMN skills jsonb NOT NULL DEFAULT '[]';