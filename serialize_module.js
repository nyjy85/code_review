function Serialize(range, node){
  this.range = range;
  this.node = node;
}

Serialize.prototype.setStart = function(){
    this.serializeIt(this.node, this.range.startContainer);
    return this;
}

Serialize.prototype.setEnd = function(){
    this.serializeIt(this.node, this.range.endContainer);
    return this;
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