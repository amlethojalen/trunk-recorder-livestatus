/// <reference path='./state.ts'/>
/// <reference path='./server/ServerCall.ts'/>

import {State} from './state';
import {ServerCall} from './server/ServerCall';

export class Call{
	id: string;
	systemName: string;
	talkgroup: string;
	talkgrouptag: string;
	frequency: number;
	recorderNumber: number;
	startTime: number;
	stopTime: number;
	fileName: string;
	length: number;
	state: State;
	encrypted : boolean;
	emergency: boolean;


	constructor(serverCall: ServerCall)
	{
		this.id = serverCall.id;
		this.systemName = serverCall.shortName;
		this.talkgroup = serverCall.talkgroup;
		this.talkgrouptag = serverCall.talkgrouptag;
		this.frequency = serverCall.freq;
		this.recorderNumber = serverCall.recNum;
		this.startTime = serverCall.startTime;
		this.stopTime = serverCall.stopTime;
		this.fileName = serverCall.filename;
		this.length = serverCall.length;
		this.state = serverCall.state;
		this.encrypted = serverCall.encrypted;
		this.emergency = serverCall.emergency;
	}
}
