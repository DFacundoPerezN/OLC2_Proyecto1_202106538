class NodeBase {
  constructor(type){
    this.type = type;
    this.value = null;
    this.children = [];
  }
}

class NodeID extends NodeBase {
  constructor(type){
    super(type);
    this.line = 0;
    this.column = 0;
  }
}

class Experession {
    constructor(){
        this.line = null;
        this.column = null;
    }
}

class BoolOperation extends Experession {
  constructor({left, right, operator}) {
    super();
    this.left = left;
    this.right = right;
    this.operator = operator;
  }
}

class aritmeticOperation extends Experession {
    constructor({left, right, operator}) {
      super();
      this.left = left;
      this.right = right;
      this.operator = operator;
    }
}

/**
 * Represents a relational operation.
 * @class
 * @extends Experession
 * @memberof module:structs/nodes
 */
class relationalOperation extends Experession {
    constructor({left, right, operator}) {
      super();
      this.left = left;
      this.right = right;
      this.operator = operator;
    }
}

class negativeOperation extends Experession{
  constructor({value, operator}) {
    super();
    this.value = value;
    this.operator = operator;
  }
}

class Number extends Experession{
    constructor(value){
        super();
        this.value = value;
    }
}


export default {
  NodeBase,
  NodeID,
  BoolOperation,
  aritmeticOperation,
  relationalOperation,
  negativeOperation,
  Number
}