window.onload = function(){
	let title = document.getElementById("questname");
    if(title) title.focus();
}

//PLACEHOLDER OBJECTS//
gamedata_pholder = {
        "mainQuest": [
              {
                     "number": 0,
                     "text": "",
                     "type": "",
                     "description": "",
                     "options": [],
                     "image": {
                       "imguri": "",
                       "imgalt": ""
                     },
                     "goto": [],
                     "subquest_rewards": []
             }
        ],
        "subQuests": [
          {
            "number": 0,
            "objective": "",
            "available_on": [],
            "requires_sub": [],
            "text": "",
            "type": "",
            "description": "",
            "options": [],
            "solution": []
          }
        ],
        "css_style": {
      "mainStyle": {
        "font-family": "",
          "font-style": "",
          "font-weight": "",
          "font-size": "",
          "color" : ""
      },
      "background": {
          "image": null,
          "url": "",
          "style": {
              "nav": {
              "custom": null,
              "bootstrap": {
                "textColor": "",
                "background": ""
              },
              "customized": {
                "general": {
                "background-color": "",
                "color": ""
              },
             }
          },
          "badge": {
          "custom": null,
            "bootstrap": {
              "type": ""
            },
            "customized": {
                "background-color": "",
                "border-width": "",
                "border-style": "",
                "border-color": "",
                "color" : ""
            }
          },
          "alert": {
          "custom": null,
            "bootstrap": {
              "type": ""
            },
            "customized": {
                "background-color": "",
                "border-width": "",
                "border-style": "",
                "border-color": "",
                "color" : ""
            }
          },
          "card": {
            "custom": null,
            "bootstrap": {
              "textColor": "",
              "background": ""
            },
            "customized": {
                "background-color": "",
                "color": ""
          }
         }
        }
        }
    }
};

    metadata_pholder = {
      "name": "",
      "active": false,
      "accessible": true,
      "language": ""
    };

