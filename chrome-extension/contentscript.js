//Global variables:

//var WEBSITE = 'http://shervin.usnetwork.space';
var WEBSITE = 'http://us.foundation';
var EXTENSIONID = chrome.runtime.id;
$('body').append('<style>@font-face{font-family:\'Glyphicons Halflings\';src:url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.eot);src:url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.eot?#iefix) format(\'embedded-opentype\'),url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.woff2) format(\'woff2\'),url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.woff) format(\'woff\'),url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.ttf) format(\'truetype\'),url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.svg#glyphicons_halflingsregular) format(\'svg\')}</style>');


function parents(grandpa_id){
	grandpa_id = parseInt(grandpa_id);
	//A PHP version of this function is in us_helper.php
	switch(grandpa_id) {
    case 1:
    	return '@';
        break;
    case 2:
    	return '&';
        break;
    case 3:
    	return '#';
        break;
    case 4:
    	return '?';
        break;
    case 43:
    	return '!';
        break;
    default:
    	return null;
	}
}

function resetIdea(){
	$('#selectedNodeId').val('0');
	$('#selectedValue').remove();
	$('#addnode').show().val('');
}

function loadAlgolia(){
	//Load Algolia:
	var algolia_index,client;
	client = algoliasearch('49OCX1ZXLJ', 'ca3cf5f541daee514976bc49f8399716');
	algolia_index = client.initIndex('nodes');

	$( "#addnode" ).on('autocomplete:selected', function(event, suggestion, dataset) {
		//Update the hidden field:
		$('#selectedNodeId').val(suggestion.node_id);
		$('#addnode').hide();
		$('#addnode').before('<a id="selectedValue" href="javascript:void(0);">'+suggestion.value+'</a>');
	
		$( "#selectedValue" ).click(function() {
			resetIdea();
			$('#addnode').focus();
		});
		
	}).autocomplete({ hint: false, keyboardShortcuts: ['a'] }, [{
	    source: function(q, cb) {
	    	//Here we only search for hashtags within Growing a Startup
		      algolia_index.search(q, { filters: 'grandpas_child_id:56', hitsPerPage: 7 }, function(error, content) {
		        if (error) {
		          cb([]);
		          return;
		        }
		        
		        cb(content.hits, content);
		      });
		    },
		    displayKey: function(suggestion) { return "" },
		    templates: {
		      suggestion: function(suggestion) {
		         return '<span class="suggest-prefix"><span class="glyphicon glyphicon-link" aria-hidden="true"></span> Link to</span> '+parents(parseInt(suggestion.grandpa_id)) + suggestion._highlightResult.value.value;
		      },
		      header: function(data) {
		    	  if(!data.isEmpty){
		    		  return '<a href="javascript:newNode(\''+data.query+'\')" class="add_node"><span class="suggest-prefix"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span> Create</span> #'+data.query+'</a>';
		    	  }
		      },
		      empty: function(data) {
	    		  	  return '<a href="javascript:newNode(\''+data.query+'\')" class="add_node"><span class="suggest-prefix"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span> Create</span> #'+data.query+'</a>';
		      },
		    }
	}]).keypress(function (e) {
	    var code = (e.keyCode ? e.keyCode : e.which);
	    if (code == 13) {
	    	return void(0);
	    }
	});
}


function timeFormatter(hh_mm_ss_time){
	if(hh_mm_ss_time.length<1){
		return 0;
	}
	var time_parts = hh_mm_ss_time.split(":");
	if(time_parts.length==3){
		//Has hours too!
		return parseInt(time_parts[0]*3600) + parseInt(time_parts[1]*60) + parseInt(time_parts[2]);
	} else if(time_parts.length==2){
		return parseInt(time_parts[0]*60) + parseInt(time_parts[1]);
	} else if(time_parts.length==1){
		return parseInt(time_parts[0]);
	}
}


