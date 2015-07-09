$(document).ready(function(){
    console.log('document is ready!');
    // get file with highlight array
    // chrome.runtime.sendMessage({command: 'verify', url: url()})

    chrome.runtime.onMessage.addListener(
        function(res, sender){
            if(res.command === 'verified'){
                runScript(res.message.url, res.message.user);
            }

            // chrome.runtime.sendMessage({command: 'notification', message: res.message.user.notifications.length })

        })
    // if(window.location.href.indexOf("blob") > -1){
    //     runScript();
    // }
});




function url(){
    return window.location.href;
}


var color = '#ceff63';

var highlighting = false;

function runScript(repoUrl, user){
chrome.runtime.sendMessage({command: 'notification', len: user.notifications.length.toString()})


    console.log('hit runScript', repoUrl, user)

    document.addEventListener('DOMNodeInserted', function(e) {
        if (highlighting) {
            var target = e.target;
            target.className = 'highlighted'+startId;
        }
    }, false);

    // chrome.runtime.sendMessage({command: 'get-file', url: url()});
    // INITIALIZE VARIABLES
    var startId, endId, data, comment;

//////////////////////////// box popover

    var $popover = '<div class="popover"><textarea id="textarea" placeholder="Leave a comment" rows=5 class="span1"></textarea><input style="float: right; " type="button" class="save-button" id="pop-button" value="Save"/><input style="float: right; " type="button" class="cancel-button" id="pop-button" value="Cancel"/><input style="float: right; " type="button" class="delete-button" id="pop-button" value="Delete"/></div>';
    $('body').append($popover);

///////////////////////////////////////

    $(".delete-button").on('click', function(e){
        console.log('the parent of delete button', $(this).parent())
        var id = $(this).parent().data("highlight-data")._id
        var data = $(this).parent().data("highlight-data").highlighted;
        highlight.clear(data.startId, data.endId, 'white')
        // clears text area
        $('.span1').val('');
        $('.popover').hide();
        $('#post-it-'+data.endId).remove();
        chrome.runtime.sendMessage({command: 'delete-highlight', data: {id: id, url: url()}})
    });

    $(".save-button").on('click', function(e){
        $('.popover').prepend('<div class="chatbox">'+$('.span1').val()+'</div>');
        if(data) Comment.postNew(endId, data, user);
        else Comment.update(user);
        // getHighlight()
        $('.popover').hide();
    });

    $(".cancel-button").on('click', function(e){
        $('.popover').hide();
        $('.span1').val("");
        if(startId && endId) highlight.clear(startId, endId, 'white')
    });

    $('td').mousedown(function(){
        startId = $(this).attr('id');
    });

    $('td').mouseup(function(e){
        endId = $(this).attr('id');
        var section = new Events(startId, endId, color);
        serialized = section.createData().setColor().setData().section;

        var code = section.code;
        code = code.split('\n');

        data = {newData:{highlighted: serialized, code: code}, fileInfo: {fileUrl: url()}, repoUrl: repoUrl}
        console.log('data', data)
        // comment popover appears
        popOver.show(e, endId, true)

    });

    // post-it on hover
    $("td").on('mouseenter', 'button.post-it', function(e){
        popOver.show(e, this)
    });

    $('td').on('mouseleave', 'button.post-it', function(){
        $('.popover').on('mouseleave', function(){
            $('.popover').children('div').remove('.chatbox');
            $('.popover').hide();
            $('.span1').val('');
            // if(startId && endId) highlight.clear(startId, endId, 'white')
        });
    })

    // listens for events from AJAX calls/background.js and executes something
    chrome.runtime.onMessage.addListener(
        function(res, sender){
            // if(res.command === 'highlight-retrieved'){
            //     console.log('Highlight info from backend', res)
            //     var hl = res.message.highlighted;
            //     reSelect(hl, 'yellow')
            //     // setNewRange(newStartNode, hl.startOffset, newEndNode, hl.endOffset, newRange);
            // }

            if(res.command === 'file-retrieved'){
                console.log('Highlight info from backend', res.message)
                var hl = res.message;
                // repopulate highlight
                hl.highlighted.forEach(function(selection){
                    reSelect(selection.highlighted, 'yellow');
                    postIt.append(selection.highlighted.endId, selection);
                });
            }

            if(res.command === 'highlight-posted'){
                console.log('posted new highlight and got it from the back!', res)
                var id = res.message._id;
                var hl = res.message.highlighted;
                // highlight.unhighlight('highlighted'+hl.startId);
                // reSelect(hl, 'red');
                postIt.append(hl.endId, res.message)
                data = null;
                // updated the dom with this new highlight info
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
