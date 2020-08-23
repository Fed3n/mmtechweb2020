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

app.get('/autore', (req, res) => {
	return res.sendFile(path.join(__dirname + "/autore.html"));
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


//## AMBIENTE AUTORE ##//
app.get('/story', (req, res) => {
	console.log("Getting content of ./story directory...")
	let entrylist = fs.readdirSync(path.join(__dirname + "/story"));
	load = [];
	//Per ogni entry mando oggetto con info
	for(entry of entrylist){
		let info = fs.readFileSync(path.join(__dirname + "/story/" + entry + "/info.json"));
		info = JSON.parse(info);
		load.push(info);
	}
	res.send(load);
});

app.get('/story:storyName', (req, res) => {
	var story = req.params.storyName;
	var jsonpath = path.join(__dirname + "/story/" + story + "/" + story + ".json")
	var metapath = path.join(__dirname + "/story/" + story + "/" + "info.json")
	console.log("Getting story " + story);
	let json = fs.readFileSync(jsonpath);
	json = JSON.parse(json);
	let meta = fs.readFileSync(metapath);
	meta = JSON.parse(meta);
	let load = {
		json: json,
		meta: meta
	};
	console.log(load);
	res.setHeader('Content-Type','application/json');
	res.json(load);
});

app.post('/story', (req, res) => {
	console.log("Posting story :)");
	var storyName = req.body.storyName;
	var json = req.body.json;
	var meta = req.body.meta;
	var storydir = path.join(__dirname + "/story");
	var newdir = path.join(storydir + "/" + storyName);
	//Se la directory c'è già non la ricrea
	fs.mkdirSync(path.join(newdir), { recursive: true });
	fs.writeFile(path.join(newdir + "/" + storyName + ".json"), JSON.stringify(json), (error) => {
		if(error) {
			console.log("error at json");
			throw error;
		}
	});
	fs.writeFile(path.join(newdir + "/" + "info.json"), JSON.stringify(meta), (error) => {
		if(error) {
			console.log("error at meta");
			throw error;
		}
	});
	res.send(":)");
});

app.delete('/story', (req, res) => {
	var story = req.query.storyName;
	console.log("Deleting story: " + story);
	var storydir = path.join(__dirname + "/story");
	var dir = path.join(storydir + "/" + story);
	fs.rmdir(dir, { recursive: true }, (error) => {
		if(error) throw error;
		console.log("Deleted story " + story);
		res.send(":)");
	});
});
//#######################################################//

app.listen(port, () => {
  console.log(`Listening at http://${host}:${port}`)
});
