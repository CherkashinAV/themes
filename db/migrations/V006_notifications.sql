CREATE TYPE notification_type_enum AS ENUM ('INVITE_MENTOR', 'MENTOR_RESPONSE', 'THEME_STATUS');

CREATE TABLE notifications (
	id SERIAL PRIMARY KEY,
	type notification_type_enum NOT NULL,
	user_id integer NOT NULL REFERENCES users (id),
	created_at timestamptz NOT NULL DEFAULT NOW(),
	attributes jsonb,
	new boolean NOT NULL DEFAULT true
);
