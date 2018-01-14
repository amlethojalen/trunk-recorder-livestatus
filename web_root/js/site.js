
var websocket;
var livedata;
var filterTalkgroup = localStorage.getItem("filterTalkgroup");
if (filterTalkgroup == undefined) {
    filterTalkgroup = "";
}
var isMobile = false;


$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');


    if ($('#desktopTest').is(':hidden')) {
        isMobile = true;
    } else {
        isMobile = false;
    }

    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        return;
    }

    // open connection
    websocket = new WebSocket('ws://' + location.hostname+(location.port ? ':'+location.port: ''));

    websocket.onopen = function () {
        // first we want users to enter their names
    };

    websocket.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.' } ));
    };

    // most important part - incoming messages
    websocket.onmessage = function (message) {
        var json;
		try {
            json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
		}

        if (json.type == 'initial') {
                updateRecorders(json.recorders);
                updateCalls(json.calls);
                updateSystems(json.systems);
            } else if (json.type == 'call') {
                updateCall(json.call, false);
            } else if (json.type == 'recorder') {
                updateRecorder(json.recorder);
            } else if (json.type == 'recorders') {
                updateRecorders(json.recorders);
            } else if (json.type == 'system') {
                updateSystem(json.system);
            } else if (json.type == 'rate'){
                rateUpdate(json.rate);
            }

    };
    
    setInterval(UpdateTimes, 500);
});


function updateRecorders(recorders)
{

    recorders.sort(function(a,b) {return (a.id < b.id) ? 1 : ((b.id < a.id) ? -1 : 0);} );

    var len = recorders.length;
    for (var i = 0; i < len; i ++)
    {        
        var recorder = recorders[i];
        updateRecorder(recorder);
    }
}

function updateRecorder (recorder)
{

        var durationText = FormatDuration(recorder.duration);

        if ($("#rec_" + recorder.id).length == 0)
        {
            var row = "<tr id='rec_" + recorder.id+ "'>" 
                //+ "<td class='col-xs-2' id='" + call.id+ "_status'>" + call.state + "</td>"
                + "<td id='rec_" + recorder.id+ "_type'>" + recorder.type + "</td>"
                + "<td id='rec_" + recorder.id+ "_count'>" + recorder.count + "</td>"
                + "<td id='rec_" + recorder.id+ "_duration'>" + durationText + "</td>"
                + "<td id='rec_" + recorder.id+ "_len'>" + recorder.len + "</td>"                                                
                + "<td id='rec_" + recorder.id+ "_error'>" +  recorder.error + "</td>"                
                + "<td id='rec_" + recorder.id+ "_spike'>" + recorder.spike + "</td>"
                + "</tr>";

            $(row).prependTo("#recorder_log");

            SetInitialValue($("#rec_" + recorder.id+ "_count"), recorder.count);
            SetInitialValue($("#rec_" + recorder.id+ "_duration"), durationText);
            SetInitialValue($("#rec_" + recorder.id+ "_len"), recorder.len);
            SetInitialValue($("#rec_" + recorder.id+ "_error"), recorder.error);
            SetInitialValue($("#rec_" + recorder.id+ "_spike"), recorder.spike);

            var odd = true; 
            $('#recorder_log tr:visible').each(function() {   
              $(this).removeClass('odd even').addClass(odd?'odd':'even'); 
              odd=!odd 
            });
        }
        else
        {
            UpdateIfChanged($("#rec_" + recorder.id+ "_count"), recorder.count, recorder.count);
            UpdateIfChanged($("#rec_" + recorder.id+ "_duration"), durationText, durationText);
            UpdateIfChanged($("#rec_" + recorder.id+ "_len"), recorder.len, recorder.len);
            UpdateIfChanged($("#rec_" + recorder.id+ "_error"), recorder.error, recorder.error);
            UpdateIfChanged($("#rec_" + recorder.id+ "_spike"), recorder.spike, recorder.spike);
        }

        if (recorder.state == 3)
        {
            $("#rec_" + recorder.id).removeClass('inactiverecorder');
            $("#rec_" + recorder.id).addClass('activerecorder');
        }
        else 
        {
            if ($("#rec_" + recorder.id).hasClass('activerecorder'))
            {
                $("#rec_" + recorder.id).addClass('inactiverecorder');
            }
        }
}


