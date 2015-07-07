$(document).ready(function(){
    console.log('document is ready!');
    $("#markItUp").markItUp(mySettings);
    // get file with highlight array
    chrome.runtime.sendMessage({command: 'verify', url: url()})
    chrome.runtime.onMessage.addListener(
        function(res, sender){
            if(res.command === 'verified'){
                runScript(res.message);
            }
        })
    // if(window.location.href.indexOf("blob") > -1){
    //     runScript();
    // }   
}); 

function url(){
    return window.location.href;
}

chrome.runtime.onMessage.addListener(function(res, sender){
    if(res.command === 'change-color'){
        color = res.message;
    }
})

var color = '#ceff63';

function runScript(repoUrl){
    console.log('this is repoUrl', repoUrl)
    chrome.runtime.sendMessage({command: 'get-file', url: url()});
    var startId, endId, data, comment;

//////////////////////////// box popover

    var $popover = '<div class="popover"><textarea id="markItUp" rows=5 class="span1"></textarea><input style="float: right; " type="button" class="btn save-button pop-button" value="Save"/><input style="float: right; " type="button" class="btn cancel-button pop-button" value="Cancel"/><input style="float: right; " type="button" class="btn delete-button pop-button" value="Delete"/></div>';
    $('body').append($popover);

///////////////////////////////////////

    $(".delete-button").on('click', function(e){
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
        if(data) postNew(endId, data);
        else update();
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
        var section = setData(startId, endId, color);
        var href = window.location.href;
        data = {newData:{comment: 'joanne', highlighted: section}, fileInfo: {fileUrl: url()}, repoUrl: repoUrl}
        console.log('data', data)
        // comment popover appears
        popOver(e, endId) 

    });

    // post-it on hover
    $("td").on('mouseenter', 'button.post-it', function(e){
        popOver(e, this)
    });
    
    $('td').on('mouseleave', 'button.post-it', function(){
        $('.popover').on('mouseleave', function(){
            $('.popover').hide();
            $('.span1').val('');
            // if(startId && endId) highlight.clear(startId, endId, 'white')
        });
    })

    // listens for events from AJAX calls/background.js and executes something
    chrome.runtime.onMessage.addListener(
        function(res, sender){
            if(res.command === 'highlight-retrieved'){
                console.log('Highlight info from backend', res)
                var hl = res.message.highlighted;
                reSelect(hl, 'yellow')
                // setNewRange(newStartNode, hl.startOffset, newEndNode, hl.endOffset, newRange);
            }

            if(res.command === 'file-retrieved'){
                console.log('Highlight info from backend', res.message)
                var hl = res.message;
                // repopulate highlight
                hl.highlighted.forEach(function(selection){
                    reSelect(selection.highlighted, 'yellow');
                    postIt(selection.highlighted.endId, selection);
                });
            }

        }
    )   

}