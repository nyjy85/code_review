$(document).ready(function(){
	// only works on the popup's console
	console.log('document is ready!')

  	// this is working on the DOM for Fullstack Academy page
  	var text = $('.normtext.lead').text().trim()
  	console.log('this be text yo', text)
  	// emits an event
  	// chrome.extension.sendRequest({message: text});
  	$('.normtext.lead').on('click', function(){
  		chrome.runtime.sendMessage({event:"hello", message: text});
  		// chrome.runtime.sendMessage({event:"bye", message: 'bye bye'});
  	});

	chrome.runtime.onMessage.addListener(
		function(req, sender){
			console.log('received a msg from background', req);
			console.log('this be sender', sender)
		}
	)
});

