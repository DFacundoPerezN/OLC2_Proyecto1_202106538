/**
 * Represents a Synthesis object.
 * @class
 */
import {NodeBase, NodeID}  from '../structs/nodes.js';
import Symbol_s from '../structs/symbol.js';

import {
    executePrint,
    executeDeclaration,
    executeAssignment,
    executeIf,
    executeSwitch,
    executeWhile,
    executeFor } from './sentences.js';


let globalPower = {
    IdMap: new Map(),
    output: ''
};

class Synthesis {
  constructor() {
    this.symbolTable = [];
    //this.IdMap = new Map();
    this.ast = null;
  }

  execute() {
    executeSentences(this.ast);
  }

  addSymbol(id, type_symbol, type_var, line, column) {
    this.symbolTable.push(new Symbol_s(id, type_symbol, type_var, line, column));
  }

  addAst(ast) {
    this.ast = ast;
  }

  getSymbolTable() {
    return this.symbolTable;
  }

  getOutput() {
    return globalPower.output;
  }

}
/**
     * @param {BaseNode} node
     * @returns {any}
     */

function getValue (node) {
    //First we need to check if the node is a value int, float, string, bool, char
    console.log("Node : "+ typeof node + ' ' +JSON.stringify(node, null, 2));
    if (node.type === 'int' || node.type === 'float' || node.type === 'string' || node.type === 'boolean' || node.type === 'char') {
        return node.value;
    //Then we check if the node is a variable
    } else if (/^[A-Za-z]+/.test(node.type)) {
        if (globalPower.IdMap.has(node.type)) {
            //node.value = node.type;
            const val = globalPower.IdMap.get(node.type).value;
            node.type = globalPower.IdMap.get(node.type).type;
            return val;
        }
        else{
            console.log('Semantic Error: Variable '+ node.type +' not found');
            return null;
        }
    } else if(node.type ==='parseInt'){
        node.type = 'int';
        node.value = getValue(node.children[0] );
        return node.value;
    } else if(node.type ==='parseFloat'){
        node.type = 'float';
        node.value = getValue(node.children[0] );
        return node.value;
    } else if(node.type ==='parseString'){
        node.type = 'string';
        node.value = '"'+ getValue(node.children[0] )+'"';
        return node.value;
    } else if(node.type ==='toLowerCase'){
        if (node.children[0].type === 'string'){
            node.value = getValue(node.children[0] ).toLowerCase();
            return node.value;
        }
        console.log('Semantic Error: Invalid operand for toLowerCase');
        return node.value;
    }else if(node.type ==='toUpperCase'){
        if (node.children[0].type === 'string'){
            node.value = getValue(node.children[0] ).toUpperCase();
            return node.value;
        }
        console.log('Semantic Error: Invalid operand for toUpperCase');
        return node.value;
    } else if(node.type ==='typeof'){
        getValue(node.children[0] )
        node.value = node.children[0].type;
        return node.value;
    } else if(node.type==='op3'){            
        let condition = getValue(node.children[0] );        
        if (condition == 'true') {
            return getValue(node.children[1] );
        } else {
            return getValue(node.children[2] );
        }
    }
    else { 
        let right = "null";
        let left = "null";
        //It is important doing getValue() before doing the operation because this function establish the .type of the node
        if (node.children.length > 1) {
            left = getValue(node.children[0] );
            right = getValue(node.children[1] );
            console.log(left + ' ' + node.type + ' ' + right);
        }else{
            //console.log("One operand");
            right = getValue(node.children[0] );
        }
        switch (node.type) {
        case '+':
            if (left.includes('"') || right.includes('"')) {//If one of the operands is a string, we concatenate them
                node.type = 'string';
                return left + right;
            }
            else if (node.children[0].type === 'int' && node.children[1].type === 'int') {//If both operands are integers, we parse them to int and add them
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
            console.log('Semantic Error: Invalid operands for '+node.children[0].type+': '+left +' + '+ node.children[1].type +': '+ right);
            return left + right;
        case '-':
            if (node.children.length < 2) {//If the node is a negative number
                //console.log('Negative of: '+node.children[0].type);
                node.type =  node.children[0].type; //The node type is the same as the right operand node
                return (-right).toString(); 
            }
            else if (node.children[0].type === 'int' && node.children[1].type === 'int') {
                node.type = 'int';
                const value = parseInt(left) - parseInt(right);
                return value.toString();
            }
            else if (node.children[0].type === 'float' || node.children[1].type === 'float') {
                node.type = 'float';
                const value = parseFloat(left) - parseFloat(right);
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for '+node.children[0].type+' '+left +' - '+ node.children[1].type +' '+ right);
            return (left - right).toString();
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
                //console.log('Value: '+value);
                //return parse float to String
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for'+ left +' * ' + right);
            return left * right;
        case '/':
            if (node.children[0].type === 'int' && node.children[1].type === 'int') {//If both operands are integers, we parse them to int and add them
                node.type = 'float';
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
                return (left == right).toString();
            } else if (node.children[0].type === 'int' && node.children[1].type === 'float') {
                const value = parseInt(left) === parseFloat(right);
                return value.toString();
            } else if (node.children[0].type === 'float' && node.children[1].type === 'int') {
                const value = parseFloat(left) === parseInt(right);
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for'+ left +' == ' + right);
            return (left == right).toString();
        case '!=':
            node.type = 'boolean';
            if (node.children[0].type === node.children[1].type) {   
                return (left !== right).toString();
            } else if (node.children[0].type === 'int' && node.children[1].type === 'float') {
                const value = parseInt(left) !== parseFloat(right);
                return value.toString();
            } else if (node.children[0].type === 'float' && node.children[1].type === 'int') {
                const value = parseFloat(left) === parseInt(right);
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for '+ left +' != ' + right);
            return (left != right).toString();
        case '>':
            node.type = 'boolean';
            if (node.children[0].type === 'char' && node.children[1].type === 'char') {//If one of the operands is a string, we concatenate them
                return (left > right).toString();
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
            return (left > right).toString();
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
            else if (node.children[0].type === 'float' || node.children[1]. type === 'float'){//If both operands are floats, we parse them to float and add them
                const value = parseFloat(left) < parseFloat(right);
                //parse float to String
                return value.toString();
            }
            console.log('Semantic Error: Invalid operands for '+ left +' < ' + right);
            return (left < right).toString();
        case '>=':
            node.type = 'boolean';
            if (node.children[0].type === 'char' || node.children[1].type === 'char') {//If one of the operands is a string, we concatenate them
                return (left >= right).toString();
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
            return (left >= right).toString();
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
            return (left <= right).toString();
        case '&&':            
            node.type = 'boolean';
            if (node.children[0].type === 'boolean' && node.children[1].type === 'boolean') {
                return (left && right).toString();
            }
            console.log('Semantic Error: Invalid operands for'+ left +' && ' + right);
            return (left && right).toString();
        case '||':
            node.type = 'boolean';
            if (node.children[0].type === 'boolean' && node.children[1].type === 'boolean') {
                return (left || right).toString();
            }
            console.log('Semantic Error: Invalid operands for'+ left +' || ' + right);
            return (left || right).toString();
        case '!':
            node.type = 'boolean';
            if (node.children[0].type === 'boolean') {
                return (!right).toString();
            }
            console.log('Semantic Error: Invalid operand for ! ' + right);
            return (!right).toString();;
        
        }
    }
}

function executeSentences (node) { 
    for(let i = 0; i < node.children.length; i++) {
        if (node.children[i] !== null) {
            executeSentence(node.children[i] );
        }
    }
}

function executeSentence (node) {
    if (node.type === 'declaration') {
        executeDeclaration(node);
    } else if (node.type === 'assign') {
        executeAssignment(node);
    } else if (node.type === 'print') {
        executePrint(node);
    } else if (node.type === 'if') {
        executeIf(node);
    } else if (node.type === 'while') {
        executeWhile(node);
    } else if (node.type === 'for') {
        executeFor(node);
    } else if (node.type === 'switch') {
        executeSwitch(node);
    } 
    
}


export { 
    globalPower,
    Synthesis, 
    getValue, 
    executeSentences, 
    executeSentence
};