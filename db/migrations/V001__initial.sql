CREATE EXTENSION pgcrypto;

CREATE TABLE organizations (
	id SERIAL PRIMARY KEY,
	uid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
	short_name text NOT NULL,
	full_name text NOT NULL,
	description text NOT NULL DEFAULT '',
	attributes jsonb
);

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	uid uuid NOT NULL UNIQUE,
	description text NOT NULL DEFAULT '',
	organization integer NOT NULL REFERENCES organizations (id) DEFAULT 1,
	created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE groups (
	id SERIAL PRIMARY KEY,
	size integer NOT NULL DEFAULT 1,
	created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE group_members (
	id SERIAL PRIMARY KEY,
	member integer NOT NULL REFERENCES users (id),
	group_id integer NOT NULL REFERENCES groups (id)
);

CREATE TABLE themes (
	id SERIAL PRIMARY KEY,
	title text NOT NULL,
	short_description text NOT NULL DEFAULT '',
	description text NOT NULL,
	approver integer REFERENCES users (id),
	creator integer NOT NULL REFERENCES users (id),
	private boolean NOT NULL DEFAULT false,
	executors_group integer NOT NULL REFERENCES groups (id),
	organization_id integer DEFAULT 0,
	created_at timestamptz NOT NULL DEFAULT NOW(),
	updated_at timestamptz NOT NULL DEFAULT NOW()
);
