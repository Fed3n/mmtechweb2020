//##NODE/EXPRESS MODULES##//
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const nocache = require('nocache');
const fileUpload = require('express-fileupload');
const app = express();

//##HOST SETTINGS##//
const serverOpened = false;
const host = "localhost";
const openhost = "site181991.tw.cs.unibo.it";
const port = 8000;

//##PLACEHOLDERS##//
var players_data = {};
var players_chat = {};
var uid_generator = 0;

//##EXPRESS MIDDLEWARE AND OPTIONS##
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(nocache());

//Enable CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Enable the req.protocol to read and set the HTTP/S protocol properly
app.enable('trust proxy');

//##MAIN PAGES RESPONSES##//
app.get('/', (req, res) => {
	if((req.protocol == "https" && serverOpened == true) || (serverOpened == false)) {
		return res.sendFile(path.join(__dirname + "/player.html"));
	} else if(req.protocol != "https" && serverOpened == true) {
		res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
		res.end();
	}
});

app.get('/autore', (req, res) => {
	if((req.protocol == "https" && serverOpened == true) || (serverOpened == false)) {
                return res.sendFile(path.join(__dirname + "/autore.html"));
        } else if(req.protocol != "https" && serverOpened == true) {
                res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
                res.end();
        }
});

app.get('/valutatore', (req, res) => {
	if((req.protocol == "https" && serverOpened == true) || (serverOpened == false)) {
                return res.sendFile(path.join(__dirname + "/valutatore.html"));
        } else if(req.protocol != "https" && serverOpened == true) {
                res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
                res.end();
        }
});


//##PLAYER RESOURCES##//
app.get('/uid', (req, res) => { // da cambiare in POST
    uid_generator++;
    console.log(`New user: ${uid_generator}`);
  	players_data[uid_generator] = {};
    players_chat[uid_generator] = [];
    return res.send(uid_generator.toString());
});

app.patch('/players/:player_id', (req, res) => {
    var id = req.params.player_id;
    if(players_data[id]){
      for (let key in req.body)
          players_data[id][key] = req.body[key];
            return res.send(":)");
    }
    else {
      return res.status(404).send({ error: "Couldn't find id"});
    }
});

app.patch('/players/', (req, res) => {
    for(let id in req.body){
        for(let key in req.body[id]){
        players_data[id][key] = req.body[id][key];
      }
    }
    console.log('Modifiche del valutatore: ', req.body);
    return res.send(":)");
});

app.get('/players/', (req, res) => {
    if(req.query.id){
    	return res.send(players_data[req.query.id]);
    }
  	else {
    	return res.send(players_data);
    }
});

//## CHAT ##//
//Manda un messaggio da pushare sulla chat del server dello specifico player_id
app.post('/chat/:player_id/', (req,res) => {
  if(players_chat[req.params.player_id]){
    players_chat[req.params.player_id].push(req.body);
    return res.send(":)");
  }
  else {
    return res.status(404).send("Could not find player id.");
  }
});

app.get('/chat/', (req,res) => {
  if(req.query.user_id){
    return res.send(players_chat[req.query.user_id]);
  }
  else {
    return res.send(players_chat);
  }
});

//Stories Resources
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
        if(error)   throw error;
    });
    res.send(":)");
});

//#######################################################//

//Server Start
app.listen(port, (req, res) => {
  console.log(`Listening at ${serverOpened ? 'https' : 'http'}://${serverOpened ? openhost : host}:${port}`)
});
