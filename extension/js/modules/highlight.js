var highlight = {};

highlight.set = function(color){
    document.designMode = "on";
    document.execCommand("BackColor", false, color);
    document.designMode = 'off';   
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

highlight.clear = function(start, end, color){
	console.log('start', start, 'end', end);
	var newStart = parseInt(start.match(/\d+/)[0])
	var newEnd = parseInt(end.match(/\d+/)[0])
	var arr = [];

	for (var i = newStart; i <= newEnd; i++){
		arr.push("LC"+i);
	}
	console.log('arrrrgh', arr)
	arr.forEach(function(id){
		console.log('sdkfjsldkfj', $('#'+ id + ' span'))
		k = $('#'+ id + ' span');
		k.each(function(i, span){
			console.log('nteste', span)
			$(span).css("background-color", color)
		})
		// $('#'+id + ' span').forEach(function(span){
		// 	$(span).css("background-color", color)
		// })
	})
    // $('#'+start).children()[0].css("background-color", "white");
    // this.set(color);
}

