class Fact {
  constructor(id, name, type, possibleValues) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.possibleValues = possibleValues;
  }

  // Você pode adicionar métodos para validar um input, por exemplo:
  isValid(value) {
    return this.possibleValues.includes(value);
  }
}

module.exports = Fact;
