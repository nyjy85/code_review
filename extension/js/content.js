$(document).ready(function(){
    console.log('document is ready!')
    $('body').append('<button id="joanne">CLICK ME TO REPOPULATE BIIITCCCH</button>')
    $('body').append('<button id="yae">CLICK ME TO CLEAR BIIITCCCH</button>')
    // sends events back to background.js 
    // chrome.runtime.sendMessage({command: "verify"});

    // $(document).on('click', function(){
    //     console.log('HEEELLLP')
    //     chrome.runtime.sendMessage({command: "get", id: '55918a257b166fba67442c21'});
    // })
    
    // listens for events from AJAX calls/background.js and executes something
    chrome.runtime.onMessage.addListener(
        function(res, sender){
            if (res.command === 'verified'){
                console.log('message 1!', res.message)
                $('#LC26').html('<p>THERE IS A MATCH!</p>').css('background-color', 'green');
            }
            if (res.command === 'file-retrieved'){
                // do something
                console.log('message 2!', res.message)
            }
            if(res.command === 'highlight-retrieved'){
                console.log('THIS BE RES RES RES', res)
                var highlighted = res.message.highlighted
                var startId = highlighted.startId;
                startId = document.getElementById(startId)
                var endId = highlighted.endId;
                endId = document.getElementById(endId);
                var startNode = highlighted.startNode;
                var endNode = highlighted.endNode;
                var startOffset = highlighted.startOffset;
                var endOffset = highlighted.endOffset;
                setStart(startId, startNode)
                setEnd(endId, endNode)

                var selection = window.getSelection();
                 selection.removeAllRanges();
                var newRange = document.createRange();

                setNewRange(newStartNode, startOffset, newEndNode, endOffset, newRange)
                reHighlight(newRange)


            }
        }
    )

    var startId;
    var endId;
    // handles highlighting;
    // var highlight;
    $('td').mousedown(function(){
        startId = $(this).attr('id');
        console.log('you clicked yo!')
    });

    // grab id on mouseup
    $('td').mouseup(function(){
        endId = $(this).attr('id');
        var href = window.location.href;
        var selection = window.getSelection()
        var range = selection.getRangeAt(0)
        var start = new Serialize(range, range.startContainer)
        var startOffset = range.startOffset;
        var startNode = start.setStart();
        startNode = start.newNode.textContent;
        var end = new Serialize(range, range.endContainer)
        var endOffset = range.endOffset;
        var endNode = end.setEnd();
        endNode = end.newNode.textContent;

        zss_editor.backuprange();
        highlight = {
            startId: startId, 
            endId: endId, 
            startNode: startNode, 
            endNode: endNode, 
            startOffset: startOffset, 
            endOffset: endOffset
        }

        var data = {newData:{comment: 'THIS BEETA WOIK', highlighted: highlight}, fileInfo: {fileUrl: href}}
            // console.log('THIS IS DATA FORM HIGHLIGHT', data);
            chrome.runtime.sendMessage({command: 'highlight-data', data: data})
    });
    $('#joanne').on('click', function(){
        chrome.runtime.sendMessage({command: 'get-highlight', id: '5594232cc19c94e356a276ee'})
        // zss_editor.currentSelection.forEach(function(ele){
            // zss_editor.setBackgroundColor(ele)
        // });
    })
    // $('#yae').on('click', function(){
    //     var href = window.location.href;
    //     var data = {newData:{comment: 'Test Comment', code: 'function(){}', ranges: ['a','b'], id: '#LC25', func: zss_editor.currentSelection}, fileInfo: {fileUrl: href}}
    //     chrome.runtime.sendMessage({command: 'highlight-data', data: data})
    //     zss_editor.currentSelection.forEach(function(ele){
    //         zss_editor.clear(ele)
    //     });
    // })

});

var newEndNode;
function setEnd(node, text) {
   if (node.textContent === text) {
       newEndNode = node;
   } else if (node.childNodes) {
       for (var i = 0; i < node.childNodes.length;i++) {
           setEnd(node.childNodes[i], text);
       }
   } else {
       console.log("getDocument: no document found for node");
   }
}

var newStartNode;
function setStart(node, text) {
   if (node.textContent === text) {
       newStartNode = node;
   } else if (node.childNodes) {
       for (var i = 0; i < node.childNodes.length;i++) {
           setStart(node.childNodes[i], text);
       }
   } else {
       console.log("getDocument: no document found for node");
   }
}

function setNewRange(startNode, startOffset, endNode, endOffset, newRange){ 
    if(startNode.nodeType !==3) startNode = startNode.parentElement;
    newRange.setStart(startNode, startOffset);
    if(endNode.nodeType !==3) endNode = endNode.parentElement;
    newRange.setEnd(endNode, endOffset);
}

function reHighlight(newRange){
    selection.addRange(newRange);
    document.designMode = "on";
    document.execCommand("BackColor", false, 'yellow');
    document.designMode = 'off';
}


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

var zss_editor = {};

// The current selection
zss_editor.currentSelection = [];

zss_editor.backuprange = function(){
    var selection = window.getSelection();
    document.designMode = "on";
    document.execCommand("BackColor", false, '#ceff63');
    document.designMode = 'off';
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

zss_editor.setBackgroundColor = function(ele) {
    zss_editor.restorerange(ele);
    document.designMode = "on";
    document.execCommand("BackColor", false, 'yellow');
    document.designMode = 'off';
}

zss_editor.clear = function(ele){
    zss_editor.restorerange(ele);
    document.designMode = "on";
    document.execCommand("BackColor", false, 'white');
    document.designMode = 'off';
}

selection = window.getSelection();
range = selection.getRangeAt(0)

var startId = document.getElementById('LC36')
var endId = document.getElementById('LC39')

var selection = window.getSelection();
    selection.removeAllRanges();
var newRange = document.createRange();
var start = newRange.setStart(startId, range.startOffset);
var end =  newRange.setEnd(endId, range.endOffset);
    selection.addRange(newRange);

document.designMode = "on";
    document.execCommand("BackColor", false, 'yellow');
    document.designMode = 'off';





