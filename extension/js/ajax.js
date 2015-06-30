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

// for backend
// url.replace(/(http)/g, 'https').replace(/(wwww)\./g, '')