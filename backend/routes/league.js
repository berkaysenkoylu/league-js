const express = require('express');

const leagueControllers = require('../controllers/league');

const router = express.Router();

router.get('', leagueControllers.getLeague);

router.get('/newleague', leagueControllers.initializeLeague);

router.get('/playmatch', leagueControllers.playMatch);

router.get('/playallmatches', leagueControllers.playAllMatches);

module.exports = router;