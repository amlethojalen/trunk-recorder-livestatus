
export class ServerCall{
	id: string;
	freq: number;
	sysNum: number;
	shortName: string;	
	talkgroup: string;
	talkgrouptag: string;
	elasped: number;
	length: number;
	state: number;
	phase2: number;
	conventional: boolean;
	encrypted: boolean;
	emergency: boolean;
	startTime: number;
	stopTime: number;
	recNum: number;
	srcNum: number;
	recState: number;
	analog: boolean;
	filename: string;
	statusFilename: string;

	constructor()
	{
		this.id = void 0;
		this.freq = void 0;
		this.sysNum = void 0;
		this.shortName = void 0;
		this.talkgroup = void 0;
		this.talkgrouptag = void 0;
		this.elasped = void 0;
		this.length = void 0;
		this.state = void 0;
		this.phase2 = void 0;
		this.conventional = void 0;
		this.encrypted = void 0;
		this.emergency = void 0;
		this.startTime = void 0;
		this.stopTime = void 0;
		this.recNum = void 0;
		this.srcNum = void 0;
		this.recState = void 0;
		this.analog = void 0;
		this.filename = void 0;
		this.statusFilename = void 0;
	}
}
