{
	class NodeBase {
		constructor(type){
			this.type = type;
			this.value = null;
			this.children = [];
		}
	}

	class NodeID extends NodeBase {
		constructor(type){
			super(type);
			this.line = 0;
			this.column = 0;
		}
	}

	const createNode = (type, children) => {
		// return {
		// 	type,
		// 	children
		// };
		//const node = new type(props);

		const node = new NodeBase(type);
		node.children = children;

		return node;
	};

	const createNodeVar = (type, value) => {
		const node = new NodeBase(type);
		node.value = value;

		return node;
	};

	const createNodeID = (line, column, type)=>{
		const node = new NodeID(type);
		node.line = line;
		node.column = column;

		return node;
	};

}

start = sens:sentences {return createNode("Entry", sens)}

sentences = sentence:sentence sentences:sentences { return [sentence].concat(sentences); }
	/sentence:sentence _ (coments)?  { return sentence; }
    /_ {return []}

sentence =  instruc
			/sentenceIf
			/sentenceWhile 
            / sentenceSwitch 
            / sentenceFor 
			/sentenceT
			/ print
            /coments {return []}
 
//Transfer sentences
sentenceT = _"continue"_";"				{return createNodeVar("continue", "continue");}
			/_"break"_";"				{return createNodeVar("break", "break");}
            
return = _"return"_";"				{return createNodeVar("return", "return");}
            /_"return"_ exp:exp _";"	{const node = createNode("return", [exp]); node.value = "return" ;return node;}

//Sentences Block
sentenceBlock = "{" sens:sentences "}" {return createNode("sentences", sens);}

//Sentence If-Else
sentenceIf =  _ "if" _"("_ cond:exp _")"_ sentences:sentenceBlock senIfE:sentenceIfElse 
					{return createNode("if",[cond, sentences].concat(senIfE));}
            /_ "if" _"("_ cond:exp _")"_ sens:sentenceBlock 
					{return createNode("if",[cond, sens]);}
             
sentenceIfElse = sentenceElse
				/ _ "else"_ "if" _"("_ cond:exp _")"_ sentences:sentenceBlock senIfE:sentenceIfElse
					{return [createNode("else if",[cond,sentences])].concat(senIfE)  ;}
				/ _ "else"_ "if" _"("_ cond:exp _")"_ sentences:sentenceBlock		
					{return createNode("else if",[cond].concat(sentences));}
                    
sentenceElse = _ "else" _ sentences:sentenceBlock {return createNode("else", [sentences]);}

//Sentence While
sentenceWhile = _ "while" _"("_ cond:exp _")"_ sens:sentenceBlock {return createNode("while", [cond, sens]);}

//Sentence Switch case
sentenceSwitch = _ "switch" _ "("_ exp:exp _")" _ "{" sC:sentenceCase "}" 
					{return createNode("switch",[exp].concat(sC));}
                    
sentenceCase = _ "case" _ exp:exp _ ":" _ sens:sentences sC:sentenceCase
					{return [createNode("case",[exp,sens])].concat(sC);}
            / _ "case" _ exp:exp _ ":" sens:sentences
					{return createNode("case",[exp, sens]);}
			/_ "default:" _ sens:sentences 
					{return createNode("default",sens);}

//Sentence For
sentenceFor = _"for"_"("_ type:type _ element:id _":"_ array:id ")"_ sens:sentenceBlock 
			{return createNode("for_Array", [type, element, array, sens]);}
			/ _"for"_"("_ dec:(decl/assing)_ ";" _ cond:and _";"_ inc:(inc/assing) _")"_ sens:sentenceBlock
            {return createNode("for", [dec, cond, inc, sens]);}

// Instruccions
instruc = i:(arrayDecl /  inc  / assing/ decl) _ ";" {return i;}

//Incre
inc "Incremental" = _ id:id _ inc:("+="/"-=")_ exp:exp
						{return createNode(inc , [id, exp]);} // id.getValue() + exp.getValue()
            		/ _ id:id _ inc:("++"/"--") 	
            			{return createNode(inc, id);}
    
//Declaration 
decl = type:type id:id _ "=" exp:exp 	{ return createNode("declaration", [type, id, exp]); }
    /type:type id:id 					{ return createNode("declaration", [type, id]); }
	/ _ "var" _ id:id _ "=" exp:exp 	{ return createNode("declaration", ["var", id, exp]); }
    /inc
    
// Assignment
assing = _ id:id _ "=" exp:exp { return createNode("assign", [id, exp]); }

// valor
exp = op3/ logical 
//Logical 
logical = and 

