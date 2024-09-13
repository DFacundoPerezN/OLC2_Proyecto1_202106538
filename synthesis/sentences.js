//const { exec } = require('child_process');
//const {synthesis} = require('./synthesis.js');
import { getValue } from './synthesis.js' ;
import {globalPower} from './synthesis.js' ;


function executePrint(node) {
    let innerOutput = '';
    //checking the map
    console.log('Map size: '+globalPower.IdMap.size); 
    for (let clavevalor of globalPower.IdMap.entries()) {
        console.log(clavevalor);
    }
    for (let i = 0; i < node.children.length; i++) {
        let value = getValue(node.children[i]);
        innerOutput += value.replace(/"/g , '') ;
        console.log('Must print: '+value);
    }
    globalPower.output += innerOutput.replace('\\n' , '\n')+ '\n';
    return globalPower.output;
}

function executeDeclaration(node ) {
    if (!(globalPower.IdMap instanceof Map)) {
        console.error("globalPower.IdMap must be a Map, instead got: " + typeof globalPower.IdMap);
        return;
    }
    if (node.children[0] === "var") { //case: "var" <id> "=" <value> ";"
        console.log('Declaration: '+node.children[0]);
        let id = node.children[1].type;
        let value = getValue(node.children[2] );
        let type = node.children[2].type;
        globalPower.IdMap.set(id, { type, value }); //add the variable to the map; the id is the key to an object with the type and the value
        
    } else if (node.children.length === 2) {    //case: <type> <value> ";"
        let type = node.children[0];
        let id = node.children[1].type;
        let value = "null";
        globalPower.IdMap.set(id, { type, value }); 
        //add the variable to the map; the id is the key to an object with the type and the value
    } else {                            //case: <type> <id> "=" <value> ";"
        let type = node.children[0];
        let id = node.children[1].type;
        let type2 = node.children[2].type;
        let value = getValue(node.children[2] );
        if (type !== type2 && !(type === 'float' && type2 === 'int')) { // Verify if the types are the same or if the type is float and the type1 is int
            console.log("Error: Type mismatch: " + type + " !== " + type2);
        }
        globalPower.IdMap.set(id, { type, value }); 
        //add the variable to the map; the id is the key to an object with the type and the value
    }
    console.log(globalPower.IdMap);
    return globalPower.IdMap;
}

function executeAssignment(node ) {
    let id = node.children[0].value;
    let value = getValue(node.children[1] );
    let type = node.children[1].type;

    if (globalPower.IdMap.get(id) !== undefined) {
        if (type !== globalPower.IdMap.get(id) && !(globalPower.IdMap.get(id) === 'float' && type === 'int')) {
            console.log("Error: Type mismatch: " + globalPower.IdMap.get(id).type + " !== " + type);
            return;
        }
    } else {
        console.log("Error: Variable " + id + " is not declared.");
        return;
    }

    globalPower.IdMap.set(id, { type, value });
    console.log(globalPower.IdMap);
    return globalPower.IdMap;
}


function executeIf(node ) {
    //first child is the condition, 
    //second child is the code block
    //the next blocks are the else ifs
    let condition = getValue(node.children[0] );
    if (condition == 'true') {
        let sentences = node.children[1].children;
        for (let i = 0; i < sentences.length; i++) {
            let sentence = sentences[i];
            if (sentence.type === 'break' || sentence.value === 'break') {
                node.value = 'break';
                break;
            }
            else if (sentence.type === 'continue' || sentence.value === 'continue') {
                node.value = 'continue';
                break;
            } else {
                synthesis.executeSentence(sentence );
            }
        }
        return getValue(node.children[1] );
    } else {
        //else ifs
        for (let i = 2; i < node.children.length; i++) {
            let elseNode = node.children[i];
            if (elseNode.type === 'else if') {
                let condition = getValue(elseNode.children[0] );
                if (condition == 'true') {
                    let sentences = elseNode.children[1].children;
                    for (let j = 0; j < sentences.length; j++) {
                        let sentence = sentences[j];
                        if (sentence.type === 'break' || sentence.value === 'break') {
                            node.value = 'break';
                            break;
                        }
                        else if (sentence.type === 'continue' || sentence.value === 'continue') {
                            node.value = 'continue';
                            break;
                        } else {
                            synthesis.executeSentence(sentence );
                        }
                    }
                    return getValue(elseNode.children[1] );
                } else {
                    continue;
                }
            } else {
                let sentences = elseNode.children[0].children;
                for (let j = 0; j < sentences.length; j++) {
                    let sentence = sentences[j];
                    if (sentence.type === 'break' || sentence.value === 'break') {
                        node.value = 'break';
                        break;
                    }
                    else if (sentence.type === 'continue' || sentence.value === 'continue') {
                        node.value = 'continue';
                        break;
                    } else if (sentence.type === 'return') {
                        node.type = 'return';
                        if (sentence.children[0] !== null) {
                            node.value = getValue(sentence.children[0] );
                            return getValue(sentence.children[0] );
                        }
                        break;
                    } else {
                        synthesis.executeSentence(sentence );
                    }
                }
            }
        }
        return getValue(node.children[2] );
    }
}

function executeSwitch(node ) {
    //first child is the value to compare, 
    //the other children are the cases and the default (if there is one)
    let val = getValue(node.children[0] );
    for (let i = 1; i < node.children.length; i++) {
        let caseNode = node.children[i];
        //first child is the value to compare,
        //the other children are the sentences
        if (caseNode.type === 'case') {
            let caseVal = getValue(caseNode.children[0] );
            if (val === caseVal) {
                let sentences = caseNode.children;
                for (let j = 1; j < sentences.length; j++) {
                    let sentence = sentences[j];
                    if (sentence.type === 'break' || sentence.value === 'break') {
                        node.value = 'break';
                        break;
                    } else if (sentence.type === 'return') {
                        node.type = 'return';
                        if (sentence.children[0] !== null) {
                            node.value = getValue(sentence.children[0] );
                            return getValue(sentence.children[0] );
                        }
                        break;
                    } else {
                        synthesis.executeSentence(sentence );
                    }
                }
            }
        } else if (caseNode.type === 'default') {
            //the children are the sentences
            let sentences = caseNode.children;
            for (let j = 0; j < sentences.length; j++) {
                let sentence = sentences[j];
                if (sentence.type === 'break' || sentence.value === 'break') {
                    node.value = 'break';
                    break;
                } else if (sentence.type === 'return') {
                    node.type = 'return';
                    if (sentence.children[0] !== null) {
                        node.value = getValue(sentence.children[0] );
                        return getValue(sentence.children[0] );
                    }
                    break;
                } else {
                    synthesis.executeSentence(sentence );
                }
            }
            return getValue(caseNode.children[0] );
        }
    }
}

function executeWhile(node ) {
    //first child is the condition, 
    //second child is the code block
    let condition = getValue(node.children[0] );
    while (condition == 'true') {
        let sentences = node.children[1].children;
        for (let i = 0; i < sentences.length; i++) {
            let sentence = sentences[i];
            if (sentence.type === 'break' || sentence.value === 'break') {
                //node.value = 'break';
                break;
            }
            else if (sentence.type === 'continue'|| sentence.value === 'continue') {
                //node.value = 'continue';
                continue;
            } else if (sentence.type === 'return') {
                //node.type = 'return';
                if (sentence.children[0] !== null) {
                    node.value = getValue(sentence.children[0] );
                    return getValue(sentence.children[0] );
                }
                break;
            } else {
                synthesis.executeSentence(sentence );
            }
        }
        condition = getValue(node.children[0] );
    }
}

function executeFor(node ) {
    //first child is the declaration, 
    //second child is the condition,
    //third child is the assignation,
    //fourth child is the code block
    executeDeclaration(node.children[0] );
    let condition = getValue(node.children[1] );
    while (condition == 'true') {
        let sentences = node.children[3].children;
        for (let i = 0; i < sentences.length; i++) {
            let sentence = sentences[i];
            if (sentence.type === 'break' || sentence.value === 'break' || sentences[i-1].value === 'break') {
                node.value = 'break';
                break;
            }
            else if (sentence.type === 'continue'|| sentence.value === 'continue' || sentences[i-1].value === 'continue') {
                node.value = 'continue';
                continue;
            } else if (sentence.type === 'return') {
                node.type = 'return';
                if (sentence.children[0] !== null) {
                    node.value = getValue(sentence.children[0] );
                    return getValue(sentence.children[0] );
                }
                break;
            } else {
                synthesis.executeSentence(sentence );
            }
        }
        executeAssignation(node.children[2] );
        condition = getValue(node.children[1] );
    }
}

function executeFunction (node ) {
    //first child is the id, 
    //second child is the parameters,
    //third child is the code block
    let id = node.children[0].value;
    let parameters = node.children[1];
    let codeBlock = node.children[2];
    //globalPower.IdMap[id] = {parameters, codeBlock};
}

export{
    executePrint,
    executeDeclaration,
    executeAssignment,
    executeIf,
    executeSwitch,
    executeWhile,
    executeFor,
    executeFunction
}