-- Up
CREATE TABLE Call (
	id TEXT PRIMARY KEY,
	systemName TEXT,
	talkgroup TEXT,
	frequency TEXT,
	recorderNumber INTEGER,
	startTime INTEGER,
	stopTime INTEGER,
	fileName TEXT, 
	length INTEGER, 
	state INTEGER, 
	talkgrouptag TEXT,
	encrypted INTEGER,
	emergency INTEGER
	);
	
-- Down
DROP TABLE Call;
