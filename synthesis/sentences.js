//const { exec } = require('child_process');
//const {synthesis} = require('./synthesis.js');
import { getValue } from './synthesis.js' ;
import { executeSentence } from './synthesis.js' ;
import {globalPower, addSymbol} from './synthesis.js' ;


function executePrint(node) {
    let innerOutput = '';
    //checking the map
    console.log('Map size: '+globalPower.IdMap.size); 
    for (let clavevalor of globalPower.IdMap.entries()) {
        console.log(clavevalor);
    }
    for (let i = 0; i < node.children.length; i++) {
        let value = getValue(node.children[i]);
        //console.log('type of value: '+ typeof value);
        console.log('value: '+ JSON.stringify(value, null, 2));
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
    let id = node.children[1].type;
    let type = node.children[0];
    if (node.children[0] === "var") { //case: "var" <id> "=" <value> ";"
        console.log('Declaration: '+node.children[0]);
        //let id = node.children[1].type;
        let value = getValue(node.children[2] );
        type = node.children[2].type;
        globalPower.IdMap.set(id, { type, value }); //add the variable to the map; the id is the key to an object with the type and the value
        
    } else if (node.children.length === 2) {    //case: <type> <value> ";"
        //let type = node.children[0];
        //let id = node.children[1].type;
        let value = "null";
        globalPower.IdMap.set(id, { type, value }); 
        //add the variable to the map; the id is the key to an object with the type and the value
    } else {                            //case: <type> <id> "=" <value> ";"
        //let type = node.children[0];
        //let id = node.children[1].type;
        let type2 = node.children[2].type;
        let value = getValue(node.children[2] );
        if (type !== type2 && !(type === 'float' && type2 === 'int')) { // Verify if the types are the same or if the type is float and the type1 is int
            console.log("Error: Type mismatch: " + type + " !== " + type2);
        }
        globalPower.IdMap.set(id, { type, value }); 
        //add the variable to the map; the id is the key to an object with the type and the value
    }
    addSymbol(id, type, 'variable', node.children[1].line, node.children[1].column);
    console.log(globalPower.IdMap);
    return globalPower.IdMap;
}

function executeAssignment(node ) {
    let id = node.children[0].type;
    let value = getValue(node.children[1] );
    let type = node.children[1].type;

    if (globalPower.IdMap.get(id) !== undefined) {
        if (type !== globalPower.IdMap.get(id).type && !(globalPower.IdMap.get(id) === 'float' && type === 'int')) {
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


function executeIf(node) {
    //first child is the condition, 
    //second child is the code block
    //the next blocks are the else ifs
    let condition = getValue(node.children[0] );
    if (condition == 'true') {
        let sentences = node.children[1].children;
        //console.log('Sentences in If: '+JSON.stringify(sentences, null, 2));
        for (let i = 0; i < sentences.length; i++) {
            let sentence = sentences[i];
            //console.log('Sentence Type: '+sentence.type + '; Value: '+sentence.value);
            if (sentence.type === 'break' || sentence.value === 'break') {
                node.value = 'break';
                console.log('Break in If ' + node.value);
                break;
            }
            else if (sentence.type === 'continue' || sentence.value === 'continue') {
                node.value = 'continue';
                break;
            } else {
                executeSentence(sentence);
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
                            node.type = 'break';
                            break;
                        }
                        else if (sentence.type === 'continue' || sentence.value === 'continue') {
                            node.value = 'continue';
                            break;
                        } else {
                            executeSentence(sentence );
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
                        node.type = 'break';
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
                        executeSentence(sentence );
                    }
                }
            }
        }
    }
}

function executeSwitch(node ) {
    //first child is the value to compare, 
    //the other children are the cases and the default (if there is one)
    let val = getValue(node.children[0]);
    let aproved = false; //to check if a case was aproved
    for (let i = 1; i < node.children.length; i++) {
        let caseNode = node.children[i];
        //if it is a case
        if (caseNode.type === 'case') {
            //the first child is the value to compare
            let caseVal = getValue(caseNode.children[0]);
            console.log('Comparing: '+val+ ' with '+caseVal);
            if (val === caseVal || aproved) {
                aproved = true;
                //console.log('Matched '+val+ ' with '+caseVal);
                //the second child is the list of sentences
                let sentences = caseNode.children[1];
                console.log('Sentences: '+JSON.stringify(sentences, null, 2));
                for (let j = 0; j < sentences.length; j++) {
                    let sentence = sentences[j];
                    if (sentence.type === 'break' || sentence.value === 'break') {
                        aproved = false;
                        i = node.children.length; //to break the loop
                        console.log('Break');
                        node.value = 'break';
                        break;
                    } else if (sentence.type === 'return') {
                        console.log('return');
                        node.type = 'return';
                        if (sentence.children[0] !== null) {
                            node.value = getValue(sentence.children[0] );
                            return getValue(sentence.children[0] );
                        }
                        break;
                    } else {
                        executeSentence(sentence );
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
                    executeSentence(sentence );
                }
            }
            return getValue(caseNode.children[0] );
        }
    }
}

function deepClone(obj) {
    return Array.isArray(obj) 
        ? obj.map(deepClone)
        : obj !== null && typeof obj === 'object'
        ? Object.keys(obj).reduce((acc, key) => {
            acc[key] = deepClone(obj[key]);
            return acc;
          }, {})
        : obj;
}

function executeWhile(node) {
    //first child is the condition, 
    //second child is the code block
    let Nodecondition = deepClone(node.children[0]);  // Clone the condition node to not modify;
    let Nodeblock = deepClone(node.children[1]);  // Clone the block node to not modify;
    let condition = getValue(Nodecondition);
    while (condition == 'true') {
        Nodecondition = deepClone(node.children[0]);  // Reset the condition node to not modify;
        Nodeblock = deepClone(node.children[1]);
        //console.log("Sentences : " +JSON.stringify(sentences, null, 2));
        let sentences = Nodeblock.children;
        for (let i = 0; i < sentences.length; i++) {
            let sentence = sentences[i];            
            //console.log('Sentence Type: '+sentence.type + '; Value: '+sentence.value);
            if (sentence.type === 'return') {
                //node.type = 'return';
                if (sentence.children[0] !== null) {
                    node.value = getValue(Nodecondition );
                    return node.value;
                }
                return;
            } else {
                executeSentence(sentence);
                console.log("Sentence After execute: " +JSON.stringify(sentence, null, 2));
                console.log('Sentence value: '+sentence.value);
                if (sentence.value == 'break') {
                    console.log('Break in While');
                    condition = 'false';
                    return;
                }
                else if (sentence.value == 'continue') {
                    console.log('Continue in While');
                    break;
                }
            }
        }
        
        console.log('conditionNode operator: '+Nodecondition.type);
        condition = getValue(Nodecondition);
    }
}

function executeFor(node ) {
    //first child is the declaration, 
    //second child is the condition,
    //third child is the assignation,
    //fourth child is the code block
    executeDeclaration(node.children[0]);
    let Nodecondition = deepClone(node.children[1]);  // Clone the condition node to not modify;
    let condition = getValue(Nodecondition);
    let NodeInc = deepClone(node.children[2]);  // Clone the increment node to not modify;
    let Nodeblock = deepClone(node.children[3]);  // Clone the block node to not modify;
    while (condition == 'true') {
        Nodecondition = deepClone(node.children[1]);  // Reset the condition node to not modify;
        Nodeblock = deepClone(node.children[3]);
        let sentences = Nodeblock.children;
        for (let i = 0; i < sentences.length; i++) {
            let sentence = sentences[i];
            if (sentence.type === 'return') {
                node.type = 'return';
                if (sentence.children[0] !== null) {
                    node.value = getValue(sentence.children[0] );
                    return getValue(sentence.children[0] );
                }
                break;
            } else {
                executeSentence(sentence);
                console.log("Sentence After execute: " +JSON.stringify(sentence, null, 2));
                console.log('Sentence value: '+sentence.value);
                if (sentence.value == 'break') {
                    console.log('Break in While');
                    condition = 'false';
                    return;
                }
                else if (sentence.value == 'continue') {
                    console.log('Continue in While');
                    break;
                }
            }
        }
        NodeInc = deepClone(node.children[2]);  // Reset the increment node to not modify;
        executeAssignment(NodeInc);
        condition = getValue(Nodecondition);
    }
}



export{
    executePrint,
    executeDeclaration,
    executeAssignment,
    executeIf,
    executeSwitch,
    executeWhile,
    executeFor,
    deepClone
}