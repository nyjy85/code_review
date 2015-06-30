//listens for event.  this is the purpose of background.js
chrome.runtime.onMessage.addListener(function(req, sender){
	if(req.event==="hello") console.log('HELLOW');
	if(req.event==="bye") console.log('BYE BYE');
	if(req.event==="get"){
		$.ajax({
			type: 'GET',
			url: 'http://localhost:1337/api/file/'+req.id,
			success: function(response){
				console.log('successfully gotten', response);
				// returnMessage(response);
			}
		})
	}
	if (req.event==="check"){

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		   var parsedRepo = tab.url.match(/^.*\/\/[\w+.]+(?=(\/\w+\/\w+))/);
		   var theRepo = parsedRepo.join("");

		   $.ajax({
		   		type: 'GET', 
		   		url: 'http://localhost:1337/session', 
		   		success: function(response){
		   			console.log('succesfully gotten', response);

		   			response.user.repos.forEach(function(repo){
		   				if (repo.url === theRepo) returnMessage(response.url);
		   			})
		   		}
		   })
		   // do comparison logic in the front
		}); 
	}
})

function returnMessage(msg){
	chrome.tabs.getSelected(null, function(tab){
		console.log('this be tab', tab)
		chrome.tabs.sendMessage(tab.id, {message: msg})
	});
};

