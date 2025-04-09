/*
   explanationService.js
   A service to explain which rules were triggered by the inference process.
   It provides human-readable explanations of the rules applied.
*/

const InferenceService = require('./inferenceService');

class ExplanationService {
  static getExplanations() {
    const triggeredRules = InferenceService.performInference();
    const explanations = triggeredRules.map(item => {
      return `Rule ${item.ruleId} was triggered because fact ${item.factId} ("${item.factDescription}") satisfied the condition leading to action: ${item.action}.`;
    });
    return explanations;
  }
}

module.exports = ExplanationService;
