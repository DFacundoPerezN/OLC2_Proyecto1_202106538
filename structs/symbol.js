class Symbol_s {
  constructor(id, type_symbol, type_var, line, column, ambit) {
    this.id = id;
    this.type_symbol = type_symbol;
    this.type_var = type_var;
    this.line = line;
    this.column = column;
    this.ambit = ambit;
    this.value = null;
  }
}

export default Symbol_s;