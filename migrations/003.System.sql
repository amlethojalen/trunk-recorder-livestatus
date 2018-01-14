-- Up
CREATE TABLE System (
	id TEXT PRIMARY KEY,
	type TEXT,
	name INTEGER,
	sysid INTEGER,
	wacn INTEGER,
	nac INTEGER,
	last_decoderate INTEGER,
	last_update INTEGER
);

-- Down
DROP TABLE system;