//Runs all the time:
if(!$( "#mainUsPlayer" ).hasClass( "us-player")){
	
	$('#watch-header').before(
		 '<div id="mainUsPlayer" class="us-player"><div>'
			 + '<div id="initialLoader"><img style="margin:15px 0;" src="chrome-extension://'+EXTENSIONID+'/load.gif" /> Loading...</div>'
			 + '<div id="videoStatus"></div>'
			 + '<div id="userStatus"></div>'
			 + '<div id="UsController">'
				 + '<div><table style="width:100%;"><tr>'
				 	+ '<td width="50%" style="padding-right:5px;"><label class="control-label">Start Time <span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="When the idea starts being described in the video. Required." data-toggle="tooltip"></span></label><div class="input-group"> <span class="input-group-addon"><a id="injectStartTime" href="javascript:void(0);"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></a></span> <input type="text" id="timeStart" class="form-control" placeholder="0:00" /></div></td>'
				 	+ '<td width="50%" style="padding-left:5px;"><label class="control-label">End Time <span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="The point where the idea is well explained. Required." data-toggle="tooltip"></span></label><div class="input-group"> <span class="input-group-addon"><a id="injectEndTime" href="javascript:void(0);"><span class="glyphicon glyphicon-stop" aria-hidden="true"></span></a></span> <input type="text" id="timeEnd" class="form-control" placeholder="0:00" /></div></td>'
				 + '</tr></table></div>'
				 + '<div>'
				 	+ '<label class="control-label">Gem Key <span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="Describe the idea in a sentence. Link to existing ideas or create new idea. Required." data-toggle="tooltip"></span></label><div class="input-group"> <span class="input-group-addon" style="padding:3px 9px;">#</span><input type="text" id="addnode" class="form-control" /><input type="hidden" id="selectedNodeId" value="0" /></div>'
				 + '</div>'
				 + '<div>'
				 	+ '<label class="control-label">Notes <span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="Explain your understandinf of how this video snippet related to the gem idea." data-toggle="tooltip"></span></label><textarea id="notesValue" class="form-control" rows="3"></textarea>'
				 + '</div>'
				 + '<div>'
				 	+ '<a id="savePostData" href="javascript:void(0);" class="btn btn-primary" style="margin:15px 0 0 15px;">Collect Gem <img src="chrome-extension://'+EXTENSIONID+'/diamond.png" width="20" /></a>'				 
				 	+ '<div id="saveUpdates"></div>'
				+ '</div>'
			+ '</div>'
		+'</div></div>'
	);
	
	
	//Apply tooltip:
	$('[data-toggle="tooltip"]').tooltip();
	
	//Load Search:
	loadAlgolia();
	
	//Setup some functions for what we just injected into the YouTube page:
	$( "#injectStartTime" ).click(function() {
		//We click on the play button to refresh the current timer which sometimes lags in Chrome and falls behind!
		$('.ytp-play-button').click();
		$('#timeStart').val($('.ytp-time-current').text());
		$('.ytp-play-button').click();
	});
	$( "#injectEndTime" ).click(function() {
		$('.ytp-play-button').click();
		$('#timeEnd').val($('.ytp-time-current').text());
		$('.ytp-play-button').click();
	});
	$( "#savePostData" ).click(function() {
		
		//Clean input data:
		var input_data = {
			youtube_id:$('meta[itemprop="videoId"]').attr("content"),
			start_time:timeFormatter($( "#timeStart" ).val()),
			end_time:timeFormatter($( "#timeEnd" ).val()),
			selected_id: parseInt($('#selectedNodeId').val()),
			new_node_text:$( "#addnode" ).val(),
			description:$( "#notesValue" ).val(),
		};

		//For sending over XMLhttp
		var params = "youtube_id="+input_data['youtube_id']
		+"&start_time="+input_data['start_time']
		+"&end_time="+input_data['end_time']
		+"&selected_id="+input_data['selected_id']
		+"&new_node_text="+input_data['new_node_text']
		+"&description="+input_data['description'];
		
		//Validate inputs:
		if(input_data['start_time']<1){
			alert('ERROR: Start time required.');
		} else if(input_data['end_time']<1){
			alert('ERROR: End time required.');
		} else if((input_data['end_time']-input_data['start_time'])<0){
			alert('ERROR: Start time must be before end time.');
		} else if((input_data['end_time']-input_data['start_time'])<3){
			alert('ERROR: A video Slice must be 3 seconds or longer.');
		} else if((input_data['end_time']-input_data['start_time'])>360){
			alert('ERROR: A video Slice must be 6 minutes or shorter.');
		} else if(input_data['selected_id']<1 && (input_data['new_node_text'].length<5 || input_data['description'].length<10)){
			if(input_data['new_node_text'].length<1){
				alert('ERROR: Search an idea or enter a new idea.');
			} else if(input_data['description'].length<10) {
				alert('ERROR: New ideas require a description to further explain them.');
			} else  {
				//The user has some text, but its short.
				alert('ERROR: New ideas must be 5 characters or longer.');
			}
			
		} else {
			
			var http = new XMLHttpRequest();
			http.open("POST", WEBSITE+"/openapi/sliceYouTubePost", true);
			//Send the proper header information along with the request
			http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			http.onreadystatechange = function() {//Call a function when the state changes.
				if(http.readyState == 4 && http.status == 200) {
					$( "#saveUpdates" ).html(http.responseText);
					
					//Reset input fields:
					resetIdea();
					$( "#timeStart" ).val('');
					$( "#timeEnd" ).val('');
					$( "#notesValue" ).val('');
					
					//Disapper in a while:
					setTimeout(function() {
				       $("#saveUpdates").html('&nbsp;');
					}, 3000);
				}
			}
			http.send(params);
			
		}
	});
}



