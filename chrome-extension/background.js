chrome.browserAction.onClicked.addListener(function(tab) {
	//Load application:
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true, url: "https://www.youtube.com/watch*"}, function (tabs) {
		chrome.tabs.executeScript(null,{file:"contentscript.js"});
	});
});