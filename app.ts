/// <reference path='./db.ts'/>
/// <reference path='./models/server/ServerRecorder.ts'/>
/// <reference path='./models/server/ServerCall.ts'/>
/// <reference path='./models/server/ServerSystem.ts'/>
/// <reference path='./models/server/ServerRate.ts'/>
/// <reference path='./models/call.ts'/>
/// <reference path='./models/recorder.ts'/>
/// <reference path='./models/system.ts'/>
/// <reference path='./models/recorderstat.ts'/>
/// <reference path='./models/rate.ts'/>
/// <reference path='./models/state.ts'/>

var config = require('./config.js');

var socketIndex = 0;

import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import {deserialize} from 'json-typescript-mapper';
import {Call} from './models/call';
import {System} from './models/system';
import {Recorder} from './models/recorder';
import {Rate} from './models/rate';
import {RecorderStat} from './models/recorderstat';
import {ServerCall} from './models/server/ServerCall';
import {ServerRecorder} from './models/server/ServerRecorder';
import {ServerSystem} from './models/server/ServerSystem';
import {ServerRate} from './models/server/ServerRate';

import * as _ from 'underscore';
import { DB } from "./db";

class Data{
	recorders: Recorder[];
}

const data: Data = new Data();
data.recorders = [];

var clients: WebSocket[] = [];
var servers: WebSocket[] = [];

var db: DB = new DB();

const app = express();

const server = http.createServer(app);
db.CallsReset();
db.RecordersGet().then(d => {if (d!= undefined) data.recorders =d;});

app.use(config.captureURLPrefix, express.static(config.captureDirectory));
app.use(express.static(__dirname + '/web_root'));

const wss = new WebSocket.Server({ server });

wss.on('connection', async (ws: WebSocket, req: Request) => {

	var isClient:boolean = true;
	var index: number = 0;
	var c = ws.connection;
	var o = (<any>req.headers).origin;
	if (o == undefined)
	{
		isClient = false;
	}

	index = socketIndex++;

	console.log("connect (" + index +")");

	if (isClient) {
		clients.push({ ws: ws, index: index});
	} else {
		servers.push({ ws: ws, index: index});		
	}
	ws.on('error', function(error)
	{
		console.log("error (" + index +"): " + error );
	});

    ws.on('message', (message: string) => {
		ProcessMessage(message);
    });

	ws.on('close', function(connection) {
		console.log("close (" + index +")");
		if (isClient) {
			clients = clients.filter(function(item) { return item.index != index;});
		} else {
			servers = servers.filter(function(item) { return item.index != index;});
		}
	});

	if (isClient)
	{
		UpdateClientInitial();
	}
	else
	{
		db.CallsReset();
		db.RecordersGet().then(d => {if (d!= undefined) data.recorders =d;});
		UpdateClientInitial();
	}
});

//start our server
server.listen(config.port, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});


