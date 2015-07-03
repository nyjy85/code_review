$(document).ready(function(){
    console.log('document is ready!')

    $('body').append('<button id="yae">CLICK ME TO CLEAR BIIITCCCH</button>')
    $('body').append('<button id="submit">Submit Comment</button>')

//////////////////////////// box popover

    var $popover = '<div class="popover"><textarea rows=5 class="span1"></textarea><input style="float: right; " type="button" class="btn save-button pop-button" value="Save"/><input style="float: right; " type="button" class="btn cancel-button pop-button" value="Cancel"/></div>';
    $('body').append($popover);

    var $commentShow = '<div></div>';
    $('body').append($commentShow);

///////////////////////////////////////
    $(".save-button").on('click', function(e){
        console.log('hit save button', data.newData.comment)
        data.newData.comment = $('.span1').val();
        console.log(data)
        console.log('after hit save button', data.newData.comment)
        // sends to back end
        chrome.runtime.sendMessage({command: 'highlight-data', data: data});
        $('.popover').hide();
        $('.span1').val("");

        // small post-it appears
        var x = document.getElementById(endId);
        console.log("this is elelment nodnde", x)
        var idx = x.childNodes.length-1;
        $(x.childNodes[idx]).after('<button></button>');

        //submit comment, attach comment to the data attribute of the element
        //and on hover display the text
        //delegate for on hover, where only the one you are on shows the hover
        // $(this).on('hover', 'delegate the class name here' function () {}) 
        //data-comment .attr()

    })

    $(".cancel-button").on('click', function(e){
        $('.popover').hide();
        $('.span1').val("");
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

            if(res.command === 'highlight-retrieved'){
                console.log('Highlight info from backend', res)
                var hl = res.message.highlighted;
                reSelect(hl)
                // setNewRange(newStartNode, hl.startOffset, newEndNode, hl.endOffset, newRange);
            }

            if(res.command === 'file-retrieved'){
                console.log('Highlight info from backend', res.message)
                var hl = res.message;
                // repopulate highlight
                hl.highlighted.forEach(function(selection){
                    reSelect(selection.highlighted);
                });
                // repopulate comment
            }

            if(res.command === 'create-CommentBox'){
                console.log('message 3!', res.message)
                var box = document.createElement('input');
                box.setAttribute('type', 'text');
                document.getElementById('LC13').appendChild(box);
            }

        }
    )

    var startId, endId, data, comment;

    $('td').mousedown(function(){
        startId = $(this).attr('id');
    });

    $('td').mouseup(function(e){
        endId = $(this).attr('id');
        var section = setData(startId, endId);
        var href = window.location.href;

        data = {newData:{comment: 'THIS BEETA WOIK', highlighted: section}, fileInfo: {fileUrl: href}}
        console.log('this is data after mousup and hightlihgt', data)

        // comment popover appears
        var offset = $(this).offset();
        var left = e.pageX;
        var top = e.pageY;
        var theHeight = $('.popover').height();
        $('.popover').show();
        $('.popover').css('left', (left-25) + 'px');
        $('.popover').css('top', (top-(theHeight/2)-107) + 'px');


    });

    // get file with highlight array
    chrome.runtime.sendMessage({command: 'get-file', url: window.location.href});

    $('#submit').on('click', function(){
        chrome.runtime.sendMessage({command: 'highlight-data', data: data})
    });

});

function setData(startId, endId){
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);

    var startNode = range.startContainer.textContent;
    var startOffset = range.startOffset;

    var endNode = range.endContainer.textContent;
    var endOffset = range.endOffset;
    
    highlight.set('#ceff63');

    var section = {
        startId: startId, 
        endId: endId, 
        startNode: startNode, 
        endNode: endNode, 
        startOffset: startOffset, 
        endOffset: endOffset
    }

    console.log('this is all the highlighted data', section)
    return section;
    
}
