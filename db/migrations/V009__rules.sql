CREATE TABLE organization_rules (
	id SERIAL PRIMARY KEY,
	title text NOT NULL,
	type theme_type_enum NOT NULL,
	expiration_date text NOT NULL,
	join_date text NOT NULL,
	realization_dates jsonb NOT NULL,
	download_link text NOT NULL,
	organization_id integer NOT NULL REFERENCES organizations (id)
);

ALTER TABLE themes
ADD COLUMN rule_id integer REFERENCES organization_rules (id);