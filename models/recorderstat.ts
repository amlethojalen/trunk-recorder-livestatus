/// <reference path='./recorder.ts'/>

import {Recorder} from './recorder';



export class RecorderStat{
	id: string;
	srcNum: number;
	recNum: number;
	count: number;
	duration: number;
	len: number;
	error: number;
	spike: number;
	date: number;



	Diff(recorderOld: Recorder, recorderNew: Recorder) : boolean
	{
		const newCount: number = recorderNew.count - recorderOld.count;
		const newDuration: number = recorderNew.duration - recorderOld.duration;
		const newLen: number = recorderNew.len - recorderOld.len;
		const newError: number = recorderNew.error - recorderOld.error;
		const newSpike: number = recorderNew.spike - recorderOld.spike;

		var changed:boolean = false;
		if (newCount != this.count)
			changed = true;
		else if (newDuration != this.duration)
			changed = true;
		else if (newLen != this.len)
			changed = true;
		else if (newError != this.error)
			changed = true;
		else if (newSpike != this.spike)
			changed = true;						

		if (changed == false)
			return false;

		this.count = newCount;
		this.duration = newDuration;
		this.len = newLen;
		this.error = newError;
		this.spike = newSpike;


		this.srcNum = recorderNew.srcNum;
		this.recNum = recorderNew.recNum;
		this.date = Date.now();
		this.id = recorderNew.id + "_" + this.date
		return true;
	}

	Load(recorder: Recorder)
	{		
		this.srcNum = recorder.srcNum;
		this.recNum = recorder.recNum;
		this.count = recorder.count;
		this.duration = recorder.duration;
		this.len = recorder.len;
		this.error = recorder.error;
		this.spike = recorder.spike;

		this.date = Date.now();

		this.id = recorder.id + "_" + this.date;
	}
}
