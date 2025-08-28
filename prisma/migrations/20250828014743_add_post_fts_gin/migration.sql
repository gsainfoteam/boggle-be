CREATE OR REPLACE FUNCTION immutable_array_to_string(text[], text)
RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE
AS $$ SELECT array_to_string(coalesce($1, '{}'::text[]), $2) $$;

CREATE INDEX IF NOT EXISTS "Post_fts_gin"
ON "Post"
USING GIN ((
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', immutable_array_to_string(tags, ' ')), 'B') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'C')
));
