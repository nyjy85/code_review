$(document).ready(function(){
    console.log('document is ready!')

    // sends events back to background.js 
    chrome.runtime.sendMessage({command: "verify"});

    $(document).on('click', function(){
        console.log('HEEELLLP')
        chrome.runtime.sendMessage({command: "get", id: '55918a257b166fba67442c21'});
    })
    
    // listens for events from AJAX calls/background.js and executes something
    chrome.runtime.onMessage.addListener(
        function(res, sender){
            if (res.command === 'verified'){
                console.log('message 1!', res.message)
                $('#LC26').html('<p>THERE IS A MATCH!</p>').css('background-color', 'green');
            }
            if (res.command === 'file-retrieved'){
                // do something
                console.log('message 2!', res.message)
            }
        }
    )
});


