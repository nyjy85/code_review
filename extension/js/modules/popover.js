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

