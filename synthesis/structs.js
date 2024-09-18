import { getValue } from './synthesis.js' ;
//import { executeSentence } from './synthesis.js' ;
import {globalPower} from './synthesis.js' ;


function executeStructPrototype(node){
    //value is the name of the struct
    const structName = node.value;
    //the children are the attributes of the struct
    const attributes = node.children;
    for(let i = 0; i < attributes.length; i++){
        globalPower.Prototypes.set(structName+'.'+attributes[i].id, attributes[i].type);
    }
}

function executeStructDec(node){
    //first child is the id of the struct
    const id = node.children[0].type;
    //second child is the type of struct and it children are the attributes
    const structType = node.children[1].value;
    const attributes = node.children[1].children;
    //let struct = new Map();
    for(let i = 0; i < attributes.length; i++){
        let atributeName = attributes[i].type;
        console.log('Atribute: '+attributes[i]);
        let atributeValue = getValue(attributes[i].children[0]);
        //It is important doing getValue first because
        // this function set the type of the node
        let atributeType = attributes[i].children[0].value;
        //struct.set(attributes[i].id, getValue(attributes[i].value)); <- Ignore this line
        //Saving the attributes in the IdMap by idStruct.idAtribute
        globalPower.IdMap.set(id+"."+atributeName, {type: atributeType, value: atributeValue});
    }
}

function executeStructAssing(node){
    //first child contains de acces (id) of the atribute
    let structAccess = node.children[0]
    let ids = structAccess.children; //ids is an array with the ids of the struct
    let key = '';
    for(let i = 0; i < ids.length; i++){
        key += ids[i].type;
        if(i < ids.length - 1){
            key += '.';
        }
    }
    //second child contains the value to assign
    let value = getValue(node.children[1]);
    let type = node.children[1].value;
    globalPower.IdMap.set(key, {type, value});
}


export  {
    executeStructPrototype,
    executeStructDec,
    executeStructAssing
}