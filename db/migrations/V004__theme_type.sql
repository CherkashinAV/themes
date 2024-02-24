CREATE TYPE theme_type_enum AS ENUM ('course', 'graduation', 'contest', 'pet', 'hackathon');

ALTER TABLE themes
ADD COLUMN type theme_type_enum NOT NULL DEFAULT 'pet' constraint;