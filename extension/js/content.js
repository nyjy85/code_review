function reSelect(hl, color){
  //////////
    var selection = window.getSelection();
    selection.removeAllRanges();
  ///////
    var startId = getNode(hl.startId)
    var endId = getNode(hl.endId);

    setStart(startId, hl.startNode);
    setEnd(endId, hl.endNode);

    setNewRange(hl, color)
};

function setNewRange(hl, color){
    var selection = window.getSelection();
    selection.removeAllRanges();
    var newRange = document.createRange();

    newRange.setStart(newStartNode, hl.startOffset);
    newRange.setEnd(newEndNode, hl.endOffset);
    selection.addRange(newRange);
    
    highlight.set(color);
    // gets rid of nasty blue line
    selection.removeAllRanges();
}

function getNode(id){
    return document.getElementById(id)
}

var newEndNode;
function setEnd(node, text) {
   if (node.textContent === text && node.childNodes.length === 0) {
       newEndNode = node;
   } else if (node.childNodes) {
       for (var i = 0; i < node.childNodes.length;i++) {
           setEnd(node.childNodes[i], text);
       }
   } else {
       console.log("getDocument: no document found for node");
   }
}
var newStartNode;
function setStart(node, text) {
   if (node.textContent === text && node.childNodes.length === 0) {
       newStartNode = node;
   } else if (node.childNodes) {
       for (var i = 0; i < node.childNodes.length;i++) {
           setStart(node.childNodes[i], text);
       }
   } else {
       console.log("getDocument: no document found for node");
   }
}

var highlight = {};

highlight.set = function(color){
    document.designMode = "on";
    document.execCommand("hiliteColor", false, color);
    document.designMode = 'off';  
}

highlight.clear = function(start, end, color){
	var newStart = parseInt(start.match(/\d+/)[0])
	var newEnd = parseInt(end.match(/\d+/)[0])
	var arr = [];

	for (var i = newStart; i <= newEnd; i++){
		arr.push("LC"+i);
	}

	arr.forEach(function(id){
		k = $('#'+ id + ' span');
		k.each(function(i, span){ $(span).css("background-color", color) });
	});
	var selection = window.getSelection();
    selection.removeAllRanges();
}

highlight.undo = function(section){
    document.designMode = 'on';
    
    // restoreRange(section)
    document.execCommand('removeFormat', false, null)
    var sel = window.getSelection();
    sel.removeAllRanges();
    // section = null;
    document.designMode = 'off';
}

// function restoreRange(section) {
//     var range = document.createRange();
//     console.log('this be section data in restorerange', section)
//     range.setStart(section.startContainer, section.startOffset);
//     range.setEnd(section.endContainer, section.endOffset);

//     var sel = window.getSelection();
//     sel.removeAllRanges();
//     sel.addRange(range);
// }

function Events(startId, endId, color){
    this.startId = startId;
    this.endId = endId;
    this.color = color;
    this.selection;
    this.startNode;
    this.startContainer;
    this.endContainer;
    this.startOffset;
    this.endNode;
    this.endOffset;
    this.section;
    this.code;
}

Events.prototype.createData = function(){
    this.selection = window.getSelection();
    this.code = this.selection.toString();
    var range = this.selection.getRangeAt(0);

    this.startNode = range.startContainer.textContent;
    this.startContainer = range.startContainer;
    this.startOffset = range.startOffset;

    this.endNode = range.endContainer.textContent;
    this.endContainer = range.endContainer;
    this.endOffset = range.endOffset;
    return this;
}
Events.prototype.setColor = function(){
    highlight.set(this.color);
    // this.selection.removeAllRanges();
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
    // console.log('popOver data', data)
    $('.popover').children('div').remove('.chatbox')
    var left = e.pageX, top = e.pageY;
    var height = $('.popover').height();
    // grabs button data
    
    this.applyCSS(left, top, height);
    
}
popOver.buttonShow = function(e, ele){
    $('.popover').children('div').remove('.chatbox')
    var left = e.pageX, top = e.pageY;
    var height = $('.popover').height();
    var data2 = $(ele).data("data");
    console.log('data2222222', data2)
    this.bindData(data2);
    this.applyCSS(left, top, height);
    // $('.span1').val('');
}
popOver.applyCSS = function(left, top, height){
    $('.popover').show();
    $('.popover').css('left', (left-25) + 'px');
    $('.popover').css('top', (top-(height/2)-107) + 'px');
}
popOver.bindData = function(data){
   $('.popover').data("highlight-data", data);
   data = null;
    var popData = $('.popover').data("highlight-data");
    popData.comment.forEach(function(comment){
        console.log('THIS IS COMMENT', comment)
        $('.popover').prepend('<div class="chatbox"><div class="commenter"><p>'+comment.commenter+'</p></div><div class="msg">'+comment.message+'</div><p class="timestamp">'+convertTime(comment.timestamp)+'</p></div>');
    
    });

}

function convertTime(date){
    var date2 = new Date(date).toString();
    return date2.split(" ").slice(0,5).join(" ");
}