function ProcessMessage(messageJson:string)
{
	var obj = JSON.parse(messageJson);
	if (obj.hasOwnProperty("type"))
	{
		var type = obj.type;
		
		if ((type == 'call_start') || (type == 'call_end'))
		{
			const serverCall: ServerCall = deserialize(ServerCall, obj.call);
			const call : Call = new Call(serverCall);
			ProcessCall(call, true);
		}
		else if (type == 'systems')
		{
			var len = obj.systems.length
			for (var i = 0; i < len; i ++)
			{
				const serverSystem: ServerSystem = deserialize(ServerSystem, obj.systems[i]);
				const system: System = new System(serverSystem);
				ProcessSystem(system, false);
			}
		}
		else if (type == 'system')
		{
			const serverSystem: ServerSystem = deserialize(ServerSystem, obj.system);
			const system: System = new System(serverSystem);
			ProcessSystem(system, false);
		}
		else if (type == 'rates')
		{
			var len = obj.rates.length
			for (var i = 0; i < len; i ++)
			{
				const serverRate: ServerRate = deserialize(ServerRate, obj.rates[i]);
				const rate: Rate = new Rate(serverRate);
				ProcessRate(rate);				
			}
		}
		else if (type == 'calls_active')
		{
			var len = obj.calls.length
			for (var i = 0; i < len; i ++)
			{
				const serverCall: ServerCall = deserialize(ServerCall, obj.calls[i]);
				const call: Call = new Call(serverCall);
				ProcessCall(call, false);
			}
		}
		else if (type == 'recorder')
		{
			const serverRecorder: ServerRecorder = deserialize(ServerRecorder, obj.recorder);
			const recorder: Recorder = new Recorder(serverRecorder);
			ProcessRecorder(recorder, true);
		}
		else if (type == 'recorders')
		{
			var len = obj.recorders.length
			for (var i = 0; i < len; i ++)
			{
				const serverRecorder: ServerRecorder = deserialize(ServerRecorder, obj.recorders[i]);
				const recorder: Recorder = new Recorder(serverRecorder);
				ProcessRecorder(recorder, false);
			}
			UpdateClientWithRecorders();
		}
	}		
}

function ProcessCall(call: Call, updateClient: boolean)
{
	call.fileName = call.fileName.replace(config.captureDirectory, config.captureURLPrefix);

	db.CallUpdate(call);
	if (updateClient)
		UpdateClientWithCall(call);
}

function ProcessRate(rate: Rate)
{
	db.Rate_Update(rate);
	ClientUpdate_WithRate(rate);
}


function ProcessSystem(system: System, updateClient: boolean)
{
	db.SystemUpdate(system);
	if (updateClient)
		UpdateClientWithSystem(system);
}

function ProcessRecorder(recorder: Recorder, updateClient: boolean)
{
	var id =  recorder.id
	var recorderStats: RecorderStat = new RecorderStat();
	var updateStats: boolean = true;


	var recorderOld = _.find(data.recorders, { id : id});
	if (recorderOld == null)
	{
		data.recorders.unshift(recorder);
		recorderStats.Load(recorder);
	}
	else
	{
		if (recorder.count < recorderOld.count)
			// assume that there was a restart and the counters have been reset
			recorderStats.Load(recorder);
		else
			updateStats = recorderStats.Diff(recorderOld, recorder);

		var index = data.recorders.indexOf(recorderOld);
		data.recorders[index] = recorder;
	}

	db.RecorderUpdate(recorder);
	if (updateStats)
		db.RecorderStatsUpdate(recorderStats);

	if (updateClient) {
		UpdateClientWithRecorder(recorder);
	}
}

function UpdateClientWithCall(call: Call)
{
	if (call.recorderNumber == null){
		// not recorded
		return;
	}
	Client_send(JSON.stringify({ type:'call', call: call }));
}

function UpdateClientWithRecorder(recorder: Recorder)
{
	Client_send(JSON.stringify({ type:'recorder', recorder: recorder }));
}

function UpdateClientWithRecorders()
{
	Client_send(JSON.stringify({ type:'recorders', recorders: data.recorders}));
}

async function UpdateClientInitial()
{
	const [calls, systems] = await Promise.all([
		db.Calls_Get(100),
		db.Systems_Get()
	]);

	
	Client_send(JSON.stringify({ type:'initial', recorders: data.recorders, calls: calls, systems: systems }));
}

function UpdateClientWithSystem(system: System)
{
	Client_send(JSON.stringify({ type:'system', system: system }));
}

function UpdateClientWithSystems(systems: System[])
{
	Client_send(JSON.stringify({ type:'systems', systems: systems }));
}


function ClientUpdate_WithRate(rate: Rate)
{
	Client_send(JSON.stringify({ type:'rate', rate: rate}));

}

function Client_send(json:string)
{
	for (var i=0; i < clients.length; i++) {
		try
		{
			clients[i].ws.send(json);
		}
		catch (ex)
		{
		}
	}
}
