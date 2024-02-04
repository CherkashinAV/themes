CREATE EXTENSION pgcrypto;

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	uid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	description text NOT NULL DEFAULT '',
	organization integer NOT NULL REFERENCES organizations (id),
	created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE themes (
	id SERIAL PRIMARY KEY,
	title text NOT NULL,
	short_description text NOT NULL DEFAULT '',
	description text NOT NULL,
	approver integer NOT NULL REFERENCES users (id),
	creator integer NOT NULL REFERENCES users (id),
	private boolean NOT NULL DEFAULT true,
	executors_group integer NOT NULL REFERENCES groups (id),
	created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE groups (
	id SERIAL PRIMARY KEY,
	size integer NOT NULL DEFAULT 1,
	theme integer REFERENCES themes (id),
	created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE group_members (
	id SERIAL PRIMARY KEY,
	user integer NOT NULL REFERENCES users (id),
	group integer NOT NULL REFERENCES groups (id)
);

CREATE TABLE organizations (
	id SERIAL PRIMARY KEY,
	uid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	short_name text NOT NULL,
	full_name text NOT NULL,
	description text NOT NULL DEFAULT '',
	attributes jsonb
);
