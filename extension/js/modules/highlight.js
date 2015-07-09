var highlight = {};

highlight.set = function(color){
	// highlighting = true;
    document.designMode = "on";
    document.execCommand("hiliteColor", false, color);
    document.designMode = 'off'; 
    // highlighting = false;  
}

highlight.clear = function(start, end, color){
	var newStart = parseInt(start.match(/\d+/)[0])
	var newEnd = parseInt(end.match(/\d+/)[0])
	var arr = [];

	for (var i = newStart; i <= newEnd; i++){
		arr.push("LC"+i);
	}

	arr.forEach(function(id){
		k = $('#'+ id + ' span');
		k.each(function(i, span){ $(span).css("background-color", color) });
	});
	var selection = window.getSelection();
    selection.removeAllRanges();
}

highlight.undo = function(section){
    document.designMode = 'on';
    var sel = window.getSelection();
    restoreRange(section)
    section = null;
    document.execCommand('removeFormat', false, null)
    sel.removeAllRanges();
    document.designMode = 'off';
}

function restoreRange(section) {
    var range = document.createRange();
    console.log('this be section data in restorerange', section)
    range.setStart(section.startContainer, section.startOffset);
    range.setEnd(section.endContainer, section.endOffset);

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

// highlight.restorerange = function(ele){
//     var selection = window.getSelection();
//     selection.removeAllRanges();
//     var range = document.createRange();
//     range.setStart(ele.startContainer, ele.startOffset);
//     range.setEnd(ele.endContainer, ele.endOffset);
//     selection.addRange(range);
// }

// highlight.setBackgroundColor = function(ele) {
//     highlight.restorerange(ele);
//     this.set();
// }