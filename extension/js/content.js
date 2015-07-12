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
	// highlighting = true;
    document.designMode = "on";
    document.execCommand("hiliteColor", false, color);
    document.designMode = 'off'; 
    // highlighting = false;  
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
    var sel = window.getSelection();
    restoreRange(section)
    section = null;
    document.execCommand('removeFormat', false, null)
    sel.removeAllRanges();
    document.designMode = 'off';
}

function restoreRange(section) {
    var range = document.createRange();
    console.log('this be section data in restorerange', section)
    range.setStart(section.startContainer, section.startOffset);
    range.setEnd(section.endContainer, section.endOffset);

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

// highlight.restorerange = function(ele){
//     var selection = window.getSelection();
//     selection.removeAllRanges();
//     var range = document.createRange();
//     range.setStart(ele.startContainer, ele.startOffset);
//     range.setEnd(ele.endContainer, ele.endOffset);
//     selection.addRange(range);
// }

// highlight.setBackgroundColor = function(ele) {
//     highlight.restorerange(ele);
//     this.set();
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
        $('.span1').val("");
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
                console.log('comment appended!!!', res.message)
            }

            if(res.command === 'change-color'){
                color = res.message;
            }
            if(res.message === 'logout'){
                console.log('logout is hit in the content.js')
            }

        }
    )

}


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRlc2VyaWFsaXplLmpzIiwiaGlnaGxpZ2h0LmpzIiwic2VsZWN0LmpzIiwiY29udGVudFNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb250ZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gcmVTZWxlY3QoaGwsIGNvbG9yKXtcbiAgLy8vLy8vLy8vL1xuICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAvLy8vLy8vXG4gICAgdmFyIHN0YXJ0SWQgPSBnZXROb2RlKGhsLnN0YXJ0SWQpXG4gICAgdmFyIGVuZElkID0gZ2V0Tm9kZShobC5lbmRJZCk7XG5cbiAgICBzZXRTdGFydChzdGFydElkLCBobC5zdGFydE5vZGUpO1xuICAgIHNldEVuZChlbmRJZCwgaGwuZW5kTm9kZSk7XG5cbiAgICBzZXROZXdSYW5nZShobCwgY29sb3IpXG59O1xuXG5mdW5jdGlvbiBzZXROZXdSYW5nZShobCwgY29sb3Ipe1xuICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgIHZhciBuZXdSYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG5cbiAgICBuZXdSYW5nZS5zZXRTdGFydChuZXdTdGFydE5vZGUsIGhsLnN0YXJ0T2Zmc2V0KTtcbiAgICBuZXdSYW5nZS5zZXRFbmQobmV3RW5kTm9kZSwgaGwuZW5kT2Zmc2V0KTtcbiAgICBzZWxlY3Rpb24uYWRkUmFuZ2UobmV3UmFuZ2UpO1xuICAgIFxuICAgIGhpZ2hsaWdodC5zZXQoY29sb3IpO1xuICAgIC8vIGdldHMgcmlkIG9mIG5hc3R5IGJsdWUgbGluZVxuICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbn1cblxuZnVuY3Rpb24gZ2V0Tm9kZShpZCl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxufVxuXG52YXIgbmV3RW5kTm9kZTtcbmZ1bmN0aW9uIHNldEVuZChub2RlLCB0ZXh0KSB7XG4gICBpZiAobm9kZS50ZXh0Q29udGVudCA9PT0gdGV4dCAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgbmV3RW5kTm9kZSA9IG5vZGU7XG4gICB9IGVsc2UgaWYgKG5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgc2V0RW5kKG5vZGUuY2hpbGROb2Rlc1tpXSwgdGV4dCk7XG4gICAgICAgfVxuICAgfSBlbHNlIHtcbiAgICAgICBjb25zb2xlLmxvZyhcImdldERvY3VtZW50OiBubyBkb2N1bWVudCBmb3VuZCBmb3Igbm9kZVwiKTtcbiAgIH1cbn1cbnZhciBuZXdTdGFydE5vZGU7XG5mdW5jdGlvbiBzZXRTdGFydChub2RlLCB0ZXh0KSB7XG4gICBpZiAobm9kZS50ZXh0Q29udGVudCA9PT0gdGV4dCAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgbmV3U3RhcnROb2RlID0gbm9kZTtcbiAgIH0gZWxzZSBpZiAobm9kZS5jaGlsZE5vZGVzKSB7XG4gICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmNoaWxkTm9kZXMubGVuZ3RoO2krKykge1xuICAgICAgICAgICBzZXRTdGFydChub2RlLmNoaWxkTm9kZXNbaV0sIHRleHQpO1xuICAgICAgIH1cbiAgIH0gZWxzZSB7XG4gICAgICAgY29uc29sZS5sb2coXCJnZXREb2N1bWVudDogbm8gZG9jdW1lbnQgZm91bmQgZm9yIG5vZGVcIik7XG4gICB9XG59XG4iLCJ2YXIgaGlnaGxpZ2h0ID0ge307XG5cbmhpZ2hsaWdodC5zZXQgPSBmdW5jdGlvbihjb2xvcil7XG5cdC8vIGhpZ2hsaWdodGluZyA9IHRydWU7XG4gICAgZG9jdW1lbnQuZGVzaWduTW9kZSA9IFwib25cIjtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImhpbGl0ZUNvbG9yXCIsIGZhbHNlLCBjb2xvcik7XG4gICAgZG9jdW1lbnQuZGVzaWduTW9kZSA9ICdvZmYnOyBcbiAgICAvLyBoaWdobGlnaHRpbmcgPSBmYWxzZTsgIFxufVxuXG5oaWdobGlnaHQuY2xlYXIgPSBmdW5jdGlvbihzdGFydCwgZW5kLCBjb2xvcil7XG5cdHZhciBuZXdTdGFydCA9IHBhcnNlSW50KHN0YXJ0Lm1hdGNoKC9cXGQrLylbMF0pXG5cdHZhciBuZXdFbmQgPSBwYXJzZUludChlbmQubWF0Y2goL1xcZCsvKVswXSlcblx0dmFyIGFyciA9IFtdO1xuXG5cdGZvciAodmFyIGkgPSBuZXdTdGFydDsgaSA8PSBuZXdFbmQ7IGkrKyl7XG5cdFx0YXJyLnB1c2goXCJMQ1wiK2kpO1xuXHR9XG5cblx0YXJyLmZvckVhY2goZnVuY3Rpb24oaWQpe1xuXHRcdGsgPSAkKCcjJysgaWQgKyAnIHNwYW4nKTtcblx0XHRrLmVhY2goZnVuY3Rpb24oaSwgc3Bhbil7ICQoc3BhbikuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBjb2xvcikgfSk7XG5cdH0pO1xuXHR2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbn1cblxuaGlnaGxpZ2h0LnVuZG8gPSBmdW5jdGlvbihzZWN0aW9uKXtcbiAgICBkb2N1bWVudC5kZXNpZ25Nb2RlID0gJ29uJztcbiAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIHJlc3RvcmVSYW5nZShzZWN0aW9uKVxuICAgIHNlY3Rpb24gPSBudWxsO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdyZW1vdmVGb3JtYXQnLCBmYWxzZSwgbnVsbClcbiAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgZG9jdW1lbnQuZGVzaWduTW9kZSA9ICdvZmYnO1xufVxuXG5mdW5jdGlvbiByZXN0b3JlUmFuZ2Uoc2VjdGlvbikge1xuICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgY29uc29sZS5sb2coJ3RoaXMgYmUgc2VjdGlvbiBkYXRhIGluIHJlc3RvcmVyYW5nZScsIHNlY3Rpb24pXG4gICAgcmFuZ2Uuc2V0U3RhcnQoc2VjdGlvbi5zdGFydENvbnRhaW5lciwgc2VjdGlvbi5zdGFydE9mZnNldCk7XG4gICAgcmFuZ2Uuc2V0RW5kKHNlY3Rpb24uZW5kQ29udGFpbmVyLCBzZWN0aW9uLmVuZE9mZnNldCk7XG5cbiAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xufVxuXG4vLyBoaWdobGlnaHQucmVzdG9yZXJhbmdlID0gZnVuY3Rpb24oZWxlKXtcbi8vICAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuLy8gICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbi8vICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuLy8gICAgIHJhbmdlLnNldFN0YXJ0KGVsZS5zdGFydENvbnRhaW5lciwgZWxlLnN0YXJ0T2Zmc2V0KTtcbi8vICAgICByYW5nZS5zZXRFbmQoZWxlLmVuZENvbnRhaW5lciwgZWxlLmVuZE9mZnNldCk7XG4vLyAgICAgc2VsZWN0aW9uLmFkZFJhbmdlKHJhbmdlKTtcbi8vIH1cblxuLy8gaGlnaGxpZ2h0LnNldEJhY2tncm91bmRDb2xvciA9IGZ1bmN0aW9uKGVsZSkge1xuLy8gICAgIGhpZ2hsaWdodC5yZXN0b3JlcmFuZ2UoZWxlKTtcbi8vICAgICB0aGlzLnNldCgpO1xuLy8gfSIsImZ1bmN0aW9uIEV2ZW50cyhzdGFydElkLCBlbmRJZCwgY29sb3Ipe1xuICAgIHRoaXMuc3RhcnRJZCA9IHN0YXJ0SWQ7XG4gICAgdGhpcy5lbmRJZCA9IGVuZElkO1xuICAgIHRoaXMuY29sb3IgPSBjb2xvcjtcbiAgICB0aGlzLnNlbGVjdGlvbjtcbiAgICB0aGlzLnN0YXJ0Tm9kZTtcbiAgICB0aGlzLnN0YXJ0Q29udGFpbmVyO1xuICAgIHRoaXMuZW5kQ29udGFpbmVyO1xuICAgIHRoaXMuc3RhcnRPZmZzZXQ7XG4gICAgdGhpcy5lbmROb2RlO1xuICAgIHRoaXMuZW5kT2Zmc2V0O1xuICAgIHRoaXMuc2VjdGlvbjtcbiAgICB0aGlzLmNvZGU7XG59XG5cbkV2ZW50cy5wcm90b3R5cGUuY3JlYXRlRGF0YSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5zZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgdGhpcy5jb2RlID0gdGhpcy5zZWxlY3Rpb24udG9TdHJpbmcoKTtcbiAgICB2YXIgcmFuZ2UgPSB0aGlzLnNlbGVjdGlvbi5nZXRSYW5nZUF0KDApO1xuXG4gICAgdGhpcy5zdGFydE5vZGUgPSByYW5nZS5zdGFydENvbnRhaW5lci50ZXh0Q29udGVudDtcbiAgICB0aGlzLnN0YXJ0Q29udGFpbmVyID0gcmFuZ2Uuc3RhcnRDb250YWluZXI7XG4gICAgdGhpcy5zdGFydE9mZnNldCA9IHJhbmdlLnN0YXJ0T2Zmc2V0O1xuXG4gICAgdGhpcy5lbmROb2RlID0gcmFuZ2UuZW5kQ29udGFpbmVyLnRleHRDb250ZW50O1xuICAgIHRoaXMuZW5kQ29udGFpbmVyID0gcmFuZ2UuZW5kQ29udGFpbmVyO1xuICAgIHRoaXMuZW5kT2Zmc2V0ID0gcmFuZ2UuZW5kT2Zmc2V0O1xuICAgIHJldHVybiB0aGlzO1xufVxuRXZlbnRzLnByb3RvdHlwZS5zZXRDb2xvciA9IGZ1bmN0aW9uKCl7XG4gICAgaGlnaGxpZ2h0LnNldCh0aGlzLmNvbG9yKTtcbiAgICAvLyB0aGlzLnNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICByZXR1cm4gdGhpcztcbn1cblxuRXZlbnRzLnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLnNlY3Rpb24gPSB7XG4gICAgICAgIHN0YXJ0SWQ6IHRoaXMuc3RhcnRJZCxcbiAgICAgICAgZW5kSWQ6IHRoaXMuZW5kSWQsXG4gICAgICAgIHN0YXJ0Tm9kZTogdGhpcy5zdGFydE5vZGUsXG4gICAgICAgIGVuZE5vZGU6IHRoaXMuZW5kTm9kZSxcbiAgICAgICAgc3RhcnRPZmZzZXQ6IHRoaXMuc3RhcnRPZmZzZXQsXG4gICAgICAgIGVuZE9mZnNldDogdGhpcy5lbmRPZmZzZXRcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cbnZhciBwb3BPdmVyID0ge307XG5wb3BPdmVyLnNob3cgPSBmdW5jdGlvbihlLCBlbGUsIG5vQ29tbWVudCl7XG4gICAgLy8gY29uc29sZS5sb2coJ3BvcE92ZXIgZGF0YScsIGRhdGEpXG4gICAgJCgnLnBvcG92ZXInKS5jaGlsZHJlbignZGl2JykucmVtb3ZlKCcuY2hhdGJveCcpXG4gICAgdmFyIGxlZnQgPSBlLnBhZ2VYLCB0b3AgPSBlLnBhZ2VZO1xuICAgIHZhciBoZWlnaHQgPSAkKCcucG9wb3ZlcicpLmhlaWdodCgpO1xuICAgIC8vIGdyYWJzIGJ1dHRvbiBkYXRhXG4gICAgXG4gICAgdGhpcy5hcHBseUNTUyhsZWZ0LCB0b3AsIGhlaWdodCk7XG4gICAgXG59XG5wb3BPdmVyLmJ1dHRvblNob3cgPSBmdW5jdGlvbihlLCBlbGUpe1xuICAgICQoJy5wb3BvdmVyJykuY2hpbGRyZW4oJ2RpdicpLnJlbW92ZSgnLmNoYXRib3gnKVxuICAgIHZhciBsZWZ0ID0gZS5wYWdlWCwgdG9wID0gZS5wYWdlWTtcbiAgICB2YXIgaGVpZ2h0ID0gJCgnLnBvcG92ZXInKS5oZWlnaHQoKTtcbiAgICB2YXIgZGF0YTIgPSAkKGVsZSkuZGF0YShcImRhdGFcIik7XG4gICAgY29uc29sZS5sb2coJ2RhdGEyMjIyMjIyJywgZGF0YTIpXG4gICAgdGhpcy5iaW5kRGF0YShkYXRhMik7XG4gICAgdGhpcy5hcHBseUNTUyhsZWZ0LCB0b3AsIGhlaWdodCk7XG4gICAgLy8gJCgnLnNwYW4xJykudmFsKCcnKTtcbn1cbnBvcE92ZXIuYXBwbHlDU1MgPSBmdW5jdGlvbihsZWZ0LCB0b3AsIGhlaWdodCl7XG4gICAgJCgnLnBvcG92ZXInKS5zaG93KCk7XG4gICAgJCgnLnBvcG92ZXInKS5jc3MoJ2xlZnQnLCAobGVmdC0yNSkgKyAncHgnKTtcbiAgICAkKCcucG9wb3ZlcicpLmNzcygndG9wJywgKHRvcC0oaGVpZ2h0LzIpLTEwNykgKyAncHgnKTtcbn1cbnBvcE92ZXIuYmluZERhdGEgPSBmdW5jdGlvbihkYXRhKXtcbiAgICQoJy5wb3BvdmVyJykuZGF0YShcImhpZ2hsaWdodC1kYXRhXCIsIGRhdGEpO1xuICAgZGF0YSA9IG51bGw7XG4gICAgdmFyIHBvcERhdGEgPSAkKCcucG9wb3ZlcicpLmRhdGEoXCJoaWdobGlnaHQtZGF0YVwiKTtcbiAgICBwb3BEYXRhLmNvbW1lbnQuZm9yRWFjaChmdW5jdGlvbihjb21tZW50KXtcbiAgICAgICAgY29uc29sZS5sb2coJ1RISVMgSVMgQ09NTUVOVCcsIGNvbW1lbnQpXG4gICAgICAgICQoJy5wb3BvdmVyJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImNoYXRib3hcIj48ZGl2IGNsYXNzPVwiY29tbWVudGVyXCI+PHA+Jytjb21tZW50LmNvbW1lbnRlcisnPC9wPjwvZGl2PjxkaXYgY2xhc3M9XCJtc2dcIj4nK2NvbW1lbnQubWVzc2FnZSsnPC9kaXY+PHAgY2xhc3M9XCJ0aW1lc3RhbXBcIj4nK2NvbnZlcnRUaW1lKGNvbW1lbnQudGltZXN0YW1wKSsnPC9wPjwvZGl2PicpO1xuICAgIFxuICAgIH0pO1xuXG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRUaW1lKGRhdGUpe1xuICAgIHZhciBkYXRlMiA9IG5ldyBEYXRlKGRhdGUpLnRvU3RyaW5nKCk7XG4gICAgcmV0dXJuIGRhdGUyLnNwbGl0KFwiIFwiKS5zbGljZSgwLDUpLmpvaW4oXCIgXCIpO1xufVxuXG52YXIgQ29tbWVudCA9IHt9O1xuQ29tbWVudC5wb3N0TmV3ID0gZnVuY3Rpb24oZW5kSWQsIGRhdGEsIHVzZXIpe1xuICAgIGNvbnNvbGUubG9nKCd0aGlzIGJlIHRoZSBjb21tZW50JywgJCgnLnNwYW4xJykudmFsKCkpXG4gICAgZGF0YS5uZXdEYXRhLmNvbW1lbnQgPSB7Y29tbWVudGVyOiB1c2VyLmdpdGh1Yi51c2VybmFtZSwgbWVzc2FnZTogJCgnLnNwYW4xJykudmFsKCl9O1xuICAgIFxuICAgIGNvbnNvbGUubG9nKCdwb3N0TmV3IGRhdGEnLCBkYXRhKVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtjb21tYW5kOiAnaGlnaGxpZ2h0LWRhdGEnLCBkYXRhOiBkYXRhfSk7XG4gICAgLy8gcG9zdEl0KGVuZElkLCBkYXRhLm5ld0RhdGEpXG4gICAgLy8gZGF0YSA9IG51bGw7XG59XG5Db21tZW50LnVwZGF0ZSA9IGZ1bmN0aW9uKHVzZXIpe1xuICAgIHZhciB1cGRhdGVkID0gJCgnLnBvcG92ZXInKS5kYXRhKCdoaWdobGlnaHQtZGF0YScpO1xuICAgIGNvbnNvbGUubG9nKCd0aGlzIGJlIHVwZGF0ZWQgd2hhYWEnLCB1cGRhdGVkKVxuICAgIC8vIHVwZGF0ZWQuY29tbWVudC5wdXNoKHttZXNzYWdlOiAkKCcuc3BhbjEnKS52YWwoKSwgY29tbWVudGVyOiB1c2VyLmdpdGh1Yi51c2VybmFtZX0pO1xuICAgIHVwZGF0ZWQuY29tbWVudC5wdXNoKHt0aW1lc3RhbXA6IERhdGUubm93KCksIG1lc3NhZ2U6ICQoJy5zcGFuMScpLnZhbCgpLCBjb21tZW50ZXI6IHVzZXIuZ2l0aHViLnVzZXJuYW1lfSk7XG4gICAgdXBkYXRlZC51cmwgPSB1cmwoKTtcbiAgICBjb25zb2xlLmxvZygndXBkYXRlZCBEYXRhJywgdXBkYXRlZClcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7Y29tbWFuZDogJ3VwZGF0ZS1jb21tZW50JywgZGF0YTogdXBkYXRlZH0pXG59XG5cbnZhciBwb3N0SXQgPSB7fTtcbnBvc3RJdC5hcHBlbmQgPSBmdW5jdGlvbihlbmRJZCwgZGF0YSl7XG4gICAgdmFyIHggPSAkKCcjJytlbmRJZCk7XG4gICAgdmFyIGlkeCA9IHguY29udGVudHMoKS5sZW5ndGgtMTtcbiAgICAkKHguY29udGVudHMoKVtpZHhdKS5hZnRlcignPGJ1dHRvbiBjbGFzcz1cInBvc3QtaXRcIiBpZD1cInBvc3QtaXQtJytlbmRJZCsnXCI+PC9idXR0b24+Jyk7XG4gICAgdGhpcy5iaW5kRGF0YShlbmRJZCwgZGF0YSlcbn1cbnBvc3RJdC5iaW5kRGF0YSA9IGZ1bmN0aW9uKGVuZElkLCBkYXRhKXtcbiAgICAkKCcjcG9zdC1pdC0nK2VuZElkKS5kYXRhKFwiZGF0YVwiLCBkYXRhKTtcbiAgICBjb25zb2xlLmxvZygnVEhJUy5EQVRBLlNLTERGSlNEJywgZGF0YSk7XG4gICAgJCgnLnNwYW4xJykudmFsKGRhdGEuY29tbWVudC5tZXNzYWdlKVxufVxuIiwiJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLmxvZygnZG9jdW1lbnQgaXMgcmVhZHkhJyk7XG4gICAgLy8gaGFja3kgYXMgaGVsbCBidXQgb2ggd2VsbFxuICAgICQoJ2EnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpXG4gICAgICAgIGNvbnNvbGUubG9nKCdocmVmIGhyZWYgaHJlZicsIGhyZWYpXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gaHJlZjtcbiAgICB9KTtcblxuICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihcbiAgICAgICAgZnVuY3Rpb24ocmVzLCBzZW5kZXIpe1xuICAgICAgICAgICAgaWYocmVzLmNvbW1hbmQgPT09ICd2ZXJpZmllZCcpe1xuICAgICAgICAgICAgICAgIHJ1blNjcmlwdChyZXMubWVzc2FnZS51cmwsIHJlcy5tZXNzYWdlLnVzZXIpOyAgICBcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH1cbiAgICApXG59KTtcblxuZnVuY3Rpb24gdXJsKCl7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xufVxuXG5mdW5jdGlvbiBydW5TY3JpcHQocmVwb1VybCwgdXNlcil7XG4gICAgY29uc29sZS5sb2coJ2hpdCBydW5TY3JpcHQnLCByZXBvVXJsLCB1c2VyKVxuICBcblxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtjb21tYW5kOiAnbm90aWZpY2F0aW9uJywgbGVuOiB1c2VyLm5vdGlmaWNhdGlvbnMubGVuZ3RoLnRvU3RyaW5nKCl9KVxuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtjb21tYW5kOiAnZ2V0LWZpbGUnLCB1cmw6IHVybCgpfSk7XG5cbiAgICAvLyBJTklUSUFMSVpFIFZBUklBQkxFU1xuICAgIHZhciBzdGFydElkLCBlbmRJZCwgZGF0YSwgY29tbWVudCwgc2VjdGlvbjtcbiAgICB2YXIgY29sb3IgPSAnI2NlZmY2Myc7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gYm94IHBvcG92ZXJcblxuICAgIHZhciAkcG9wb3ZlciA9ICc8ZGl2IGNsYXNzPVwicG9wb3ZlclwiPjx0ZXh0YXJlYSBpZD1cInRleHRhcmVhXCIgcGxhY2Vob2xkZXI9XCJMZWF2ZSBhIGNvbW1lbnRcIiByb3dzPTUgY2xhc3M9XCJzcGFuMVwiPjwvdGV4dGFyZWE+PGlucHV0IHN0eWxlPVwiZmxvYXQ6IHJpZ2h0OyBcIiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJzYXZlLWJ1dHRvblwiIGlkPVwicG9wLWJ1dHRvblwiIHZhbHVlPVwiU2F2ZVwiLz48aW5wdXQgc3R5bGU9XCJmbG9hdDogcmlnaHQ7IFwiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNhbmNlbC1idXR0b25cIiBpZD1cInBvcC1idXR0b25cIiB2YWx1ZT1cIkNhbmNlbFwiLz48aW5wdXQgc3R5bGU9XCJmbG9hdDogcmlnaHQ7IFwiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImRlbGV0ZS1idXR0b25cIiBpZD1cInBvcC1idXR0b25cIiB2YWx1ZT1cIkRlbGV0ZVwiLz48L2Rpdj4nO1xuICAgICQoJ2JvZHknKS5hcHBlbmQoJHBvcG92ZXIpO1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICQoXCIuZGVsZXRlLWJ1dHRvblwiKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgY29uc29sZS5sb2coJ3RoZSBwYXJlbnQgb2YgZGVsZXRlIGJ1dHRvbicsICQodGhpcykucGFyZW50KCkpXG4gICAgICAgIHZhciBpZCA9ICQodGhpcykucGFyZW50KCkuZGF0YShcImhpZ2hsaWdodC1kYXRhXCIpLl9pZFxuICAgICAgICB2YXIgZGF0YSA9ICQodGhpcykucGFyZW50KCkuZGF0YShcImhpZ2hsaWdodC1kYXRhXCIpLmhpZ2hsaWdodGVkO1xuICAgICAgICBjb25zb2xlLmxvZygnVEhFIERBVEEgQkVGT1JFIFRIRSBERUwnLCBkYXRhKVxuICAgICAgICBoaWdobGlnaHQuY2xlYXIoZGF0YS5zdGFydElkLCBkYXRhLmVuZElkLCAnd2hpdGUnKVxuICAgICAgICAvLyBzZXJpYWxpemUgdGhlIHRleHQgZGF0YVxuICAgICAgICAvLyBjYWxsIGhpZ2hsaWdodC51bmRvXG4gICAgICAgIC8vIGNsZWFycyB0ZXh0IGFyZWFcbiAgICAgICAgJCgnLnNwYW4xJykudmFsKCcnKTtcbiAgICAgICAgJCgnLnBvcG92ZXInKS5oaWRlKCk7XG4gICAgICAgICQoJyNwb3N0LWl0LScrZGF0YS5lbmRJZCkucmVtb3ZlKCk7XG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtjb21tYW5kOiAnZGVsZXRlLWhpZ2hsaWdodCcsIGRhdGE6IHtpZDogaWQsIHVybDogdXJsKCl9fSlcbiAgICB9KTtcblxuICAgICQoXCIuc2F2ZS1idXR0b25cIikub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKCcxLiAuc2F2ZS1idXR0b24gZGF0YScsIGRhdGEpXG4gICAgICAgIGlmKGRhdGEpIENvbW1lbnQucG9zdE5ldyhlbmRJZCwgZGF0YSwgdXNlcik7XG4gICAgICAgIGVsc2UgQ29tbWVudC51cGRhdGUodXNlcik7XG4gICAgICAgIGRhdGEgPSBudWxsO1xuICAgICAgICAkKCcucG9wb3ZlcicpLmhpZGUoKTtcblxuICAgIH0pO1xuXG4gICAgJChcIi5jYW5jZWwtYnV0dG9uXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuXG4gICAgICAgICQoJy5wb3BvdmVyJykuaGlkZSgpO1xuICAgICAgICAkKCcuc3BhbjEnKS52YWwoXCJcIik7XG4gICAgICAgIGhpZ2hsaWdodC51bmRvKHNlY3Rpb24pO1xuXG4gICAgfSk7XG5cbiAgICAkKCd0ZCcpLm1vdXNlZG93bihmdW5jdGlvbigpe1xuICAgICAgICBzdGFydElkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgIH0pO1xuXG4gICAgJCgndGQnKS5tb3VzZXVwKGZ1bmN0aW9uKGUpe1xuICAgICAgICBlbmRJZCA9ICQodGhpcykuYXR0cignaWQnKTtcbiAgICAgICAgc2VjdGlvbiA9IG5ldyBFdmVudHMoc3RhcnRJZCwgZW5kSWQsIGNvbG9yKTtcbiAgICAgICAgdmFyIHNlcmlhbGl6ZWQgPSBzZWN0aW9uLmNyZWF0ZURhdGEoKS5zZXRDb2xvcigpLnNldERhdGEoKS5zZWN0aW9uO1xuXG4gICAgICAgIHZhciBjb2RlID0gc2VjdGlvbi5jb2RlO1xuICAgICAgICBjb2RlID0gY29kZS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIC8vIGNhY2hlIGRhdGFcbiAgICAgICAgZGF0YSA9IHtuZXdEYXRhOntoaWdobGlnaHRlZDogc2VyaWFsaXplZCwgY29kZTogY29kZSwgY29sb3I6IGNvbG9yfSwgZmlsZUluZm86IHtmaWxlVXJsOiB1cmwoKX0sIHJlcG9Vcmw6IHJlcG9Vcmx9XG5cbiAgICAgICAgcG9wT3Zlci5zaG93KGUsIGVuZElkLCB0cnVlKVxuXG4gICAgfSk7XG5cbiAgICAvLyBwb3N0LWl0IG9uIGhvdmVyXG4gICAgJChcInRkXCIpLm9uKCdtb3VzZWVudGVyJywgJ2J1dHRvbi5wb3N0LWl0JywgZnVuY3Rpb24oZSl7XG4gICAgICAgIHBvcE92ZXIuYnV0dG9uU2hvdyhlLCB0aGlzKVxuICAgIH0pO1xuXG4gICAgJCgndGQnKS5vbignbW91c2VsZWF2ZScsICdidXR0b24ucG9zdC1pdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICQoJy5wb3BvdmVyJykub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgLy8gaWYoISQoJy5zcGFuMScpLnZhbCgpKSBoaWdobGlnaHQudW5kbyhzZWN0aW9uKVxuICAgICAgICAgICAgJCgnLnBvcG92ZXInKS5jaGlsZHJlbignZGl2JykucmVtb3ZlKCcuY2hhdGJveCcpO1xuICAgICAgICAgICAgJCgnLnBvcG92ZXInKS5oaWRlKCk7XG4gICAgICAgICAgICAkKCcuc3BhbjEnKS52YWwoJycpO1xuICAgICAgICB9KTtcbiAgICB9KVxuXG4gICAgLy8gbGlzdGVucyBmb3IgZXZlbnRzIGZyb20gQUpBWCBjYWxscy9iYWNrZ3JvdW5kLmpzIGFuZCBleGVjdXRlcyBzb21ldGhpbmdcbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcywgc2VuZGVyKXtcblxuICAgICAgICAgICAgaWYocmVzLmNvbW1hbmQgPT09ICdmaWxlLXJldHJpZXZlZCcpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdIaWdobGlnaHQgaW5mbyBmcm9tIGJhY2tlbmQnLCByZXMubWVzc2FnZSlcbiAgICAgICAgICAgICAgICB2YXIgaGwgPSByZXMubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAvLyByZXBvcHVsYXRlIGhpZ2hsaWdodFxuICAgICAgICAgICAgICAgIGhsLmhpZ2hsaWdodGVkLmZvckVhY2goZnVuY3Rpb24oc2VsZWN0aW9uKXtcbiAgICAgICAgICAgICAgICAgICAgcmVTZWxlY3Qoc2VsZWN0aW9uLmhpZ2hsaWdodGVkLCBzZWxlY3Rpb24uY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICBwb3N0SXQuYXBwZW5kKHNlbGVjdGlvbi5oaWdobGlnaHRlZC5lbmRJZCwgc2VsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXMuY29tbWFuZCA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHJlcy5jb21tYW5kID09PSAnaGlnaGxpZ2h0LXBvc3RlZCcpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwb3N0ZWQgbmV3IGhpZ2hsaWdodCBhbmQgZ290IGl0IGZyb20gdGhlIGJhY2shJywgcmVzKVxuICAgICAgICAgICAgICAgIHZhciBpZCA9IHJlcy5tZXNzYWdlLl9pZDtcbiAgICAgICAgICAgICAgICB2YXIgaGwgPSByZXMubWVzc2FnZS5oaWdobGlnaHRlZDtcbiAgICAgICAgICAgICAgICBwb3N0SXQuYXBwZW5kKGhsLmVuZElkLCByZXMubWVzc2FnZSlcbiAgICAgICAgICAgICAgICBkYXRhID0gbnVsbDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVzLmNvbW1hbmQgZGF0YScsIGRhdGEpXG4gICAgICAgICAgICAgICAgcmVzLmNvbW1hbmQgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihyZXMuY29tbWFuZCA9PT0gJ3VwZGF0ZWQhJyl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NvbW1lbnQgYXBwZW5kZWQhISEnLCByZXMubWVzc2FnZSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYocmVzLmNvbW1hbmQgPT09ICdjaGFuZ2UtY29sb3InKXtcbiAgICAgICAgICAgICAgICBjb2xvciA9IHJlcy5tZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocmVzLm1lc3NhZ2UgPT09ICdsb2dvdXQnKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9nb3V0IGlzIGhpdCBpbiB0aGUgY29udGVudC5qcycpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIClcblxufVxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=