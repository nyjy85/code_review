var highlight = {};

highlight.set = function(color){
    document.designMode = "on";
    document.execCommand("BackColor", false, color);
    document.designMode = 'off';   
}

highlight.restorerange = function(ele){
    var selection = window.getSelection();
    selection.removeAllRanges();
    var range = document.createRange();
    range.setStart(ele.startContainer, ele.startOffset);
    range.setEnd(ele.endContainer, ele.endOffset);
    selection.addRange(range);
}

highlight.setBackgroundColor = function(ele) {
    highlight.restorerange(ele);
    this.set();
}

highlight.clear = function(ele){
    highlight.restorerange(ele);
    this.set('white');
}