var Comment = {};
Comment.postNew = function(endId, data, user){
    console.log('this be the comment', $('.span1').val())
    data.newData.comment = {commenter: user.github.username, message: $('.span1').val()};
    
    console.log('postNew data', data)
    chrome.runtime.sendMessage({command: 'highlight-data', data: data});
    // postIt(endId, data.newData)
    // data = null;
}
Comment.update = function(user){
    var updated = $('.popover').data('highlight-data');
    console.log('this be updated whaaa', updated)
    // updated.comment.push({message: $('.span1').val(), commenter: user.github.username});
    updated.comment.push({timestamp: Date.now(), message: $('.span1').val(), commenter: user.github.username});
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

$(document).ready(function(){
    console.log('document is ready!');
    // hacky as hell but oh well
    $('a').on('click', function(e){
        e.preventDefault();
        var href = $(this).attr('href')
        console.log('href href href', href)
        window.location.href = href;
    });

    chrome.runtime.onMessage.addListener(
        function(res, sender){
            if(res.command === 'verified'){
                runScript(res.message.url, res.message.user);    
            } 
        }
    )
});

function url(){
    return window.location.href;
}

function runScript(repoUrl, user){
    console.log('hit runScript', repoUrl, user)
  

    chrome.runtime.sendMessage({command: 'notification', len: user.notifications.length.toString()})
    chrome.runtime.sendMessage({command: 'get-file', url: url()});

    // INITIALIZE VARIABLES
    var startId, endId, data, comment, section;
    var color = '#ceff63';

//////////////////////////// box popover

    var $popover = '<div class="popover"><textarea id="textarea" placeholder="Leave a comment" rows=5 class="span1"></textarea><input style="float: right; " type="button" class="save-button" id="pop-button" value="Save"/><input style="float: right; " type="button" class="cancel-button" id="pop-button" value="Cancel"/><input style="float: right; " type="button" class="delete-button" id="pop-button" value="Delete"/></div>';
    $('body').append($popover);

///////////////////////////////////////

    $(".delete-button").on('click', function(e){
        console.log('the parent of delete button', $(this).parent())
        var id = $(this).parent().data("highlight-data")._id
        var data = $(this).parent().data("highlight-data").highlighted;
        console.log('THE DATA BEFORE THE DEL', data)
        highlight.clear(data.startId, data.endId, 'white')
        // serialize the text data
        // call highlight.undo
        // clears text area
        $('.span1').val('');
        $('.popover').hide();
        $('#post-it-'+data.endId).remove();
        chrome.runtime.sendMessage({command: 'delete-highlight', data: {id: id, url: url()}})
    });

    $(".save-button").on('click', function(e){
        console.log('1. .save-button data', data)
        if(data) Comment.postNew(endId, data, user);
        else Comment.update(user);
        data = null;
        $('.popover').hide();

    });

    $(".cancel-button").on('click', function(e){

        $('.popover').hide();
        // $('.span1').val("");
        console.log('section when cancel clicked', section)
        highlight.undo(section);

    });

    $('td').mousedown(function(){
        startId = $(this).attr('id');
    });

    $('td').mouseup(function(e){
        endId = $(this).attr('id');
        section = new Events(startId, endId, color);
        var serialized = section.createData().setColor().setData().section;

        var code = section.code;
        code = code.split('\n');
        // cache data
        data = {newData:{highlighted: serialized, code: code, color: color}, fileInfo: {fileUrl: url()}, repoUrl: repoUrl}

        popOver.show(e, endId, true)

    });

    // post-it on hover
    $("td").on('mouseenter', 'button.post-it', function(e){
        popOver.buttonShow(e, this)
    });

    $('td').on('mouseleave', 'button.post-it', function(){
        $('.popover').on('mouseleave', function(){
            // if(!$('.span1').val()) highlight.undo(section)
            $('.popover').children('div').remove('.chatbox');
            $('.popover').hide();
            $('.span1').val('');
        });
    })

    // listens for events from AJAX calls/background.js and executes something
    chrome.runtime.onMessage.addListener(
        function(res, sender){

            if(res.command === 'file-retrieved'){
                console.log('Highlight info from backend', res.message)
                var hl = res.message;
                // repopulate highlight
                hl.highlighted.forEach(function(selection){
                    reSelect(selection.highlighted, selection.color);
                    postIt.append(selection.highlighted.endId, selection);
                });
                res.command = null;
            }

            if(res.command === 'highlight-posted'){
                console.log('posted new highlight and got it from the back!', res)
                var id = res.message._id;
                var hl = res.message.highlighted;
                postIt.append(hl.endId, res.message)
                data = null;
                console.log('res.command data', data)
                res.command = null;
            }

            if(res.command === 'updated!'){
                console.log('comment appended!!!', res.message);
                res.command = null;
            }

            if(res.command === 'change-color'){
                color = res.message;
                res.command = null;
            }
            if(res.message === 'logout'){
                console.log('logout is hit in the content.js');
                res.command = null;
            }

        }
    )

}


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRlc2VyaWFsaXplLmpzIiwiaGlnaGxpZ2h0LmpzIiwic2VsZWN0LmpzIiwiY29udGVudFNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIHJlU2VsZWN0KGhsLCBjb2xvcil7XG4gIC8vLy8vLy8vLy9cbiAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgLy8vLy8vL1xuICAgIHZhciBzdGFydElkID0gZ2V0Tm9kZShobC5zdGFydElkKVxuICAgIHZhciBlbmRJZCA9IGdldE5vZGUoaGwuZW5kSWQpO1xuXG4gICAgc2V0U3RhcnQoc3RhcnRJZCwgaGwuc3RhcnROb2RlKTtcbiAgICBzZXRFbmQoZW5kSWQsIGhsLmVuZE5vZGUpO1xuXG4gICAgc2V0TmV3UmFuZ2UoaGwsIGNvbG9yKVxufTtcblxuZnVuY3Rpb24gc2V0TmV3UmFuZ2UoaGwsIGNvbG9yKXtcbiAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICB2YXIgbmV3UmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuXG4gICAgbmV3UmFuZ2Uuc2V0U3RhcnQobmV3U3RhcnROb2RlLCBobC5zdGFydE9mZnNldCk7XG4gICAgbmV3UmFuZ2Uuc2V0RW5kKG5ld0VuZE5vZGUsIGhsLmVuZE9mZnNldCk7XG4gICAgc2VsZWN0aW9uLmFkZFJhbmdlKG5ld1JhbmdlKTtcbiAgICBcbiAgICBoaWdobGlnaHQuc2V0KGNvbG9yKTtcbiAgICAvLyBnZXRzIHJpZCBvZiBuYXN0eSBibHVlIGxpbmVcbiAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XG59XG5cbmZ1bmN0aW9uIGdldE5vZGUoaWQpe1xuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcbn1cblxudmFyIG5ld0VuZE5vZGU7XG5mdW5jdGlvbiBzZXRFbmQobm9kZSwgdGV4dCkge1xuICAgaWYgKG5vZGUudGV4dENvbnRlbnQgPT09IHRleHQgJiYgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgIG5ld0VuZE5vZGUgPSBub2RlO1xuICAgfSBlbHNlIGlmIChub2RlLmNoaWxkTm9kZXMpIHtcbiAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgIHNldEVuZChub2RlLmNoaWxkTm9kZXNbaV0sIHRleHQpO1xuICAgICAgIH1cbiAgIH0gZWxzZSB7XG4gICAgICAgY29uc29sZS5sb2coXCJnZXREb2N1bWVudDogbm8gZG9jdW1lbnQgZm91bmQgZm9yIG5vZGVcIik7XG4gICB9XG59XG52YXIgbmV3U3RhcnROb2RlO1xuZnVuY3Rpb24gc2V0U3RhcnQobm9kZSwgdGV4dCkge1xuICAgaWYgKG5vZGUudGV4dENvbnRlbnQgPT09IHRleHQgJiYgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgIG5ld1N0YXJ0Tm9kZSA9IG5vZGU7XG4gICB9IGVsc2UgaWYgKG5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgc2V0U3RhcnQobm9kZS5jaGlsZE5vZGVzW2ldLCB0ZXh0KTtcbiAgICAgICB9XG4gICB9IGVsc2Uge1xuICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0RG9jdW1lbnQ6IG5vIGRvY3VtZW50IGZvdW5kIGZvciBub2RlXCIpO1xuICAgfVxufVxuIiwidmFyIGhpZ2hsaWdodCA9IHt9O1xuXG5oaWdobGlnaHQuc2V0ID0gZnVuY3Rpb24oY29sb3Ipe1xuICAgIGRvY3VtZW50LmRlc2lnbk1vZGUgPSBcIm9uXCI7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoXCJoaWxpdGVDb2xvclwiLCBmYWxzZSwgY29sb3IpO1xuICAgIGRvY3VtZW50LmRlc2lnbk1vZGUgPSAnb2ZmJzsgIFxufVxuXG5oaWdobGlnaHQuY2xlYXIgPSBmdW5jdGlvbihzdGFydCwgZW5kLCBjb2xvcil7XG5cdHZhciBuZXdTdGFydCA9IHBhcnNlSW50KHN0YXJ0Lm1hdGNoKC9cXGQrLylbMF0pXG5cdHZhciBuZXdFbmQgPSBwYXJzZUludChlbmQubWF0Y2goL1xcZCsvKVswXSlcblx0dmFyIGFyciA9IFtdO1xuXG5cdGZvciAodmFyIGkgPSBuZXdTdGFydDsgaSA8PSBuZXdFbmQ7IGkrKyl7XG5cdFx0YXJyLnB1c2goXCJMQ1wiK2kpO1xuXHR9XG5cblx0YXJyLmZvckVhY2goZnVuY3Rpb24oaWQpe1xuXHRcdGsgPSAkKCcjJysgaWQgKyAnIHNwYW4nKTtcblx0XHRrLmVhY2goZnVuY3Rpb24oaSwgc3Bhbil7ICQoc3BhbikuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBjb2xvcikgfSk7XG5cdH0pO1xuXHR2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbn1cblxuaGlnaGxpZ2h0LnVuZG8gPSBmdW5jdGlvbihzZWN0aW9uKXtcbiAgICBkb2N1bWVudC5kZXNpZ25Nb2RlID0gJ29uJztcbiAgICBcbiAgICAvLyByZXN0b3JlUmFuZ2Uoc2VjdGlvbilcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgncmVtb3ZlRm9ybWF0JywgZmFsc2UsIG51bGwpXG4gICAgdmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgLy8gc2VjdGlvbiA9IG51bGw7XG4gICAgZG9jdW1lbnQuZGVzaWduTW9kZSA9ICdvZmYnO1xufVxuXG4vLyBmdW5jdGlvbiByZXN0b3JlUmFuZ2Uoc2VjdGlvbikge1xuLy8gICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4vLyAgICAgY29uc29sZS5sb2coJ3RoaXMgYmUgc2VjdGlvbiBkYXRhIGluIHJlc3RvcmVyYW5nZScsIHNlY3Rpb24pXG4vLyAgICAgcmFuZ2Uuc2V0U3RhcnQoc2VjdGlvbi5zdGFydENvbnRhaW5lciwgc2VjdGlvbi5zdGFydE9mZnNldCk7XG4vLyAgICAgcmFuZ2Uuc2V0RW5kKHNlY3Rpb24uZW5kQ29udGFpbmVyLCBzZWN0aW9uLmVuZE9mZnNldCk7XG5cbi8vICAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuLy8gICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbi8vICAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuLy8gfVxuIiwiZnVuY3Rpb24gRXZlbnRzKHN0YXJ0SWQsIGVuZElkLCBjb2xvcil7XG4gICAgdGhpcy5zdGFydElkID0gc3RhcnRJZDtcbiAgICB0aGlzLmVuZElkID0gZW5kSWQ7XG4gICAgdGhpcy5jb2xvciA9IGNvbG9yO1xuICAgIHRoaXMuc2VsZWN0aW9uO1xuICAgIHRoaXMuc3RhcnROb2RlO1xuICAgIHRoaXMuc3RhcnRDb250YWluZXI7XG4gICAgdGhpcy5lbmRDb250YWluZXI7XG4gICAgdGhpcy5zdGFydE9mZnNldDtcbiAgICB0aGlzLmVuZE5vZGU7XG4gICAgdGhpcy5lbmRPZmZzZXQ7XG4gICAgdGhpcy5zZWN0aW9uO1xuICAgIHRoaXMuY29kZTtcbn1cblxuRXZlbnRzLnByb3RvdHlwZS5jcmVhdGVEYXRhID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICB0aGlzLmNvZGUgPSB0aGlzLnNlbGVjdGlvbi50b1N0cmluZygpO1xuICAgIHZhciByYW5nZSA9IHRoaXMuc2VsZWN0aW9uLmdldFJhbmdlQXQoMCk7XG5cbiAgICB0aGlzLnN0YXJ0Tm9kZSA9IHJhbmdlLnN0YXJ0Q29udGFpbmVyLnRleHRDb250ZW50O1xuICAgIHRoaXMuc3RhcnRDb250YWluZXIgPSByYW5nZS5zdGFydENvbnRhaW5lcjtcbiAgICB0aGlzLnN0YXJ0T2Zmc2V0ID0gcmFuZ2Uuc3RhcnRPZmZzZXQ7XG5cbiAgICB0aGlzLmVuZE5vZGUgPSByYW5nZS5lbmRDb250YWluZXIudGV4dENvbnRlbnQ7XG4gICAgdGhpcy5lbmRDb250YWluZXIgPSByYW5nZS5lbmRDb250YWluZXI7XG4gICAgdGhpcy5lbmRPZmZzZXQgPSByYW5nZS5lbmRPZmZzZXQ7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5FdmVudHMucHJvdG90eXBlLnNldENvbG9yID0gZnVuY3Rpb24oKXtcbiAgICBoaWdobGlnaHQuc2V0KHRoaXMuY29sb3IpO1xuICAgIC8vIHRoaXMuc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgIHJldHVybiB0aGlzO1xufVxuXG5FdmVudHMucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuc2VjdGlvbiA9IHtcbiAgICAgICAgc3RhcnRJZDogdGhpcy5zdGFydElkLFxuICAgICAgICBlbmRJZDogdGhpcy5lbmRJZCxcbiAgICAgICAgc3RhcnROb2RlOiB0aGlzLnN0YXJ0Tm9kZSxcbiAgICAgICAgZW5kTm9kZTogdGhpcy5lbmROb2RlLFxuICAgICAgICBzdGFydE9mZnNldDogdGhpcy5zdGFydE9mZnNldCxcbiAgICAgICAgZW5kT2Zmc2V0OiB0aGlzLmVuZE9mZnNldFxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn1cblxudmFyIHBvcE92ZXIgPSB7fTtcbnBvcE92ZXIuc2hvdyA9IGZ1bmN0aW9uKGUsIGVsZSwgbm9Db21tZW50KXtcbiAgICAvLyBjb25zb2xlLmxvZygncG9wT3ZlciBkYXRhJywgZGF0YSlcbiAgICAkKCcucG9wb3ZlcicpLmNoaWxkcmVuKCdkaXYnKS5yZW1vdmUoJy5jaGF0Ym94JylcbiAgICB2YXIgbGVmdCA9IGUucGFnZVgsIHRvcCA9IGUucGFnZVk7XG4gICAgdmFyIGhlaWdodCA9ICQoJy5wb3BvdmVyJykuaGVpZ2h0KCk7XG4gICAgLy8gZ3JhYnMgYnV0dG9uIGRhdGFcbiAgICBcbiAgICB0aGlzLmFwcGx5Q1NTKGxlZnQsIHRvcCwgaGVpZ2h0KTtcbiAgICBcbn1cbnBvcE92ZXIuYnV0dG9uU2hvdyA9IGZ1bmN0aW9uKGUsIGVsZSl7XG4gICAgJCgnLnBvcG92ZXInKS5jaGlsZHJlbignZGl2JykucmVtb3ZlKCcuY2hhdGJveCcpXG4gICAgdmFyIGxlZnQgPSBlLnBhZ2VYLCB0b3AgPSBlLnBhZ2VZO1xuICAgIHZhciBoZWlnaHQgPSAkKCcucG9wb3ZlcicpLmhlaWdodCgpO1xuICAgIHZhciBkYXRhMiA9ICQoZWxlKS5kYXRhKFwiZGF0YVwiKTtcbiAgICBjb25zb2xlLmxvZygnZGF0YTIyMjIyMjInLCBkYXRhMilcbiAgICB0aGlzLmJpbmREYXRhKGRhdGEyKTtcbiAgICB0aGlzLmFwcGx5Q1NTKGxlZnQsIHRvcCwgaGVpZ2h0KTtcbiAgICAvLyAkKCcuc3BhbjEnKS52YWwoJycpO1xufVxucG9wT3Zlci5hcHBseUNTUyA9IGZ1bmN0aW9uKGxlZnQsIHRvcCwgaGVpZ2h0KXtcbiAgICAkKCcucG9wb3ZlcicpLnNob3coKTtcbiAgICAkKCcucG9wb3ZlcicpLmNzcygnbGVmdCcsIChsZWZ0LTI1KSArICdweCcpO1xuICAgICQoJy5wb3BvdmVyJykuY3NzKCd0b3AnLCAodG9wLShoZWlnaHQvMiktMTA3KSArICdweCcpO1xufVxucG9wT3Zlci5iaW5kRGF0YSA9IGZ1bmN0aW9uKGRhdGEpe1xuICAgJCgnLnBvcG92ZXInKS5kYXRhKFwiaGlnaGxpZ2h0LWRhdGFcIiwgZGF0YSk7XG4gICBkYXRhID0gbnVsbDtcbiAgICB2YXIgcG9wRGF0YSA9ICQoJy5wb3BvdmVyJykuZGF0YShcImhpZ2hsaWdodC1kYXRhXCIpO1xuICAgIHBvcERhdGEuY29tbWVudC5mb3JFYWNoKGZ1bmN0aW9uKGNvbW1lbnQpe1xuICAgICAgICBjb25zb2xlLmxvZygnVEhJUyBJUyBDT01NRU5UJywgY29tbWVudClcbiAgICAgICAgJCgnLnBvcG92ZXInKS5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiY2hhdGJveFwiPjxkaXYgY2xhc3M9XCJjb21tZW50ZXJcIj48cD4nK2NvbW1lbnQuY29tbWVudGVyKyc8L3A+PC9kaXY+PGRpdiBjbGFzcz1cIm1zZ1wiPicrY29tbWVudC5tZXNzYWdlKyc8L2Rpdj48cCBjbGFzcz1cInRpbWVzdGFtcFwiPicrY29udmVydFRpbWUoY29tbWVudC50aW1lc3RhbXApKyc8L3A+PC9kaXY+Jyk7XG4gICAgXG4gICAgfSk7XG5cbn1cblxuZnVuY3Rpb24gY29udmVydFRpbWUoZGF0ZSl7XG4gICAgdmFyIGRhdGUyID0gbmV3IERhdGUoZGF0ZSkudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gZGF0ZTIuc3BsaXQoXCIgXCIpLnNsaWNlKDAsNSkuam9pbihcIiBcIik7XG59XG5cbnZhciBDb21tZW50ID0ge307XG5Db21tZW50LnBvc3ROZXcgPSBmdW5jdGlvbihlbmRJZCwgZGF0YSwgdXNlcil7XG4gICAgY29uc29sZS5sb2coJ3RoaXMgYmUgdGhlIGNvbW1lbnQnLCAkKCcuc3BhbjEnKS52YWwoKSlcbiAgICBkYXRhLm5ld0RhdGEuY29tbWVudCA9IHtjb21tZW50ZXI6IHVzZXIuZ2l0aHViLnVzZXJuYW1lLCBtZXNzYWdlOiAkKCcuc3BhbjEnKS52YWwoKX07XG4gICAgXG4gICAgY29uc29sZS5sb2coJ3Bvc3ROZXcgZGF0YScsIGRhdGEpXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe2NvbW1hbmQ6ICdoaWdobGlnaHQtZGF0YScsIGRhdGE6IGRhdGF9KTtcbiAgICAvLyBwb3N0SXQoZW5kSWQsIGRhdGEubmV3RGF0YSlcbiAgICAvLyBkYXRhID0gbnVsbDtcbn1cbkNvbW1lbnQudXBkYXRlID0gZnVuY3Rpb24odXNlcil7XG4gICAgdmFyIHVwZGF0ZWQgPSAkKCcucG9wb3ZlcicpLmRhdGEoJ2hpZ2hsaWdodC1kYXRhJyk7XG4gICAgY29uc29sZS5sb2coJ3RoaXMgYmUgdXBkYXRlZCB3aGFhYScsIHVwZGF0ZWQpXG4gICAgLy8gdXBkYXRlZC5jb21tZW50LnB1c2goe21lc3NhZ2U6ICQoJy5zcGFuMScpLnZhbCgpLCBjb21tZW50ZXI6IHVzZXIuZ2l0aHViLnVzZXJuYW1lfSk7XG4gICAgdXBkYXRlZC5jb21tZW50LnB1c2goe3RpbWVzdGFtcDogRGF0ZS5ub3coKSwgbWVzc2FnZTogJCgnLnNwYW4xJykudmFsKCksIGNvbW1lbnRlcjogdXNlci5naXRodWIudXNlcm5hbWV9KTtcbiAgICB1cGRhdGVkLnVybCA9IHVybCgpO1xuICAgIGNvbnNvbGUubG9nKCd1cGRhdGVkIERhdGEnLCB1cGRhdGVkKVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtjb21tYW5kOiAndXBkYXRlLWNvbW1lbnQnLCBkYXRhOiB1cGRhdGVkfSlcbn1cblxudmFyIHBvc3RJdCA9IHt9O1xucG9zdEl0LmFwcGVuZCA9IGZ1bmN0aW9uKGVuZElkLCBkYXRhKXtcbiAgICB2YXIgeCA9ICQoJyMnK2VuZElkKTtcbiAgICB2YXIgaWR4ID0geC5jb250ZW50cygpLmxlbmd0aC0xO1xuICAgICQoeC5jb250ZW50cygpW2lkeF0pLmFmdGVyKCc8YnV0dG9uIGNsYXNzPVwicG9zdC1pdFwiIGlkPVwicG9zdC1pdC0nK2VuZElkKydcIj48L2J1dHRvbj4nKTtcbiAgICB0aGlzLmJpbmREYXRhKGVuZElkLCBkYXRhKVxufVxucG9zdEl0LmJpbmREYXRhID0gZnVuY3Rpb24oZW5kSWQsIGRhdGEpe1xuICAgICQoJyNwb3N0LWl0LScrZW5kSWQpLmRhdGEoXCJkYXRhXCIsIGRhdGEpO1xuICAgIGNvbnNvbGUubG9nKCdUSElTLkRBVEEuU0tMREZKU0QnLCBkYXRhKTtcbiAgICAkKCcuc3BhbjEnKS52YWwoZGF0YS5jb21tZW50Lm1lc3NhZ2UpXG59XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUubG9nKCdkb2N1bWVudCBpcyByZWFkeSEnKTtcbiAgICAvLyBoYWNreSBhcyBoZWxsIGJ1dCBvaCB3ZWxsXG4gICAgJCgnYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJylcbiAgICAgICAgY29uc29sZS5sb2coJ2hyZWYgaHJlZiBocmVmJywgaHJlZilcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmO1xuICAgIH0pO1xuXG4gICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXMsIHNlbmRlcil7XG4gICAgICAgICAgICBpZihyZXMuY29tbWFuZCA9PT0gJ3ZlcmlmaWVkJyl7XG4gICAgICAgICAgICAgICAgcnVuU2NyaXB0KHJlcy5tZXNzYWdlLnVybCwgcmVzLm1lc3NhZ2UudXNlcik7ICAgIFxuICAgICAgICAgICAgfSBcbiAgICAgICAgfVxuICAgIClcbn0pO1xuXG5mdW5jdGlvbiB1cmwoKXtcbiAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWY7XG59XG5cbmZ1bmN0aW9uIHJ1blNjcmlwdChyZXBvVXJsLCB1c2VyKXtcbiAgICBjb25zb2xlLmxvZygnaGl0IHJ1blNjcmlwdCcsIHJlcG9VcmwsIHVzZXIpXG4gIFxuXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe2NvbW1hbmQ6ICdub3RpZmljYXRpb24nLCBsZW46IHVzZXIubm90aWZpY2F0aW9ucy5sZW5ndGgudG9TdHJpbmcoKX0pXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe2NvbW1hbmQ6ICdnZXQtZmlsZScsIHVybDogdXJsKCl9KTtcblxuICAgIC8vIElOSVRJQUxJWkUgVkFSSUFCTEVTXG4gICAgdmFyIHN0YXJ0SWQsIGVuZElkLCBkYXRhLCBjb21tZW50LCBzZWN0aW9uO1xuICAgIHZhciBjb2xvciA9ICcjY2VmZjYzJztcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBib3ggcG9wb3ZlclxuXG4gICAgdmFyICRwb3BvdmVyID0gJzxkaXYgY2xhc3M9XCJwb3BvdmVyXCI+PHRleHRhcmVhIGlkPVwidGV4dGFyZWFcIiBwbGFjZWhvbGRlcj1cIkxlYXZlIGEgY29tbWVudFwiIHJvd3M9NSBjbGFzcz1cInNwYW4xXCI+PC90ZXh0YXJlYT48aW5wdXQgc3R5bGU9XCJmbG9hdDogcmlnaHQ7IFwiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInNhdmUtYnV0dG9uXCIgaWQ9XCJwb3AtYnV0dG9uXCIgdmFsdWU9XCJTYXZlXCIvPjxpbnB1dCBzdHlsZT1cImZsb2F0OiByaWdodDsgXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2FuY2VsLWJ1dHRvblwiIGlkPVwicG9wLWJ1dHRvblwiIHZhbHVlPVwiQ2FuY2VsXCIvPjxpbnB1dCBzdHlsZT1cImZsb2F0OiByaWdodDsgXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZGVsZXRlLWJ1dHRvblwiIGlkPVwicG9wLWJ1dHRvblwiIHZhbHVlPVwiRGVsZXRlXCIvPjwvZGl2Pic7XG4gICAgJCgnYm9keScpLmFwcGVuZCgkcG9wb3Zlcik7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgJChcIi5kZWxldGUtYnV0dG9uXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBjb25zb2xlLmxvZygndGhlIHBhcmVudCBvZiBkZWxldGUgYnV0dG9uJywgJCh0aGlzKS5wYXJlbnQoKSlcbiAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5wYXJlbnQoKS5kYXRhKFwiaGlnaGxpZ2h0LWRhdGFcIikuX2lkXG4gICAgICAgIHZhciBkYXRhID0gJCh0aGlzKS5wYXJlbnQoKS5kYXRhKFwiaGlnaGxpZ2h0LWRhdGFcIikuaGlnaGxpZ2h0ZWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKCdUSEUgREFUQSBCRUZPUkUgVEhFIERFTCcsIGRhdGEpXG4gICAgICAgIGhpZ2hsaWdodC5jbGVhcihkYXRhLnN0YXJ0SWQsIGRhdGEuZW5kSWQsICd3aGl0ZScpXG4gICAgICAgIC8vIHNlcmlhbGl6ZSB0aGUgdGV4dCBkYXRhXG4gICAgICAgIC8vIGNhbGwgaGlnaGxpZ2h0LnVuZG9cbiAgICAgICAgLy8gY2xlYXJzIHRleHQgYXJlYVxuICAgICAgICAkKCcuc3BhbjEnKS52YWwoJycpO1xuICAgICAgICAkKCcucG9wb3ZlcicpLmhpZGUoKTtcbiAgICAgICAgJCgnI3Bvc3QtaXQtJytkYXRhLmVuZElkKS5yZW1vdmUoKTtcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe2NvbW1hbmQ6ICdkZWxldGUtaGlnaGxpZ2h0JywgZGF0YToge2lkOiBpZCwgdXJsOiB1cmwoKX19KVxuICAgIH0pO1xuXG4gICAgJChcIi5zYXZlLWJ1dHRvblwiKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgY29uc29sZS5sb2coJzEuIC5zYXZlLWJ1dHRvbiBkYXRhJywgZGF0YSlcbiAgICAgICAgaWYoZGF0YSkgQ29tbWVudC5wb3N0TmV3KGVuZElkLCBkYXRhLCB1c2VyKTtcbiAgICAgICAgZWxzZSBDb21tZW50LnVwZGF0ZSh1c2VyKTtcbiAgICAgICAgZGF0YSA9IG51bGw7XG4gICAgICAgICQoJy5wb3BvdmVyJykuaGlkZSgpO1xuXG4gICAgfSk7XG5cbiAgICAkKFwiLmNhbmNlbC1idXR0b25cIikub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG5cbiAgICAgICAgJCgnLnBvcG92ZXInKS5oaWRlKCk7XG4gICAgICAgIC8vICQoJy5zcGFuMScpLnZhbChcIlwiKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3NlY3Rpb24gd2hlbiBjYW5jZWwgY2xpY2tlZCcsIHNlY3Rpb24pXG4gICAgICAgIGhpZ2hsaWdodC51bmRvKHNlY3Rpb24pO1xuXG4gICAgfSk7XG5cbiAgICAkKCd0ZCcpLm1vdXNlZG93bihmdW5jdGlvbigpe1xuICAgICAgICBzdGFydElkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgIH0pO1xuXG4gICAgJCgndGQnKS5tb3VzZXVwKGZ1bmN0aW9uKGUpe1xuICAgICAgICBlbmRJZCA9ICQodGhpcykuYXR0cignaWQnKTtcbiAgICAgICAgc2VjdGlvbiA9IG5ldyBFdmVudHMoc3RhcnRJZCwgZW5kSWQsIGNvbG9yKTtcbiAgICAgICAgdmFyIHNlcmlhbGl6ZWQgPSBzZWN0aW9uLmNyZWF0ZURhdGEoKS5zZXRDb2xvcigpLnNldERhdGEoKS5zZWN0aW9uO1xuXG4gICAgICAgIHZhciBjb2RlID0gc2VjdGlvbi5jb2RlO1xuICAgICAgICBjb2RlID0gY29kZS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIC8vIGNhY2hlIGRhdGFcbiAgICAgICAgZGF0YSA9IHtuZXdEYXRhOntoaWdobGlnaHRlZDogc2VyaWFsaXplZCwgY29kZTogY29kZSwgY29sb3I6IGNvbG9yfSwgZmlsZUluZm86IHtmaWxlVXJsOiB1cmwoKX0sIHJlcG9Vcmw6IHJlcG9Vcmx9XG5cbiAgICAgICAgcG9wT3Zlci5zaG93KGUsIGVuZElkLCB0cnVlKVxuXG4gICAgfSk7XG5cbiAgICAvLyBwb3N0LWl0IG9uIGhvdmVyXG4gICAgJChcInRkXCIpLm9uKCdtb3VzZWVudGVyJywgJ2J1dHRvbi5wb3N0LWl0JywgZnVuY3Rpb24oZSl7XG4gICAgICAgIHBvcE92ZXIuYnV0dG9uU2hvdyhlLCB0aGlzKVxuICAgIH0pO1xuXG4gICAgJCgndGQnKS5vbignbW91c2VsZWF2ZScsICdidXR0b24ucG9zdC1pdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICQoJy5wb3BvdmVyJykub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgLy8gaWYoISQoJy5zcGFuMScpLnZhbCgpKSBoaWdobGlnaHQudW5kbyhzZWN0aW9uKVxuICAgICAgICAgICAgJCgnLnBvcG92ZXInKS5jaGlsZHJlbignZGl2JykucmVtb3ZlKCcuY2hhdGJveCcpO1xuICAgICAgICAgICAgJCgnLnBvcG92ZXInKS5oaWRlKCk7XG4gICAgICAgICAgICAkKCcuc3BhbjEnKS52YWwoJycpO1xuICAgICAgICB9KTtcbiAgICB9KVxuXG4gICAgLy8gbGlzdGVucyBmb3IgZXZlbnRzIGZyb20gQUpBWCBjYWxscy9iYWNrZ3JvdW5kLmpzIGFuZCBleGVjdXRlcyBzb21ldGhpbmdcbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcywgc2VuZGVyKXtcblxuICAgICAgICAgICAgaWYocmVzLmNvbW1hbmQgPT09ICdmaWxlLXJldHJpZXZlZCcpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdIaWdobGlnaHQgaW5mbyBmcm9tIGJhY2tlbmQnLCByZXMubWVzc2FnZSlcbiAgICAgICAgICAgICAgICB2YXIgaGwgPSByZXMubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAvLyByZXBvcHVsYXRlIGhpZ2hsaWdodFxuICAgICAgICAgICAgICAgIGhsLmhpZ2hsaWdodGVkLmZvckVhY2goZnVuY3Rpb24oc2VsZWN0aW9uKXtcbiAgICAgICAgICAgICAgICAgICAgcmVTZWxlY3Qoc2VsZWN0aW9uLmhpZ2hsaWdodGVkLCBzZWxlY3Rpb24uY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICBwb3N0SXQuYXBwZW5kKHNlbGVjdGlvbi5oaWdobGlnaHRlZC5lbmRJZCwgc2VsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXMuY29tbWFuZCA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHJlcy5jb21tYW5kID09PSAnaGlnaGxpZ2h0LXBvc3RlZCcpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwb3N0ZWQgbmV3IGhpZ2hsaWdodCBhbmQgZ290IGl0IGZyb20gdGhlIGJhY2shJywgcmVzKVxuICAgICAgICAgICAgICAgIHZhciBpZCA9IHJlcy5tZXNzYWdlLl9pZDtcbiAgICAgICAgICAgICAgICB2YXIgaGwgPSByZXMubWVzc2FnZS5oaWdobGlnaHRlZDtcbiAgICAgICAgICAgICAgICBwb3N0SXQuYXBwZW5kKGhsLmVuZElkLCByZXMubWVzc2FnZSlcbiAgICAgICAgICAgICAgICBkYXRhID0gbnVsbDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVzLmNvbW1hbmQgZGF0YScsIGRhdGEpXG4gICAgICAgICAgICAgICAgcmVzLmNvbW1hbmQgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihyZXMuY29tbWFuZCA9PT0gJ3VwZGF0ZWQhJyl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NvbW1lbnQgYXBwZW5kZWQhISEnLCByZXMubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmVzLmNvbW1hbmQgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihyZXMuY29tbWFuZCA9PT0gJ2NoYW5nZS1jb2xvcicpe1xuICAgICAgICAgICAgICAgIGNvbG9yID0gcmVzLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgcmVzLmNvbW1hbmQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocmVzLm1lc3NhZ2UgPT09ICdsb2dvdXQnKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9nb3V0IGlzIGhpdCBpbiB0aGUgY29udGVudC5qcycpO1xuICAgICAgICAgICAgICAgIHJlcy5jb21tYW5kID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgKVxuXG59XG5cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==