import { parse } from "./parser/parser.js";
import {executeSentences} from "./synthesis/synthesis.js";
import {Synthesis} from "./synthesis/synthesis.js";

const input = document.getElementById("code");
const salida = document.getElementById("console");
//const ast = document.getElementById("ast");

document.getElementById("console").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const texto = input.value;
    const resultado = parse(texto);
    console.log(resultado);
    resultado.execute();
    salida.innerHTML = "Resultado: " + resultado;
  }
});

execute.addEventListener("click", () => {

  const interpreter = new Synthesis();
  interpreter.resetIdMap();
  interpreter.resetOutput();
  
  const code = input.value;
  const tree =  parse(code);
  console.log(tree);
  interpreter.addAst(tree);

  interpreter.execute();
  //salida.innerHTML = JSON.stringify(tree, null, 2);
  salida.innerHTML = interpreter.getOutput();
});