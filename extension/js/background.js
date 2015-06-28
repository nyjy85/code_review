//listens for event
chrome.runtime.onMessage.addListener(function(req, sender){
	console.log('AM I IN BG.js??')
	if(req.event==="hello") console.log('HELLOW');
	if(req.event==="bye") console.log('BYE BYE');

	$.ajax({
  		type: 'POST',
  		url: 'http://localhost:1337/api/comments',
  		data: {highlighted:{code: req.message}},
  		success: function(response){
  			console.log('Post was successful!', response)
  		}
  	})
	returnMessage(req.message);
})

function returnMessage(msg){
	chrome.tabs.getSelected(null, function(tab){
		console.log('this be tab', tab)
		chrome.tabs.sendMessage(tab.id, {message: msg})
	});
};
