$(document).ready(function(){
    console.log('document is ready!')

    $('body').append('<button id="joanne">Show DB Highlight</button>')
    $('body').append('<button id="yae">CLICK ME TO CLEAR BIIITCCCH</button>')
    $('body').append('<button id="submit">Submit Comment</button>')

//////////////////////////// box popover
    $('[data-toggle="tooltip"]').tooltip();
    var popOverSettings = {
        html: true,
        placement: 'bottom',
        selector: "[rel='popover']",
        container: "body",
        content: function () {
            return $('<div id="popover-content"><button class="pop-Add">Add</button></div>').html();
        }
    };
        $('body').popover(popOverSettings);
///////////////////////////////////////

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

            if(res.command === 'create-CommentBox'){
                console.log('message 3!', res.message)
                var box = document.createElement('input');
                box.setAttribute('type', 'text');
                document.getElementById('LC13').appendChild(box);
            }

        }
    )

    var startId, endId, data;

    $('td').mousedown(function(){
        startId = $(this).attr('id');
    });

    $('td').mouseup(function(){
        endId = $(this).attr('id');
        var href = window.location.href;
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);

        var startNode = range.startContainer.textContent;
        var startOffset = range.startOffset;

        var endNode = range.endContainer.textContent;
        var endOffset = range.endOffset;
        
        highlight.set('#ceff63');

        section = {
            startId: startId, 
            endId: endId, 
            startNode: startNode, 
            endNode: endNode, 
            startOffset: startOffset, 
            endOffset: endOffset
        }

        console.log('this is all the highlighted data', section)

        data = {newData:{comment: 'THIS BEETA WOIK', highlighted: section}, fileInfo: {fileUrl: href}}
            // console.log('THIS IS DATA FORM HIGHLIGHT', data);
            // chrome.runtime.sendMessage({command: 'highlight-data', data: data})

        var box = '<div id="box" rel="popover" class="hide"><textarea id="comments" rows=5></textarea><button id="submit">Submit</button></div>'
        

        // $(this).attr({ "data-toggle": "popover", "title": "Comment", "data-popover-content": box})



    });


    $("#LC3").on("click", function() {
        $(this).append("<li class='project-name'><a>project name 2<button class='pop-function' rel='popover'></button></a></li>");
    })

    // tests to see if persisting highlighting works
    $('#joanne').on('click', function(){
        chrome.runtime.sendMessage({command: 'get-highlight', id: '5594c9fb5a8b4ac1761146fb'})
        // highlight.currentSelection.forEach(function(ele){
            // highlight.setBackgroundColor(ele)
        // });
    });

    $('#submit').on('click', function(){
        chrome.runtime.sendMessage({command: 'highlight-data', data: data})
    });

});

