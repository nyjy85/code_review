$(document).ready(function(){
    console.log('document is ready!')

    $('body').append('<button id="joanne">Show DB Highlight</button>')
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
        // chrome.runtime.sendMessage({command: 'highlight-data', data: data})
        $('.popover').hide();

        $('.span1').val("");
        // $("#"+endId).after(data.newData.comment);

        var x = document.getElementById(endId);
        console.log("this is elelment nodnde", x)
        var idx = x.childNodes.length-1;
        $(x.childNodes[idx]).after('<button >Comment...</button>');

    })

    $(".cancel-button").on('click', function(e){
        $('.popover').hide();
        $('.span1').val("");
    })
    // $(document).on('click', function(clicked){
    //     console.log(clicked)
    //     console.log($('#canceller'))
    //     if(clicked.toElement === $('#cancel')[0]){
    //         $('#fo').hide();
    //     }
    //     if(clicked.toElement === $('#saverrr')[0]){
    //         // console.log("inside the save", clicked.toElement.form['0'].value)
    //         var x = clicked.toElement.form['0'].value;
    //         // console.log("this work?", x)
    //         chrome.runtime.sendMessage({command: "save-comment", comment: {comment:x}});
    //     }
    //     chrome.runtime.sendMessage({command: "get", id: '55918a257b166fba67442c21'});
    // })

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

    var startId, endId, data, comment;

    $('td').mousedown(function(){
        startId = $(this).attr('id');
    });

    $('td').mouseup(function(e){
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

        // console.log('this is all the highlighted data', section)
        // console.log('this is under highlight data', comment)
        data = {newData:{comment: 'THIS BEETA WOIK', highlighted: section}, fileInfo: {fileUrl: href}}
        console.log('this is data after mousup and hightlihgt', data)
            // console.log('THIS IS DATA FORM HIGHLIGHT', data);
            // chrome.runtime.sendMessage({command: 'highlight-data', data: data})

            console.log('yopu do all the timesssss', e)

            var offset = $(this).offset();
            var left = e.pageX;
            var top = e.pageY;
            var theHeight = $('.popover').height();
            $('.popover').show();
            $('.popover').css('left', (left-25) + 'px');
            $('.popover').css('top', (top-(theHeight/2)-107) + 'px');


    });


    // tests to see if persisting highlighting works
    $('#joanne').on('click', function(){
        chrome.runtime.sendMessage({command: 'get-highlight', id: '55959d86bf68d8d4f9dc321d'})
        // highlight.currentSelection.forEach(function(ele){
            // highlight.setBackgroundColor(ele)
        // });
    });

    $('#submit').on('click', function(){
        chrome.runtime.sendMessage({command: 'highlight-data', data: data})
    });

});