function updateCalls(calls)
{

    calls.sort(function(a,b) {return (a.startTime > b.startTime) ? 1 : ((b.startTime > a.startTime) ? -1 : 0);} );

    var len = calls.length;
    for (var i = 0; i < len; i ++)
    {        
        var call = calls[i];
        updateCall(call,true);
    }
    applyZebraStripe();
}

function setFilter(talkgroupId){
  filterTalkgroup = talkgroupId;
  localStorage.setItem("filterTalkgroup", filterTalkgroup);
    // retrieve the dropdown selected value
  var table = $('#call_log');
  // if a location is selected
  if (talkgroupId != "") {
    // hide all not matching
    table.find('tr[data-tg!=' + talkgroupId + ']').hide();
    // display all matching
    table.find('tr[data-tg=' + talkgroupId + ']').show();
    applyZebraStripe();
  } else {
    // location is not selected,
    // display all
    table.find('tr').show();
    applyZebraStripe();
  }
}


function updateCall(call, isBatch)
{
    var stopTime = FormatDuration(call.length);
    //var audio = "<audio src=\"" + call.fileName + "\" controls preload='none'></audio>";
    var effectiveFilename = call.fileName;
    if (call.state == 1)
    {
        stopTime="&nbsp;";
        audio ="&nbsp;"
        //effectiveFilename = "";
        stopTime = "00:00:00";
    }
    //audio ="&nbsp;"
    if ($("#call_" + call.id).length == 0)
    {
        $("#call_log").find('tr:gt(1000)').remove();

        var tg = call.talkgrouptag;
        if (tg == '-') {
            tg = call.talkgroup;
        }

        var style = "display: none;";
        if ((filterTalkgroup == "") || (filterTalkgroup == call.talkgroup))
        {
            style = "";
        }

        var row = "<tr id='call_" + call.id+ "' class='call' data-tg='" + call.talkgroup + "' data-state='-1' style='" + style + "'>" 
            + "<td id='call_" + call.id+ "_sysname'>" + call.systemName + "</td>"
            + "<td id='call_" + call.id+ "_tg'>" + tg + "</td>"
            + "<td id='call_" + call.id+ "_freq' class='hidden-xs'>" + call.frequency + "</td>"
            + "<td id='call_" + call.id+ "_starttime'>" + FormatTime(call.startTime) + "</td>"
            + "<td><img class='recording' src='images/radio.apng' /></td>"
            + "<td id='call_" + call.id+ "_stoptime' data-starttime='" + call.startTime + "'>" +  stopTime + "</td>"
            + "<td id='call_" + call.id+ "_play' class='playbuttoncontainer'>&nbsp;</td>"
            + "</tr>";
        if (isMobile){
            row += "<tr id='callaudio_" + call.id + "' style='display: none;'><td id='callaudio_" + call.id + "_audio' colspan='6'>&nbsp;</td></tr>";
        }
        $(row).prependTo("#call_log");
        
        var filterItemId = "filterlist_" + call.talkgroup;
        if ($("#" + filterItemId).length == 0)
        {     
            var filterItem = "<li class='dynamic' id='" + filterItemId + "'><a href='#' onClick='setFilter(\"" + call.talkgroup + "\");'>" + tg + "</a></li>";

            $(filterItem).appendTo("#filterlist");

            $("#filterlist > li.dynamic").sort(asc_sort).appendTo('#filterlist');

            function asc_sort(a, b){
                return ($(b).text() == $(a).text()) ? 0 : (($(b).text()) < ($(a).text()) ? 1 : -1);    
            }

        }
        if (isBatch == false)
        {
            applyZebraStripe();
        }
    }

    var callRow = $("#call_" + call.id);
    var oldState = callRow.data('state');

    if (oldState != call.state)
    {
        callRow.data("state", call.state);
        if (call.state == 1) {
            // recording
            $("#call_" + call.id+ "_stoptime").addClass("updatetime");
            callRow.addClass('activecall');
        } else {
            // stopped;
            $("#call_" + call.id+ "_stoptime").removeClass("updatetime");
            callRow.addClass('inactivecall');
            $("#call_"+ call.id+ "_stoptime").html(stopTime);
            if (call.length > 0) {
                callRow.data('filename', call.fileName);
                var playButton = "<button onClick='playAudio(\"" + call.id+"\");' id='call_" + call.id+ "_playbutton' class='playbutton btn btn-info'><span class='glyphicon glyphicon-play'></span></button>";
                if (isMobile) {
                    $("#call_"+ call.id+ "_play").html(playButton);
                } else {
                    $("#call_"+ call.id+ "_play").html(playButton + "<span id='callaudio_" + call.id + "_audio'></span>");
                }
            }
        }
    }
}

