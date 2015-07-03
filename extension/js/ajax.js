function getRepos(url){
	$.ajax({
   		type: 'GET', 
   		url: 'http://localhost:1337/session', 
   		success: function(response){
   			console.log('response please', response)
   			response.user.repos.forEach(function(repo){
   				if (repo.url === url) returnMessage(repo.url, 'verified');
   			}) 
   			if(!response) console.log('user is not part of this repo')
   		}
   })
}

function populateFile(id){
	$.ajax({
		type: 'GET',
		url: 'http://localhost:1337/api/file/'+id,
		success: function(response){
			console.log('successfully gotten', response);
			returnMessage(response, "file-retrieved");
		}
	})
}

function sendHighlightData(data){
   $.ajax({
      type: 'POST',
      url: 'http://localhost:1337/api/highlighted',
      data: data,
      success: function(response){
         console.log('POST has been successful!', response);
      }
   })
}

function getHighlightData(id){
   $.ajax({
      type: 'GET',
      url: 'http://localhost:1337/api/highlighted/getit/'+id,
      success: function(response){
         console.log('YOU GOT THE HIGLIHGT', response);
         returnMessage(response, 'highlight-retrieved');
      }
   })
}

function getFile(url){
   console.log('this is the file url', url)
   $.ajax({
      type: 'GET',
      data: {url: url},
      url: 'http://localhost:1337/api/file/',
      success: function(response){
         console.log('File from the backend', response);
         returnMessage(response, 'file-retrieved');
      }
   })
}

function deleteHighlight(id, url){ 
   console.log('this is the hiliglsdkfjs id', id);
   $.ajax({
      type: 'DELETE',
      data: {url: url},
      url: 'http://localhost:1337/api/highlighted/'+id,
      success: function(response){
         console.log('highlight successfully deleted', response)
         // returnMessage(response)
      }
   })

}

// for backend
// url.replace(/(http)/g, 'https').replace(/(wwww)\./g, '')