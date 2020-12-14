//##NODE/EXPRESS MODULES##//
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const nocache = require('nocache');
const favicon = require('serve-favicon');
const fileUpload = require('express-fileupload');
const app = express();

//##FUNZIONI AUSILIARIE PER COMPENSARE ALLA VERSIONE VECCHIA DI NODE DEL DIPARTIMENTO//
function recursiveRm(path){
    if(fs.existsSync(path)){
        if(fs.lstatSync(path).isDirectory()){
            files = fs.readdirSync(path);
            for(f of files){
                recursiveRm(path + `/${f}`);
            }
            fs.rmdirSync(path);
        }
        else {
            fs.unlinkSync(path);
        }
    }
}

function recursiveMkDir(path){
    if(!fs.existsSync(path)){
        fs.mkdirSync(path);
    }
}

function recursiveChmod(path, dirp, filep){
    if(fs.lstatSync(path).isDirectory()){
        files = fs.readdirSync(path);
        for(f of files){
            recursiveChmod(path + `/${f}`);
        }
        try {
            fs.chmodSync(path, `0o${dirp}`);
        } catch(err){
            console.log(err);
        }
    }
    else {
        try{
            fs.chmodSync(path, `0o${filep}`);
        } catch(err){
            console.log(err);
        }
    }
}
//####################

//##HOST SETTINGS##//
const serverOpened = false;
const host = "localhost";
const openhost = "site181991.tw.cs.unibo.it";
const port = 8000;

//##PLACEHOLDERS##//
var players_data = {};
var players_chat = {};
var players_ans = {};
var players_deleted = [];
var uid_generator = {};

var pnames = [];

//##EXPRESS MIDDLEWARE AND OPTIONS##
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(__dirname));
app.use(nocache());
app.use(favicon(path.join(__dirname + '/favicon.ico')));

//Enable CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Enable the req.protocol to read and set the HTTP/S protocol properly
app.enable('trust proxy');

//##PLAYER RESOURCES##//
app.get('/uid', (req, res) => {
    name = req.query.story_name;
    console.log("Receiving request for story " + name);
    if (uid_generator[name] !== undefined) uid_generator[name]++;
    else uid_generator[name] = 0;
    uid = name + "$" + uid_generator[name];
    let nindex = Math.floor(Math.random() * pnames.length);
    let pname = pnames[nindex];
    pnames.slice(nindex,1);
    players_data[uid] = {};
    players_chat[uid] = [];
    players_ans[uid] = {
        'waiting': false,
        'answer': {},
        'feedback': ""
    };
    console.log(`New user: ${uid}, ${pname}`);
    return res.status(200).send({ "id":uid, "pname":pname });
});

app.patch('/players/:player_id', (req, res) => {
    var id = req.params.player_id;
    if (players_data[id] && !players_deleted.includes(id)) {
        for (let key in req.body){
            players_data[id][key] = req.body[key];
            if(key == "help_received" && players_data[id][key] == true)
                players_data[id]["help_message"] = "";
        }
        return res.send("Player sent data successfully");
    } else {
        return res.status(404).send({
            error: "Couldn't find id"
        });
    }
});

app.patch('/players/', (req, res) => {
    for (let id in req.body) {
        if (!players_deleted.includes(id)) {
            for (let key in req.body[id]) {
                players_data[id][key] = req.body[id][key];
            }
        }
    }
    return res.status(201).send("Data updated successfully.");
});

app.get('/players/', (req, res) => {
    var id = req.query.user_id;
    if (id) {
        if (players_data[id] && !players_deleted.includes(id))
            return res.status(200).send(players_data[req.query.user_id]);
        else
            return res.status(404).send("Player data not available anymore");
    } else {
        return res.status(200).send(players_data);
    }
});

app.delete('/players/:player_id', (req, res) => {
    var id = req.params.player_id;
    players_deleted.push(id);
    pnames.push(players_data[id]);
    delete players_ans[id];
    delete players_chat[id];
    delete players_data[id];
    return res.status(200).send("Delete successfully.");
});

//valutatore fa get di risposte, restituite solo se ci sono
app.get('/answers/', (req, res) => {
    if (req.query.user_id) {
        return res.status(200).send(players_ans[req.query.user_id]);
    } else {
        let answers = {};
        for (id in players_ans) {
            if (players_ans[id].waiting) answers[id] = players_ans[id];
        }
        return res.status(200).send(answers);
    }
});

