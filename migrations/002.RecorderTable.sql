-- Up
CREATE TABLE Recorder (
	id TEXT PRIMARY KEY,
	type TEXT,
	srcNum INTEGER,
	recNum INTEGER,
	count INTEGER,
	duration INTEGER,
	state INTEGER,
	len INTEGER,
	error INTEGER,
	spike INTEGER
);


CREATE TABLE RecorderStat (
	id TEXT PRIMARY KEY,
	srcNum INTEGER,
	recNum INTEGER,
	count INTEGER,
	duration INTEGER,
	len INTEGER,
	error INTEGER,
	spike INTEGER,
	date INTEGER
);	
-- Down
DROP TABLE Recorder;
DROP TABLE RecorderStat;
