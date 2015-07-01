// iteration 4
function Highlight(){
	this.selections = [];
	this.range;
}

Highlight.prototype.backupRange = function(){
	var selection = window.getSelection();
    this.range = selection.getRangeAt(0); 
    this.selections.push({"startContainer": this.range.startContainer, "startOffset":this.range.startOffset,"endContainer":this.range.endContainer, "endOffset":this.range.endOffset}))
}

function ReHighlight(data){
	this.selection = data;
}
ReHighlight.prototype.restoreRange = function(ele){
	var selection = window.getSelection();
	selection.removeAllRanges();
	var range = document.createRange();
	range.setStart(ele.startContainer, ele.startOffset);
    range.setEnd(ele.endContainer, ele.endOffset);
    selection.addRange(range);
}

ReHighlight.prototype.setBackgroundColor = function(ele){
	this.restoreRange(ele);
    document.designMode = "on";
    document.execCommand("BackColor", false, '#ceff63');
    document.designMode = 'off';
}

// create new instance of highlight on receiving data
var rehighlight = new ReHighlight(data)
//assume data from data base
this.selection.forEach(function(ele){
	highlight.setBackgroundColor(ele);
})
// iteration 3
var zss_editor = {};

// The current selection
zss_editor.currentSelection = [];

zss_editor.backuprange = function(){
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);  
    zss_editor.currentSelection.push({"startContainer": range.startContainer, "startOffset":range.startOffset,"endContainer":range.endContainer, "endOffset":range.endOffset});

}

zss_editor.restorerange = function(ele){
    var selection = window.getSelection();
    selection.removeAllRanges();
    var range = document.createRange();
    range.setStart(ele.startContainer, ele.startOffset);
    range.setEnd(ele.endContainer, ele.endOffset);
    selection.addRange(range);
}

zss_editor.setTextColor = function(color) {
    zss_editor.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('foreColor', false, color);
    document.execCommand("styleWithCSS", null, false);
}

zss_editor.setBackgroundColor = function(ele) {
    zss_editor.restorerange(ele);
    document.designMode = "on";
    document.execCommand("BackColor", false, '#ceff63');
    document.designMode = 'off';
}
zss_editor.currentSelection.forEach(function(ele){
    zss_editor.setBackgroundColor(ele, '#007AFF')
});
// iteration 2 
// this was deleted
var highlight;
$('td').mousedown(function(){
    highlight = new Highlight();
    highlight.id.push($(this).attr('id'));
});

// grab id on mouseup
$('td').mouseup(function(){
    var selection = window.getSelection();
    if(!selection.isCollapsed){
        var range = selection.getRangeAt(0).cloneRange();
        highlight.ranges.push(range);
        highlight.addHighlight();
        console.log(highlight.ranges)
    }
});

function Highlight(){
    this.ranges = [];
    this.id = [];
}

Highlight.prototype.addHighlight = function(){
    var ref = this.id;
    var self = this;
    // this.ranges.forEach(function(range, idx){
    	// console.log('the id', ref[idx])
        // range.selectNodeContents(document.getElementById(ref[idx]));
        // this is the highlight 
        document.designMode = "on";
        document.execCommand("BackColor", false, '#ceff63');
        document.designMode = 'off';
        // end highlight
        // self.addCommentLink(range.startContainer);
    // })
};

var $commentBox = '<div class="box"><textarea rows="5"></textarea></div>';

Highlight.prototype.addCommentLink = function(codeBlock){
    $('body').after($commentBox);
    $('.box').css({"background-color": "green", "height": "200px", "width": "300px", "text-align": "center"})
};


// this was deleted
var highlight;
$('td').mousedown(function(){
    highlight = new Highlight();
    highlight.id.push($(this).attr('id'));
});

// grab id on mouseup
$('td').mouseup(function(){
    var selection = window.getSelection();
    if(!selection.isCollapsed){
        var range = selection.getRangeAt(0).cloneRange();
        highlight.ranges.push(range);
        highlight.addHighlight();
        console.log(highlight.ranges)
    }
});

function Highlight(){
    this.ranges = [];
    this.id = [];
}

Highlight.prototype.addHighlight = function(){
    var ref = this.id;
    var self = this;
    this.ranges.forEach(function(range, idx){
        range.selectNodeContents(document.getElementById(ref[idx]));
        // this is the highlight 
        document.designMode = "on";
        document.execCommand("BackColor", false, '#ceff63');
        document.designMode = 'off';
        // end highlight
        self.addCommentLink(range.startContainer);
    })
};

Highlight.prototype.addCommentLink = function(codeBlock){
    $(codeBlock).after('<a href="#" title="Replace this with an icon in the future">Comment</a>');
};




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