//player fa post di risposta
app.post('/answers/', (req, res) => {
    let uid = req.query.user_id;
    if (!players_ans[uid]) return res.status(404).send("Could not find player id.");
    let ans = {
        'text': req.body.text,
        'imagedata': req.body.imagedata
    };
    players_ans[uid]['waiting'] = true;
    players_ans[uid]['answer'] = ans;
    players_ans[uid]['feedback'] = "";
    console.log(players_ans);
    return res.status(200).send("Answer submitted successfully.");
});

//player fa get di feedback
app.get('/feedback/', (req, res) => {
    let uid = req.query.user_id;
    if (!players_ans[uid]) return res.status(404).send("Could not find player id.");
    return res.status(200).send(players_ans[uid]['feedback']);
});

//valutatore fa post di feedback ad una risposta
app.post('/feedback/', (req, res) => {
    let uid = req.query.user_id;
    if (!players_ans[uid]) return res.status(404).send("Could not find player id.");
    let feedback = req.body.text;
    players_ans[uid]['waiting'] = false;
    players_ans[uid]['feedback'] = feedback;
    players_ans[uid]['answer'] = {};
    return res.status(200).send("Feedback submitted successfully.");
});

//## CHAT ##//
//Manda un messaggio da pushare sulla chat del server dello specifico player_id
app.post('/chat/:player_id/', (req, res) => {
    if (players_chat[req.params.player_id]) {
        players_chat[req.params.player_id].push(req.body);
        return res.status(200).send("Message sent successfully");
    } else {
        return res.status(404).send("Could not find player id.");
    }
});

app.get('/chat/', (req, res) => {
    if (req.query.user_id) {
        return res.status(200).send(players_chat[req.query.user_id]);
    } else {
        return res.status(200).send(players_chat);
    }
});

//Clear server data
app.post('/clear/', (req, res) => {
    players_data = {};
    players_chat = {};
    players_ans = {};
    players_deleted = [];
    uid_generator = {};
    pnames = fs.readFileSync(path.join(__dirname + "/namelist.txt"), "utf-8").split(',');
    return res.status(200).send("Data cleared successfully.");
});

//Stories Resources
//Prende i file info.json delle storie in cui sono contenuti metadata per la rappresentazione (i.e. nome,accessibilità,etc)
app.get('/stories', (req, res) => {
    console.log("Getting content of ./story directory...")
    let entrylist = fs.readdirSync(path.join(__dirname + "/story"));
    load = [];
    //Per ogni entry mando oggetto con info
    for (entry of entrylist) {
        try {
            let info = fs.readFileSync(path.join(__dirname + "/story/" + entry + "/info.json"));
            info = JSON.parse(info);
            load.push(info);
        }
        catch {
            console.log(`Invalid directory ${entry}, skipping...`);
        }
    }
    res.status(200).send(load);
});

app.get('/stories/:storyName', (req, res) => {
    var story = req.params.storyName;
    var jsonpath = path.join(__dirname + "/story/" + story + "/" + story + ".json")
    var metapath = path.join(__dirname + "/story/" + story + "/" + "info.json")
    console.log("Getting story " + story);
    try {
        let json = fs.readFileSync(jsonpath);
        json = JSON.parse(json);
        let meta = fs.readFileSync(metapath);
        meta = JSON.parse(meta);
        let load = {
            json: json,
            meta: meta
        };
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(load);
    } catch {
        res.status(404).send("Story does not exist.")
    }
});

app.post('/stories', (req, res) => {
    console.log("Posting story :)");
    let clone = req.body.clone;
    let storyName = req.body.storyName;
    let json = req.body.json;
    let meta = req.body.meta;
    if(clone){
        let clonepath = path.join(__dirname + "/story/" + clone);
        let dstpath = path.join(__dirname + "/story/" + storyName); 
        try {
        fse.copySync(clonepath, dstpath);
        fse.moveSync(`${dstpath}/${clone}.json`, `${dstpath}/${storyName}.json`);
        let data = fs.readFileSync(`${dstpath}/info.json`);
        data = JSON.parse(data);
        data.name = storyName;
        fs.unlinkSync(`${dstpath}/info.json`);
        fs.writeFileSync(`${dstpath}/info.json`, JSON.stringify(data));
        } catch(err) {
            console.log(err);
            return res.status(500).send("File system error.");
        }
    } else {
        let storydir = path.join(__dirname + "/story");
        let newdir = path.join(storydir + "/" + storyName);
        //Se la directory c'è già non la ricrea
        recursiveMkDir(newdir);
        try {
            fs.writeFileSync(path.join(newdir + "/" + storyName + ".json"), JSON.stringify(json));
        } catch(err){
            console.log(err);
            return res.status(500).send("File system error.");
        }
        try {
            fs.writeFileSync(path.join(newdir + "/" + "info.json"), JSON.stringify(meta));
        } catch(err) {
            console.log(err);
            return res.status(500).send("File system error.");
        }
        recursiveMkDir(newdir + "/images");
        recursiveMkDir(newdir + "/videos");
    }
    return res.status(201).send("Story posted successfully.");
});

