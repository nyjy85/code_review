// grab id on mousedown
var highlight;
$('td').mousedown(function(){
	var start = $(this).attr('id');
	highlight = new Highlight();
	highlight.range.push(start);
});

// grab id on mouseup
$('td').mouseup(function(){
	var end = $(this).attr('id');
	highlight.range.push(end);
	highlight.selection = window.getSelection().toString().split('\n')
	highlight.addRanges().addId().addHighlight();
});

function Highlight(range){
	this.range = range || [];
	this.selection;
}

Highlight.prototype.addRanges = function(){
	this.range = this.range.map(function(ele){return parseInt(ele.match(/\d+/)[0])});
	var length = this.range[1] - this.range[0];
	for(var i = 1; i < length; i++){
		this.range.splice(i , 0, this.range[0]+i)
	}
	return this;
};

Highlight.prototype.addId = function(){
	this.range = this.range.map(function(ele){
		return "LC"+ele;
	});
	return this;
};

Highlight.prototype.addHighlight = function(){
	if(allTextMatches(this.range, this.selection)){
		this.range.forEach(function(id){
			$('#'+id).contents().wrap('<span style="background-color:yellow"></span>').end();
			// $('#'+id).css("background-color", "yellow");
		})
	}
};

// helper function for addHighlight:
function allTextMatches(ids, text){
	ids.forEach(function(id){
		text.forEach(function(text){
			if ( $('#'+id).text().indexOf(text) === -1) return false;
		});
	});
	return true;
}


var range = [];
var selection;

// grab id on mousedown
$('td').mousedown(function(){
	var start = $(this).attr('id');
	range.push(start);
});

// grab id on mouseup
$('td').mouseup(function(){
	var end = $(this).attr('id')
	range.push(end);
	selection = window.getSelection().toString().split('\n')
});
function cool(){
	// find range between them
	// first fo regex to abstract the number
	var newRange = range.map(function(ele){return parseInt(ele.match(/\d+/)[0])});
	var length = newRange[1] - newRange[0];
	for(var i = 1; i < length; i++){
		newRange.splice(i , 0, newRange[0]+i)
	}
	// add the LC back to the numbers
	newRange = newRange.map(function(ele){
		return "LC"+ele;
	});

	// loop through the IDs and if the text of each ID matches the one in the selected area, apply a highlight
	if(all(newRange, selection)){
		newRange.forEach(function(id){
			$('#'+id).css("background-color", "yellow");
		})	;
	}
		
}

function all(ids, text){
	ids.forEach(function(id){
		text.forEach(function(text){
			if ( $('#'+id).text().indexOf(text) === -1) return false;
		});
	});
	return true;
}


lc36.replace(/\.pipe/gi, "<span style='background-color:green'>.pipe(e</span>")


function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}

alert(getSelectionHtml());