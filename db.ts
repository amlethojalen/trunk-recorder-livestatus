/// <reference path='./models/state.ts'/>
/// <reference path='./models/call.ts'/>
/// <reference path='./models/rate.ts'/>
/// <reference path='./models/system.ts'/>
/// <reference path='./models/recorder.ts'/>
/// <reference path='./models/recorderstat.ts'/>

// https://github.com/kriasoft/node-sqlite

//import * as Promise from 'bluebird';
import * as sqlite from 'sqlite';
import {State} from './models/state';
import {Call} from './models/call';
import {Rate} from './models/rate'
import {System} from './models/system';
import {Recorder} from './models/recorder';
import {RecorderStat} from './models/recorderstat';


export class DB
{
	private _dbPromise: Promise<sqlite.Database>;

	constructor()
	{
		this._dbPromise = Promise.resolve()
		.then(() => sqlite.open('./database.sqlite'))
		.then(db => db.migrate({ force: 'false' }));	
	}

	async CallUpdate(call : Call)
	{
		const db = await this._dbPromise;
		var dbCall = await db.get("SELECT * FROM Call WHERE id = ?", call.id);
		if (dbCall == undefined)
		{
			// insert
			await db.run("INSERT INTO Call(id, systemName, talkgroup, frequency, recorderNumber, startTime, stopTime, fileName, length, state, talkgrouptag, emergency, encrypted) "
					+ "VALUES ($id, $systemName, $talkgroup, $frequency, $recorderNumber, $startTime, $stopTime, $fileName, $length, $state, $talkgrouptag, $emergency, $encrypted)", 
					{ 	$id : call.id,
						$systemName : call.systemName,
						$talkgroup : call.talkgroup,
						$frequency : call.frequency,
						$recorderNumber : call.recorderNumber,
						$startTime : call.startTime,
						$stopTime : call.stopTime,
						$fileName : call.fileName,
						$length : call.length,
						$state : call.state,
						$talkgrouptag : call.talkgrouptag,
						$emergency: call.emergency,
						$encrypted: call.encrypted });
		}
		else
		{
			// update
			await db.run("UPDATE Call SET stopTime = $stopTime, fileName = $fileName, length=$length, state = $state WHERE id = $id",
			{ 	$id : call.id,
				$stopTime : call.stopTime,
				$fileName : call.fileName,
				$length : call.length,
				$state : call.state});				
		}
	}

	async RecorderUpdate(recorder : Recorder)
	{
		const db = await this._dbPromise;
		var dbRecorder = await db.get("SELECT * FROM Recorder WHERE id = ?", recorder.id);
		if (dbRecorder == undefined)
		{
			// insert
			await db.run("INSERT INTO Recorder(id, type, srcNum, recNum, count, duration, state, len, error, spike) "
					+ "VALUES ($id, $type, $srcNum, $recNum, $count, $duration, $state, $len, $error, $spike)", 
					{ 	$id : recorder.id,
						$type : recorder.type,
						$srcNum : recorder.srcNum,
						$recNum : recorder.recNum,
						$count : recorder.count,
						$duration : recorder.duration,
						$state : recorder.state,
						$len : recorder.len,
						$error : recorder.error,
						$spike : recorder.spike});
		}
		else
		{
			// update
			await db.run("UPDATE Recorder SET count = $count, duration = $duration, len=$len, error = $error, spike = $spike WHERE id = $id",
			{ 	$id : recorder.id,
				$count : recorder.count,
				$duration : recorder.duration,
				$len : recorder.len,
				$error : recorder.error,
				$spike : recorder.spike});				
		}
	}

	async RecorderStatsUpdate(recorder : RecorderStat)
	{
		const db = await this._dbPromise;
			// insert
		await db.run("INSERT INTO RecorderStat(id, srcNum, recNum, count, duration, len, error, spike, date) "
				+ "VALUES ($id, $srcNum, $recNum, $count, $duration, $len, $error, $spike, $date)", 
				{ 	$id : recorder.id,
					$srcNum : recorder.srcNum,
					$recNum : recorder.recNum,
					$count : recorder.count,
					$duration : recorder.duration,
					$len : recorder.len,
					$error : recorder.error,
					$spike : recorder.spike,
					$date: recorder.date
				});
	}

	async CallsReset()
	{
		const db = await this._dbPromise;
			// insert
		await db.run("UPDATE Call SET state = 0 WHERE state = 1 ");
		await db.run("UPDATE Recorder SET state = 2 WHERE state = 3 ");
	}

	

	async RecordersGet() : Promise<Recorder[]>
	{
		const db = await this._dbPromise;
		const dbRecorders = await db.all("SELECT * FROM Recorder");

		var returnValues: Recorder[] = [];
		if (dbRecorders != undefined)
		{
			var len = dbRecorders.length;
			for (var i = 0; i < len; i ++)
			{
				returnValues.push(<Recorder>dbRecorders[i]);
			}
		}

		return returnValues;
	}

	async Calls_Get(limit: number) : Promise<Call[]>
	{
		const db = await this._dbPromise;
		const dbCalls = await db.all("SELECT * FROM Call WHERE recorderNumber IS NOT NULL ORDER BY startTime DESC LIMIT " + limit);

		var returnValues: Call[] = [];
		if (dbCalls != undefined)
		{
			var len = dbCalls.length;
			for (var i = 0; i < len; i ++)
			{
				returnValues.push(<Call>dbCalls[i]);
			}
		}

		return returnValues;
	}

	async Rate_Update(rate : Rate)
	{
		const db = await this._dbPromise;
		await db.run("UPDATE System SET last_decoderate = $last_decoderate, last_update = $last_update WHERE id = $id",
		{ 	$id : rate.id,
			$last_decoderate : rate.decoderate,
			$last_update : rate.lastupdate});	
	}

	async SystemUpdate(system : System)
	{
		const db = await this._dbPromise;
		var dbSystem = await db.get("SELECT * FROM System WHERE id = ?", system.id);
		if (dbSystem == undefined)
		{
			// insert
			await db.run("INSERT INTO System (id, type, name, sysid, wacn, nac) "
					+ "VALUES ($id, $type, $name, $sysid, $wacn, $nac)", 
					{ 	$id : system.id,
						$type : system.type,
						$name : system.name,
						$sysid : system.sysid,
						$wacn : system.wacn,
						$nac : system.nac});
		}
		else
		{
			// update
			await db.run("UPDATE System SET type = $type, name = $name, sysid=$sysid, wacn = $wacn, nac = $nac WHERE id = $id",
			{ 	$id : system.id,
				$type : system.type,
				$name : system.name,
				$sysid : system.sysid,
				$wacn : system.wacn,
				$nac : system.nac});				
		}
	}

	async Systems_Get() : Promise<System[]>
	{
		const db = await this._dbPromise;
		const dbSystems = await db.all("SELECT * FROM System");

		var returnValues: System[] = [];
		if (dbSystems != undefined)
		{
			var len = dbSystems.length;
			for (var i = 0; i < len; i ++)
			{
				returnValues.push(<System>dbSystems[i]);
			}
		}

		return returnValues;
	}
}

