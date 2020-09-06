window.onload = function(){
    document.getElementById("questname").focus();
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
    "qrload": httpVueLoader("components/qrload.vue")
  },
  data: {
    user_id: 0,          // TODO lo deve assegnare il server
    time_played: 0,
    time_inactive: 0,    // entrambe in secondi
    help_requested: false,
    help_sent: false,
    help_received: false,
    help_message: "",
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
    submitStyle: {},
    mainStyleObject: {},
    css_style: {
      mainStyle: {
    		"font-family": "'Dancing Script', cursive",
        	"font-style": "normal",
        	"font-weight": "bold",
        	"font-size": "25px",
        	"color" : "rgba(60,60,60,1)"			//se non si vuole specificare le proprietà globalmente inserire ""
      },
      background: {
      		image: true,
      		url: "url('notebook.png') no-repeat center center fixed",
      		style: {
  			    nav: {
				  	custom: true,
				  	bootstrap: {
				  		textColor: "navbar-light",
				  		background: "bg-light"
				  	},
				  	customized: {
				  		general: {
							"background-color": "grey",
							"color": "red"
						},
				   }
			  },
			  badge: {
				custom: false,
			  	bootstrap: {
			  		type: "badge-warning"
			  	},
			  	customized: {
			  			"background-color": "rgba(122,232,14,0.8)",
			  			"border-width": "3px",
			   			"border-style": "dotted",
			   			"border-color": "blue",
			   			"color" : "red"
			  	}
			  },
			  card: {
			  	custom: true,
			  	bootstrap: {
			  		textColor: "text-info",
			  		background: "bg-light"
			  	},
			  	customized: {
			   			"background-color": "white",
			   			"color": "white"
				}
			 }
    	  }
      }
    }
  },
  created: function (){
    axios.get('/uid').then(res => {
      this.user_id = res.data;
    });
    //adding the background image
    var temp = this.css_style.background;
    if (temp.image){
	  	document.getElementsByTagName("body")[0].style.background = temp["url"];
	 	document.getElementsByTagName("body")[0].style.webkitBackgroundSize = "cover";
	 	document.getElementsByTagName("body")[0].style.mozBackgroundSize = "cover";
		document.getElementsByTagName("body")[0].style.oBackgroundSize = "cover";
	 	document.getElementsByTagName("body")[0].style.backgroundSize =  "cover";
  	}
  	//creating mainStyleObject
  	var starting_obj = this.css_style.mainStyle;
  	var ending_obj = {};
  	Object.entries(starting_obj).forEach( entry => {
		const[key,value] = entry;
		if (value != "")
			ending_obj[key] = value;
	});
	this.mainStyleObject = ending_obj;
	this.upgradeSubmitStyle();
  },
  mounted: function() {
      this.updatesEvery5Seconds();
      this.trackTimeEverySecond();
  },
  methods: {
    requestHelp: function() {
      if (!this.help_msg) {
        this.$refs.requestedHelp.style.display = "inline";
        this.$refs.help.classList.add("disabled");
        this.help_requested = true;
      }
      // manda richiesta aiuto
      // quando la soddisfera', sara' da mettere display = "none"
    },
    updatesEvery5Seconds: function() {
      let timerId = setInterval(() => {
        this.sendGameData();
        this.getGameData();
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
            time_played: this.time_played
          })
        .then(response => {console.log(response)})
        .catch(err => {console.log(err)});
    },
    getGameData: function() {
      let uid = { params: { user_id: this.user_id }};
      axios.get('/players/', uid).then(response => {
        for (let key in response.data) {
          this[key] = response.data[key];
        }
        if (this.help_sent && this.help_message !== "") {
          console.log(this.help_message);
          this.help_received = true;
          this.help_requested = false;
        }
      }).catch(err => console.log(err));
    },
    changeQuest: function() {
    if(this.questname) {
        axios.get(`/stories/${this.questname}`).then(response => {
          this.gamedata = response.data.json;
          this.metadata = response.data.meta;
        });
          this.$refs.questloader.remove();
          this.$refs.questrender.removeAttribute("hidden");
      }
    },
    changeState: function (state){
      this.currentQuest = state;
    },
    goToSubQuest: function (quest){
      this.currentSub = quest.number;
      this.in_mainquest = false;
      this.$refs.questname.focus();
    },
    goToMainQuest: function(){
      this.in_mainquest = true;
      this.$refs.questname.focus();
    },
    submitMain: function() {
      options = this.getCurrentGotos;
      for(opt of options){
        console.log(opt);
        //Le risposte del tipo draw hanno un formato diverso
        if(this.gamedata.mainQuest[this.currentQuest].type == "draw"){
          let x = opt[0][0];
          let y = opt[0][1];
          let radius = parseInt(opt[0][2]);
          if(this.picked[0] >= x-radius && this.picked[0] <= x+radius &&
            this.picked[1] >= y-radius && this.picked[1] <= y+radius){
              this.currentQuest = opt[1];
              this.time_inactive = 0;
              this.sendGameData();
              break;
            }
        }
        //Formato standard che controlla se opt[0] == picked
        else if(opt[0] == this.picked){
          this.currentQuest = opt[1];
          this.time_inactive = 0;
          this.sendGameData();
          break;
        }
        //L'opzione di default se non ci sono corrispondenze è sempre l'ultima
        if(options.indexOf(opt) == options.length-1){
          this.currentQuest = opt[1];
        }
      }
      if(document.getElementById("input")) {
        document.getElementById("input").value = "";
      }
      document.getElementById("submit").disabled = true;
      this.upgradeSubmitStyle(true);
      this.picked = null;
      this.$refs.questname.focus();
    },
    submitSub: function() {
      if (this.in_mainquest) return;
      let wrong_answer = true;
      let subQuest = this.gamedata.subQuests[this.currentSub];
      if (subQuest.type == "input") {
        for (let accepted of subQuest.solution)
          if (this.picked == accepted)
            wrong_answer = false;
          }
      else if (subQuest.type == "choice") {
        if (this.picked == subQuest.solution)
          wrong_answer = false;
        }
      if (wrong_answer) return;

      // devo aver completato le subquest necessarie richieste
      for (let required of subQuest.requires_sub)
        if (!this.completedSubs.includes(required))
          return;

      this.sendGameData();
      this.time_inactive = 0;
      this.completedSubs.push(subQuest.number);
      this.in_mainquest = true;
      if(document.getElementById("input")) {
        document.getElementById("input").value = "";
      }
      document.getElementById("submit").disabled = true;
      this.upgradeSubmitStyle(true);
      this.picked = null;
      this.$refs.questname.focus();
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
	menuLinkStyle: function(num) {
		var styles = {};
		if (!this.css_style.background.image){
			if (!this.css_style.background.style.nav.custom){
				//adding text color property
				//predefined style used in addition to bootstrap navbar style
				if (!this.mainStyleObject["color"])
					if (color = this.css_style.background.style.nav.bootstrap.textColor == "navbar-light")
						styles = Object.assign(styles,bootstrap_menu_color_dark_text);
					else if (this.css_style.background.style.nav.bootstrap.textColor == "navbar-dark")
						styles = Object.assign(styles,bootstrap_menu_color_light_text);
					else
						console.log(`error in JSON compilation: bootstrap navbar textcolor properties available are 'navbar-light' and 'navbar-dark', ${color} is not supported`);
				styles = Object.assign(styles,this.mainStyleObject);
				//adding background color property
				if (this.onLink[num]){
					if (this.css_style.background.style.nav.bootstrap.background != "bg-light")
						styles = Object.assign(styles,{ "background-color": bootstrap_menu_links_light_background});
					else
						styles = Object.assign(styles,{ "background-color": bootstrap_menu_links_background});
				}
			}
			else {
				//adding text color property
				styles = Object.assign(styles, { "color" : this.css_style.background.style.nav.customized.general["color"] } );
				styles = Object.assign(styles,this.mainStyleObject);
				//adding background color property
				if (this.onLink[num])
					if (this.css_style.background.style.nav.customized.general["background-color"] == "white")
							styles = Object.assign(styles,{ "background-color": menu_links_white_background });
						else
							styles = Object.assign(styles,{ "background-color": menu_links });
			}
		}
		else {
			styles = Object.assign(styles, { "color" : defaul_image_menu_links_text_color } );
			styles = Object.assign(styles,this.mainStyleObject);
			//adding background color property
			if (this.onLink[num])
				styles = Object.assign(styles,{ "background-color": default_image_menu_links_hover_backgroud_color });
		}
		//used for menu responsivness
		if (this.togglerButtonVisible)
			styles = Object.assign(styles,{ "white-space": "normal" });
		else
			styles = Object.assign(styles,{ "white-space": "normal" },{ "max-width": "65vw" });
		return styles;
	},
	upgradeSubmitStyle: function(disabled){
		styles = {};
		//if the card uses bootstrap the related style is in the Object submitBootstrapStyle
		if (!this.css_style.background.image){
			if (this.css_style.background.style.card.custom){
				styles = Object.assign(styles, { "color" : this.css_style.background.style.card.customized["color"] } );
				styles = Object.assign(styles,this.mainStyleObject);
			}
			else {
				styles = Object.assign(styles,this.mainStyleObject);
				styles = Object.assign(styles, { "color" : this.mainStyleObject["color"]+"!important" } );			//used in order to overwrite bootstrap text color
			}
		}
		else {
			styles = Object.assign(styles,this.mainStyleObject);
		}
		//adding responsive style
		if (!disabled)
			styles = Object.assign(styles,submit_button_style);
		else {
			styles = Object.assign(styles,submit_button_style_disabled);
			var temp = this.css_style.background.style.card;
			if (!this.css_style.background.image)
				if ((temp.custom && temp.customized["background-color"] == "black") || (!temp.custom && temp.bootstrap.background == "bg-dark"))
					 styles = Object.assign(styles, { "border" : submit_button_border });
		}
		this.submitStyle = styles;
	}
  },
  computed: {
    currentComponent: function() {
      if(this.gamedata == null)
            return "";
      var type;
        if(this.in_mainquest)
            type = this.gamedata.mainQuest[this.currentQuest].type;
        else
          type = this.gamedata.subQuests[this.currentSub].type;

      if (type == "choice") return "choiceinput";
        else if (type == "input") return "textinput";
        else if (type == "draw") return "imginput";
      else return "";
    },
    renderQuest: function() {
      if(this.gamedata == null)
        return null;
            if(this.in_mainquest) return this.gamedata.mainQuest[this.currentQuest];
                else return this.gamedata.subQuests[this.currentSub];
    },
    getSubquests: function() {
      var subQuestList = [];
      if(!this.gamedata) return subQuestList;
            for(sub of this.gamedata.subQuests){
        if (!this.completedSubs.includes(sub.number) && sub.available_on.includes(this.currentQuest)
          && sub.requires_sub.every( val => this.completedSubs.includes(val) ))
              subQuestList.push(sub);
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
    //styleObjects
	navbarBootstrapStyle: function() {
		var temp = this.css_style.background.style.nav.bootstrap;
		if (!this.css_style.background.image)
			if (!this.css_style.background.style.nav.custom)
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
		if (!this.css_style.background.image){
			if (this.css_style.background.style.nav.custom)
				styles = Object.assign(styles,this.css_style.background.style.nav.customized.general);
		}
		return styles;
	},
	badgeBootstrapStyle: function() {
		var temp = this.css_style.background.style.badge.bootstrap;
		if (!this.css_style.background.style.badge.custom)
			return temp.type;
		else {
			return "";
		}
	},
	badgeStyle: function() {
		var styles = {}
		var temp = this.css_style.background.style.badge.customized;
		if (this.css_style.background.style.badge.custom)
			styles = Object.assign(styles,temp);
		return styles;
	},
	togglerButtonStyle: function() {
		var buttonColor;
		if (!this.css_style.background.image){
			if (this.css_style.background.style.nav.custom){
				if (this.mainStyleObject["color"])
					buttonColor = this.mainStyleObject["color"];
				else
					buttonColor = this.css_style.background.style.nav.customized.general["color"];
				return `url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='${buttonColor}' stroke-width='${togglerbutton_default_linesWidth}' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E") `;
			}
			else
				return "";
		}
		else {
			if (buttonColor = this.mainStyleObject["color"])
				;
			else
				buttonColor = image_default_togglerButton_color;
			return `url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='${buttonColor}' stroke-width='${togglerbutton_default_linesWidth}' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E") `;
		}
	},
	toggleButtonContainer: function() {
		if (!this.css_style.background.image){
			if (this.css_style.background.style.nav.custom){
				var borderColor;
				if (this.mainStyleObject["color"])
					borderColor = this.mainStyleObject["color"];
				else
					borderColor = this.css_style.background.style.nav.customized.general["color"];
				return { "border-color" : borderColor };
			}
			else
				return "";
		}
		else {
			var borderColor = image_default_togglerButton_border_color;
			if (this.mainStyleObject["color"])
				borderColor = this.mainStyleObject["color"];
			return { "border-color" : borderColor };
		}
	},
	menuStyle: function() {
		var styles = {};
		if (!this.css_style.background.image){
			if (!this.css_style.background.style.nav.custom){
				if (this.togglerButtonVisible)
					//predefined style used in addition to bootstrap navbar style
					styles = Object.assign(styles,{ "background-color": bootstrap_menu_background});
				else{
					var color = "";
					if (color = this.css_style.background.style.nav.bootstrap.textColor == "navbar-light")
						styles = Object.assign(styles,bootstrap_menu_border_color_dark_text);
					else if (this.css_style.background.style.nav.bootstrap.textColor == "navbar-dark")
						styles = Object.assign(styles,bootstrap_menu_border_color_light_text);
					else
						console.log(`error in JSON compiling: bootstrap's navbar textcolor properties available are 'navbar-light' and 'navbar-dark', ${color} is not supported`);
					//overwrite occasional mainstyle
					if (this.mainStyleObject["color"])
						styles = Object.assign(styles, { "border-color": this.mainStyleObject["color"] } );
				}
			} else {
				var temp = this.css_style.background.style.nav.customized.general;
				if (this.togglerButtonVisible)
					styles = Object.assign(styles,{ "background-color": menu_background});
				else {
					styles = Object.assign(styles,{ "background-color": temp["background-color"] });
					styles = Object.assign(styles,{ "border-color": temp["color"] });
					//overwrite occasional mainstyle
					if (this.mainStyleObject["color"])
						styles = Object.assign(styles,{ "border-color" : this.mainStyleObject["color"] });
				}
			}
		}
		else {
			if (this.togglerButtonVisible)
				//predefined style used in addition to bootstrap navbar style
				styles = Object.assign(styles,{ "background-color": menu_background});
			else{
				styles = Object.assign(styles,menu_backgroundImage);
				styles = Object.assign(styles,{ "border": default_image_menu_border });
				if (this.mainStyleObject["color"])
					styles = Object.assign(styles,{ "border-color": this.mainStyleObject["color"] });
			}
		}
		if (!this.togglerButtonVisible)
			styles = Object.assign(styles,{ "width": "max-content" });
		return styles;
	},
	dividerStyle: function() {
		var styles = {};
		if (!this.css_style.background.image){
			if (!this.css_style.background.style.nav.custom)
				//if the bootstrap class is "navbar-light" the text will be dark
				if (this.css_style.background.style.nav.bootstrap.textColor == "navbar-light")
					styles = Object.assign(styles,{ "border-color" : bootstrap_menu_divider_dark });
				else
					styles = Object.assign(styles,{ "border-color" : bootstrap_menu_divider_light });
			else {
				var temp = this.css_style.background.style.nav.customized.general;
				styles = Object.assign(styles,{ "border-color" : temp["color"] });
			}
			//overwrite occasional mainstyle
			if (this.mainStyleObject["color"])
				styles = Object.assign(styles,{ "border-color" : this.mainStyleObject["color"] });
		}
		else {
			styles = Object.assign(styles, { "border-color" : default_image_divider_color } );
			if (this.mainStyleObject["color"])
				styles = Object.assign(styles,{ "border-color" : this.mainStyleObject["color"] } );
		}
		return styles;
	},
	menuBootstrapStyle: function() {
		if (!this.css_style.background.image){
			if (!this.css_style.background.style.nav.custom){
				var temp = this.css_style.background.style.nav.bootstrap;
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
		if (!this.css_style.background.image){
			var temp = this.css_style.background.style.card.bootstrap;
			if (!this.css_style.background.style.card.custom)
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
		var	styles = {};
		if (!this.css_style.background.image){
			var temp = this.css_style.background.style.card.customized;
			if (this.css_style.background.style.card.custom)
				styles = Object.assign(styles,temp);
		}
		else
			styles = Object.assign(styles,{ "background" : "transparent" });
		return styles;
	},
	submitBootstrapStyle: function() {
		if (!this.css_style.background.image)
			if (!this.css_style.background.style.card.custom)
				return this.css_style.background.style.card.bootstrap.textColor;
	},
	cardLimitStyle: function() {
		var styles = {};
		if (!this.css_style.background.image){
			styles = Object.assign(styles,card_headerFooter);
			var temp = this.css_style.background.style.card;
			if ((!temp.custom && temp.bootstrap.background == "bg-dark") || (temp.custom && temp.customized["background-color"] == "black"))
					styles = Object.assign(styles,bootstrap_card_headerFooter_black_background);
		}
		//stylistic choices lead us not to add this feature if there is a background image
		return styles;
	},
	navbarBrandStyle: function() {
		return this.mainStyleObject;
	},
	questsStyle: function() {
		var styles = {};
		if (this.css_style.background.image) {
			styles = Object.assign(styles, { "color" : default_image_text_color } );
			styles = Object.assign(styles,this.mainStyleObject);
		}
		else
			if (!this.css_style.background.style.nav.custom)
				styles = Object.assign(styles,this.mainStyleObject);
			else {
				styles = Object.assign(styles, { "color" : this.css_style.background.style.nav.customized.general["color"] } );
				styles = Object.assign(styles,this.mainStyleObject);
			}
		return styles;
	},
	removePredefinedStylesCard: function() {
			return this.mainStyleObject;
	},
	componentStyle: function() {
		var styles = {}
		if (this.currentComponent == "choiceinput")
			;
        if (this.currentComponent == "textinput")
        	style = Object.assign(styles,this.mainStyleObject,input_backgroundImage);
        	if (!this.css_style.background.image)
				if (!this.mainStyleObject["color"])
					styles = Object.assign(styles, { "color" : "inherit" } );
        if (this.currentComponent == "imginput")
	       ;
        return styles;
	}
  }
});
