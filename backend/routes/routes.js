const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectsController');
const ruleController = require('../controllers/rulesController');
const factController = require('../controllers/factsController');
const responsibleController = require('../controllers/responsibleController');

// Project routes
router.get('/projects', projectController.getProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', projectController.createProject);
router.delete('/projects/:id', projectController.deleteProject);

// Rule routes
router.get('/rules', ruleController.getRules);
router.get('/rules/:id', ruleController.getRuleById);
router.post('/rules', ruleController.createRule);
router.delete('/rules/:id', ruleController.deleteRule);

// Fact routes
router.get('/facts', factController.getFacts);
router.get('/facts/:id', factController.getFactById);
router.post('/facts', factController.createFact);
router.delete('/facts/:id', factController.deleteFact);

// Responsible routes
router.get('/responsibles', responsibleController.getResponsibles);
router.get('/responsibles/:id', responsibleController.getResponsibleById);
router.post('/responsibles', responsibleController.createResponsible);
router.delete('/responsibles/:id', responsibleController.deleteResponsible);

module.exports = router;
