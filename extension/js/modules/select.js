function Events(startId, endId, color){
    this.startId = startId;
    this.endId = endId;
    this.color = color;
    this.selection;
    this.startNode;
    this.startOffset;
    this.endNode;
    this.endOffset;
    this.section;
    this.code;
}

Events.prototype.createData = function(){
    this.selection = window.getSelection();
    this.code = this.selection.toString();
    console.log('THIS IS THE SELECTION CODE!', this.code)
    var range = this.selection.getRangeAt(0);

    this.startNode = range.startContainer.textContent;
    this.startOffset = range.startOffset;

    this.endNode = range.endContainer.textContent;
    this.endOffset = range.endOffset;
    return this;
}
Events.prototype.setColor = function(){
    highlight.set(this.color);
    this.selection.removeAllRanges();
    return this;
}

Events.prototype.setData = function(){
    this.section = {
        startId: this.startId,
        endId: this.endId,
        startNode: this.startNode,
        endNode: this.endNode,
        startOffset: this.startOffset,
        endOffset: this.endOffset
    }
    return this;
}

var popOver = {};
popOver.show = function(e, ele, noComment){
    var left = e.pageX, top = e.pageY;
    var height = $('.popover').height();
    // grabs button data
    var data = $(ele).data("data");
    this.applyCSS(left, top, height);
    if(!noComment) this.bindData(data);
    $('.span1').val('');
}
popOver.applyCSS = function(left, top, height){
    $('.popover').show();
    $('.popover').css('left', (left-25) + 'px');
    $('.popover').css('top', (top-(height/2)-107) + 'px');
}
popOver.bindData = function(data){
   $('.popover').data("highlight-data", data);
    var popData = $('.popover').data("highlight-data");
    popData.comment.forEach(function(comment){
        console.log('THIS IS COMMENT', comment)

        $('.popover').prepend('<div class="chatbox"><div class="commenter"><p>'+comment.commenter+'</p></div><div class="msg">'+comment.message+'</div></div>');
    });

}

var Comment = {};
Comment.postNew = function(endId, data, user){
    data.newData.comment = {commenter: user.github.username, message: $('.span1').val()};
    console.log('postNew data', data)
    chrome.runtime.sendMessage({command: 'highlight-data', data: data});
    // postIt(endId, data.newData)
    data = null;
}
Comment.update = function(user){
    var updated = $('.popover').data('highlight-data');
    console.log('this be updated whaaa', updated)
    // updated.comment.push({message: $('.span1').val(), commenter: user.github.username});
    updated.comment.push({message: $('.span1').val(), commenter: user.github.username});
    updated.url = url();
    console.log('updated Data', updated)
    chrome.runtime.sendMessage({command: 'update-comment', data: updated})
}

var postIt = {};
postIt.append = function(endId, data){
    var x = $('#'+endId);
    var idx = x.contents().length-1;
    $(x.contents()[idx]).after('<button class="post-it" id="post-it-'+endId+'"></button>');
    this.bindData(endId, data)
}
postIt.bindData = function(endId, data){
    $('#post-it-'+endId).data("data", data);
    console.log('THIS.DATA.SKLDFJSD', data);
    $('.span1').val(data.comment.message)
}





// function setData(startId, endId, color){
//     var selection = window.getSelection();
//     var range = selection.getRangeAt(0);

//     var startNode = range.startContainer.textContent;
//     var startOffset = range.startOffset;

//     var endNode = range.endContainer.textContent;
//     var endOffset = range.endOffset;

//     highlight.set(color);

//     var section = {
//         startId: startId,
//         endId: endId,
//         startNode: startNode,
//         endNode: endNode,
//         startOffset: startOffset,
//         endOffset: endOffset
//     }
//     // gets rid of blue selection highlight
//     selection.removeAllRanges();
//     console.log('this is all the highlighted data', section)
//     return section;
// }


// function popOver(e, ele, noComment){
//     // var offset = $(ele).offset();
//     var left = e.pageX;
//     var top = e.pageY;
//     var height = $('.popover').height();
//     var data = $(ele).data("data")
//     console.log('YO THIS IS DAAAAATTTTAAA', data)
//     console.log('THE KIDDIE KIDS', $('.popover').children('div'))

//     $('.popover').show();
//     $('.popover').css('left', (left-25) + 'px');
//     $('.popover').css('top', (top-(height/2)-107) + 'px');
//     // adding comments
//     if(!noComment){
//        $('.popover').data("highlight-data", $(ele).data("data"));
//         console.log('DATA ON POPOVAAAA', $('.popover').data("highlight-data"))

//         var popData = $('.popover').data("highlight-data");
//         popData.comment.forEach(function(comment){
//             $('.popover').prepend('<div class="chatbox">'+comment.message+'</div>');
//         });
//     }


//     $('.span1').val('');
// }

// function postIt(endId, data){
//     var x = $('#'+endId);
//     var idx = x.contents().length-1;
//     $(x.contents()[idx]).after('<button class="post-it" id="post-it-'+endId+'"></button>');
//     // bind data to the postit
//     $('#post-it-'+endId).data("data", data);
//     $('.span1').val(data.comment.message)
// }

// function postNew(endId, data){
//     data.newData.comment = {message: $('.span1').val(), commenter: user.github.username};
//     chrome.runtime.sendMessage({command: 'highlight-data', data: data});
//     // postIt(endId, data.newData)
//     data = null;
// }

// function update(){
//     var updated = $('.popover').data('highlight-data');
//     console.log('this be updated whaaa', updated)
//     // $('.popover').data('highlight-data').comment.push($('.span1').val());
//     updated.comment.push({message: $('.span1').val(), commenter: user.github.username});
//     updated.url = url();
//     chrome.runtime.sendMessage({command: 'update-comment', data: updated})
// }
