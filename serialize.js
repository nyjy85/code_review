en

var endNode;
function getEnd(node, text) {
   if (node.textContent === text) {
       endNode = node;
   } else if (node.childNodes) {
       for (var i = 0; i < node.childNodes.length;i++) {
           getEnd(node.childNodes[i], text);
       }
   } else {
       console.log("getDocument: no document found for node");
   }
}

var startNode;
function getStart(node, text) {
   if (node.textContent === text) {
       startNode = node;
   } else if (node.childNodes) {
       for (var i = 0; i < node.childNodes.length;i++) {
           getStart(node.childNodes[i], text);
       }
   } else {
       console.log("getDocument: no document found for node");
   }
}

var selection = window.getSelection();
    selection.removeAllRanges();
var newRange = document.createRange();

function setNewRange(startNode, startOffset, endNode, endOffset, newRange){	
	if(startNode.nodeType !==3) startNode = starNode.parentElement;
	newRange.setStart(startNode, startOffset);
	if(endNode.nodeType !==3) endNode = endNode.parentElement;
	newRange.setEnd(endNode, endOffset);
}

function reHighlight(){
	selection.addRange(newRange)
}


newRange.setStart(startNode, range.startOffset)
newRange.setEnd(endNode, range.endOffset)


var selection = window.getSelection()
var range = selection.getRangeAt(0)
 // node = range.startContainer or range.endContainer
function Serialize(range, node){
	this.node = node;
	this.newNode;
	this.range = range;
}

Serialize.prototype.setStart = function(){
	this.serializeIt(this.node, this.range.startContainer);
}

Serialize.prototype.setEnd = function(){
	this.serializeIt(this.node, this.range.endContainer)
}


Serialize.prototype.serializeIt = function(node, container){
	if (node.textContent === container.textContent && node.nodeType === 3) {
       this.newNode = this.node;
   } else if (node.childNodes) {
       for (var i = 0; i < node.childNodes.length;i++) {
           this.serializeIt(node.childNodes[i], container);
       }
   } else {
       console.log("getDocument: no document found for node");
   }
}

var selection = window.getSelection();
    selection.removeAllRanges();
    var newRange = document.createRange();

newRange.setStart(start, range.startOffset)
newRange.setEnd(end, range.endOffset)
selection.addRange(newRange)






var selection = window.getSelection();
var range = selection.getRangeAt(0);
var saveNode = range.startContainer;

var startOffset = range.startOffset;  // where the range starts
var endOffset = range.endOffset;      // where the range ends

var nodeData = saveNode.data;                       // the actual selected text
var nodeHTML = saveNode.parentElement.innerHTML;    // parent element innerHTML
var nodeTagName = saveNode.parentElement.tagName;   
var id;
$('td').mousedown(function(){
	id = $(this).attr('id');
})
function buildRange(startOffset, endOffset, nodeData, nodeHTML, nodeTagName, id){
    var cDoc = document.getElementById(id).contentElement;
    var tagList = cDoc.getElementsByTagName(nodeTagName);
    var foundEle;
    // find the parent element with the same innerHTML
    for (var i = 0; i < tagList.length; i++) {
        if (tagList[i].innerHTML == nodeHTML) {
            foundEle = tagList[i];
        }
    }

    // find the node within the element by comparing node data
    var nodeList = foundEle.childNodes;
    var foundNode;
    for (var i = 0; i < nodeList.length; i++) {
        if (nodeList[i].data == nodeData) {
            foundNode = nodeList[i];
        }
    }

    console.log('this is foundNode', foundNode);
    // create the range
    var range = cDoc.createRange();

    range.setStart(id, startOffset);
    range.setEnd(id, endOffset);
    return range;
}



$('td').mouseup(function(event) {
    if (event===undefined) event= window.event;                     // IE hack
    var target= 'target' in event? event.target : event.srcElement; // another IE hack

    var root= document.compatMode==='CSS1Compat'? document.documentElement : document.body;
    var mxy= [event.clientX+root.scrollLeft, event.clientY+root.scrollTop];

    var path= getPathTo(target);
    var txy= getPageXY(target);
    var message = 'You clicked the element '+path+' at offset '+(mxy[0]-txy[0])+', '+(mxy[1]-txy[1]);
    console.log(message);
})

function getPathTo(element) {
    if (element.id!=='')
        return "//*[@id='"+element.id+"']";
    
    if (element===document.body)
        return element.tagName.toLowerCase();

    var ix= 0;
    var siblings= element.parentNode.childNodes;
    for (var i= 0; i<siblings.length; i++) {
        var sibling= siblings[i];
        
        if (sibling===element) return getPathTo(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
        
        if (sibling.nodeType===1 && sibling.tagName === element.tagName) {
            ix++;
        }
    }
}

function getPageXY(element) {
    var x= 0, y= 0;
    while (element) {
        x+= element.offsetLeft;
        y+= element.offsetTop;
        element= element.offsetParent;
    }
    return [x, y];
}




window.onmousedown = clearSimulatedSelections;

function storeSelection(){
    if(window.getSelection){
        var currSelection = window.getSelection();
        for(var i = 0; i < currSelection.rangeCount; i++){
            storeRecursive(currSelection.getRangeAt(i));
        }
        currSelection.removeAllRanges();
    } else {
        alert("Your browser does not support this example!");
    }
}

function storeRecursive(selection, node, started){
    node = node || document.body;
    started = started || false;
    var nodes = node.childNodes;
    for(var i = 0; i < nodes.length; i++){
        if(nodes[i].nodeType == 3){
            var first = nodes[i] == selection.startContainer;
            var last = nodes[i] == selection.endContainer;
            if(first) started = true;
            if(started) {
                var sel = selection.cloneRange();
                if(!first) sel.setStartBefore(nodes[i]);
                if(!last) sel.setEndAfter(nodes[i]);

                storedSelections.push(sel);
                if(last) return false;
            }
        } else {
            started = storeRecursive(selection, nodes[i], started);
        }
    }
    return started;
}

function clearStoredSelections(){
    storedSelections = [];
}

function showStoredSelections(){
    if(window.getSelection){
        var currSelection = window.getSelection();
        currSelection.removeAllRanges();
        for(var i = 0; i < storedSelections.length; i++){
            var node = document.createElement("span");
            node.className = "highlight";
            node.style.backgroundColor = "green"
            storedSelections[i].surroundContents(node);
            simulatedSelections.push(node);
        }
    } else {
        alert("Your browser does not support this example!");
    }
}

function clearSimulatedSelections()
{
    for(var i = 0; i < simulatedSelections.length; i++)
    {
        var sec = simulatedSelections[i];
        var pn = sec.parentNode;
        while(sec.firstChild)
        {
            pn.insertBefore(sec.firstChild, sec);
        }
        pn.removeChild(sec);
    }
    simulatedSelections = [];
}