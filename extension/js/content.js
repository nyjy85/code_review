//listens for event
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
       console.log('this is tab yo', tab.url);
       var parsedRepo = tab.url.match(/^.*\/\/[\w+.]+(?=(\/\w+\/\w+))/);
       console.log('this is parsed URL', parsedRepo)
       // send parsed to the back end
       var theRepo = parsedRepo.join("");
       console.log('this is the repo', theRepo);

       $.ajax({
          type: 'GET', 
          url: 'http://localhost:1337/session', 
          success: function(response){
            console.log('succesfully gotten', response);

            response.user.repos.forEach(function(repo){
              console.log('repo.url', repo.url)
              console.log('repo', theRepo)
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

