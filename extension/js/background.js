//listens for event from content.js.  this is the purpose of background.js
// it will be a bunch of if statements that will check for the command and do something on that command


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(tab.url.indexOf('blob') > -1 && changeInfo.status == 'complete') {
    	chrome.runtime.sendMessage({command: 'verify', url: tab.url});
    } 
});

chrome.runtime.onMessage.addListener(function(req, sender){
 	if (req.command === 'notification') {
        chrome.browserAction.setBadgeText({text: req.len});
    }

	if(req.command === "get"){
		populateFile(req.id)
	}

	if (req.command === "verify"){
		// split get 4th element do repo name check
		console.log('in background for verification')
    	var parsedRepo = req.url.match(/^.*\/\/[\w+.]+(?=(\/\w+\/\w+))/);
    	var repo = parsedRepo.join("");
    	console.log('repo depp', repo)
    	getRepos(repo);
	}

	if (req.command === "highlight-data"){
		sendHighlightData(req.data)
	}

	if(req.command === "get-highlight"){
		getHighlightData(req.id)
	}

	if(req.command === 'get-file'){
		console.count('git file')
		getFile(req.url)
	}

	if(req.command === 'delete-highlight'){
		deleteHighlight(req.data.id, req.data.url)
		chrome.tabs.reload()
	}

	if(req.command === 'update-comment'){
		console.log('hit me baby', req)
		updateComment(req.data);
	}

});

function returnMessage(msg, cmd){
   chrome.tabs.getSelected(null, function(tab){
      chrome.tabs.sendMessage(tab.id, {message: msg, command: cmd})
   });
};
