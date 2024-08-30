{
	class NodeBase {
		constructor(text){
			this.text = text;
			this.value = null;
			this.children = [];
		}
	}

	class NodeID extends NodeBase {
		constructor(text){
			super(text);
			this.line = 0;
			this.column = 0;
		}
	}

	const createNode = (text, children) => {
		// return {
		// 	type,
		// 	children
		// };
		//const node = new type(props);

		const node = new NodeBase(text);
		node.children = children;

		return node;
	};

	const createNodeID = (line, column, text)=>{
		const node = new NodeID(text);
		node.line = line;
		node.column = column;

		return node;
	};

}

start = sentences

sentences = sentence:sentence sentences:sentences { return [sentence].concat(sentences); }
	/sentence

sentence = instruc _

// Instruccions
instruc = dec / assing

//Declaration 
dec = type:type id:id "=" exp:exp ";"	{ return createNode("declaration", [type, id, exp]); }
	/type:type id ";"					{ return createNode("declaration", [id, exp]); }
    /_ "var" _ id:id "=" exp:exp ";"	{ return createNode("declaration", ["var", id, exp]); }
// Assign
assing = _ id:id "=" exp:exp _ ";" 	{ return createNode("assign", [id, exp]); }

// valor
exp = logical
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

neg = _"-" right:exp
		{ return createNode("-", [left, right]); } 
        /_ terminal:term 	{return terminal;}
        
term =  decimal:float 	{return createNode(decimal, null);} //{ return parseFloat(decimal); } 
	/ num:entero 		{return createNode(num, null);}	//{ return parseInt(num); } 
	/ val:id 			{return createNodeID(location()?.start.line, location()?.start.column, val);}
    / s:string 			{return createNode(s, null);}
    / c:char			{return createNode(c, null);}
    / "(" num:exp ")"_ 	{return num}

type = _ type:("int"/"float"/"char"/"boolean"/"string") _ {return type;}

nativeFunction = _ "parseInt(" _ str:string _ ")" _ ";" {return createNode("parseInt", str);}
				/ _ "parseFloat(" _ str:string _ ")" _ ";" {return createNode("parseFloat", str);}
				/ _ "toString(" _ exp:exp _ ")" _ ";" {return createNode("toString", exp);}
				/  _ "toLowerCase(" _ exp:exp _ ")" _ ";" {return createNode("toLowerCase", exp);}
				/ _ "toUpperCase(" _ exp:exp _ ")" _ ";" {return createNode("toUpperCase", exp);}
				/ _ "typeof" _ exp:exp _ ";" {return createNode("typeof", exp);}
	  
print = _ "System.out.println(" (elements:listcons) ")" _ ";" {return createNode("print", elements);}

listcons = listelement:exp "," listcons:listcons {return [listelement].concat(listcons);}
	/ listelement:exp 


_ "Whitespace" = [ \t\n\r]*
entero = _ int:[0-9]+ _ {return text()}
float "Float" = _ [0-9]+("."[0-9]+)? _ {return text()}
boolean =  _("true"/ "false")_
string "String" = _"\"" ([^"]/escapes)*"\""_ {return text()}
char "char" = _  "'"[^']"'"_
id "ID" = [A-Za-z][A-Za-z0-9]* _ {return text()}

escapes =_ "\\" ("n" / "t" / '"' / "\\") _;