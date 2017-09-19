



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











function uiStep1LoadUserLogin(){
	//Loading Login UI:

	
	
	
	//Load Listeners:
	
}



