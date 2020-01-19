require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const handleErrors = require('./middlewares/handleErrors');

const teamRoutes = require('./routes/team');
const leagueRoutes = require('./routes/league');

const app = express();

mongoose.set('useCreateIndex', true);

mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true }).then(() => {
    console.log('Connected');  
}).catch(err => {
    console.log('Failed to connect!');
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// HANDLE ROUTES HERE
app.use('/api/team', teamRoutes);
app.use('/api/league', leagueRoutes);

app.use(handleErrors);

app.listen(process.env.PORT || 8000 );