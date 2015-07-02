function DeSerialize(range, node){
  this.range = range;
  this.node = node;
}

DeSerialize.prototype.setStart = function(){
    this.serializeIt(this.node, this.range.startContainer.textContent);
    return this;
}

DeSerialize.prototype.setEnd = function(){
    this.serializeIt(this.node, this.range.endContainer.textContent);
    return this;
}

DeSerialize.prototype.serializeIt = function(node, text){
    if (node.textContent === text) this.newNode = this.node;
    else if (node.childNodes) {
       for (var i = 0; i < node.childNodes.length; i++) {
           this.serializeIt(node.childNodes[i], text);
       }
   } else console.log("getDocument: no document found for node");
}

// function DeSerialize(range, node){
//   Serialize.call(this, range, node)
// }
// DeSerialize.prototype = Object.create(Serialize.prototype)
// DeSerialize.prototype.constructor = DeSerialize;