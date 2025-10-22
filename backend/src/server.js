const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection } = require('./database/connection');

const alunoController = require('./controllers/alunoController');
const livroController = require('./controllers/livroController');
const emprestimoController = require('./controllers/emprestimoController');
const exemplarController = require('./controllers/exemplarController');
const classificacaoController = require('./controllers/classificacaoController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

testConnection();