/*
   rulesEngine.js
   A service to execute rules based on given facts.
   This is a basic rule engine simulation.
*/

const Fact = require('../models/Fact');
const Rule = require('../models/Rule');

class RulesEngine {
  /*
   Evaluates all rules against available facts and returns the evaluation results.
   For simplicity, it checks if the rule's condition string is found in any fact description.
  */
  static evaluateRules() {
    const facts = Fact.loadAll();
    const rules = Rule.loadAll();
    const evaluationResults = [];

    rules.forEach(rule => {
      // Find all facts that satisfy the condition.
      const applicableFacts = facts.filter(fact => fact.description.includes(rule.condition));
      if (applicableFacts.length > 0) {
        evaluationResults.push({
          ruleId: rule.id,
          ruleCondition: rule.condition,
          ruleAction: rule.action,
          matchingFacts: applicableFacts.map(fact => fact.id)
        });
      }
    });

    return evaluationResults;
  }
}

module.exports = RulesEngine;