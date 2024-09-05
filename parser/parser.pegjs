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

start = sentences

sentences = sentence:sentence sentences:sentences { return [sentence].concat(sentences); }
	/sentence _

sentence = coments {return []}
			/instruc 
			/sentenceIf
			/sentenceWhile 
            / sentenceSwitch 
            / sentenceFor 
            / sentenceT
            / print
 
//Transfer sentences
sentenceT = _"continue"_";"				{return createNodeVar("continue", "continue");}
			/_"break"_";"				{return createNodeVar("break", "break");}
			/_"return"_";"				{return createNode("return", "return");}
            /_"return"_ exp:exp _";"	{const node = createNode("return", [exp]); node.value = "return" ;return node;}

//Sentences Block
sentenceBlock = "{" sens:sentences "}" {return createNode("sentences", sens);}

//Sentence If-Else
sentenceIf =  _ "if" _"("_ cond:exp _")"_ sentences:sentenceBlock senIfE:sentenceIfElse 
					{return createNode("if",[sentences].concat(senIfE));}
            /_ "if" _"("_ cond:exp _")"_ sens:sentenceBlock 
					{return createNode("if",[cond, sens]);}
             
sentenceIfElse = sentenceElse
				/ _ "else"_ "if" _"("_ cond:exp _")"_ sentences:sentenceBlock senIfE:sentenceIfElse
					{return createNode("else if",[cond, [sentences].concat(senIfE)]);}
				/ _ "else"_ "if" _"("_ cond:exp _")"_ sentences:sentenceBlock		
					{return createNode("else if",[cond, sentences]);}
                    
sentenceElse = _ "else" _ sentences:sentenceBlock {return createNode("else", [sentences]);}

//Sentence While
sentenceWhile = _ "while" _"("_ cond:exp _")"_ sens:sentenceBlock {return createNode("while", [cond, sens]);}

//Sentence Switch case
sentenceSwitch = _ "switch" _ "("_ exp:exp _")" _ "{" sC:sentenceCase "}" 
					{return createNode("switch",[exp, sC]);}
sentenceCase = _ "default:" _ sens:sentences
            / _ "case" _ exp:exp _ ":" _ sens:sentences sC:sentenceCase
			/_ "case" _ exp:exp _ ":" sens:sentences

//Sentence For
sentenceFor = _"for"_"("_ type _ element:id _":"_ array:id ")"_ sens:sentenceBlock
			/ _"for"_"("_ dec:(dec/assing)_ ";" _ cond:and _";"_ inc:inc _")"_ sens:sentenceBlock

//Incre
inc "Incremental" =  id:id _ "++" 			 {return createNode("++", id);}
	/ id:id _ "--"		 {return createNode("--", id);}
    /  id:id _ "+="_ exp:exp 	 {return createNode("+=", [id, exp]);} // id.getValue() + exp.getValue()
    /  id:id _ "-="_ exp:exp 	 {return createNode("-=", [id, exp]);}
    
// Instruccions
instruc = (arrayDecl/ dec _ ";"/ assing _ ";"/ inc _ ";")

//Declaration 
dec = type:type id:id 					{ return createNode("declaration", [id]); }
    /type:type id:id "=" exp:exp 	{ return createNode("declaration", [type, id, exp]); }
	/_ "var" _ id:id "=" exp:exp 	{ return createNode("declaration", ["var", id, exp]); }
    
// Assign
assing = _ id:id "=" exp:exp { return createNode("assign", [id, exp]); }

// valor
exp = logical / op3
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
equal = left:operand _ op:("=="/"!=") _ right:equal { return createNode(op, [left, right]); }
	/ operand

operand = _"(" exp:exp ")"_ { return exp; }
        / relational
        
//Relational
relational = left:comp _ op:(">="/"<="/">"/"<")_ right:relational { return createNode(op, [left, right]); }
	/ comp

comp =  _"(" exp:exp ")"_ 	{ return exp; }
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

neg = _"-"_ right:exp
		{ return createNode("-", [right]); } 
		/ ntF:nativeFunction 	{return ntF;}
        /_ terminal:term 	{return terminal;}
        
term =  decimal:float 	{return createNodeVar("float", decimal);} //{ return parseFloat(decimal); } 
	/ num:entero 		{return createNodeVar("int", num);}	//{ return parseInt(num); } 
	/ b:boolean 		{return createNodeVar("boolean", b);} //{ return b; }
    / s:string 			{return createNodeVar("string", s);} //{ return s; }
    / c:char			{return createNodeVar("char", c);} //{ return c; }
	/ val:id 			{return createNodeID(location()?.start.line, location()?.start.column, val);}
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
op3 = _ cond:and _ "?" _ expT:exp _ ":" _ expF:exp _ ";" {return createNode("op3", [cond, expT, expF]);} // if(cond.getvalue()) {op3.value=expF} else{op3.value=expF}

//Sentence Print
print = _ "System.out.println(" list:listcons ")" _ ";" {return createNode("print", [list]);}

listcons = listelement:exp "," listcons:listcons {return [listelement].concat(listcons);}
	/ listelement:exp 								{return listelement}
 
//Arrays
arrayDecl =  arrayCons _ "="_ arrayExp _ ";"

arrayCons = type _("[]")+ _ id 
arrayExp = "new" _ type _ ("["_ entero _"]")+
	/ id
	/ "{" _ list:listcons _ "}"  
    
_ "Whitespace" = [ \t\n\r]*
entero = _ int:[0-9]+ _ {return text()}
float "Float" = _ [0-9]+("."[0-9]+)? _ {return text()}
boolean =  _ bool:("true"/ "false")_ {return bool}
string "String" = _"\"" ([^"]/escapes)*"\""_ {return text()}
char "char" = _  "'"[^']"'"_ {return text()}
id "ID" = !reserved [A-Za-z][A-Za-z0-9]* _ {return text()}

reserved = type / "if" / "else" /"switch" / "case" /"for"

coments"Comments" = _"//" ([^(\n)])* "\n"
			/ _ "/*" [^(*/)]* "*/" {}

escapes =_ "\\" ("n" / "t" / '"' / "\\") _ ;

//{console.log("Analizando la sitaxis");}