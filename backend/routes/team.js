const express = require('express');

const teamControllers = require('../controllers/team');

const router = express.Router();

router.get('', teamControllers.getAllTeams);

router.get('/:id', teamControllers.getOneTeam);

router.post('', teamControllers.addTeam);

router.put('/:id', teamControllers.editTeam);

router.delete('/:id', teamControllers.deleteTeam);

module.exports = router;