const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();
const fileUpload = require('express-fileupload')
const host = "localhost";
const port = 8080;

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/', (req, res) => {
	return res.sendFile(path.join(__dirname + "/player.html"));
});

app.get('/autore', (req, res) => {
	return res.sendFile(path.join(__dirname + "/autore.html"));
});

app.get('/valutatore', (req, res) => {
    return res.sendFile(path.join(__dirname + "/valutatore.html"));
});

app.post('/players', (req, res) => {
    var user_path = path.join(__dirname + '/players/' + req.body.user_id);
    var data = JSON.stringify(req.body);
    fs.writeFile(user_path, data, err => {
        if (err) throw err;
        console.log('dati di gioco salvati');
    });
    console.log(req.body);
    return res.send(":)");
});


//## AMBIENTE AUTORE ##//
//Prende i file info.json delle storie in cui sono contenuti metadata per la rappresentazione (i.e. nome,accessibilità,etc)
app.get('/stories', (req, res) => {
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

app.get('/stories/:storyName', (req, res) => {
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
	res.setHeader('Content-Type','application/json');
	res.json(load);
});

app.post('/stories', (req, res) => {
	console.log("Posting story :)");
	var storyName = req.body.storyName;
	var json = req.body.json;
	var meta = req.body.meta;
	var storydir = path.join(__dirname + "/story");
	var newdir = path.join(storydir + "/" + storyName);
	//Se la directory c'è già non la ricrea
	fs.mkdirSync(newdir, { recursive: true });
	fs.writeFile(path.join(newdir + "/" + storyName + ".json"), JSON.stringify(json), (error) => {
		if(error) {
			throw error;
		}
	});
	fs.writeFile(path.join(newdir + "/" + "info.json"), JSON.stringify(meta), (error) => {
		if(error) {
			throw error;
		}
	});
	res.send(":)");
});

app.delete('/stories', (req, res) => {
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

app.get('/stories/:storyName/images', (req, res) =>{
	console.log(`Getting content of /story/${req.params.storyName}/images`);
	var imgdir = path.join(__dirname + `/story/${req.params.storyName}/images/`);
	let entrylist = fs.readdirSync(imgdir);
	console.log(entrylist);
	res.send(entrylist);
});

app.post('/stories/:storyName/images', (req, res) => {
	var targetDir = path.join(__dirname + "/story/" + req.params.storyName + "/images/");
	fs.mkdirSync(targetDir, { recursive: true });
	fs.writeFile(path.join(targetDir + req.files.image.name), req.files.image.data, (error) => {
		if(error)	throw error;
	});
	res.send(":)");
});


//## AMBIENTE VALUTATORE ##//
app.get('/players/', (req, res) => {
    var playerIDs = fs.readdirSync(__dirname + '/players/');
    var players_data = [];
    for(const player_id of playerIDs){
        var data = fs.readFileSync(__dirname + '/players/' + player_id);
        players_data.push(data.toString());
    }
    return res.send(players_data);
});


//#######################################################//

app.listen(port, () => {
  console.log(`Listening at http://${host}:${port}`)
});