and = left:or "||" right:and { return createNode("||", [left, right]); }
	/or

or = left:not "&&" right:or { return createNode("&&", [left, right]); }
	/not

not = _"!" right:not 		{ return createNode("!", [right]); }
	/equal

// Comparison operation
//Igualdad
equal = left:relational _ op:("=="/"!=") _ right:equal { return createNode(op, [left, right]); }
	/ relational
        
//Relational
relational = left:sum _ op:(">="/"<="/">"/"<")_ right:relational { return createNode(op, [left, right]); }
	/ sum        
        
// Arithmetic operations
sum = left:mul op:("+" / "-") right:sum
	{ return createNode(op, [left, right]); } 
    / mul
    
mul = left:mod op:("*" / "/") right:mul
	{return createNode(op, [left, right]); }
/ mod

mod = left:neg op:"%" right:mod
	{ return createNode(op, [left, right]); }
/ neg

neg = _"-"_ right:neg
		{ return createNode("-", [right]); } 
		/ ntF:nativeFunction 	{return ntF;}
        /_ terminal:term _	{return terminal;}
        
term =  decimal:float 	{return createNodeVar("float", decimal);} //{ return parseFloat(decimal); } 
	/ num:entero 		{return createNodeVar("int", num);}	//{ return parseInt(num); } 
	/ b:boolean 		{return createNodeVar("boolean", b);} //{ return b; }
    / s:string 			{return createNodeVar("string", s);} //{ return s; }
    / c:char			{return createNodeVar("char", c);} //{ return c; }
	/ val:id 			
    / "(" num:exp ")"_ 	{return num}
    / val:id ("["_ num:exp _"]")+ {return createNodeVar("Array", text());}

type = _ type:("int"/"float"/"char"/"boolean"/"string") _ {return type;}

nativeFunction = _ "parseInt(" _ str:exp _ ")"  	{return createNode("parseInt", [str]);}
				/ _ "parseFloat(" _ str:exp _ ")" 	{return createNode("parseFloat", [str]);}
				/ _ "toString(" _ exp:exp _ ")"  		{return createNode("toString", [exp]);}
				/  _ "toLowerCase(" _ exp:exp _ ")"  	{return createNode("toLowerCase",[exp]);}
				/ _ "toUpperCase(" _ exp:exp _ ")"  	{return createNode("toUpperCase", [exp]);}
				/ _ "typeof" _ exp:exp _ 			{return createNode("typeof",[exp]);}
    
//Operador 3
op3 = _ cond:and _ "?" _ expT:exp _ ":" _ expF:exp  
		{return createNode("op3", [cond, expT, expF]);} // if(cond.getvalue()) {op3.value=expF} else{op3.value=expF}

//Sentence Print
print = _ "System.out.println(" list:listcons ")" _ ";" {return createNode("print", [list]);}

listcons = listelement:exp "," listcons:listcons {return [listelement].concat(listcons);}
	/ listelement:exp 								{return listelement}
 
//Arrays
arrayDecl =  id:arrayCons _ "="_ Aexp:arrayExp { return createNode("Array_declaration", [ id, Aexp]); }

arrayCons = type:type _ cor:("[]")+ _ id:id { return createNode("ID", [ type, cor, id ]); }
arrayExp = "new" _ type:type _ ("["_ intg:entero _"]")+ {return createNode("new", [type, intg]);}
	/ id
	/ "{" _ list:listcons _ "}"  { return createNode("list", list); }
    
//Void
void = _ "void" _ id:id _ "("_")" sens:sentencesVoid {return createNode("void", sens.concat(re));}

sentencesVoid = _"{"_ sens:sentences re:return (sentences)? "}"_{return createNode("sentences", sens.concat(re));}
				/sentenceBlock 

_ "Whitespace" = [ \t\n\r]*
entero = int:[0-9]+  						{return text()}
float "Float" = [0-9]+"."([0-9]+)?  			{return text()}
boolean =  bool:("true"/ "false") 			{return bool}
string "String" = "\"" a:([^"]/escapes)*"\"" 	{return text()}
char "char" =  "'"[^']"'"_ 					{return text()}
id "ID" = val:(!reserved [A-Za-z]["_"A-Za-z0-9]*) 		{return createNodeID(location()?.start.line, location()?.start.column, text());}

reserved = type / "if" / "else" /"switch" / "case" /"for"

coments"Comments" = _ "/*" (!"*/" .)* "*/"
			/ _"//" ([^(\n)])* "\n"

escapes =_ "\\" ("n" / "t" / '"' / "\\") _ ;

//{console.log("Analizando la sitaxis");}