/**
 * Represents a Synthesis object.
 * @class
 */
const symbol = require('./structs/symbol.js');
const nodes = require('./strutcs/nodes.js');

class Synthesis {
  constructor() {
    this.symbolTable = [];
    this.ast = null;
    this.console = null;
  }

  execute() {
    this.ast.execute();
  }

  addSymbol(id, type_symbol, type_var, line, column) {
    this.symbolTable.push(new symbol.Symbol(id, type_symbol, type_var, line, column));
  }

  addAst(ast) {
    this.ast = ast;
  }

  addConsole(console) {
    this.console = console;
  }
}
/**
 * Represents a Synthesis object.
 * @class
 * @memberof module:synthesis
 * @param {Object} ast - The AST to be synthesized.
 */
getValue = (node, symbols) => {
    //First we need to check if the node is a value int, float, string, bool, char
    if (node.type === 'int' || node.type === 'float' || node.type === 'string' || node.type === 'boolean' || node.type === 'char') {
        return node.value;
    //Then we check if the node is a variable
    } else if (node instanceof nodes.NodeID) {
        try {
            const symbol = symbols.find(symbol => symbol.id === node.type);
        return symbol.value;}
        catch (error) {
            console.log('Semantic Error: Variable not found');
            return null;
        }
    } else { 
        
        switch (node.operator) {
        case '+':
            if (node.left.type === 'string' || node.right.type === 'string') {//If one of the operands is a string, we concatenate them
                return getValue(node.left, symbols) + getValue(node.right, symbols);
            }
            else if (node.left.type === 'int' && node.right.type === 'int') {//If both operands are integers, we parse them to int and add them
                const value = parseInt(getValue(node.left, symbols)) + parseInt(getValue(node.right, symbols));
                //parse integer to String
                return value.toString();
            }
            return getValue(node.left, symbols) + getValue(node.right, symbols);
        case '-':
            return getValue(node.left, symbols) - getValue(node.right, symbols);
        case '*':
            return getValue(node.left, symbols) * getValue(node.right, symbols);
        case '/':
            return getValue(node.left, symbols) / getValue(node.right, symbols);
        case '%':
            return getValue(node.left, symbols) % getValue(node.right, symbols);
        case '==':
            return getValue(node.left, symbols) === getValue(node.right, symbols);
        case '!=':
            return getValue(node.left, symbols) !== getValue(node.right, symbols);
        case '>':
            return getValue(node.left, symbols) > getValue(node.right, symbols);
        case '<':
            return getValue(node.left, symbols) < getValue(node.right, symbols);
        case '>=':
            return getValue(node.left, symbols) >= getValue(node.right, symbols);
        case '<=':
            return getValue(node.left, symbols) <= getValue(node.right, symbols);
        case '&&':
            return getValue(node.left, symbols) && getValue(node.right, symbols);
        case '||':
            return getValue(node.left, symbols) || getValue(node.right, symbols);
        case '!':
            return !getValue(node.right, symbols);
        case '-':
            return -getValue(node.right, symbols);
        
        }
    }
}