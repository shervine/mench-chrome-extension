/*
 * 
 * GLOBAL VARIABLES
 * 
 * */

//var WEBSITE = 'http://shervin.usnetwork.space';
var WEBSITE = 'https://us.foundation';
var EXTENSIONID = chrome.runtime.id;
var STORAGE = chrome.storage.local; //Used to set and retrieve variables from local storage
//STORAGE.remove("user_node"); //For testing user login/logout

//Load search engine:
var CLIENT = algoliasearch('49OCX1ZXLJ', 'ca3cf5f541daee514976bc49f8399716');
var ALGOLIA_INDEX = CLIENT.initIndex('nodes');

/*
 * 
 * GENERIC FUNCTIONS
 * 
 * */

function parents(grandpa_id){
	grandpa_id = parseInt(grandpa_id);
	//A PHP version of this function is in us_helper.php
	switch(grandpa_id) {
    case 1:
    	return '@';
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

function resetNewVideoIdea(){
	$('#selectedNewVideoNodeId').val('0');
	$('#selectedNewVideoValue').remove();
	$('#addNewVideonode').show().val('');
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

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function toggleLoader(buttonID,showLoader){
	if(!showLoader){
		//This means we should load the button it self:
		$('#'+buttonID).removeClass('hide');
		$('#'+buttonID).next('.loading-msg').remove();
	} else {
		//We have a replacement loading message:
		$('#'+buttonID).addClass('hide');
		$('#'+buttonID).after('<div class="loading-msg"><img style="margin:15px 0;" src="chrome-extension://'+EXTENSIONID+'/load.gif" /></div>');
	}
}

function saveToLocalStorage(key,value){
	var obj= {};
	obj[key] = value;
	STORAGE.set(obj);
}




function create_intent(new_node_name){
	//Update the hidden field:
	$('#selectedNodeId').val(0); //Not a current node
	$('#addnode').hide();
	$('#addnode').before('<a id="selectedValue" title="Click to Change" href="javascript:void(0);">'+new_node_name+' <span style="color:#FF0000">[New]</span> <span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="New #Intents are created as a DIRECT OUT to #NewlyCreatedIntents, then you can organize and improve upon it on Foundation." data-toggle="tooltip" data-placement="bottom"></span></a>');
	
	//Apply tooltip:
	$('[data-toggle="tooltip"]').tooltip();
	
	$( "#selectedValue" ).click(function() {
		resetIdea();
		$('#addnode').focus();
	});
}

function create_NewVideo_intent(new_node_name){	
	//Update the hidden field:
	$('#selectedNewVideoNodeId').val(0); //Not a current node
	$('#addNewVideonode').hide();
	$('#addNewVideonode').before('<a id="selectedNewVideoValue" title="Click to Change" href="javascript:void(0);">'+new_node_name+' <span style="color:#FF0000">[New]</span> <span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="New #Intents are created as a DIRECT OUT to #NewlyCreatedIntents, then you can organize and improve upon it on Foundation." data-toggle="tooltip" data-placement="bottom"></span></a>');
	
	//Apply tooltip:
	$('[data-toggle="tooltip"]').tooltip();
	
	$( "#selectedNewVideoValue" ).click(function() {
		resetNewVideoIdea();
		$('#addNewVideonode').focus();
	});
}



/*
 * 
 * UI SPECIFIC FUNCTIONS
 * 
 * */

function uiStep3VideoSlicer(){
	
	STORAGE.get(["user_node","video_node"], function(items){
		
		//by now we should have both the user node and video node loaded into local storage:
		if(items.user_node==undefined || items.user_node.node_id<=0){
			//Missing user node in local storage:
			uiStep1LoadUserLogin();			
		} else if(items.video_node==undefined || items.video_node.node_id<=0){
			//Missing user node in local storage:
			uiStep2LoadVideoAdder();			
		} else {
			
			//All good, Ready to start Slicing Video:
			//Clear UI:
			$('#divVideoCreation').hide();
			
			//Adjust Background:
			$('.us-player').addClass('bg-blue');
			
			//Show new content:
			$('#mainContent').html(
				'<div class="divMainElement" id="UsController">'
				 	 + '<table style="width:100%;"><tr>'
					 	+ '<td width="50%" style="padding-right:5px;"><label class="control-label">#Intent <span id="slice-intent"></span><span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="Which #Intent is being referenced in this video slice? Link to an existing #Intent or create a new one." data-toggle="tooltip" data-placement="bottom"></span></label><div class="input-group"> <span class="input-group-addon" style="padding:3px 9px;">#</span><input type="text" id="addnode" placeholder="Search..." class="form-control" /><input type="hidden" id="selectedNodeId" value="0" /></div></td>'
					 	+ '<td width="21%" style="padding-right:5px;"><label class="control-label">Start <span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="When the #Intent starts being discussed in the video." data-toggle="tooltip" data-placement="bottom"></span></label><div class="input-group"> <span class="input-group-addon"><a id="injectStartTime" href="javascript:void(0);"><span class="glyphicon glyphicon-play" style="color:rgb(49, 210, 247);" aria-hidden="true"></span></a></span> <input type="text" id="timeStart" class="form-control" placeholder="0:00" /></div></td>'
					 	+ '<td width="21%" style="padding-left:5px;"><label class="control-label">End <span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="The point where the #Intent is well explained." data-toggle="tooltip" data-placement="bottom"></span></label><div class="input-group"> <span class="input-group-addon"><a id="injectEndTime" href="javascript:void(0);"><span class="glyphicon glyphicon-stop" style="color:rgb(49, 210, 247);" aria-hidden="true"></span></a></span> <input type="text" id="timeEnd" class="form-control" placeholder="0:00" /></div></td>'
					 	+ '<td width="8%" style="padding-left:5px;"><a id="savePostData" href="javascript:void(0);" class="btn btn-primary"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span></a></td>'
					 + '</tr></table>'
				+ '</div>'
			);
			
			//Show video URL:
			$('#slice-intent').append(' Mentioned in <a href="'+WEBSITE+'/'+items.video_node.node_id+'" target="_blank" title="Video Name: '+items.video_node.value+'">This Video</a> ');
			
			//Apply tooltip:
			$('[data-toggle="tooltip"]').tooltip();
			
			//Load Search:
			$( "#addnode" ).on('autocomplete:selected', function(event, suggestion, dataset) {
				
				//Update the hidden field:
				$('#selectedNodeId').val(suggestion.node_id);
				$('#addnode').hide();
				$('#addnode').before('<a id="selectedValue" title="Click to Change" href="javascript:void(0);">'+suggestion.value+'</a>');
			
				$( "#selectedValue" ).click(function() {
					resetIdea();
					$('#addnode').focus();
				});
				
			}).autocomplete({ hint: false, keyboardShortcuts: ['a'] }, [{
			    source: function(q, cb) {
			    	//Here we only search for hashtags within Growing a Startup
			    	ALGOLIA_INDEX.search(q, { filters: 'grandpa_id:3', hitsPerPage: 7 }, function(error, content) {
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
				         return '<span class="suggest-prefix"><span class="glyphicon glyphicon-link" aria-hidden="true"></span></span> '+parents(parseInt(suggestion.grandpa_id)) + suggestion._highlightResult.value.value;
				      },
				      header: function(data) {
				    	  if(!data.isEmpty){
				    		  return '<a href="javascript:void(0);" class="add_node"><span class="suggest-prefix"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span></span> #'+data.query+' [Press Enter]</a>';
				    	  }
				      },
				      empty: function(data) {
			    		  	  return '<a href="javascript:void(0);" class="add_node"><span class="suggest-prefix"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span></span> #'+data.query+' [Press Enter]</a>';
				      },
				    }
			}]).keypress(function (e) {
			    var code = (e.keyCode ? e.keyCode : e.which);
			    if (code == 13) {
			    	//The main controller for creating a new #Intent:
			    	create_intent($( "#addnode" ).val());
			    	return true;
			    }
			});
           
			
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
						video_node_id:items.video_node.node_id,
						us_id:items.user_node.node_id,
						intent_id: parseInt($('#selectedNodeId').val()),
						intent_name:$( "#addnode" ).val(),
						start_time:timeFormatter($( "#timeStart" ).val()),
						end_time:timeFormatter($( "#timeEnd" ).val()),
				};

				//For sending over XMLhttp
				var params = "video_node_id="+input_data['video_node_id']
				+"&us_id="+input_data['us_id']
				+"&start_time="+input_data['start_time']
				+"&end_time="+input_data['end_time']
				+"&intent_id="+input_data['intent_id']
				+"&intent_name="+input_data['intent_name'];
				
				//Validate inputs:
				if(input_data['video_node_id']<=0){
					alert('ERROR: Video reference lost. Refresh & Try again.');
				} else if(input_data['us_id']<=0){
					alert('ERROR: Login session expired! Refresh & Try again.');
				} else if(input_data['intent_id']<=0 && input_data['intent_name'].length<2){
					if(input_data['intent_name'].length<=0){
						alert('ERROR: Referenced #Intent Required.');
					} else  {
						//The user has some text, but its short.
						alert('ERROR: New ideas must be 2 characters or longer.');
					}
				} else if(input_data['start_time']<1){
					alert('ERROR: Start time required.');
				} else if(input_data['end_time']<1){
					alert('ERROR: End time required.');
				} else if((input_data['end_time']-input_data['start_time'])<0){
					alert('ERROR: Start time must be before end time.');
				} else if((input_data['end_time']-input_data['start_time'])<3){
					alert('ERROR: A video Slice must be 3 seconds or longer.');
				} else if((input_data['end_time']-input_data['start_time'])>300){
					alert('ERROR: A video Slice must be 5 minutes or shorter.');
				} else {
					
					//Show loader:
					toggleLoader('savePostData',1);
					
					//Send data for processing:
					var http = new XMLHttpRequest();
					http.open("POST", WEBSITE+"/openapi/sliceYouTubeVideo?"+params, true);
					//Send the proper header information along with the request
					http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					http.onreadystatechange = function() {//Call a function when the state changes.
						if(http.readyState == 4 && http.status == 200) {
							var gemCollectionJson = JSON.parse(http.responseText);
							if(gemCollectionJson.status){
								//Show message:
								alert('SUCCESS: '+gemCollectionJson.message+' Click [This Video] to browse, or continue collecting more gems ;)');
								
								//It all went well!
								resetIdea();
								$( "#timeStart" ).val('');
								$( "#timeEnd" ).val('');
							} else {
								//Ooops, some error?
								alert('ERROR: '+gemCollectionJson.message);
							}							
							//Reset loader:
							toggleLoader('savePostData',0);
						}					
					}
					http.send(params);
				}
			});
		}
	});
}





function uiStep2LoadVideoAdder(){
	
	//Show Loader in case fetching takes time:
	$('#mainContent').html('<div class="loading-msg"><img style="margin:15px 0;" src="chrome-extension://'+EXTENSIONID+'/load.gif" /> Loading...</div>');
	
	//Adjust Background:
	$('.us-player').addClass('bg-pink');
	
	//Lets see if we have this video, or if we need to add it:
	var xhrSearchVideo = new XMLHttpRequest();
	//Search current YouTube Videos (Youtube ID 237 and YouTube videos 65)
	xhrSearchVideo.open("GET", WEBSITE+"/openapi/search2steps/237/65/"+$('meta[itemprop="videoId"]').attr("content"), true);
	xhrSearchVideo.onreadystatechange = function() {
		if (xhrSearchVideo.readyState == 4) {
			var currentVideoJson = JSON.parse(xhrSearchVideo.responseText);
			if(currentVideoJson.status){
				
				//Video Found! Save in local storage:
				saveToLocalStorage("video_node",currentVideoJson.link);
				
				//Load next step:
				uiStep3VideoSlicer();
				
			} else {
				
				//Video not found!
				//Load UI to add video: 
				$('#mainContent').html(
					'<div class="divMainElement" id="divVideoCreation">'
					 	 //Must define IN reference of this new video to identify what this video is talking about:
						 + '<table style="width:100%;"><tr>'
						 	+ '<td width="40%" style="padding-right:5px;"><label class="control-label">New Video #Intent <span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="Every Video is discussing a macro topic that inspired the discussions within the video. This helps Us understand what this video is all about." data-toggle="tooltip" data-placement="bottom"></span></label><div class="input-group"> <span class="input-group-addon" style="padding:3px 9px;">#</span><input type="text" id="addNewVideonode" placeholder="Search..." class="form-control" /><input type="hidden" id="selectedNewVideoNodeId" value="0" /></div></td>'
						 	+ '<td width="26%" style="padding-right:5px;"><label class="control-label">People <span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="Who is in this video? Reference people who are talking and sharing #Intents." data-toggle="tooltip" data-placement="bottom"></span></label><div class="input-group"><input type="text" id="referencedPeople" placeholder="Elon Musk, Peter Thiel" class="form-control" /></div></td>'
						 	+ '<td width="26%" style="padding-left:5px;"><label class="control-label">Organizations <span class="glyphicon glyphicon-info-sign" aria-hidden="true" title="Are there any organizations whom produced this video or directly contributed to its #Intents?" data-toggle="tooltip" data-placement="bottom"></span></label><div class="input-group"><input type="text" id="referencedOrganizations" placeholder="Google, Y Combinator" class="form-control" /></div></td>'
						 	+ '<td width="8%" style="padding-left:5px;"><a id="addVideoButton" href="javascript:void(0);" class="btn btn-primary"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span></a></td>'
						 + '</tr></table>'
					+ '</div>'
				);
				
				//Apply tooltip:
				$('[data-toggle="tooltip"]').tooltip();
				
				//Load Search:
				$( "#addNewVideonode" ).on('autocomplete:selected', function(event, suggestion, dataset) {
					
					//Update the hidden field:
					$('#selectedNewVideoNodeId').val(suggestion.node_id);
					$('#addNewVideonode').hide();
					$('#addNewVideonode').before('<a id="selectedNewVideoValue" title="Click to Change" href="javascript:void(0);">'+suggestion.value+'</a>');
					$( "#selectedNewVideoValue" ).click(function() {
						resetNewVideoIdea();
						$('#addNewVideonode').focus();
					});
					
				}).autocomplete({ hint: false, keyboardShortcuts: ['a'] }, [{
				    source: function(q, cb) {
				    	//Here we only search for hashtags within Growing a Startup
				    	ALGOLIA_INDEX.search(q, { filters: 'grandpa_id:3', hitsPerPage: 7 }, function(error, content) {
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
					         return '<span class="suggest-prefix"><span class="glyphicon glyphicon-link" aria-hidden="true"></span></span> '+parents(parseInt(suggestion.grandpa_id)) + suggestion._highlightResult.value.value;
					      },
					      header: function(data) {
					    	  if(!data.isEmpty){
					    		  return '<a href="javascript:void(0);" class="add_node"><span class="suggest-prefix"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span></span> #'+data.query+' [Press Enter]</a>';
					    	  }
					      },
					      empty: function(data) {
				    		  	  return '<a href="javascript:void(0);" class="add_node"><span class="suggest-prefix"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span></span> #'+data.query+' [Press Enter]</a>';
					      },
					    }
				}]).keypress(function (e) {
				    var code = (e.keyCode ? e.keyCode : e.which);
				    if (code == 13) {
				    	//The main controller for creating a new #Intent:
				    	create_NewVideo_intent($( "#addNewVideonode" ).val());
				    	return true;
				    }
				});
				
				
				
				//Listen to new video submission button:
				$( "#addVideoButton" ).click(function() {
					STORAGE.get("user_node", function(items){
						
						//by now we should have both the user node and video node loaded into local storage:
						if(items.user_node==undefined || items.user_node.node_id<=0){
							//Missing user node in local storage:
							uiStep1LoadUserLogin();
						} else if($('meta[itemprop="videoId"]').attr("content").length < 8) {
							//This should never really happen!
							alert('ERROR: Invalid YouTube ID! Contact Admin to resolve this programming error.');
						} else if(parseInt($('#selectedNewVideoNodeId').val())<1 && $( "#addNewVideonode" ).val().length<1) {
							//This should never really happen!
							alert('ERROR: Either reference an existing #Intent or create a new #Intent.');
						} else {
							
							//Show loader:
							toggleLoader('addVideoButton',1);
							
							//Add video and associate it to the IN #Intent:
							var xhrAddVideo = new XMLHttpRequest();
							
							//Attempt to create this video in the new bucket list:
							xhrAddVideo.open("GET", WEBSITE+"/openapi/addYoutubeVideo?us_id="+items.user_node.node_id+"&video_id="+$('meta[itemprop="videoId"]').attr("content")+"&intent_id="+$('#selectedNewVideoNodeId').val()+"&intent_name="+$( "#addNewVideonode" ).val()+"&people="+$( "#referencedPeople" ).val()+"&organizations="+$( "#referencedOrganizations" ).val(), true);
							xhrAddVideo.onreadystatechange = function() {
								if (xhrAddVideo.readyState == 4) {
									var videoJson = JSON.parse(xhrAddVideo.responseText);
									//This should always work, as we're creating a new video:
									if(videoJson.status){
										//Set local variable:
										saveToLocalStorage("video_node",videoJson.link);
										
										//Load next step:
										uiStep3VideoSlicer();
										
										//Apply tooltip:
										$('[data-toggle="tooltip"]').tooltip();
										
									} else {
										//There was some error!
										alert('ERROR: '+videoJson.message);
									}
									
									//Hide loader:
									toggleLoader('addVideoButton',0);
								}
							}
							xhrAddVideo.send();
						}
					});
				});
			}
		}
	}
	xhrSearchVideo.send();
}







function uiStep1LoadUserLogin(){
	//Loading Login UI:
	$('#mainContent').html(
		'<div class="divMainElement" id="divUserLogin">'
			 + '<table style="width:100%;"><tr>'
			 	+ '<td width="46%" style="padding-right:5px;"><label class="control-label">Login email</label><input type="email" required="required" id="user_email" class="form-control" /></td>'
			 	+ '<td width="46%" style="padding-right:5px;"><label class="control-label">Login password</label><input type="password" required="required" id="user_pass" class="form-control" /></td>'
			 	+ '<td width="8%" style="padding-left:5px;"><a id="userAttemptLogin" href="javascript:void(0);" class="btn btn-primary"><span class="glyphicon glyphicon-log-in" aria-hidden="true"></span></a></td>'
			 + '</tr></table>'
		+ '</div>'
	);
	
	//Apply tooltip:
	$('[data-toggle="tooltip"]').tooltip();
	
	//Load Listeners:
	$( "#userAttemptLogin" ).click(function() {
		//Make sure valid entry:
		if(!validateEmail($('#user_email').val())){
			alert('ERROR: Enter a valid email to login.');
		} else if($('#user_pass').val().length<1){
			alert('ERROR: Enter a password to login.');
		} else {
			//Show processing bar:
			toggleLoader('userAttemptLogin',1);
			
			var xhrUser = new XMLHttpRequest();
			xhrUser.open("GET", WEBSITE+"/openapi/validateUser?user_email="+$('#user_email').val()+"&user_pass="+$('#user_pass').val(), true);
			xhrUser.onreadystatechange = function() {
				if (xhrUser.readyState == 4) {
					var login_result = JSON.parse(xhrUser.responseText);
					if(login_result.status){
						
						//Set local variable:
						saveToLocalStorage("user_node",login_result.link);
						
						//Move on to the next step:
						uiStep2LoadVideoAdder();
						
					} else {
						//There was some error!
						alert('ERROR: '+login_result.message);
					}
					//Release Button:
					toggleLoader('userAttemptLogin',0);					
				}
			}
			xhrUser.send();
		}	
	});
}






/*
 * 
 * LOADER
 * 
 * */
if(!$( "#mainUsPlayer" ).hasClass( "us-player")){
	
	//Load CSS
	//.addClass('adjustHeight')
	$('body').append('<input type="hidden" id="loadedURL" value="'+window.location+'" /><link href="https://fonts.googleapis.com/css?family=Exo" rel="stylesheet"><style>@font-face{font-family:\'Glyphicons Halflings\';src:url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.eot);src:url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.eot?#iefix) format(\'embedded-opentype\'),url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.woff2) format(\'woff2\'),url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.woff) format(\'woff\'),url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.ttf) format(\'truetype\'),url(chrome-extension://'+EXTENSIONID+'/glyphicons-halflings-regular.svg#glyphicons_halflingsregular) format(\'svg\')}</style>');

	//Load initial frame:
	//$('#watch-header').before(
	$('body').prepend(
		'<div id="mainUsPlayer" class="us-player"><div>'
			 + '<table style="width:100%;"><tr>'
			 	+ '<td width="60" style="padding-right:8px; font-size:42px; font-weight:bold; font-family:Exo;">Us</td>'
			 	+ '<td><div id="mainContent"></div></td>'
			 + '</tr></table>'
		+'</div></div>'
	);

	//See if we have user email/pass in local storage:
	STORAGE.get("user_node", function(items){
		if(items.user_node!==undefined && items.user_node.node_id>0){
			//Yes, user has already logged in!
			//Move on to the next step:
			uiStep2LoadVideoAdder();
		} else {
			//Load user login:
			uiStep1LoadUserLogin();
		}
	});
	
	var LOADED_URL = window.location;
	
	//Add URL change listener:
	window.setInterval(function(){
		if(window.location!=$('#loadedURL').val()){
			//This means the URL has changed! Remove the loaded to force reload:
			$( "#mainUsPlayer" ).html('URL change detected. Refresh page to collect more gems.');
		}
	}, 1000);
	
} else {
	$('#mainUsPlayer').toggle();
	//$('body').toggleClass('adjustHeight');
}


