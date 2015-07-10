$(document).ready(function(){
    console.log('document is ready!');
    // get file with highlight array
    // chrome.runtime.sendMessage({command: 'verify', url: url()})
    chrome.runtime.onMessage.addListener(
        function(res, sender){
            if(res.command === 'verified'){
                $('.popover').remove();
                runScript(res.message.url, res.message.user);
            }
        })
    // if(window.location.href.indexOf("blob") > -1){
    //     runScript();
    // }   
}); 

function url(){
    return window.location.href;
}


var color = '#ceff63';

function runScript(repoUrl, user){
    console.log('the list', startId, endId, data, comment, section)
chrome.runtime.sendMessage({command: 'notification', len: user.notifications.length.toString()})

    console.log('hit runScript', repoUrl, user)

    chrome.runtime.sendMessage({command: 'get-file', url: url()});
    // INITIALIZE VARIABLES
    var startId, endId, data, comment, section;

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
        // $('.popover').prepend('<div class="chatbox">'+$('.span1').val()+'</div>');
        console.log('1. .save-button data', data)
        if(data) Comment.postNew(endId, data, user);
        else Comment.update(user);
        // getHighlight()
        data = null;
        $('.popover').hide();
    });

    $(".cancel-button").on('click', function(e){
        $('.popover').hide();
        $('.span1').val("");
        // if(startId && endId) highlight.clear(startId, endId, 'white')
         // use serialized variable to toggleHilite()
        highlight.undo(section);

    });

    $('td').mousedown(function(){
        console.log('mousedown')
        startId = $(this).attr('id');
    });

    $('td').mouseup(function(e){
        console.log('TRIGGER finger')
        endId = $(this).attr('id');
        section = new Events(startId, endId, color);
        var serialized = section.createData().setColor().setData().section;

        var code = section.code;
        code = code.split('\n');
        // cache data
        data = {newData:{highlighted: serialized, code: code}, fileInfo: {fileUrl: url()}, repoUrl: repoUrl}
        console.log('data', data)
        // comment popover appears
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
                res.command = null;
            }

            if(res.command === 'highlight-posted'){
                console.log('posted new highlight and got it from the back!', res)
                var id = res.message._id;
                var hl = res.message.highlighted;
                // highlight.unhighlight('highlighted'+hl.startId);
                // reSelect(hl, 'red');
                postIt.append(hl.endId, res.message)
                data = null;
                console.log('res.command data', data)
                res.command = null;
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