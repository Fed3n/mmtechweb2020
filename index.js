const express = require('express');
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


app.get('/', (req, res) => {
	return res.sendFile(path.join(__dirname + "/player.html"));
});

app.get('/autore', (req, res) => {
	return res.sendFile(path.join(__dirname + "/autore.html"));
});

app.get('/valutatore', (req, res) => {
    return res.sendFile(path.join(__dirname + "/valutatore.html"));
});

app.get('/prova', (req, res) => {
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

app.get('/image/:storyName', (req, res) =>{
	console.log(`Getting content of /story/${req.params.storyName}/images`);
	var imgdir = path.join(__dirname + `/story/${req.params.storyName}/images/`);
	let entrylist = fs.readdirSync(imgdir);
	console.log(entrylist);
	res.send(entrylist);
});

app.post('/image/:storyName', (req, res) => {
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
