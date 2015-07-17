function Events(startId, endId, color){
    this.startId = startId;
    this.endId = endId;
    this.color = color;
    this.selection;
    this.startNode;
    this.startContainer;
    this.endContainer;
    this.startOffset;
    this.endNode;
    this.endOffset;
    this.section;
    this.code;
}

Events.prototype.createData = function(){
    this.selection = window.getSelection();
    this.code = this.selection.toString();
    var range = this.selection.getRangeAt(0);

    this.startNode = range.startContainer.textContent;
    this.startContainer = range.startContainer;
    this.startOffset = range.startOffset;

    this.endNode = range.endContainer.textContent;
    this.endContainer = range.endContainer;
    this.endOffset = range.endOffset;
    return this;
}
Events.prototype.setColor = function(){
    highlight.set(this.color);
    // this.selection.removeAllRanges();
    return this;
}

Events.prototype.setData = function(){
    this.section = {
        startId: this.startId,
        endId: this.endId,
        startNode: this.startNode,
        endNode: this.endNode,
        startOffset: this.startOffset,
        endOffset: this.endOffset
    }
    return this;
}

