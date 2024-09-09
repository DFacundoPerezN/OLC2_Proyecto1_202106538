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
    this.console = '';
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
        return node.value.replace(/"/g, '');
    //Then we check if the node is a variable
    } else if (node instanceof nodes.NodeID) {
        try {
            const symbol = symbols.find(symbol => symbol.id === node.type);
            return symbol.value;
        }
        catch (error) {
            console.log('Semantic Error: Variable not found');
            return null;
        }
    } else if(node.type ==='parseInt'){
        node.type = 'int';
        node.value = getValue(node.children[0], symbols);
        return node.vale;
    } else if(node.type ==='parseFloat'){
        node.type = 'float';
        node.value = getValue(node.children[0], symbols);
        return node.vale;
    } else if(node.type ==='parseString'){
        node.type = 'string';
        node.value = '"'+ getValue(node.children[0], symbols)+'"';
        return node.vale;
    } else if(node.type ==='toLowerCase'){
        if (node.children[0].type === 'string'){
            node.value = getValue(node.children[0], symbols).toLowerCase();
            return node.value;
        }
        console.log('Semantic Error: Invalid operand for toLowerCase');
        return node.value;
    }else if(node.type ==='tuUpperCase'){
        if (node.children[0].type === 'string'){
            node.value = getValue(node.children[0], symbols).toUpperCase();
            return node.value;
        }
        console.log('Semantic Error: Invalid operand for toUpperCase');
        return node.value;
    } else if(node.type ==='typeof'){
        getValue(node.children[0], symbols)
        node.value = node.children[0].type;
        return node.value;
    }
    else { 
        let right = "null";
        let left = "null";
        //It is important doing getValue() before doing the operation because this function establish the .type of the node
        if (node.children[0] !== null) {
            left = getValue(node.children[0], symbols);
            right = getValue(node.children[1], symbols)
        }else{
            right = getValue(node.children[0], symbols);
        }
        switch (node.type) {
        case '+':
            if (left.includes('"') || right.includes('"')) {//If one of the operands is a string, we concatenate them
                node.type = 'string';
                return left + right;
            }
            else if (/^[0-9]+$/.test(left) && /^[0-9]+$/.test(right)) {//If both operands are integers, we parse them to int and add them
                node.type = 'int';
                const value = parseInt(left) + parseInt(right);
                //parse integer to String
                return value.toString();
            }
            else if (node.children[0].type === 'float' || node.children[1].type === 'float'){//If both operands are floats, we parse them to float and add them
                node.type = 'float';
                const value = parseFloat(left) + parseFloat(right);
                //parse float to String
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for'+ left +' + ' + right);
            return left + right;
        case '-':
            if (node.children[0] === null) {//If the node is a negative number
                node.type =  node.children[0].type; //The node type is the same as the right operand node
                return -right; 
            }
            else if (node.children[0].type === 'int' && node.children[1].type === 'int') {
                node.type = 'int';
                const value = parseInt(left) - parseInt(right);
                return value.toString();
            }
            else if (node.children[0].type === 'float' && node.children[1].type === 'float') {
                node.type = 'float';
                const value = parseFloat(left) - parseFloat(right);
                return value.toString();
            }
            return left - right;
        case '*':
            if (node.children[0].type === 'int' && node.children[1].type === 'int') {//If both operands are integers, we parse them to int and add them
                node.type = 'int';
                const value = parseInt(left) * parseInt(right);
                //return parse integer to String
                return value.toString();
            }
            else if (node.children[0].type === 'float' || node.children[1].type === 'float'){//If both operands are floats, we parse them to float and add them
                node.type = 'float';
                const value = parseFloat(left) * parseFloat(right);
                //return parse float to String
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for'+ left +' * ' + right);
            return left * right;
        case '/':
            if (node.children[0].type === 'int' && node.children[1].type === 'int') {//If both operands are integers, we parse them to int and add them
                node.type = 'int';
                const value = parseInt(left) / parseInt(right);
                //return parse integer to String
                return value.toString();
            }
            else if (node.children[0].type === 'float' || node.children[1].type === 'float'){//If both operands are floats, we parse them to float and add them
                node.type = 'float';
                const value = parseFloat(left) / parseFloat(right);
                //return parse float to String
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for'+ left +' / ' + right);
            return left / right;
        case '%':
            node.type = 'int';
            if (node.children[0].type === 'int' && node.children[1].type === 'int') {//If both operands are integers, we parse them to int and add them
                const value = parseInt(left) % parseInt(right);
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for'+ left +' % ' + right);
            return left % right;
        case '==':
            node.type = 'boolean';
            if (node.children[0].type === node.children[1].type) {    
                return left === right;
            } else if (node.children[0].type === 'int' && node.children[1].type === 'float') {
                return parseInt(left) === parseFloat(right);
            } else if (node.children[0].type === 'float' && node.children[1].type === 'int') {
                return parseFloat(left) === parseInt(right);
            }
            console.log('Semantic Error: Invalid operands for'+ left +' == ' + right);
            return left === right;
        case '!=':
            node.type = 'boolean';
            if (node.children[0].type === node.children[1].type) {
                return left !== right;
            } else if (node.children[0].type === 'int' && node.children[1].type === 'float') {
                return parseInt(left) !== parseFloat(right);
            } else if (node.children[0].type === 'float' && node.children[1].type === 'int') {
                return parseFloat(left) !== parseInt(right);
            }
            console.log('Semantic Error: Invalid operands for '+ left +' != ' + right);
            return left != right;
        case '>':
            node.type = 'boolean';
            if (node.children[0].type === 'char' && node.children[1].type === 'char') {//If one of the operands is a string, we concatenate them
                return left > right;
            }
            else if (node.children[0].type === 'int' && node.children[1].type === 'int') {//If both operands are integers, we parse them to int and add them
                const value = parseInt(left) > parseInt(right);
                //parse integer to String
                return value.toString();
            }
            else if (node.children[0].type === 'float' || node.children[1].type === 'float'){//If both operands are floats, we parse them to float and add them
                const value = parseFloat(left) > parseFloat(right);
                //parse float to String
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for '+ left +' > ' + right);
            return left > right;
        case '<':
            node.type = 'boolean';
            if (node.children[0].type === 'char' || node.children[1].type === 'char') {//If one of the operands is a string, we concatenate them
                return left < right;
            }
            else if (node.children[0].type === 'int' && node.children[1].type === 'int') {//If both operands are integers, we parse them to int and add them
                const value = parseInt(left) < parseInt(right);
                //parse integer to String
                return value.toString();
            }
            else if (node.children[0].type === 'float' || node.children[1].type === 'float'){//If both operands are floats, we parse them to float and add them
                const value = parseFloat(left) < parseFloat(right);
                //parse float to String
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for '+ left +' < ' + right);
            return left < right;
        case '>=':
            node.type = 'boolean';
            if (node.children[0].type === 'char' || node.children[1].type === 'char') {//If one of the operands is a string, we concatenate them
                return left >= right;
            }
            else if (node.children[0].type === 'int' && node.children[1].type === 'int') {//If both operands are integers, we parse them to int and add them
                const value = parseInt(left) >= parseInt(right);
                //parse integer to String
                return value.toString();
            }
            else if (node.children[0].type === 'float' || node.children[1].type === 'float'){//If both operands are floats, we parse them to float and add them
                const value = parseFloat(left) >= parseFloat(right);
                //parse float to String
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for'+ left +' >= ' + right);
            return left > right;
        case '<=':
            node.type = 'boolean';
            if (node.children[0].type === 'char' || node.children[1].type === 'char') {//If one of the operands is a string, we concatenate them
                return left <= right;
            }
            else if (node.children[0].type === 'int' && node.children[1].type === 'int') {//If both operands are integers, we parse them to int and add them
                const value = parseInt(left) <= parseInt(right);
                //parse integer to String
                return value.toString();
            }
            else if (node.children[0].type === 'float' || node.children[1].type === 'float'){//If both operands are floats, we parse them to float and add them
                const value = parseFloat(left) <= parseFloat(right);
                //parse float to String
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for'+ left +' <= ' + right);
            return left <= right;
        case '&&':            
            node.type = 'boolean';
            if (node.children[0].type === 'boolean' && node.children[1].type === 'boolean') {
                return left && right;
            }
            console.log('Semantic Error: Invalid operands for'+ left +' && ' + right);
            return left && right;
        case '||':
            node.type = 'boolean';
            if (node.children[0].type === 'boolean' && node.children[1].type === 'boolean') {
                return left || right;
            }
            console.log('Semantic Error: Invalid operands for'+ left +' || ' + right);
            return left || right;
        case '!':
            node.type = 'boolean';
            if (node.children[0].type === 'boolean') {
                return !right;
            }
            console.log('Semantic Error: Invalid operands for !' + right);
            return !right;
        
        }
    }
}

executeSentences = (node, symbols) => { 
    for(let i = 0; i < node.children.length; i++) {
        if (node.children[i] !== null) {
            if (node.children[i].type === 'declaration') {
                executeDeclaration(node.children[i], symbols);
            } else if (node.children[i].type === 'assign') {
                executeAssignment(node.children[i], symbols);
            } else if (node.children[i].type === 'print') {
                executePrint(node.children[i], symbols);
            } else if (node.children[i].type === 'if') {
                executeIf(node.children[i], symbols);
            } else if (node.children[i].type === 'while') {
                executeWhile(node.children[i], symbols);
            } else if (node.children[i].type === 'for') {
                executeFor(node.children[i], symbols);
            } else if (node.children[i].type === 'switch') {
                executeSwitch(node.children[i], symbols);
            } else if (node.children[i].type === 'break') {
                executeBreak(node.children[i], symbols);
            } else if (node.children[i].type === 'continue') {
                executeContinue(node.children[i], symbols);
            } else if (node.children[i].type === 'return') {
                executeReturn(node.children[i], symbols);
            }
        }
    }
}

export { Synthesis, getValue, executeSentences };