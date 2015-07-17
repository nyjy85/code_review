var Comment = {};

Comment.postNew = function(endId, data, user){
    data.newData.comment = {commenter: user.github.username, message: $('.span1').val()};
    chrome.runtime.sendMessage({command: 'highlight-data', data: data});
}
Comment.update = function(user){
    var updated = $('.popover').data('highlight-data');
    updated.comment.push({timestamp: Date.now(), message: $('.span1').val(), commenter: user.github.username});
    updated.url = url();
    chrome.runtime.sendMessage({command: 'update-comment', data: updated})
}