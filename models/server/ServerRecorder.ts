
export class ServerRecorder{
	id: string;
	type: string;
	srcNum: number;
	recNum: number;
	count: number;
	duration: number;
	state: number;
	status_len: number;
	status_error: number;
	status_spike: number;

	constructor()
	{
		this.id = void 0;
		this.type = void 0;
		this.srcNum = void 0;
		this.recNum = void 0;
		this.count = void 0;
		this.duration = void 0;
		this.state = void 0;
		this.status_len = void 0;
		this.status_error = void 0;
		this.status_spike = void 0;
	}
}
