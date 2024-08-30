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
    BoolOperation,
    aritmeticOperation,
    relationalOperation,
    negativeOperation,
    Number
}