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