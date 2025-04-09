const fs = require('fs');
const path = require('path');

class DFASession {
  constructor() {
    this.reset();
  }

  reset() {
    this.factValues = {};
    // Armazena o fluxo linear do DFA.
    this.dfa = null;
  }
}

module.exports = new DFASession();
