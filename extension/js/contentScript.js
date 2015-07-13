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

