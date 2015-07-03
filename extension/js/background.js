//listens for event from content.js.  this is the purpose of background.js
// it will be a bunch of if statements that will check for the command and do something on that command
chrome.runtime.onMessage.addListener(function(req, sender){

	if(req.command === "get"){
		console.log('get has been called')
		populateFile(req.id)
	}

	if (req.command === "verify"){
		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			// split get 4th element do repo name check
	    	var parsedRepo = tab.url.match(/^.*\/\/[\w+.]+(?=(\/\w+\/\w+))/);
	    	var repo = parsedRepo.join("");
	    	console.log('repo depp', repo)
	    	getRepos(repo);
		}); 
	}

	if (req.command === "highlight-data"){
		sendHighlightData(req.data)
	}

	if(req.command === "get-highlight"){
		getHighlightData(req.id)
	}

	if(req.command === 'get-file'){
		getFile(req.url)
	}

	if(req.command === 'delete-highlight'){
		deleteHighlight(req.data.id, req.data.url)
	}
})

function returnMessage(msg, cmd){
   chrome.tabs.getSelected(null, function(tab){
      chrome.tabs.sendMessage(tab.id, {message: msg, command: cmd})
   });
};

