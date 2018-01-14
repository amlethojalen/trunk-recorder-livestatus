/// <reference path='./state.ts'/>
/// <reference path='./server/ServerRecorder.ts'/>

import {State} from './state';
import {ServerRecorder} from './server/ServerRecorder';

export class Recorder{
	id: string;
	type: string;
	srcNum: number;
	recNum: number;
	count: number;
	duration: number;
	state: number;
	len: number;
	error: number;
	spike: number;

	constructor(serverRecorder: ServerRecorder)
	{
		this.id = serverRecorder.id;
		this.type = serverRecorder.type;
		this.srcNum = serverRecorder.srcNum;
		this.recNum = serverRecorder.recNum;
		this.count = serverRecorder.count;
		this.duration = serverRecorder.duration;
		this.state = serverRecorder.state;
		this.len = serverRecorder.status_len;
		this.error = serverRecorder.status_error;
		this.spike = serverRecorder.status_spike;
	}
}
