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
    document.execCommand('removeFormat', false, null)
    var sel = window.getSelection();
    sel.removeAllRanges();
    document.designMode = 'off';
}

var popOver = {};

popOver.show = function(e, ele, noComment){

    $('.popover').children('div').remove('.chatbox')
    var left = e.pageX, top = e.pageY;
    var height = $('.popover').height();
    this.applyCSS(left, top, height);   
}

popOver.buttonShow = function(e, ele){
    $('.popover').children('div').remove('.chatbox')
    var left = e.pageX, top = e.pageY;
    var height = $('.popover').height();
    var data2 = $(ele).data("data");

    this.bindData(data2);
    this.applyCSS(left, top, height);
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
        $('.popover')
        .prepend('<div class="chatbox"><div class="commenter"><p>'+comment.commenter+'</p></div><div class="msg">'+comment.message+'</div><p class="timestamp">'+convertTime(comment.timestamp)+'</p></div>');
    });
}


function convertTime(date){
    var date2 = new Date(date).toString();
    return date2.split(" ").slice(0,5).join(" ");
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
    $('.span1').val(data.comment.message)
}
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1lbnQuanMiLCJkZXNlcmlhbGl6ZS5qcyIsImhpZ2hsaWdodC5qcyIsInBvcG92ZXIuanMiLCJwb3N0aXQuanMiLCJzZWxlY3QuanMiLCJjb250ZW50U2NyaXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvbnRlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQ29tbWVudCA9IHt9O1xuXG5Db21tZW50LnBvc3ROZXcgPSBmdW5jdGlvbihlbmRJZCwgZGF0YSwgdXNlcil7XG4gICAgZGF0YS5uZXdEYXRhLmNvbW1lbnQgPSB7Y29tbWVudGVyOiB1c2VyLmdpdGh1Yi51c2VybmFtZSwgbWVzc2FnZTogJCgnLnNwYW4xJykudmFsKCl9O1xuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtjb21tYW5kOiAnaGlnaGxpZ2h0LWRhdGEnLCBkYXRhOiBkYXRhfSk7XG59XG5Db21tZW50LnVwZGF0ZSA9IGZ1bmN0aW9uKHVzZXIpe1xuICAgIHZhciB1cGRhdGVkID0gJCgnLnBvcG92ZXInKS5kYXRhKCdoaWdobGlnaHQtZGF0YScpO1xuICAgIHVwZGF0ZWQuY29tbWVudC5wdXNoKHt0aW1lc3RhbXA6IERhdGUubm93KCksIG1lc3NhZ2U6ICQoJy5zcGFuMScpLnZhbCgpLCBjb21tZW50ZXI6IHVzZXIuZ2l0aHViLnVzZXJuYW1lfSk7XG4gICAgdXBkYXRlZC51cmwgPSB1cmwoKTtcbiAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7Y29tbWFuZDogJ3VwZGF0ZS1jb21tZW50JywgZGF0YTogdXBkYXRlZH0pXG59IiwiZnVuY3Rpb24gcmVTZWxlY3QoaGwsIGNvbG9yKXtcbiAgLy8vLy8vLy8vL1xuICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAvLy8vLy8vXG4gICAgdmFyIHN0YXJ0SWQgPSBnZXROb2RlKGhsLnN0YXJ0SWQpXG4gICAgdmFyIGVuZElkID0gZ2V0Tm9kZShobC5lbmRJZCk7XG5cbiAgICBzZXRTdGFydChzdGFydElkLCBobC5zdGFydE5vZGUpO1xuICAgIHNldEVuZChlbmRJZCwgaGwuZW5kTm9kZSk7XG5cbiAgICBzZXROZXdSYW5nZShobCwgY29sb3IpXG59O1xuXG5mdW5jdGlvbiBzZXROZXdSYW5nZShobCwgY29sb3Ipe1xuICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgIHZhciBuZXdSYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG5cbiAgICBuZXdSYW5nZS5zZXRTdGFydChuZXdTdGFydE5vZGUsIGhsLnN0YXJ0T2Zmc2V0KTtcbiAgICBuZXdSYW5nZS5zZXRFbmQobmV3RW5kTm9kZSwgaGwuZW5kT2Zmc2V0KTtcbiAgICBzZWxlY3Rpb24uYWRkUmFuZ2UobmV3UmFuZ2UpO1xuICAgIFxuICAgIGhpZ2hsaWdodC5zZXQoY29sb3IpO1xuICAgIC8vIGdldHMgcmlkIG9mIG5hc3R5IGJsdWUgbGluZVxuICAgIHNlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbn1cblxuZnVuY3Rpb24gZ2V0Tm9kZShpZCl7XG4gICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxufVxuXG52YXIgbmV3RW5kTm9kZTtcbmZ1bmN0aW9uIHNldEVuZChub2RlLCB0ZXh0KSB7XG4gICBpZiAobm9kZS50ZXh0Q29udGVudCA9PT0gdGV4dCAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgbmV3RW5kTm9kZSA9IG5vZGU7XG4gICB9IGVsc2UgaWYgKG5vZGUuY2hpbGROb2Rlcykge1xuICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgc2V0RW5kKG5vZGUuY2hpbGROb2Rlc1tpXSwgdGV4dCk7XG4gICAgICAgfVxuICAgfSBlbHNlIHtcbiAgICAgICBjb25zb2xlLmxvZyhcImdldERvY3VtZW50OiBubyBkb2N1bWVudCBmb3VuZCBmb3Igbm9kZVwiKTtcbiAgIH1cbn1cbnZhciBuZXdTdGFydE5vZGU7XG5mdW5jdGlvbiBzZXRTdGFydChub2RlLCB0ZXh0KSB7XG4gICBpZiAobm9kZS50ZXh0Q29udGVudCA9PT0gdGV4dCAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgbmV3U3RhcnROb2RlID0gbm9kZTtcbiAgIH0gZWxzZSBpZiAobm9kZS5jaGlsZE5vZGVzKSB7XG4gICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2RlLmNoaWxkTm9kZXMubGVuZ3RoO2krKykge1xuICAgICAgICAgICBzZXRTdGFydChub2RlLmNoaWxkTm9kZXNbaV0sIHRleHQpO1xuICAgICAgIH1cbiAgIH0gZWxzZSB7XG4gICAgICAgY29uc29sZS5sb2coXCJnZXREb2N1bWVudDogbm8gZG9jdW1lbnQgZm91bmQgZm9yIG5vZGVcIik7XG4gICB9XG59XG4iLCJ2YXIgaGlnaGxpZ2h0ID0ge307XG5cbmhpZ2hsaWdodC5zZXQgPSBmdW5jdGlvbihjb2xvcil7XG4gICAgZG9jdW1lbnQuZGVzaWduTW9kZSA9IFwib25cIjtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImhpbGl0ZUNvbG9yXCIsIGZhbHNlLCBjb2xvcik7XG4gICAgZG9jdW1lbnQuZGVzaWduTW9kZSA9ICdvZmYnOyAgXG59XG5cbmhpZ2hsaWdodC5jbGVhciA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQsIGNvbG9yKXtcblx0dmFyIG5ld1N0YXJ0ID0gcGFyc2VJbnQoc3RhcnQubWF0Y2goL1xcZCsvKVswXSlcblx0dmFyIG5ld0VuZCA9IHBhcnNlSW50KGVuZC5tYXRjaCgvXFxkKy8pWzBdKVxuXHR2YXIgYXJyID0gW107XG5cblx0Zm9yICh2YXIgaSA9IG5ld1N0YXJ0OyBpIDw9IG5ld0VuZDsgaSsrKXtcblx0XHRhcnIucHVzaChcIkxDXCIraSk7XG5cdH1cblxuXHRhcnIuZm9yRWFjaChmdW5jdGlvbihpZCl7XG5cdFx0ayA9ICQoJyMnKyBpZCArICcgc3BhbicpO1xuXHRcdGsuZWFjaChmdW5jdGlvbihpLCBzcGFuKXsgJChzcGFuKS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIGNvbG9yKSB9KTtcblx0fSk7XG5cdHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xufVxuXG5oaWdobGlnaHQudW5kbyA9IGZ1bmN0aW9uKHNlY3Rpb24pe1xuICAgIGRvY3VtZW50LmRlc2lnbk1vZGUgPSAnb24nO1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdyZW1vdmVGb3JtYXQnLCBmYWxzZSwgbnVsbClcbiAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICBkb2N1bWVudC5kZXNpZ25Nb2RlID0gJ29mZic7XG59XG4iLCJ2YXIgcG9wT3ZlciA9IHt9O1xuXG5wb3BPdmVyLnNob3cgPSBmdW5jdGlvbihlLCBlbGUsIG5vQ29tbWVudCl7XG5cbiAgICAkKCcucG9wb3ZlcicpLmNoaWxkcmVuKCdkaXYnKS5yZW1vdmUoJy5jaGF0Ym94JylcbiAgICB2YXIgbGVmdCA9IGUucGFnZVgsIHRvcCA9IGUucGFnZVk7XG4gICAgdmFyIGhlaWdodCA9ICQoJy5wb3BvdmVyJykuaGVpZ2h0KCk7XG4gICAgdGhpcy5hcHBseUNTUyhsZWZ0LCB0b3AsIGhlaWdodCk7ICAgXG59XG5cbnBvcE92ZXIuYnV0dG9uU2hvdyA9IGZ1bmN0aW9uKGUsIGVsZSl7XG4gICAgJCgnLnBvcG92ZXInKS5jaGlsZHJlbignZGl2JykucmVtb3ZlKCcuY2hhdGJveCcpXG4gICAgdmFyIGxlZnQgPSBlLnBhZ2VYLCB0b3AgPSBlLnBhZ2VZO1xuICAgIHZhciBoZWlnaHQgPSAkKCcucG9wb3ZlcicpLmhlaWdodCgpO1xuICAgIHZhciBkYXRhMiA9ICQoZWxlKS5kYXRhKFwiZGF0YVwiKTtcblxuICAgIHRoaXMuYmluZERhdGEoZGF0YTIpO1xuICAgIHRoaXMuYXBwbHlDU1MobGVmdCwgdG9wLCBoZWlnaHQpO1xufVxuXG5wb3BPdmVyLmFwcGx5Q1NTID0gZnVuY3Rpb24obGVmdCwgdG9wLCBoZWlnaHQpe1xuICAgICQoJy5wb3BvdmVyJykuc2hvdygpO1xuICAgICQoJy5wb3BvdmVyJykuY3NzKCdsZWZ0JywgKGxlZnQtMjUpICsgJ3B4Jyk7XG4gICAgJCgnLnBvcG92ZXInKS5jc3MoJ3RvcCcsICh0b3AtKGhlaWdodC8yKS0xMDcpICsgJ3B4Jyk7XG59XG5cbnBvcE92ZXIuYmluZERhdGEgPSBmdW5jdGlvbihkYXRhKXtcbiAgICAkKCcucG9wb3ZlcicpLmRhdGEoXCJoaWdobGlnaHQtZGF0YVwiLCBkYXRhKTtcbiAgICBkYXRhID0gbnVsbDtcbiAgICB2YXIgcG9wRGF0YSA9ICQoJy5wb3BvdmVyJykuZGF0YShcImhpZ2hsaWdodC1kYXRhXCIpO1xuICAgIHBvcERhdGEuY29tbWVudC5mb3JFYWNoKGZ1bmN0aW9uKGNvbW1lbnQpe1xuICAgICAgICAkKCcucG9wb3ZlcicpXG4gICAgICAgIC5wcmVwZW5kKCc8ZGl2IGNsYXNzPVwiY2hhdGJveFwiPjxkaXYgY2xhc3M9XCJjb21tZW50ZXJcIj48cD4nK2NvbW1lbnQuY29tbWVudGVyKyc8L3A+PC9kaXY+PGRpdiBjbGFzcz1cIm1zZ1wiPicrY29tbWVudC5tZXNzYWdlKyc8L2Rpdj48cCBjbGFzcz1cInRpbWVzdGFtcFwiPicrY29udmVydFRpbWUoY29tbWVudC50aW1lc3RhbXApKyc8L3A+PC9kaXY+Jyk7XG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gY29udmVydFRpbWUoZGF0ZSl7XG4gICAgdmFyIGRhdGUyID0gbmV3IERhdGUoZGF0ZSkudG9TdHJpbmcoKTtcbiAgICByZXR1cm4gZGF0ZTIuc3BsaXQoXCIgXCIpLnNsaWNlKDAsNSkuam9pbihcIiBcIik7XG59XG5cbiIsInZhciBwb3N0SXQgPSB7fTtcblxucG9zdEl0LmFwcGVuZCA9IGZ1bmN0aW9uKGVuZElkLCBkYXRhKXtcbiAgICB2YXIgeCA9ICQoJyMnK2VuZElkKTtcbiAgICB2YXIgaWR4ID0geC5jb250ZW50cygpLmxlbmd0aC0xO1xuICAgICQoeC5jb250ZW50cygpW2lkeF0pLmFmdGVyKCc8YnV0dG9uIGNsYXNzPVwicG9zdC1pdFwiIGlkPVwicG9zdC1pdC0nK2VuZElkKydcIj48L2J1dHRvbj4nKTtcbiAgICB0aGlzLmJpbmREYXRhKGVuZElkLCBkYXRhKVxufVxucG9zdEl0LmJpbmREYXRhID0gZnVuY3Rpb24oZW5kSWQsIGRhdGEpe1xuICAgICQoJyNwb3N0LWl0LScrZW5kSWQpLmRhdGEoXCJkYXRhXCIsIGRhdGEpO1xuICAgICQoJy5zcGFuMScpLnZhbChkYXRhLmNvbW1lbnQubWVzc2FnZSlcbn0iLCJmdW5jdGlvbiBFdmVudHMoc3RhcnRJZCwgZW5kSWQsIGNvbG9yKXtcbiAgICB0aGlzLnN0YXJ0SWQgPSBzdGFydElkO1xuICAgIHRoaXMuZW5kSWQgPSBlbmRJZDtcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgdGhpcy5zZWxlY3Rpb247XG4gICAgdGhpcy5zdGFydE5vZGU7XG4gICAgdGhpcy5zdGFydENvbnRhaW5lcjtcbiAgICB0aGlzLmVuZENvbnRhaW5lcjtcbiAgICB0aGlzLnN0YXJ0T2Zmc2V0O1xuICAgIHRoaXMuZW5kTm9kZTtcbiAgICB0aGlzLmVuZE9mZnNldDtcbiAgICB0aGlzLnNlY3Rpb247XG4gICAgdGhpcy5jb2RlO1xufVxuXG5FdmVudHMucHJvdG90eXBlLmNyZWF0ZURhdGEgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIHRoaXMuY29kZSA9IHRoaXMuc2VsZWN0aW9uLnRvU3RyaW5nKCk7XG4gICAgdmFyIHJhbmdlID0gdGhpcy5zZWxlY3Rpb24uZ2V0UmFuZ2VBdCgwKTtcblxuICAgIHRoaXMuc3RhcnROb2RlID0gcmFuZ2Uuc3RhcnRDb250YWluZXIudGV4dENvbnRlbnQ7XG4gICAgdGhpcy5zdGFydENvbnRhaW5lciA9IHJhbmdlLnN0YXJ0Q29udGFpbmVyO1xuICAgIHRoaXMuc3RhcnRPZmZzZXQgPSByYW5nZS5zdGFydE9mZnNldDtcblxuICAgIHRoaXMuZW5kTm9kZSA9IHJhbmdlLmVuZENvbnRhaW5lci50ZXh0Q29udGVudDtcbiAgICB0aGlzLmVuZENvbnRhaW5lciA9IHJhbmdlLmVuZENvbnRhaW5lcjtcbiAgICB0aGlzLmVuZE9mZnNldCA9IHJhbmdlLmVuZE9mZnNldDtcbiAgICByZXR1cm4gdGhpcztcbn1cbkV2ZW50cy5wcm90b3R5cGUuc2V0Q29sb3IgPSBmdW5jdGlvbigpe1xuICAgIGhpZ2hsaWdodC5zZXQodGhpcy5jb2xvcik7XG4gICAgLy8gdGhpcy5zZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cbkV2ZW50cy5wcm90b3R5cGUuc2V0RGF0YSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5zZWN0aW9uID0ge1xuICAgICAgICBzdGFydElkOiB0aGlzLnN0YXJ0SWQsXG4gICAgICAgIGVuZElkOiB0aGlzLmVuZElkLFxuICAgICAgICBzdGFydE5vZGU6IHRoaXMuc3RhcnROb2RlLFxuICAgICAgICBlbmROb2RlOiB0aGlzLmVuZE5vZGUsXG4gICAgICAgIHN0YXJ0T2Zmc2V0OiB0aGlzLnN0YXJ0T2Zmc2V0LFxuICAgICAgICBlbmRPZmZzZXQ6IHRoaXMuZW5kT2Zmc2V0XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufVxuXG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUubG9nKCdkb2N1bWVudCBpcyByZWFkeSEnKTtcbiAgICAvLyBoYWNreSBhcyBoZWxsIGJ1dCBvaCB3ZWxsXG4gICAgJCgnYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJylcbiAgICAgICAgY29uc29sZS5sb2coJ2hyZWYgaHJlZiBocmVmJywgaHJlZilcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBocmVmO1xuICAgIH0pO1xuXG4gICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKFxuICAgICAgICBmdW5jdGlvbihyZXMsIHNlbmRlcil7XG4gICAgICAgICAgICBpZihyZXMuY29tbWFuZCA9PT0gJ3ZlcmlmaWVkJyl7XG4gICAgICAgICAgICAgICAgcnVuU2NyaXB0KHJlcy5tZXNzYWdlLnVybCwgcmVzLm1lc3NhZ2UudXNlcik7ICAgIFxuICAgICAgICAgICAgfSBcbiAgICAgICAgfVxuICAgIClcbn0pO1xuXG5mdW5jdGlvbiB1cmwoKXtcbiAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWY7XG59XG5cbmZ1bmN0aW9uIHJ1blNjcmlwdChyZXBvVXJsLCB1c2VyKXtcbiAgICBjb25zb2xlLmxvZygnaGl0IHJ1blNjcmlwdCcsIHJlcG9VcmwsIHVzZXIpXG4gIFxuXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe2NvbW1hbmQ6ICdub3RpZmljYXRpb24nLCBsZW46IHVzZXIubm90aWZpY2F0aW9ucy5sZW5ndGgudG9TdHJpbmcoKX0pXG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe2NvbW1hbmQ6ICdnZXQtZmlsZScsIHVybDogdXJsKCl9KTtcblxuICAgIC8vIElOSVRJQUxJWkUgVkFSSUFCTEVTXG4gICAgdmFyIHN0YXJ0SWQsIGVuZElkLCBkYXRhLCBjb21tZW50LCBzZWN0aW9uO1xuICAgIHZhciBjb2xvciA9ICcjY2VmZjYzJztcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBib3ggcG9wb3ZlclxuXG4gICAgdmFyICRwb3BvdmVyID0gJzxkaXYgY2xhc3M9XCJwb3BvdmVyXCI+PHRleHRhcmVhIGlkPVwidGV4dGFyZWFcIiBwbGFjZWhvbGRlcj1cIkxlYXZlIGEgY29tbWVudFwiIHJvd3M9NSBjbGFzcz1cInNwYW4xXCI+PC90ZXh0YXJlYT48aW5wdXQgc3R5bGU9XCJmbG9hdDogcmlnaHQ7IFwiIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cInNhdmUtYnV0dG9uXCIgaWQ9XCJwb3AtYnV0dG9uXCIgdmFsdWU9XCJTYXZlXCIvPjxpbnB1dCBzdHlsZT1cImZsb2F0OiByaWdodDsgXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2FuY2VsLWJ1dHRvblwiIGlkPVwicG9wLWJ1dHRvblwiIHZhbHVlPVwiQ2FuY2VsXCIvPjxpbnB1dCBzdHlsZT1cImZsb2F0OiByaWdodDsgXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZGVsZXRlLWJ1dHRvblwiIGlkPVwicG9wLWJ1dHRvblwiIHZhbHVlPVwiRGVsZXRlXCIvPjwvZGl2Pic7XG4gICAgJCgnYm9keScpLmFwcGVuZCgkcG9wb3Zlcik7XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgJChcIi5kZWxldGUtYnV0dG9uXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBjb25zb2xlLmxvZygndGhlIHBhcmVudCBvZiBkZWxldGUgYnV0dG9uJywgJCh0aGlzKS5wYXJlbnQoKSlcbiAgICAgICAgdmFyIGlkID0gJCh0aGlzKS5wYXJlbnQoKS5kYXRhKFwiaGlnaGxpZ2h0LWRhdGFcIikuX2lkXG4gICAgICAgIHZhciBkYXRhID0gJCh0aGlzKS5wYXJlbnQoKS5kYXRhKFwiaGlnaGxpZ2h0LWRhdGFcIikuaGlnaGxpZ2h0ZWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKCdUSEUgREFUQSBCRUZPUkUgVEhFIERFTCcsIGRhdGEpXG4gICAgICAgIGhpZ2hsaWdodC5jbGVhcihkYXRhLnN0YXJ0SWQsIGRhdGEuZW5kSWQsICd3aGl0ZScpXG4gICAgICAgIC8vIHNlcmlhbGl6ZSB0aGUgdGV4dCBkYXRhXG4gICAgICAgIC8vIGNhbGwgaGlnaGxpZ2h0LnVuZG9cbiAgICAgICAgLy8gY2xlYXJzIHRleHQgYXJlYVxuICAgICAgICAkKCcuc3BhbjEnKS52YWwoJycpO1xuICAgICAgICAkKCcucG9wb3ZlcicpLmhpZGUoKTtcbiAgICAgICAgJCgnI3Bvc3QtaXQtJytkYXRhLmVuZElkKS5yZW1vdmUoKTtcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe2NvbW1hbmQ6ICdkZWxldGUtaGlnaGxpZ2h0JywgZGF0YToge2lkOiBpZCwgdXJsOiB1cmwoKX19KVxuICAgIH0pO1xuXG4gICAgJChcIi5zYXZlLWJ1dHRvblwiKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgY29uc29sZS5sb2coJzEuIC5zYXZlLWJ1dHRvbiBkYXRhJywgZGF0YSlcbiAgICAgICAgaWYoZGF0YSkgQ29tbWVudC5wb3N0TmV3KGVuZElkLCBkYXRhLCB1c2VyKTtcbiAgICAgICAgZWxzZSBDb21tZW50LnVwZGF0ZSh1c2VyKTtcbiAgICAgICAgZGF0YSA9IG51bGw7XG4gICAgICAgICQoJy5wb3BvdmVyJykuaGlkZSgpO1xuXG4gICAgfSk7XG5cbiAgICAkKFwiLmNhbmNlbC1idXR0b25cIikub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG5cbiAgICAgICAgJCgnLnBvcG92ZXInKS5oaWRlKCk7XG4gICAgICAgICQoJy5zcGFuMScpLnZhbChcIlwiKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3NlY3Rpb24gd2hlbiBjYW5jZWwgY2xpY2tlZCcsIHNlY3Rpb24pXG4gICAgICAgIGhpZ2hsaWdodC51bmRvKHNlY3Rpb24pO1xuXG4gICAgfSk7XG5cbiAgICAkKCd0ZCcpLm1vdXNlZG93bihmdW5jdGlvbigpe1xuICAgICAgICBzdGFydElkID0gJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgIH0pO1xuXG4gICAgJCgndGQnKS5tb3VzZXVwKGZ1bmN0aW9uKGUpe1xuICAgICAgICBlbmRJZCA9ICQodGhpcykuYXR0cignaWQnKTtcbiAgICAgICAgc2VjdGlvbiA9IG5ldyBFdmVudHMoc3RhcnRJZCwgZW5kSWQsIGNvbG9yKTtcbiAgICAgICAgdmFyIHNlcmlhbGl6ZWQgPSBzZWN0aW9uLmNyZWF0ZURhdGEoKS5zZXRDb2xvcigpLnNldERhdGEoKS5zZWN0aW9uO1xuXG4gICAgICAgIHZhciBjb2RlID0gc2VjdGlvbi5jb2RlO1xuICAgICAgICBjb2RlID0gY29kZS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIC8vIGNhY2hlIGRhdGFcbiAgICAgICAgZGF0YSA9IHtuZXdEYXRhOntoaWdobGlnaHRlZDogc2VyaWFsaXplZCwgY29kZTogY29kZSwgY29sb3I6IGNvbG9yfSwgZmlsZUluZm86IHtmaWxlVXJsOiB1cmwoKX0sIHJlcG9Vcmw6IHJlcG9Vcmx9XG5cbiAgICAgICAgcG9wT3Zlci5zaG93KGUsIGVuZElkLCB0cnVlKVxuXG4gICAgfSk7XG5cbiAgICAvLyBwb3N0LWl0IG9uIGhvdmVyXG4gICAgJChcInRkXCIpLm9uKCdtb3VzZWVudGVyJywgJ2J1dHRvbi5wb3N0LWl0JywgZnVuY3Rpb24oZSl7XG4gICAgICAgIHBvcE92ZXIuYnV0dG9uU2hvdyhlLCB0aGlzKVxuICAgIH0pO1xuXG4gICAgJCgndGQnKS5vbignbW91c2VsZWF2ZScsICdidXR0b24ucG9zdC1pdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICQoJy5wb3BvdmVyJykub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgLy8gaWYoISQoJy5zcGFuMScpLnZhbCgpKSBoaWdobGlnaHQudW5kbyhzZWN0aW9uKVxuICAgICAgICAgICAgJCgnLnBvcG92ZXInKS5jaGlsZHJlbignZGl2JykucmVtb3ZlKCcuY2hhdGJveCcpO1xuICAgICAgICAgICAgJCgnLnBvcG92ZXInKS5oaWRlKCk7XG4gICAgICAgICAgICAkKCcuc3BhbjEnKS52YWwoJycpO1xuICAgICAgICB9KTtcbiAgICB9KVxuXG4gICAgLy8gbGlzdGVucyBmb3IgZXZlbnRzIGZyb20gQUpBWCBjYWxscy9iYWNrZ3JvdW5kLmpzIGFuZCBleGVjdXRlcyBzb21ldGhpbmdcbiAgICBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoXG4gICAgICAgIGZ1bmN0aW9uKHJlcywgc2VuZGVyKXtcblxuICAgICAgICAgICAgaWYocmVzLmNvbW1hbmQgPT09ICdmaWxlLXJldHJpZXZlZCcpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdIaWdobGlnaHQgaW5mbyBmcm9tIGJhY2tlbmQnLCByZXMubWVzc2FnZSlcbiAgICAgICAgICAgICAgICB2YXIgaGwgPSByZXMubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAvLyByZXBvcHVsYXRlIGhpZ2hsaWdodFxuICAgICAgICAgICAgICAgIGhsLmhpZ2hsaWdodGVkLmZvckVhY2goZnVuY3Rpb24oc2VsZWN0aW9uKXtcbiAgICAgICAgICAgICAgICAgICAgcmVTZWxlY3Qoc2VsZWN0aW9uLmhpZ2hsaWdodGVkLCBzZWxlY3Rpb24uY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICBwb3N0SXQuYXBwZW5kKHNlbGVjdGlvbi5oaWdobGlnaHRlZC5lbmRJZCwgc2VsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXMuY29tbWFuZCA9IG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHJlcy5jb21tYW5kID09PSAnaGlnaGxpZ2h0LXBvc3RlZCcpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwb3N0ZWQgbmV3IGhpZ2hsaWdodCBhbmQgZ290IGl0IGZyb20gdGhlIGJhY2shJywgcmVzKVxuICAgICAgICAgICAgICAgIHZhciBpZCA9IHJlcy5tZXNzYWdlLl9pZDtcbiAgICAgICAgICAgICAgICB2YXIgaGwgPSByZXMubWVzc2FnZS5oaWdobGlnaHRlZDtcbiAgICAgICAgICAgICAgICBwb3N0SXQuYXBwZW5kKGhsLmVuZElkLCByZXMubWVzc2FnZSlcbiAgICAgICAgICAgICAgICBkYXRhID0gbnVsbDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVzLmNvbW1hbmQgZGF0YScsIGRhdGEpXG4gICAgICAgICAgICAgICAgcmVzLmNvbW1hbmQgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihyZXMuY29tbWFuZCA9PT0gJ3VwZGF0ZWQhJyl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2NvbW1lbnQgYXBwZW5kZWQhISEnLCByZXMubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmVzLmNvbW1hbmQgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihyZXMuY29tbWFuZCA9PT0gJ2NoYW5nZS1jb2xvcicpe1xuICAgICAgICAgICAgICAgIGNvbG9yID0gcmVzLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgcmVzLmNvbW1hbmQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocmVzLm1lc3NhZ2UgPT09ICdsb2dvdXQnKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbG9nb3V0IGlzIGhpdCBpbiB0aGUgY29udGVudC5qcycpO1xuICAgICAgICAgICAgICAgIHJlcy5jb21tYW5kID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgKVxuXG59XG5cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==