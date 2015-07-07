function setData(startId, endId, color){
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);

    var startNode = range.startContainer.textContent;
    var startOffset = range.startOffset;

    var endNode = range.endContainer.textContent;
    var endOffset = range.endOffset;
    
    highlight.set(color);

    var section = {
        startId: startId, 
        endId: endId, 
        startNode: startNode, 
        endNode: endNode, 
        startOffset: startOffset, 
        endOffset: endOffset
    }
    // gets rid of blue selection highlight
    selection.removeAllRanges();
    console.log('this is all the highlighted data', section)
    return section;   
}


function popOver(e, ele){
    // var offset = $(ele).offset();
    var left = e.pageX;
    var top = e.pageY;
    var height = $('.popover').height();
    var data = $(ele).data("data")
    console.log('YO THIS IS DAAAAATTTTAAA', data)
    $('.popover').show();
    $('.popover').css('left', (left-25) + 'px');
    $('.popover').css('top', (top-(height/2)-107) + 'px');
    // adding comments
    $('.popover').data("highlight-data", $(ele).data("data"));
    data ? $('.span1').val(data.comment) : $('.span1').val('');
}

function postIt(endId, data){
    var x = $('#'+endId);
    var idx = x.contents().length-1;
    $(x.contents()[idx]).after('<button class="post-it" id="post-it-'+endId+'"></button>');
    // bind data to the postit
    $('#post-it-'+endId).data("data", data);
    $('.span1').val(data.comment)
}

function postNew(endId, data){
    data.newData.comment = $('.span1').val();
    chrome.runtime.sendMessage({command: 'highlight-data', data: data}); 
    // postIt(endId, data.newData)
    data = null;
}

function update(){
    var updated = $('.popover').data('highlight-data');
    console.log('this be updated whaaa', updated)
    updated.comment = $('.span1').val();
    updated.url = url();
    chrome.runtime.sendMessage({command: 'update-comment', data: updated})
}