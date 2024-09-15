import { executeSentences } from './synthesis.js';
import { getValue } from './synthesis.js' ;
import {globalPower} from './synthesis.js' ;

const defaultValuesMap = new Map([
    ['int', '0'],
    ['float', '0.0'],
    ['string', ''],
    ['boolean', 'false'],
    ['object', "null"]
]);


function getArrayValue(node){
    //first child is the name of the array
    const name = node.children[0].type;
    return globalPower.IdMap.get(name);
}

function executeArrayDec(node){
    //first child is the type and name of the array
    const init = node.children[0]; //init is the first child of the array declaration (I declare it for making it easier to read)
    const type = 'Array of '+init.children[0];
    const name = init.children[2].type;

    const array = [];

    const valueInfo = node.children[1]; 
    if(valueInfo.type === 'list'){  //if the array is initialized with a list
        //example: int[] numerosPares = {2, 4, 6, 8, 10};
        for(let i = 0; i < valueInfo.children.length; i++){
            array.push(getValue(valueInfo.children[i]));
        }
    } else if(valueInfo.type === 'new'){//if the array is initialized with the new keyword and a size
        //example: int[] numerosPares = new int[5];
        //first child is the type 
        //second child is the size 
        const size = getValue(valueInfo.children[1]);
        for(let i = 0; i < size; i++){
            //initialize the array with null values
            array.push(defaultValuesMap.get(init.children[0]));
        }
    } else {
        //example: int[] numerosPares = anotherArray;
        //initialize the array with null values
        array = getArrayValue(valueInfo).value;
    }
    globalPower.IdMap.set(name, {type: type, value: array});    //save the array in the IdMap

    for (let clavevalor of globalPower.IdMap.entries()) {
        console.log(clavevalor);
    }
}

function executeArrayAssign(node){
    //first child is the name of the array
    const name = node.children[0].type;
    console.log(name);
    const array = globalPower.IdMap.get(name).value;
    const type = globalPower.IdMap.get(name).type;

    //second child is the index
    const index = getValue(node.children[1]);
    //third child is the value
    const value = getValue(node.children[2]);

    array[index] = value;
    globalPower.IdMap.set(name, {type: type, value: array});    //save the array in the IdMap
}

function executeForEach(node){
    //first child is the type
    const type = node.children[0];
    //second child is the name of the variable
    const name = node.children[1].type;
    //third child is the array
    const array = getArrayValue(node.children[2]).value;
    //fourth child is the sentences bock
    const sentences = node.children[3];
    let i = 0;
    while( i < array.length){
        globalPower.IdMap.set(name, {type: type, value: array[i]});
        executeSentences(sentences); 
        i++;
    }
}

export {
    getArrayValue, 
    executeArrayDec,
    executeArrayAssign,
    executeForEach};