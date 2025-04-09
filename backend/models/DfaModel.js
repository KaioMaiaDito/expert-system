// Um modelo simples para armazenar o estado da sessão do DFA
class DFASession {
  constructor() {
    this.reset();
  }

  reset() {
    this.factValues = {};
  }
}

module.exports = new DFASession();
