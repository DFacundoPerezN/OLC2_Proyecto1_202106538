import { executeSentence } from './synthesis.js';
import { getValue } from './synthesis.js' ;
import {globalPower, addSymbol} from './synthesis.js' ;
import {deepClone} from './sentences.js' ;

function executeFunction (node) {
    let type = node.type;
    console.log('Type of the function: '+type);
    //first child is the id, 
    //second child is the parameters,
    //third child is the code block
    let id = node.children[0].type;
    let parameters = node.children[1].children;
    let codeBlock = deepClone(node.children[2]);
    globalPower.FuncMap.set(id, {parameters, codeBlock, type});
    addSymbol(id, 'function', type, node.children[0].line, node.children[0].column);
}

function executeVoid (node) {
    let type = 'void';
    //first child is the id, 
    //second child is the parameters,
    //third child is the code block
    let id = node.children[0].type;
    let parameters = node.children[1].children;
    let codeBlock = node.children[2];
    globalPower.FuncMap.set(id, {parameters, codeBlock, type});
    addSymbol(id, type, 'void', node.children[0].line, node.children[0].column);
}

function executeCall (node) {
    for (let clavevalor of globalPower.FuncMap.entries()) {
        console.log(clavevalor);
    }
    //first child is the id,
    console.log('Call Node: '+JSON.stringify(node.children[0]));
    let id = node.children[0].type;

    let referenced = globalPower.FuncMap.get(id); //{ parameters, codeBlock, type }
    if (referenced === undefined) {
        console.log('The function "'+ id  +'" does not exist');
        throw new Error('The function does not exist');
    }
    node.type = referenced.type;
    //the other children are the parameters
    let referencedParameters = [].concat(referenced.parameters); //this are going to be the id's {type, value}
    let insertedParameters = deepClone(node.children.slice(1)); //doing .slice(1) to remove the id from the parameters
    console.log('Inserted Parameters: '+JSON.stringify(insertedParameters, null, 2));
    if (referencedParameters.length > insertedParameters.length) {
        console.log('The number of inserted parameters is less than the number of referenced parameters');
        throw new Error('The number of parameters is not the same');
    } else if (referencedParameters.length < insertedParameters.length) {
        console.log('The number of inserted parameters is greater than the number of referenced parameters');
        throw new Error('The number of parameters is not the same');
    } 

    console.log('Referenced Parameters: '+ JSON.stringify(referencedParameters, null, 2));
    for (let i = 0; i < insertedParameters.length; i++) {  //Save the values of the parameters
        let type = referencedParameters[i].type;
        let value = getValue(insertedParameters[i]);
        globalPower.IdMap.set(referencedParameters[i].value, {type, value});       
    }

    const sentences = deepClone(referenced.codeBlock).children; //get the sentences of the referenced function
    for (let j = 0; j < sentences.length; j++) {
        let sentence = sentences[j];
        if (sentence.type === 'return') {
            if (sentence.children[0] !== null) {
                node.value = getValue(sentence.children[0]);
                return node.value;
            }
            return;
        } else {
            executeSentence(sentence);
        }
    }
}


export {
    executeFunction,
    executeVoid,
    executeCall
}