//Fetch user session:
/*
var http = new XMLHttpRequest();
http.open("POST", WEBSITE+"/openapi/fetchUserSession", true);
//Send the proper header information along with the request
http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
http.onreadystatechange = function() {//Call a function when the state changes.
	if(http.readyState == 4 && http.status == 200) {
		$( "#saveUpdates" ).html(http.responseText);
	}
}
http.send("username=shervin&password=1234");
*/





/*
var xhrUser = new XMLHttpRequest();
xhrUser.open("GET", WEBSITE+"/openapi/fetchUserSession", true);
xhrUser.onreadystatechange = function() {
	if (xhrUser.readyState == 4) {
		$('#initialLoader').addClass('permanentHide');
		if(xhrUser.responseText=='0'){
			//The user is not logged in! Give them warning:
			$('#UsController').addClass('permanentHide');
			$('#videoStatus').addClass('permanentHide');
			$('#userStatus').html('<div class="alert alert-danger" role="alert"><b><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ERROR</b>: <a href="'+WEBSITE+'/login" target="_blank">Login first</a> and try again.</div>');
		} else {
			$('#UsController').fadeIn();
			$('#userStatus').addClass('permanentHide');
			//var userJson = JSON.parse(xhrUser.responseText);
			//$('#userStatus').html('<div class="alert alert-info" role="alert"><span class="glyphicon glyphicon-user" aria-hidden="true"></span> Welcome back <a href="'+WEBSITE+'/'+userJson.node_id+'" target="_blank">'+userJson.value+'</a> :)</div>');
		}
	}
}
xhrUser.send();
*/


//Fetch video from index:
var xhrVideo = new XMLHttpRequest();
//Search current YouTube Videos (Youtube ID 237 and YouTube videos 65)
xhrVideo.open("GET", WEBSITE+"/openapi/search2steps/237/65/"+$('meta[itemprop="videoId"]').attr("content"), true);
xhrVideo.onreadystatechange = function() {
	if (xhrVideo.readyState == 4) {
		$('#initialLoader').addClass('permanentHide');
		if(xhrVideo.responseText=='0'){
			$('#UsController').addClass('permanentHide');
			$('#videoStatus').html('<div class="alert alert-danger" role="alert"><b><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> ERROR</b>: Video not found in <a href="'+WEBSITE+'/65" target="_blank">YouTube Videos</a>. Add video on Us and then continue.</div>');
		} else {
			//TODO check for multiple results, which should not happen!
			//Indicate to the user that this video was found in our index:
			$('#UsController').fadeIn();
			var videoJson = JSON.parse(xhrVideo.responseText);
			$('#videoStatus').html('<p><span class="glyphicon glyphicon-facetime-video" aria-hidden="true"></span> Video: <a href="'+WEBSITE+'/'+videoJson[0].node_id+'" target="_blank">'+videoJson[0].value+'</a></p>');
		}
	}
}
xhrVideo.send();