app.delete('/stories', (req, res) => {
    let story = req.query.storyName;
    console.log("Deleting story: " + story);
    let storydir = path.join(__dirname + "/story");
    let dir = path.join(storydir + "/" + story);
    try {
        recursiveRm(dir);
    } catch(err) { 
        res.status(500).send("File system error.");
    }
    console.log("Deleted story " + story);
    res.status(200).send("Story delete successfully.");
});

app.get('/stories/:storyName/images', (req, res) => {
    let imgdir = path.join(__dirname + `/story/${req.params.storyName}/images/`);
    try {
        let entrylist = fs.readdirSync(imgdir);
        return res.status(200).send(entrylist);
    } catch(err) { return res.status(200).send([]); }
    });

app.post('/stories/:storyName/images', (req, res) => {
    let imgdir = path.join(__dirname + `/story/${req.params.storyName}/images/`);
    try {
        fs.writeFileSync(path.join(imgdir + req.files.image.name), req.files.image.data);
        return res.status(201).send("Image created successfully.");
    } catch(err){
        throw(err);
        return res.status(500).send("File system error.");
    }
});

app.post('/tmpimage', (req, res) => {
    let imgdir = path.join(__dirname + `/tmp/`);
    try {
        recursiveMkDir(imgdir);
        fs.writeFileSync(path.join(imgdir + req.files.image.name), req.files.image.data);
        return res.status(201).send("Image created successfully.");
    } catch(err){
        throw(err);
        return res.status(500).send("File system error.");
    }
});

app.delete('/stories/:storyName/images/', (req, res) => {
    let imgdir = path.join(__dirname + `/story/${req.params.storyName}/images/`);
    let img = req.query.img;
    console.log(path.join(imgdir + img));
    fs.unlinkSync(path.join(imgdir + img));
    res.status(200).send("Image deleted successfully.");
});

app.get('/stories/:storyName/videos', (req, res) => {
    let viddir = path.join(__dirname + `/story/${req.params.storyName}/videos/`);
    try {
        let entrylist = fs.readdirSync(viddir);
        return res.status(200).send(entrylist);
    } catch { return res.status(200).send([]); }
});

app.post('/stories/:storyName/videos', (req, res) => {
    let viddir = path.join(__dirname + `/story/${req.params.storyName}/videos/`);
    try {
        fs.writeFileSync(path.join(viddir + req.files.video.name), req.files.video.data);
        return res.status(201).send("Video created successfully.");
    } catch(err){
        throw(err);
        return res.status(500).send("File system error.");
    }
});

app.delete('/stories/:storyName/videos/', (req, res) => {
    let viddir = path.join(__dirname + `/story/${req.params.storyName}/videos/`);
    let vid = req.query.vid;
    fs.unlinkSync(path.join(viddir + vid));
    res.status(200).send("Video deleted successfully.");
});

//##STILI##//

app.get('/styles/interfaces', (req, res) => {
    let dir = path.join(__dirname + "/styles/interfaces/");
    let entrylist = fs.readdirSync(dir);
    for (let i = 0; i < entrylist.length; i++) {
        entrylist[i].replace(/.json$/g, "");
    }
    return res.status(200).send(entrylist);
});

app.get('/styles/interfaces/:interfaceName', (req, res) => {
    let jsonpath = path.join(__dirname + "/styles/interfaces/" + req.params.interfaceName + ".json");
    let json = fs.readFileSync(jsonpath);
    let load = JSON.parse(json);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(load);
});

app.post('/styles/interfaces/', (req, res) => {
    let target = path.join(__dirname + "/styles/interfaces/" + req.body.name + ".json");
    let json = req.body.json;
    fs.writeFile(target, JSON.stringify(json), (error) => {
        if (error) {
            res.status(500).send("File system error.");
        }
    });
    res.status(201).send("Style created successfully.");
});

