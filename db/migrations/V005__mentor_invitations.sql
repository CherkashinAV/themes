CREATE TYPE mentor_invitation_status_enum AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE mentor_invitations (
	id SERIAL PRIMARY KEY,
	inviter uuid NOT NULL,
	mentor_id integer NOT NULL REFERENCES users (id),
	theme_id integer NOT NULL REFERENCES themes (id),
	created_at timestamptz NOT NULL DEFAULT NOW(),
	status mentor_invitation_status_enum NOT NULL DEFAULT 'pending'
);
