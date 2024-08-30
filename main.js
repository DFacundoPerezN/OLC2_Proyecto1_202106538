import { parse } from "./parser/parser.js";

const input = document.getElementById("code");
const salida = document.getElementById("console");
const ast = document.getElementById("ast");

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
  const code = input.value;
  const tree =  parse(code);
  salida.innerHTML = tree;
});