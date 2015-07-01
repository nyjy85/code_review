function Highlight(){
	this.currentSelection = [];
	this.selection = window.getSelection();
}

Highlight.prototype.backupRange = function(){
	var selection = window.getSelection();
	designMode();
	var range = selection.getRangeAt(0);  
	this.currentSelection.push({
		startContainer: range.startContainer, 
		startOffset: range.startOffset,
		endContainer: range.endContainer, 
		endOffset: range.endOffset
	});
};

Highlight.prototype.restoreRange = function(){
	// var selection = window.getSelection();
    this.selection.removeAllRanges();
    var range = document.createRange();
    range.setStart(ele.startContainer, ele.startOffset);
    range.setEnd(ele.endContainer, ele.endOffset);
    selection.addRange(range);
};

Highlight.prototype.setBackgroundColor = function(){
	this.restoreRange(ele);
    document.designMode = "on";
    document.execCommand("BackColor", false, 'yellow');
    document.designMode = 'off';
}

function designMode(){
	document.designMode = "on";
    document.execCommand("BackColor", false, '#ceff63');
    document.designMode = 'off';
}

