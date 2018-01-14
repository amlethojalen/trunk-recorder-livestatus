/// <reference path='./server/ServerRate.ts'/>

import {ServerRate} from './server/ServerRate';

export class Rate{
	id: string;
	decoderate: number;
	lastupdate: number;

	constructor(serverRate: ServerRate)
	{
		this.id = serverRate.id;
		this.decoderate = Math.round(serverRate.decoderate);
		this.lastupdate = Math.round(new Date().getTime() / 1000);
	}
}
