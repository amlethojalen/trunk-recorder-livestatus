/// <reference path='./server/ServerSystem.ts'/>

import {ServerSystem} from './server/ServerSystem';

export class System{
	id: string;
	type: string;
	name: string;
	sysid: number;
	wacn: number;
	nac: number;

	constructor(serverRecorder: ServerSystem)
	{
		this.id = serverRecorder.id;
		this.type = serverRecorder.type;
		this.name = serverRecorder.name;
		this.sysid = serverRecorder.sysid;
		this.wacn = serverRecorder.wacn;
		this.nac = serverRecorder.nac;
	}
}