var app = new Vue({
  el: "#app",
  components: {
    "choiceinput": httpVueLoader("components/choice_input.vue"),
    "textinput": httpVueLoader("components/text_input.vue"),
    "imginput": httpVueLoader("components/img_input.vue"),
    "keyboardinput": httpVueLoader("components/keyboard_input.vue"),
    "humaninput": httpVueLoader("components/human_input.vue"),
    "qrload": httpVueLoader("components/qrload.vue")
  },
  data: {
	restored: false,
	restoredSubs : false,
    user_id: "",
    time_played: 0,
    time_inactive: 0,    // entrambe in secondi
    score: 0,
    help_requested: false,
    help_sent: false,
    help_received: false,
    help_message: "",
    ans_feedback: "",
    waiting_feedback: false,
    received_feedback: false,
    chat: [],
    chat_msg: "",
	  bool_inchat: false,
    gamedata: gamedata_pholder,
    metadata: metadata_pholder,
    questname: null,
    currentQuest: 0,
    currentSub: 0,
    completedSubs: [],
    in_mainquest: true,
    picked: null,
    togglerButtonVisible: true,
    onLink: [],
    submitStyleObject: {},
  },
  watch: {
    //Se ans_feedback cambia e stavo aspettando un feedback
    ans_feedback: function(newans, oldans){
        if(this.waiting_feedback){
            this.waiting_feedback = false;
            this.received_feedback = true;
        }
    }
  },
  created: function (){
    this.upgradeSubmitStyle(false);
  },
  mounted: function() {
      this.updatesEvery5Seconds();
      this.trackTimeEverySecond();
  },
  methods: {
	chatAppear: function(fromHelp) {
		let node = this.$refs.chatbtn.innerHTML;
		if(this.bool_inchat) {
			this.bool_inchat = false;
			node = "Chat";
		}
		else if((!this.bool_inchat && fromHelp)) {
			this.bool_inchat = true;
			node = "X";
		}
		this.$refs.chatbtn.innerHTML = node;
	},
    requestHelp: function() {
      if (!this.help_message) {
        this.$refs.requestedHelp.style.display = "inline-block";
        this.$refs.help.classList.add("disabled");
        this.help_requested = true;
      }
    },
    updatesEvery5Seconds: function() {
      let timerId = setInterval(() => {
        this.sendGameData();
        this.getGameData();
        this.getCurrentChats();
        if(this.waiting_feedback) this.checkAnsFeedback();
        if(this.currentComponent && this.help_received)
          this.$refs.requestedHelp.style.display = "none";
      }, 5000);
    },
    trackTimeEverySecond: function() {
      let timerId = setInterval(() => {
        this.time_played++;
        this.time_inactive++;
      }, 1000);
    },
    sendGameData: function(){
      axios.patch(`/players/${this.user_id}`,
          {
            user_id: this.user_id,
            in_mainquest: this.in_mainquest,
            currentQuest: this.currentQuest,
            currentSub: this.currentSub,
            completedSubs: this.completedSubs,
            help_requested: this.help_requested,
            help_received: this.help_received,
            finished: this.renderQuest.type == 'ending',
            time_inactive: this.time_inactive,
            time_played: this.time_played,
            newPlayerMsgs: this.newPlayerMsgs
          })
        .then(res => {console.log(res)})
        .catch(err => {
			console.log(err);
			alert("Server riavviato, elimino la sessione...");
			this.deleteCookies();
			location.reload();
		});
    },
    getGameData: function() {
      let uid = { params: { user_id: this.user_id }};
      axios.get('/players/', uid).then(response => {
        for (let key in response.data) {
          this[key] = response.data[key];
        }
        if (this.help_message !== "") {
          console.log(this.help_message);
          this.help_received = true;
          this.help_requested = false;
        }
      }).catch(err => console.log(err));
    },
    sendChatMsg: function() {
      if(this.chat_msg){
        msg = {
          sender: `utente_${this.user_id}`,
          text: this.chat_msg
        };
        axios.post(`chat/${this.user_id}`, msg)
        .then(() => { console.log("sent message successfully :)")});
        this.chat.push(msg);
		this.chat_msg = "";
        this.$nextTick(() => {
            scrollToBottom("chatbox");
        });
      }
	},
    getCurrentChats: function() {
      axios.get("/chat", {params: {user_id: this.user_id}}).then(response => {
        old_chat = this.chat;
        this.chat = response.data;
        if(this.chat.length > old_chat.length){
            this.$nextTick(() => {
                scrollToBottom("chatbox");
            });
        }
      });
    },
    checkAnsFeedback: function() {
        axios.get(`/feedback/`, { params: {user_id: this.user_id} }).then((res) => {
            this.ans_feedback = res.data;
        });
    },
	logout: function() {
		this.deleteCookies();
		let reload = confirm("Perderai tutti i progressi di gioco, vuoi uscire?");
		if(reload) location.reload();
	},
	deleteCookies: function() {
		Cookies.remove('user_id'); //1
		Cookies.remove('questname'); //2
		Cookies.remove('logged'); //3
		Cookies.remove('time_played'); //4
		Cookies.remove('time_inactive'); //5
		Cookies.remove('score'); //6
		Cookies.remove('currentQuest'); //7
		Cookies.remove('currentSub'); //8
		Cookies.remove('completedSubs'); //9
		Cookies.remove('in_mainquest'); //10
		Cookies.remove('subQuestList'); //11
		console.log("SESSION CLEARED");
	},
    changeQuest: function() {
        if(this.questname) {
            axios.get(`/stories/${this.questname}`).then(response => {
              this.gamedata = response.data.json;
              this.metadata = response.data.meta;
			  if(!Cookies.get('logged')) {
                //Chiedo al server il mio user id che è in formato nome_storia$numero
                axios.get("/uid", {params: {story_name: this.metadata.name}}).then(res => {
                  this.user_id = res.data;
				  //Creo Cookies sull'utente
					Cookies.set('logged','true');
					Cookies.set('user_id',this.user_id);
					Cookies.set('questname',this.questname);
					Cookies.set('time_played',this.time_played);
					Cookies.set('time_inactive',this.time_inactive);
					Cookies.set('score',this.score);
					Cookies.set('in_mainquest',true);
					Cookies.set('currentQuest',0);
					Cookies.set('currentSub',0);
					//Con restored il sistema non dovrà ripristinare i cookies. 
					//Se la pagina viene ricaricata, restored va a false per default e i cookies vengono ripristinati.
					this.restored = true;
                  //E mi faccio assegnare uno starting point
                  //this.currentQuest = this.parseStart(this.user_id);    //_------------------------------------------------DA TOGLIERE IL COMMENTO --------------------------------------------------
				});
			  }
            });
        }
    },
    parseStart: function(id) {
        if(this.gamedata.starting_points) {
            let len = this.gamedata.starting_points.length;
            let n = parseInt(id.substring(id.indexOf("$")+1,id.length));
            return (n%len);
        }
    },
    changeState: function (state){
      this.currentQuest = state;
    },
    goToSubQuest: function (quest){
	  this.picked = null;
	  this.$refs.inputForm.reset();
    this.currentSub = quest.number;
    this.in_mainquest = false;
    this.$refs.questname.focus();
    if (this.$refs.help)
      this.$refs.help.classList.remove("disabled");
    this.help_message = "";
    this.help_received = false;
    this.sendGameData();
	//Aggiorno status Cookies
	console.log("Entro nella subquest");
	Cookies.set('in_mainquest',this.in_mainquest);
	Cookies.set('currentSub',this.currentSub);
	console.log(this.currentSub);
	console.log(Cookies.get('currentSub'));
	console.log(this.in_mainquest);
	console.log(Cookies.get('in_mainquest'));
    resetDivScrolling();
    },
    goToMainQuest: function(){
	  this.picked = null;
	  this.$refs.inputForm.reset();
    this.in_mainquest = true;
    this.$refs.questname.focus();
    if (this.$refs.help)
      this.$refs.help.classList.remove("disabled");
    this.help_message = "";
    this.help_received = false;
    this.sendGameData();
	//Aggiorno lo stato dei cookies
	Cookies.set('in_mainquest',this.in_mainquest);
	Cookies.set('currentQuest',this.currentQuest);
    resetDivScrolling();
    },
    submitMain: function() {
      //Caso particolare in cui il submit si comporta diversamente perché non usa il valore picked
      if(this.renderQuest.type == "human") {
          this.picked = this.ans_feedback;
          this.waiting_feedback = false;
          this.received_feedback = false;
          this.ans_feedback = "";
      }
      options = this.getCurrentGotos;
      for(opt of options){
        //Le risposte del tipo draw hanno un formato diverso
        if(this.gamedata.mainQuest[this.currentQuest].type == "draw"){
          let x = opt[0][0];
          let y = opt[0][1];
          let radius = parseInt(opt[0][2]);
          if(this.picked[0] >= x-radius && this.picked[0] <= x+radius &&
            this.picked[1] >= y-radius && this.picked[1] <= y+radius){
              this.currentQuest = opt[1];
              //Per ragioni di compatibilità mi assicuro ci sia lo score
              if(opt[2]) this.score += parseInt(opt[2]);
              this.time_inactive = 0;
              this.$refs.help.classList.remove("disabled");
              this.help_message = "";
              this.help_received = false;
              this.sendGameData();
              break;
            }
        }
        //Formato standard che controlla se opt[0] == picked
        else if(opt[0] == this.picked){
          if(this.currentComponent != "")
            this.$refs.help.classList.remove("disabled");
          this.currentQuest = opt[1];
          //Per ragioni di compatibilità mi assicuro ci sia lo score
          if(opt[2]) this.score += parseInt(opt[2]);
          this.help_message = "";
          this.help_received = false;
          this.sendGameData();
          break;
        }
        //L'opzione di default se non ci sono corrispondenze è sempre l'ultima
        if(options.indexOf(opt) == options.length-1){
          if(this.currentComponent != "")
            this.$refs.help.classList.remove("disabled");
          this.currentQuest = opt[1];
          //Per ragioni di compatibilità mi assicuro ci sia lo score
          if(opt[2]) this.score += parseInt(opt[2]);
          this.time_inactive = 0;
          this.help_message = "";
          this.help_received = false;
          this.sendGameData();
          resetDivScrolling();
        }
      }
      this.$refs.inputForm.reset();
      this.upgradeSubmitStyle(true);
      this.picked = null;
      if(this.renderQuest.type == "keys") this.$refs.inputComponent.text = "";
	  //Aggiorno lo stato dei cookies
	  Cookies.set('in_mainquest',this.in_mainquest);
	  Cookies.set('currentQuest',this.currentQuest);
      this.$refs.questname.focus();
    },
    submitSub: function() {
      this.$refs.inputForm.reset();
      let wrong_answer = true;
      let subQuest = this.renderQuest;
      if (subQuest.type == "draw") {
          for(ans of subQuest.solution){
              let x = ans[0];
              let y = ans[1];
              let radius = parseInt(ans[2]);
              if(this.picked[0] >= x-radius && this.picked[0] <= x+radius &&
                this.picked[1] >= y-radius && this.picked[1] <= y+radius){
                  wrong_answer = false;
              }
          }
      }
      else {
          for(ans of subQuest.solution)
              if (this.picked == ans)
              wrong_answer = false;
      }
      if (wrong_answer) return;

      this.time_inactive = 0;
      this.completedSubs.push(subQuest.number);
      if (this.currentComponent != "")
        this.$refs.help.classList.remove("disabled");
      this.help_message = "";
      this.help_received = false;
      this.in_mainquest = true;
      this.upgradeSubmitStyle(true);
      this.picked = null;
      //If per ragioni di compatibilità...
      if(this.renderQuest.sub_score) this.score += parseInt(this.renderQuest.sub_score);
      if(this.renderQuest.type == "keys") this.$refs.inputComponent.text = "";
      this.$refs.questname.focus();
      this.sendGameData();
	  //Aggiorno lo status dei Cookies
	  Cookies.set('in_mainquest',this.in_mainquest);
	  Cookies.set('currentSub',this.currentSub);
	  let obj = JSON.stringify(this.completedSubs);
	  Cookies.set('completedSubs',obj);
      resetDivScrolling();
    },
    overwriteMainStyle: function(styles){
      var main_style = this.gamedata.css_style.mainStyle;
      var main_style_cleaned = {};
      Object.entries(main_style).forEach( entry => {
      const[key,value] = entry;
      if (value != "")
        main_style_cleaned[key] = value;
    });
    return Object.assign(styles,main_style_cleaned);
    },
    //method that returns if navbar button is visible
    buttonChangedVisibility: function(isVisible, entry) {
        this.togglerButtonVisible = isVisible
    },
    menuLinkEvent: function(num,bool) {
    this.onLink = new Array(this.getSubquests.length+1);
    this.onLink.fill(false);
    this.onLink[num] = bool;
  },
  menuLinkStyle: function(num,apply) {
    var styles = {};
    if (!this.gamedata.css_style.background.image){
      if (!this.gamedata.css_style.background.style.nav.custom){
        //adding text color property
        //predefined style used in addition to bootstrap navbar style
        if (!this.gamedata.css_style.mainStyle["color"])
          if (color = this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-light")
            styles = Object.assign(styles,bootstrap_menu_color_dark_text);
          else if (this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-dark")
            styles = Object.assign(styles,bootstrap_menu_color_light_text);
          else
            console.log(`error in JSON compilation: bootstrap navbar textcolor properties available are 'navbar-light' and 'navbar-dark', ${color} is not supported`);
        styles = this.overwriteMainStyle(styles);
        //adding background color property
        if (apply){
          if (this.onLink[num]){
            if (this.gamedata.css_style.background.style.nav.bootstrap.background != "bg-light")
              styles = Object.assign(styles,{ "background-color": bootstrap_menu_links_light_background});
            else
              styles = Object.assign(styles,{ "background-color": bootstrap_menu_links_background});
          }
        }
      }
      else {
        //adding text color property
        styles = Object.assign(styles, { "color" : this.gamedata.css_style.background.style.nav.customized.general["color"] } );
        styles = this.overwriteMainStyle(styles);
        //adding background color property
        if (apply){
          if (this.onLink[num])
            if (this.gamedata.css_style.background.style.nav.customized.general["background-color"] == "white")
                styles = Object.assign(styles,{ "background-color": menu_links_white_background });
              else
                styles = Object.assign(styles,{ "background-color": menu_links });
        }
      }
    }
    else {
      styles = Object.assign(styles, { "color" : default_image_menu_links_text_color } );
      styles = this.overwriteMainStyle(styles);
      //adding background color property
      if (apply){
        if (this.onLink[num])
          styles = Object.assign(styles,{ "background-color": default_image_menu_links_hover_backgroud_color });
      }
    }
    //used for menu responsivness
    if (this.togglerButtonVisible)
      styles = Object.assign(styles,{ "white-space": "normal" });
    else
      styles = Object.assign(styles,{ "white-space": "normal" },{ "max-width": "65vw" });
    return styles;
  },
  upgradeSubmitStyle: function(disabled){
    //adding responsive style
    styles = {};
    if (!disabled)
      styles = Object.assign(styles,submit_button_style);
    else {
      styles = Object.assign(styles,submit_button_style_disabled);
      var temp = this.gamedata.css_style.background.style.card;
      if (!this.gamedata.css_style.background.image)
        if ((temp.custom && temp.customized["background-color"] == "black") || (!temp.custom && temp.bootstrap.background == "bg-dark"))
           styles = Object.assign(styles, { "border" : submit_button_border });
    }
    this.submitStyleObject = styles;
  }
  },
  computed: {
    currentComponent: function() {
		try {
		  console.log("Computed Current Component");
		  var type = this.renderQuest.type;
		  console.log("Cerco di caricare il componente...");
		  if (type == "choice") return "choiceinput";
		  else if (type == "input") return "textinput";
		  else if (type == "draw") return "imginput";
		  else if (type == "keys") return "keyboardinput";
		  else if (type == "human") return "humaninput";
		  else return "";
		} catch(error) {
			console.log("RELOAD COMPONENT!");
		}
    },
    renderQuest: function() {
		console.log("SONO IN RENDERQUEST");
      if(this.gamedata == null) {
		console.log("Renderquest If 0");
        return null;
	  }
	  if(Cookies.get('logged') == 'true' && this.restored == false) {
		this.restored = true;
		this.user_id = Cookies.get('user_id'); //1
		this.questname = Cookies.get('questname'); //2
		this.time_played = Cookies.get('time_played'); //3
		this.time_inactive = Cookies.get('time_inactive'); //4
		this.score = Cookies.get('score'); //5
		this.currentQuest = Cookies.get('currentQuest'); //6
		//I Cookies vengono salvati solo come stringhe, e non come booleani
		if(Cookies.get('in_mainquest') === 'true') this.in_mainquest = true; //7
		else this.in_mainquest = false; //7
		this.currentSub = Cookies.get('currentSub'); //8
		this.completedSubs = Cookies.getJSON('completedSubs'); //9
		console.log("Sono loggato: " + this.user_id + this.questname + this.in_mainquest);
		this.changeQuest();
	  }
      if(this.in_mainquest) return this.gamedata.mainQuest[this.currentQuest];
	  else return this.gamedata.subQuests[this.currentSub];
    },
    getSubquests: function() {
	  console.log("SONO IN GET SUBQUEST");
      var subQuestList = [];
      if(!this.gamedata) {
		  console.log("RITORNO NULL");
		  return subQuestList;
	  }
	  if(Cookies.get('logged') == 'true' && this.restoredSubs == false) {
		restoredSubs = true;
		console.log("Cookies delle subs trovato! Ripristino...");
		subQuestList = Cookies.getJSON('subQuestList');
		console.log(subQuestList);
	  }
	  else {
		  for(sub of this.gamedata.subQuests){
			if (!this.completedSubs.includes(sub.number) && sub.available_on.includes(this.currentQuest)
			  && sub.requires_sub.every( val => this.completedSubs.includes(val) ))
				  subQuestList.push(sub);
		  }
		  console.log("SUBQUEST DISPONIBILI: ");
		  console.log(subQuestList);
		  this.restoredSubs = true;
		  let obj = JSON.stringify(subQuestList);
		  console.log(obj);
		  console.log("Converto in cookies: ");
		  Cookies.set('subQuestList',obj); //10
		  console.log(Cookies.getJSON('subQuestList'));
	  }
      return subQuestList;
    },
    getCurrentClues: function() {
      clues = [];
      for(reward of this.renderQuest.subquest_rewards){
        if(this.completedSubs.includes(reward.number))
          clues.push(reward.clue);
      }
      return clues;
    },
    getCurrentOptions: function() {
      if(this.renderQuest.options){
        options = [];
        for(opt of this.renderQuest.options)
          options.push(opt);
        for(reward of this.renderQuest.subquest_rewards){
          if(this.completedSubs.includes(reward.number)){
            for(opt of reward.added_options)
              options.push(opt);
            for(opt of reward.removed_options){
              if((index = myIndexOf(options,opt,arrCmp)) != -1)
                options.splice(index,1);
            }
          }
        }
      }
      return options;
    },
    getCurrentGotos: function() {
      gotos = [];
      for(goto of this.renderQuest.goto)
        gotos.push(goto);
      for(reward of this.renderQuest.subquest_rewards){
        if(this.completedSubs.includes(reward.number)){
          for(goto of reward.added_goto)
            //Aggiungo in penultima posizione
            gotos.splice(gotos.length-1,0,goto);
          for(goto of reward.removed_goto){
            if((index = myIndexOf(gotos,goto,arrCmp)) != -1)
              options.splice(index,1);
          }
        }
      }
      return gotos;
    },
    getMediaSrc: function() {
        return ("story/" + this.metadata.name + (this.renderQuest.media.type=="image" ? "/images/" : "/videos/") + this.renderQuest.media.uri);
    },
    submitDisabled: function() {
        //Se il tipo è "" (none) è sempre abilitato
        if(!this.renderQuest.type) return false;
        //In un type ending è sempre disabilitato (il gioco è finito)
        if(this.renderQuest.type == "ending") return true;
        //Se siamo in human input allora il submit è abilitato se ho ricevuto feedback dal valutatore
        if(this.renderQuest.type == "human") return !this.ans_feedback;
        //Altrimenti è abilitato se c'è una risposta inserita
        else return !this.picked;
    },
    //styleObjects
    loadImage: function(){
      var temp = this.gamedata.css_style.background;
    if (temp.image){
        document.getElementsByTagName("body")[0].style.background = temp["url"];
      document.getElementsByTagName("body")[0].style.webkitBackgroundSize = "cover";
      document.getElementsByTagName("body")[0].style.mozBackgroundSize = "cover";
      document.getElementsByTagName("body")[0].style.oBackgroundSize = "cover";
      document.getElementsByTagName("body")[0].style.backgroundSize =  "cover";
      }
      else {
        document.getElementsByTagName("body")[0].style.background = "none";
      }
    },
  navbarBootstrapStyle: function() {
    var temp = this.gamedata.css_style.background.style.nav.bootstrap;
    if (!this.gamedata.css_style.background.image)
      if (!this.gamedata.css_style.background.style.nav.custom)
        return (temp.textColor+" "+temp.background);
      else
        return "";
    else {
      console.log("errore in JSON compiling: cannot use bootstrap's navbar when background image is set");
      return "";
    }
  },
  navbarStyle: function() {
    var styles = {};
    if (!this.gamedata.css_style.background.image){
      if (this.gamedata.css_style.background.style.nav.custom)
        styles = Object.assign(styles,this.gamedata.css_style.background.style.nav.customized.general);
    }
    return styles;
  },
  badgeBootstrapStyle: function() {
    var temp = this.gamedata.css_style.background.style.badge.bootstrap;
    if (!this.gamedata.css_style.background.style.badge.custom)
      return temp.type;
    else
      return "";
  },
  badgeStyle: function() {
    var styles = {}
    var temp = this.gamedata.css_style.background.style.badge.customized;
    if (this.gamedata.css_style.background.style.badge.custom)
      styles = Object.assign(styles,temp);
    return styles;
  },
  helpAlertBootstrapStyle: function() {
    var temp = this.gamedata.css_style.background.style.alert.bootstrap;
    if (!this.gamedata.css_style.background.style.alert.custom)
      return temp.type;
    else
      return "";
  },
  helpAlertStyle: function() {
    var styles = {}
    var temp = this.gamedata.css_style.background.style.alert.customized;
    if (this.gamedata.css_style.background.style.alert.custom)
      styles = Object.assign(styles,temp);
    //apply mainstyle in any case
    styles = this.overwriteMainStyle(styles);
    if (!this.togglerButtonVisible)
      styles = Object.assign(styles, {
         "margin-top" : "-10px"
      });
    return styles;
  },
  helpAlertContainerStyle: function() {
    var styles = {};
    if (!this.gamedata.css_style.background.image) {
      if (!this.gamedata.css_style.background.style.nav.custom){
        var temp = this.gamedata.css_style.background.style.nav.bootstrap.textColor;
        if (temp == "navbar-light")
          styles = Object.assign(styles, { "color" : "black" } );
        else if (temp == "navbar-dark")
          styles = Object.assign(styles, { "color" : "white" } );
        else
          console.log(`error in JSON compiling: bootstrap's navbar textcolor properties available are 'navbar-light' and 'navbar-dark', ${color} is not supported`);
      }
      else {
        var temp = this.gamedata.css_style.background.style.nav.customized.general;
        styles = Object.assign(styles, { "color" : temp["color"] } );
      }
    } else
      styles = Object.assign(styles, { "color" : defaul_image_alert_color } );
    styles = this.overwriteMainStyle(styles);
    if (this.togglerButtonVisible)
      styles = Object.assign(styles, { "margin-top" : "-10px" });
    return styles;
  },
  togglerButtonStyle: function() {
    var buttonColor;
    if (!this.gamedata.css_style.background.image){
      if (this.gamedata.css_style.background.style.nav.custom){
        if (this.gamedata.css_style.mainStyle["color"])
          buttonColor = this.gamedata.css_style.mainStyle["color"];
        else
          buttonColor = this.gamedata.css_style.background.style.nav.customized.general["color"];
        return `url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='${HextoRgb(buttonColor)}' stroke-width='${togglerbutton_default_linesWidth}' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E") `;
      }
      else
        return "";
    }
    else {
      if (buttonColor = this.gamedata.css_style.mainStyle["color"])
        ;
      else
        buttonColor = default_image_togglerButton_color;
      return `url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='${HextoRgb(buttonColor)}' stroke-width='${togglerbutton_default_linesWidth}' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E") `;
    }
  },
  toggleButtonContainer: function() {
    if (!this.gamedata.css_style.background.image){
      if (this.gamedata.css_style.background.style.nav.custom){
        var borderColor;
        if (this.gamedata.css_style.mainStyle["color"])
          borderColor = this.gamedata.css_style.mainStyle["color"];
        else
          borderColor = this.gamedata.css_style.background.style.nav.customized.general["color"];
        return { "border-color" : borderColor };
      }
      else
        return "";
    }
    else {
      var borderColor = default_image_togglerButton_border_color;
      if (this.gamedata.css_style.mainStyle["color"])
        borderColor = this.gamedata.css_style.mainStyle["color"];
      return { "border-color" : borderColor };
    }
  },
  mainquestButtonBootstrapStyle: function(){
    if (!this.gamedata.css_style.background.image)
      if (!this.gamedata.css_style.background.style.card.custom)
        if (!this.gamedata.css_style.mainStyle["color"])
          return this.gamedata.css_style.background.style.card.bootstrap["textColor"];
    else
        return "";
  },
  menuStyle: function() {
    var styles = {};
    if (!this.gamedata.css_style.background.image){
      if (!this.gamedata.css_style.background.style.nav.custom){
        if (this.togglerButtonVisible)
          //predefined style used in addition to bootstrap navbar style
          styles = Object.assign(styles,{ "background-color": bootstrap_menu_background});
        else{
          var color = "";
          if (color = this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-light")
            styles = Object.assign(styles,bootstrap_menu_border_color_dark_text);
          else if (this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-dark")
            styles = Object.assign(styles,bootstrap_menu_border_color_light_text);
          else
            console.log(`error in JSON compiling: bootstrap's navbar textcolor properties available are 'navbar-light' and 'navbar-dark', ${color} is not supported`);
          //overwrite occasional mainstyle
          if (this.gamedata.css_style.mainStyle["color"])
            styles = Object.assign(styles, { "border-color": this.gamedata.css_style.mainStyle["color"] } );
        }
      } else {
        var temp = this.gamedata.css_style.background.style.nav.customized.general;
        if (this.togglerButtonVisible)
          styles = Object.assign(styles,{ "background-color": menu_background});
        else {
          styles = Object.assign(styles,{ "background-color": temp["background-color"] });
          styles = Object.assign(styles,{ "border-color": temp["color"] });
          //overwrite occasional mainstyle
          if (this.gamedata.css_style.mainStyle["color"])
            styles = Object.assign(styles,{ "border-color" : this.gamedata.css_style.mainStyle["color"] });
        }
      }
    }
    else {
      if (this.togglerButtonVisible)
        //predefined style used in addition to bootstrap navbar style
        styles = Object.assign(styles,{ "background-color": menu_background});
      else{
        if (document.getElementById("submit").style.backdropFilter !== ""){
          console.log("ci siamo");
          document.getElementById("quest-menu-list").style.background = this.gamedata.css_style.background["url"];
          document.getElementById("quest-menu-list").style.mozBackgroundSize = "cover";
          document.getElementById("quest-menu-list").style.backgroundSize =  "cover";
        }
        else
          styles = Object.assign(styles,menu_backgroundImage);
        styles = Object.assign(styles,{ "border": default_image_menu_border });
        if (this.gamedata.css_style.mainStyle["color"])
          styles = Object.assign(styles,{ "border-color": this.gamedata.css_style.mainStyle["color"] });
      }
    }
    if (!this.togglerButtonVisible)
      styles = Object.assign(styles,{ "width": "max-content" });
    return styles;
  },
  dividerStyle: function() {
    var styles = {};
    if (!this.gamedata.css_style.background.image){
      if (!this.gamedata.css_style.background.style.nav.custom)
        //if the bootstrap class is "navbar-light" the text will be dark
        if (this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-light")
          styles = Object.assign(styles,{ "border-color" : bootstrap_menu_divider_dark });
        else
          styles = Object.assign(styles,{ "border-color" : bootstrap_menu_divider_light });
      else {
        var temp = this.gamedata.css_style.background.style.nav.customized.general;
        styles = Object.assign(styles,{ "border-color" : temp["color"] });
      }
      //overwrite occasional mainstyle
      if (this.gamedata.css_style.mainStyle["color"])
        styles = Object.assign(styles,{ "border-color" : this.gamedata.css_style.mainStyle["color"] });
    }
    else {
      styles = Object.assign(styles, { "border-color" : default_image_divider_color } );
      if (this.gamedata.css_style.mainStyle["color"])
        styles = Object.assign(styles,{ "border-color" : this.gamedata.css_style.mainStyle["color"] } );
    }
    return styles;
  },
  menuBootstrapStyle: function() {
    if (!this.gamedata.css_style.background.image){
      if (!this.gamedata.css_style.background.style.nav.custom){
        var temp = this.gamedata.css_style.background.style.nav.bootstrap;
        if (!this.togglerButtonVisible)
          return temp.background;
        else
          return "";
      } else
        return "";
    }
    else{
      console.log("errore in JSON compiling: cannot use bootstrap's navbar when background image is set");
      return "";
    }
  },
  cardBootstrapStyle: function() {
    if (!this.gamedata.css_style.background.image){
      var temp = this.gamedata.css_style.background.style.card.bootstrap;
      if (!this.gamedata.css_style.background.style.card.custom)
        return (temp.textColor+" "+temp.background);
      else {
        return "";
      }
    }
    else{
      console.log("errore in JSON compiling: cannot use bootstrap's navbar when background image is set");
      return "";
    }
  },
  cardStyle: function() {
    var styles = {};
    if (!this.gamedata.css_style.background.image){
      var temp = this.gamedata.css_style.background.style.card.customized;
      if (this.gamedata.css_style.background.style.card.custom)
        styles = Object.assign(styles,temp);
    }
    else
      styles = Object.assign(styles,{ "background" : "transparent" });
    return styles;
  },
  submitBootstrapStyle: function() {
    if (!this.gamedata.css_style.background.image)
      if (!this.gamedata.css_style.background.style.card.custom)
        return this.gamedata.css_style.background.style.card.bootstrap.textColor;
  },
  submitStyle: function() {
    styles = {};
    styles = Object.assign(styles, this.submitStyleObject);
    //if the card uses bootstrap the related style is in the Object submitBootstrapStyle
    if (!this.gamedata.css_style.background.image)
      if (this.gamedata.css_style.background.style.card.custom)
        styles = Object.assign(styles, { "color" : this.gamedata.css_style.background.style.card.customized["color"] } );
    styles = this.overwriteMainStyle(styles);
    //overwrite bootstrap text color
    if (this.gamedata.css_style.mainStyle["color"] && !this.gamedata.css_style.background.style.card.custom)
      styles = Object.assign(styles, { "color" : this.gamedata.css_style.mainStyle["color"]+"!important" } );
    return styles;
  },
  cardLimitStyle: function() {
    var styles = {};
    if (!this.gamedata.css_style.background.image){
      styles = Object.assign(styles,card_headerFooter);
      var temp = this.gamedata.css_style.background.style.card;
      if ((!temp.custom && temp.bootstrap.background == "bg-dark") || (temp.custom && temp.customized["background-color"] == "black"))
          styles = Object.assign(styles,bootstrap_card_headerFooter_black_background);
    }
    //stylistic choices lead us not to add this feature if there is a background image
    return styles;
  },
  navbarBrandStyle: function() {
    return this.overwriteMainStyle({});
  },
  questsStyle: function() {
    var styles = {};
    if (this.gamedata.css_style.background.image) {
      styles = Object.assign(styles, { "color" : default_image_text_color } );
      styles = this.overwriteMainStyle(styles);
    }
    else
      if (!this.gamedata.css_style.background.style.nav.custom)
        styles = this.overwriteMainStyle(styles);
      else {
        styles = Object.assign(styles, { "color" : this.gamedata.css_style.background.style.nav.customized.general["color"] } );
        styles = this.overwriteMainStyle(styles);
      }
    return styles;
  },
  removePredefinedStylesCard: function() {
    var styles = {};
    var temp = this.gamedata.css_style.background;
    if (!temp.image)
      if (temp.style.card.custom)
        styles = Object.assign(styles, { "color" : temp.style.card.customized.color });
    return this.overwriteMainStyle(styles);
  },
  componentStyle: function() {
    var styles = {}
    if (this.currentComponent == "choiceinput")
      ;
        if (this.currentComponent == "textinput")
          style = this.overwriteMainStyle(styles);
          style = Object.assign(styles,input_backgroundImage);
          if (!this.gamedata.css_style.background.image)
        if (!this.gamedata.css_style.mainStyle["color"])
          styles = Object.assign(styles, { "color" : "inherit" } );
        if (this.currentComponent == "imginput")
         ;
        return styles;
  }
  }
});
