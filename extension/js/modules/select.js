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

    console.log('this is all the highlighted data', section)
    return section;   
}


function popOver(e, ele){
    var offset = $(ele).offset();
    var left = e.pageX;
    var top = e.pageY;
    var theHeight = $('.popover').height();
    $('.popover').show();
    $('.popover').css('left', (left-25) + 'px');
    $('.popover').css('top', (top-(theHeight/2)-107) + 'px');
    // adding comments
    $('.popover').data("highlight-data", $(ele).data("data"))
    $('.span1').val($(ele).data("data").comment)
}

function postIt(endId, data){
    var x = $('#'+endId);
    var idx = x.contents().length-1;
    $(x.contents()[idx]).after('<button class="post-it" id="post-it-'+endId+'"></button>');
    // bind data to the postit
    $('#post-it-'+endId).data("data", data);
    $('.span1').val(data.comment)
}