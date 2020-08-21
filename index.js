const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const host = "localhost";
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/', (req, res) => {
	return res.sendFile(path.join(__dirname + "/player.html"));
});

app.get('/prova', (req,res) => {
	console.log("test request!");
	return res.send("ciao!!");
});

app.get('/quest', (req, res) => {
	console.log('Richiesta lista di files');
	let load = fs.readdirSync('quest');
	load.forEach(file => { console.log(file); });
	return res.send(load);
});

app.get('/quest:questId', (req, res) => {
	console.log(`Richiesto json ${req.params.questId}!`);
	let load = fs.readFileSync(`quest/${req.params.questId}.json`);
	let json = JSON.parse(load);
	console.log(json);
	res.setHeader('Content-Type','application/json');
	console.log("Header set");
	return res.json(json);
});

app.listen(port, () => {
  console.log(`Listening at http://${host}:${port}`)
});
