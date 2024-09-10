const { exec } = require('child_process');
const synthesis = require('./synthesis.js');

executeDeclaration = (node, symbols) => {
    // const { id, type, value } = declaration;
    // symbols[id] = { type, value };  
    if(node.children[0] ==="var"){
        let id = node.children[1].value;
        let value = synthesis.getValue(node.children[2], symbols);
        let type = node.children[2].value;
        symbols[id] = { type, value };
    }else if (node.children.leght===2){
        //executeDeclaration(node.children[0], symbols)
        let type = node.children[0];
        let id = node.children[1].type;
        let value = "null";
        symbols[id] = { type, value };
    }else{
        let type1 = node.children[0];
        let id = node.children[1].type;
        let type = node.children[2].value;        
        let value = synthesis.getValue(node.children[2], symbols);
        if(type1 !== type && !(type==='int' && type1 =='float')){//Verify if the types are the same
            console.log("Error: Type mismatch: " + type1 + " !== " + type);
        }
        symbols[id] = { type1, value };

    }
    console.log(symbols);
}

executeAssignation = (node, symbols) => {
    let id = node.children[0].value;
    let value = synthesis.getValue(node.children[1], symbols);
    let type = node.children[1].value;
    if (synthesis.getValue(node.children[0], symbols) !== "null") {
        if (type !== symbols[id].type) {
            console.log("Error: Type mismatch: " + symbols[id].type + " !== " + type);
        }
    }
    symbols[id] = { type, value };
    console.log(symbols);
}

executePrint = (node, symbols) => {
    console = require('console');
    exit = '';
    for(let i = 0; i < node.children.length; i++){
        let value = synthesis.getValue(node.children[i], symbols);
        exit += value;
    }
    return exit;
}

executeIf = (node, symbols) => {
    //first child is the condition, 
    //second child is the code block
    //the next blocks are the else ifs
    let condition = synthesis.getValue(node.children[0], symbols);
    if (condition =='true') {
        sentences: node;
        sentences = node.children[1];
        for (let i = 0; i < sentences.length; i++) {
            let sentence = sentences[i];
            if (sentence.type === 'break' || sentence.value === 'break') {
                node.value = 'break';
                break;
            }
            else if (sentence.type === 'continue'|| sentence.value === 'continue') {
                node.value = 'continue';
                break;
            }else{
                synthesis.executeSentence(sentence, symbols);
            }
        }
        return synthesis.getValue(node.children[1], symbols);
    } else {
        //else ifs
        for (let i = 2; i < sentences.length; i++) {
            elseNode = sentences[i];
            if(elseNode.type === 'else if'){
                let condition = synthesis.getValue(elseNode.children[0], symbols);
                if (condition == 'true') {
                    sentences = elseNode.children[1].children;
                    for (let i = 0; i < sentences.length; i++) {
                        let sentence = sentences[i];
                        if (sentence.type === 'break' || sentence.value === 'break') {
                            node.value = 'break';
                            break;
                        }
                        else if (sentence.type === 'continue'|| sentence.value === 'continue') {
                            node.value = 'continue';
                            break;
                        }else{
                            synthesis.executeSentence(sentence, symbols);
                        }
                    }
                    return synthesis.getValue(elseNode.children[1], symbols);
                }else{
                    continue;
                }
            }else{
                sentences = elseNode.children[0].children;
                    for (let i = 0; i < sentences.length; i++) {
                        let sentence = sentences[i];
                        if (sentence.type === 'break' || sentence.value === 'break') {
                            node.value = 'break';
                            break;
                        }
                        else if (sentence.type === 'continue'|| sentence.value === 'continue') {
                            node.value = 'continue';
                            break;
                        }else if (sentence.type === 'return') {
                            node.type = 'return';
                            if (sentence.children[0] !== null) {
                                node.value = synthesis.getValue(sentence.children[0], symbols);
                                return synthesis.getValue(sentence.children[0], symbols);
                            }
                            break;
                        }else{
                            synthesis.executeSentence(sentence, symbols);
                        }
                    }
            }
        }
        return synthesis.getValue(node.children[2], symbols);
    }
}

executeSwitch = (node, symbols) => {
    //first child is the value to compare, 
    //the other children are the cases and the default (if there is one)
    let val = synthesis.getValue(node.children[0], symbols);
    for (let i=1 ; i<node.children.length; i++){
        let caseNode = node.children[i];
        //first child is the value to compare,
        //the other children are the sentences
        if(caseNode.type === 'case'){
            let caseVal = synthesis.getValue(caseNode.children[0], symbols);
            if (val === caseVal){
                let sentences = caseNode.children;
                for (let i = 1; i < sentences.length; i++) {
                    let sentence = sentences[i];
                    if (sentence.type === 'break' || sentence.value === 'break') {
                        node.value = 'break';
                        break;                    
                    }
                    
                    else if (sentence.type === 'return') {
                        node.type = 'return';
                        if (sentence.children[0] !== null) {
                            node.value = synthesis.getValue(sentence.children[0], symbols);
                            return synthesis.getValue(sentence.children[0], symbols);
                        }
                        break;
                    }else{
                        synthesis.executeSentence(sentence, symbols);
                    }
                }
                //let finalV = synthesis.getValue(caseNode.children[1], symbols);
            }
        }else if(caseNode.type === 'default'){
            //the children are the sentences
            let sentences = caseNode.children;
            for (let i = 0; i < sentences.length; i++) {
                let sentence = sentences[i];
                if (sentence.type === 'break' || sentence.value === 'break') {
                    node.value = 'break';
                    break;
                }                
                else if (sentence.type === 'return') {
                    node.type = 'return';
                    if (sentence.children[0] !== null) {
                        node.value = synthesis.getValue(sentence.children[0], symbols);
                        return synthesis.getValue(sentence.children[0], symbols);
                    }
                    break;
                }else{
                    synthesis.executeSentence(sentence, symbols);
                }
            }
            return synthesis.getValue(caseNode.children[0], symbols);
        }
        //return finalV;
    }
}

executeWhile = (node, symbols) => {
    //first child is the condition, 
    //second child is the code block
    let condition = synthesis.getValue(node.children[0], symbols);
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
            }else if (sentence.type === 'return') {
                //node.type = 'return';
                if (sentence.children[0] !== null) {
                    node.value = synthesis.getValue(sentence.children[0], symbols);
                    return synthesis.getValue(sentence.children[0], symbols);
                }
                break;
            }else{
                synthesis.executeSentence(sentence, symbols);
            }
        }
        condition = synthesis.getValue(node.children[0], symbols);
    }
}

executeFor = (node, symbols) => {
    //first child is the declaration, 
    //second child is the condition,
    //third child is the assignation,
    //fourth child is the code block
    executeDeclaration(node.children[0], symbols);
    let condition = synthesis.getValue(node.children[1], symbols);
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
            }else if (sentence.type === 'return') {
                node.type = 'return';
                if (sentence.children[0] !== null) {
                    node.value = synthesis.getValue(sentence.children[0], symbols);
                    return synthesis.getValue(sentence.children[0], symbols);
                }
                break;
            }else{
                synthesis.executeSentence(sentence, symbols);
            }
        }
        executeAssignation(node.children[2], symbols);
        condition = synthesis.getValue(node.children[1], symbols);
    }
}