function playAudio(callid)
{    
    var filename = $("#call_" + callid).data("filename");

    $("#callaudio_" + callid + "_audio").html("<audio src=\"" + filename + "\" controls preload='none' autoplay></audio>");
    $("#call_" + callid+ "_playbutton").hide();
    $("#callaudio_" + callid).show();
}

function applyZebraStripe()
{
    var odd = true; 
    $('#call_log tr:visible').each(function() {   
        if ($(this).hasClass('call')){
            odd=!odd 
          }    
        $(this).removeClass('odd even').addClass(odd?'odd':'even'); 
    });
}
/*
function applyZebraStripe()
{

}*/

function UpdateTimes()
{
    $("#call_log > tr.activecall > td.updatetime").each(function() {
        var startTime = $(this).data("starttime");
        if (startTime != undefined){
            var startDate = new Date(startTime * 1000);
            var currentDate = new Date();
            stopTime = FormatDuration((currentDate - startDate) / 1000);
            $(this).html(stopTime);
        }
    });
}

function SetInitialValue(el, rawValue)
{
    el.data('currentvalue', rawValue);
}

function UpdateIfChanged(el, rawValue, htmlValue)
{
    if (el.data('currentvalue') == rawValue){
        return;
    }
    el.data('currentvalue', rawValue).html(htmlValue);
}

function FormatTimeSpan(timeStart, timeEnd)
{
    var totalSeconds = timeEnd - timeStart;
    return FormatDuration(totalSeconds);
}

function FormatDuration(totalSeconds)
{
    totalSeconds = Math.round(totalSeconds);

    var seconds = totalSeconds % 60;
    var minutes = Math.floor(totalSeconds / 60) % 60;
    var hours = Math.floor(totalSeconds / 60 / 60);

    var minutesString = "0" + minutes;
    var secondsString = "0" + seconds;
    return hours + ':' + minutesString.substr(-2) + ':' + secondsString.substr(-2);
}

function FormatTime(time)
{
    var date = new Date(time*1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

function rateUpdate(rate)
{
    $("#sys_" + rate.id+ "_decoderate").html(rate.decoderate);
    $("#sys_" + rate.id+ "_lastupdate").html(FormatTime(rate.lastupdate));
}

function updateSystems(systems)
{

    systems.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} );

    var len = systems.length;
    for (var i = 0; i < len; i ++)
    {        
        var system = systems[i];
        updateSystem(system);
    }
}

function updateSystem(system)
{
    if ($("#sys_" + system.id).length == 0)
    {
        var row = "<div id='sys_" + system.id + "' class='sys'>"
            + "<div class='sysheading'>" + system.name + "<span class='right'>"+ system.type.toUpperCase()+"</span></div>"
            + "<div class='sysrow'>"
                + "<div class='value col-sm-4'><div class='valueheading'>SYS ID</div><span id='sys_" + system.id + "_sysid'>" + system.sysid.toString(16).toUpperCase() + "</span></div>"
                + "<div class='value col-sm-4'><div class='valueheading'>WACN</div><span id='sys_" + system.id + "_wacn'>" + system.wacn.toString(16).toUpperCase() + "</span></div>"
                + "<div class='value col-sm-4'><div class='valueheading'>NAC</div><span' id='sys_" + system.id + "_nac'>" + system.nac.toString(16).toUpperCase() + "</span></div>"
            +"</div>"
            + "<div class='sysrow'>"
                + "<div class='valueheading'>Decode Rate</div><div class='value' id='sys_" + system.id + "_decoderate'></div>"
            +"</div>"
            + "<div class='sysrow'>"
                + "<div class='valueheading'>Last update</div><div class='value' id='sys_" + system.id + "_lastupdate'></div>"
            +"</div>"
        $(row).appendTo("#system_container");
    }
    else
    {
        $("#sys_" + system.id+ "_sysid").html(system.sysid.toString(16).toUpperCase());
        $("#sys_" + system.id+ "_wacn").html(system.wacn.toString(16).toUpperCase());
        $("#sys_" + system.id+ "_nac").html(system.nac.toString(16).toUpperCase());
    }
}