app.delete('/styles/interfaces/', (req, res) => {
    let target = path.join(__dirname + "/styles/interfaces/" + req.query.name);
    fs.unlinkSync(target);
    res.status(200).send("Style deleted successfully.");
});

app.get('/styles/keyboards', (req, res) => {
    let dir = path.join(__dirname + "/styles/keyboards/");
    let entrylist = fs.readdirSync(dir);
    for (let i = 0; i < entrylist.length; i++) {
        entrylist[i].replace(/.json$/g, "");
    }
    return res.status(200).send(entrylist);
});

app.get('/styles/keyboards/:keyName', (req, res) => {
    let jsonpath = path.join(__dirname + "/styles/keyboards/" + req.params.keyName + ".json");
    let json = fs.readFileSync(jsonpath);
    let load = JSON.parse(json);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(load);
});

app.post('/styles/keyboards/', (req, res) => {
    let target = path.join(__dirname + "/styles/keyboards/" + req.body.name + ".json");
    let json = req.body.json;
    fs.writeFile(target, JSON.stringify(json), (error) => {
        if (error) {
           res.status(500).send("File system error.");
        }
    });
    res.status(201).send("Keyboard created successfully.");
});

app.delete('/styles/keyboards/', (req, res) => {
    let target = path.join(__dirname + "/styles/keyboards/" + req.query.name);
    fs.unlinkSync(target);
    res.status(200).send("Keyboard deleted successfully.");
});

//#######################################################//

//##MAIN PAGES RESPONSES##//
app.get('/', (req, res) => {
    if ((req.protocol == "https" && serverOpened == true) || (serverOpened == false)) {
        return res.sendFile(path.join(__dirname + "/player.html"));
    } else if (req.protocol != "https" && serverOpened == true) {
        res.writeHead(301, {
            "Location": "https://" + req.headers['host'] + req.url
        });
        res.end();
    }
});

app.get('/autore', (req, res) => {
    if ((req.protocol == "https" && serverOpened == true) || (serverOpened == false)) {
        return res.sendFile(path.join(__dirname + "/autore.html"));
    } else if (req.protocol != "https" && serverOpened == true) {
        res.writeHead(301, {
            "Location": "https://" + req.headers['host'] + req.url
        });
        res.end();
    }
});

app.get('/valutatore', (req, res) => {
    if ((req.protocol == "https" && serverOpened == true) || (serverOpened == false)) {
        return res.sendFile(path.join(__dirname + "/valutatore.html"));
    } else if (req.protocol != "https" && serverOpened == true) {
        res.writeHead(301, {
            "Location": "https://" + req.headers['host'] + req.url
        });
        res.end();
    }
});

app.get('/:storyname', (req, res) => {
	let storylist = fs.readdirSync(path.join(__dirname + "/story"));
    let found = false;
	let index = req.params.storyname.indexOf("quest=");
	if (index != -1) {
		let name = req.params.storyname.substring(index+6,req.params.storyname.length);
		for (story of storylist) {
			let info = fs.readFileSync(path.join(__dirname + "/story/" + story + "/info.json"));
			info = JSON.parse(info);
			if (name === info.name && info.active)
				found = true;
		}
    }
	if(found) {
		if ((req.protocol == "https" && serverOpened == true) || (serverOpened == false)) {
			return res.sendFile(path.join(__dirname + "/player.html"));
		} else if (req.protocol != "https" && serverOpened == true) {
			res.writeHead(301, {
				"Location": "https://" + req.headers['host'] + req.url
			});
			res.end();
		}
	} else {
		res.writeHead(301, {
			"Location": "http://" + req.headers['host']
		});
		res.end();
	}		
});

/*GOCKER RELATED FUNCTIONS*/
app.post('/chmod', (req, res) => {
    try {
        recursiveChmod(__dirname, 770, 660);
        res.status(200).send("Chmod done.");
    } catch(err){
        console.log(err);
        res.status(500).send("Could not complete chmod.");
    }
});

//Server Start
app.listen(port, (req, res) => {
    //Parse available names from file...
    pnames = fs.readFileSync(path.join(__dirname + "/namelist.txt"), "utf-8").split(',');
    recursiveRm(path.join(__dirname + '/tmp/'));
    console.log(`Listening at ${serverOpened ? 'https' : 'http'}://${serverOpened ? openhost : host}:${port}`)
});
