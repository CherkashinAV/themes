CREATE TYPE status_enum AS ENUM ('recruiting', 'staffed', 'in progress', 'completed');

ALTER TABLE themes
ADD COLUMN status status_enum NOT NULL DEFAULT 'recruiting' constraint;

CREATE TABLE join_requests (
	id SERIAL PRIMARY KEY,
	group_id integer NOT NULL REFERENCES groups (id),
	user_id integer NOT NULL REFERENCES users (id),
	created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);