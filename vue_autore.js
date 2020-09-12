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
									 "key_style": {
										 "keys": ""
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
						"image": {
							"imguri": "",
							"imgalt": ""
						},
						"key_style": {
							"keys": ""
						},
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

	var qr = new QRCode(document.getElementById("qrcode"),"placeholder");
	this.qr.clear();

      var app = new Vue({
        el: "#app",
        components: {
          "choiceinput": httpVueLoader("components/choice_input.vue"),
          "textinput": httpVueLoader("components/text_input.vue"),
          "imginput": httpVueLoader("components/img_input.vue"),
					"keyboardinput": httpVueLoader("components/keyboard_input.vue")
        },
        data: {
			storyList: null,
			activeStoryList: null,
			inactiveStoryList: null,
			keyStylesList: null,
			imagesList: null,
			selectedImage: "",
			custom_keys: "",
			radiusInput: 10,	//valore di default
              previewdata: {
                "currentQuest": 0,
                "currentSub": 0,
                "completedSubs": [],
                "in_mainquest": true,
                "picked": null
              },
              gamedata: gamedata_pholder,
				metadata: metadata_pholder,
				questClipboard: {
					"main": null,
					"sub": null
				},

				//temporary -----------------------------------------------------------------------------------------------------------------------------------------------------------------------
				temporary_object: {
					textColor: "",
					background: ""
				},

				//temporary ----------------------------------------------------------------------------------------------------------------------------------------------------------------------










				 questname: null,






				togglerButtonVisible: true,
			    onLink: [],
			    submitStyleObject: {},





			   css_style: {
					  mainStyle: {
							"font-family": "'Dancing Script', cursive",
							"font-style": "normal",
							"font-weight": "bold",
							"font-size": "20px",
							"color" : "rgba(60,60,60,1)"
					  },
					  background: {
					  		image: false,
					  		url: "url('notebook.png')",
					  		style: {
				  			    nav: {
								  	custom: true,
								  	bootstrap: {
								  		textColor: "navbar-dark",
								  		background: "bg-primary"
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
							  alert: {
								custom: false,
							  	bootstrap: {
							  		type: "alert-warning"
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
							  		background: "bg-warning"
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
		created: function(){
			this.updateFs();







			this.upgradeSubmitStyle(false);







		},
        methods: {
					//SERVER INTERACTION METHODS//
					updateFs: function(){
						console.log("Requesting fs update...");
						var _this = this;
						//Storie
						axios.get("/stories").then(function (res){
							storyList = [];
							activeStoryList = [];
							inactiveStoryList = [];
							for(el of res.data){
								storyList.push(el.name);
								if(el.active) activeStoryList.push(el.name);
								else inactiveStoryList.push(el.name);
 							}
							_this.storyList = storyList;
							_this.activeStoryList = activeStoryList;
							_this.inactiveStoryList = inactiveStoryList;
						});
						//Keyboard styles
						axios.get("/styles/keyboards").then(function (res){
							_this.keyStylesList = res.data;
						});
					},
					getStory: function(){
						if(this.$refs.selectedStory.value){
							var _this = this;
			   			axios.get(`/stories/${this.$refs.selectedStory.value}`).then((res) => {
			        	_this.gamedata = res.data.json;
								_this.metadata = res.data.meta;
								_this.getImagesList();
								_this.updateFs();
							})
			     	}
					},
					postStory: function(){
						data = {
							storyName: this.metadata.name,
							json: this.gamedata,
							meta: this.metadata
						}
						var _this = this;
						axios.post("/stories", data)
						.then((res) => {
							_this.updateFs();
							console.log("Post successful with response: ");
							console.log(res);
						});
					},
					deleteStory: function(){
						if(this.$refs.selectedStory.value){
							data = { params: { storyName: this.$refs.selectedStory.value }};
							ok = confirm("Are you really sure you want to delete this story from the server?");
							if(ok){
								var _this = this;
								axios.delete("/stories", data).then((res) => {
									_this.updateFs();
								});
							}
						}
					},
					uploadImg: function(){
						//Mando come multipart/form-data
						let form = new FormData();
						let imageFile = this.$refs.img_upload.files[0];
						let storyName = this.$refs.selectedStory.value;
						form.append('image', imageFile);
						let _this = this;
						axios.post(`/stories/${storyName}/images`, form, {
							headers: {
								'Content-Type': 'multipart/form-data'
							}
						})
						.then( (res) => {
							console.log(res);
							_this.getImagesList();
						});
					},
					getImagesList: function(){
						console.log("Getting images list...");
						let _this = this;
						axios.get(`/stories/${this.metadata.name}/images`).then( (res) => {
							console.log("Hi!! :)");
							console.log(res.data);
							_this.imagesList = res.data;
						});
					},
					getKeyStyle: function(){
						let _this = this;
						axios.get(`/styles/keyboards/${this.$refs.select_key_style.value}`).then( res => {
							this.renderQuest.key_style = res.data;
						});
					},
					saveKeyStyle: function(){
						let load = {
							name: this.$refs.key_style_name.value,
							json: this.renderQuest.key_style
						};
						let _this = this;
						axios.post('/styles/keyboards', load)
						.then( res => {
							_this.updateFs();
						});
					},
					deleteKeyStyle: function(){
						let _this = this;
						axios.delete('/styles/keyboards', { params: { name: this.$refs.select_key_style.value }} )
						.then( res => {
							_this.updateFs();
						});
					},
					//########################################//

					jumpToQuest: function(type,number){
						if(type == "main"){
							this.previewdata.in_mainquest = true;
							this.previewdata.currentQuest = number;
							this.previewdata.picked = null;
						}
					else {
							this.previewdata.in_mainquest = false;
							this.previewdata.currentSub = number;
							this.previewdata.picked = null;
						}
					},
          switchMainSub: function() {
            this.previewdata.in_mainquest = !this.previewdata.in_mainquest;
          },
					resetStory: function() {
						this.gamedata = gamedata_pholder;
						this.metadata = metadata_pholder;
						this.previewdata = {
							"currentQuest": 0,
							"currentSub": 0,
							"completedSubs": [],
							"in_mainquest": true,
							"picked": null
						};
					},
          addNode: function() {
            num = this.previewdata.in_mainquest ? this.gamedata.mainQuest.length : this.gamedata.subQuests.length;
            mq = {
                   "number": num,
                   "text": "",
                   "type": "",
                   "description": "",
                   "options": [],
									 "image": {
										 "imguri": "",
										 "imgalt": ""
									 },
									 "key_style": {
										 "keys": ""
									 },
                   "goto": [],
                   "subquest_rewards": []
           };
           sq = {
       			"number": num,
       			"objective": "",
       			"available_on": [],
       			"requires_sub": [],
       			"text": "",
       			"type": "",
       			"description": "",
       			"options": [],
						"image": {
							"imguri": "",
							"imgalt": ""
						},
						"key_style": {
							"keys": ""
						},
       			"solution": []
       		};
            if(this.previewdata.in_mainquest) this.gamedata.mainQuest.push(mq);
            else this.gamedata.subQuests.push(sq)
          },
					copyStory: function() {
						if(this.previewdata.in_mainquest) this.questClipboard.main = this.renderQuest;
						else this.questClipboard.sub = this.renderQuest;
					},
					pasteStory: function() {
						num = this.previewdata.in_mainquest ? this.gamedata.mainQuest.length : this.gamedata.subQuests.length;
						if(this.previewdata.in_mainquest){
							if(this.questClipboard.main) {
								var quest = Object.assign({}, this.renderQuest)
								quest.number = num;
								this.gamedata.mainQuest.push(quest);
							}
						}
						else{
							if(this.questClipboard.sub) {
								var quest = Object.assign({}, this.renderQuest)
								quest.number = num;
								this.gamedata.subQuests.push(quest);
							}
						}
					},
					//Rimuove il nodo selezionato dall'array mainquest
					//Un po' costosa computazionalmente ma l'alternativa è limitarsi al pop per la cancellazione
					rmMainNode: function(index) {
						var ok = confirm("Are you sure you want to delete this node? All remaining references to this node will be deleted.");
						if(ok){
							var mains = this.gamedata.mainQuest;
							//Deve restarne almeno una in lista
							if(mains.length > 1){
								//Se sto cancellando la quest su cui mi trovo devo prima cambiare schermata o genero errori
								if(this.previewdata.currentQuest == index){
									//Se sto cancellando la 0 non è un problema
									if(index != 0) this.previewdata.currentSub--;
								}
								//Bisogna scalare in basso tutti i riferimenti ad indici con indice > index
								//e cancellare i riferimenti con indice = index
								//Non sto usando i for each perché mi serve il riferimento diretto all'mainsay per cambiarne i valori...
								for(i = 0; i < mains.length; i++){
									if(i != index){
										//number
										if(mains[i].number > index) mains[i].number -= 1;
										//goto
										for(j = 0; j < mains[i].goto.length; j++){
											if(mains[i].goto[j][1] == index) {
												mains[i].goto.splice(j,1);
												j--;
											}
											else if(mains[i].goto[j][1] > index) mains[i].goto[j][1] -= 1;
										}
										//sub_rewards
										for(j = 0; j < mains[i].subquest_rewards.length; j++){
											//added_goto
											for(k = 0; k < mains[i].subquest_rewards[j].added_goto.length; k++){
												if(mains[i].subquest_rewards[j].added_goto[k][1] == index) {
													mains[i].subquest_rewards[j].added_goto.splice(k,1);
													k--;
												}
												else if(mains[i].subquest_rewards[j].added_goto[k][1] > index) mains[i].subquest_rewards[j].added_goto[k][1] -= 1;
											}
											//removed_goto
											for(k = 0; j < mains[i].subquest_rewards[j].removed_goto.length; k++){
												if(mains[i].subquest_rewards[j].removed_goto[k] == index){
													mains[i].subquest_rewards[j].removed_goto.splice(k,1);
													k--;
												}
												else if(mains[i].subquest_rewards[j].removed_goto[k] > index) mains[i].subquest_rewards[j].removed_goto[k] -= 1;
											}
										}
									}
								}
								subs = this.gamedata.subQuests;
								for(i = 0; i < subs.length; i++){
									for(j = 0; j < subs[i].available_on.length; j++){
										if(subs[i].available_on[j] == index) {
											subs[i].available_on.splice(j,1);
											k--;
										}
										else if(subs[i].available_on[j] > index) subs[i].available_on[j] -= 1;
									}
								}
								mains.splice(index,1);
							}
							else alert("Cannot have fewer than one quest!");
						}
					},
					//Come sopra ma per le subquests (sono funzioni separate perché controllano elementi diversi)
					rmSubNode: function(index) {
						var ok = confirm("Are you sure you want to delete this node? All remaining references to this node will be deleted.");
						if(ok){
							var subs = this.gamedata.subQuests;
							if(subs.length > 1){
								//Deve restarne almeno una in lista
								if(subs.length > 1){
									//Se sto cancellando la quest su cui mi trovo devo prima cambiare schermata o genero errori
									if(this.previewdata.currentSub == index){
										//Se sto cancellando la 0 non è un problema
										if(index != 0) this.previewdata.currentSub--;
									}
									//Bisogna scalare in basso tutti i riferimenti ad indici con indice > index
									//e cancellare i riferimenti con indice = index
									//Non sto usando i for each perché mi serve il riferimento diretto all'mainsay per cambiarne i valori...
									for(i = 0; i < subs.length; i++){
										if(i != index){
											if(subs[i].number > index) subs[i].number -= 1;
											//available_on
											for(j = 0; j < subs[i].available_on.length; j++){
												if(subs[i].available_on[j] == index){
													subs[i].available_on.splice(j,1);
													j--;
												}
												else if(subs[i].available_on[j] > index) subs[i].available_on[j] -= 1;
											}
										}
									}
									//subquest_reward
									mains = this.gamedata.mainQuest;
									for(i = 0; i < mains.length; i++){
										for(j = 0; j < mains[i].subquest_rewards.length; j++){
											if(mains[i].subquest_rewards[j].number == index){
												mains[i].subquest_rewards.splice(j,1);
												j--;
											}
											else if(mains[i].subquest_rewards[j].number > index) mains[i].subquest_rewards[j].number -= 1;
										}
									}
								}
								subs.splice(index,1);
							}
							else alert("Cannot have fewer than one quest!");
						}
					},
          addGoto: function(type){
						//Il formato di img_input è differente [[x,y,radius],node]
						if(type == "image"){
							var ans = [this.previewdata.picked[0], this.previewdata.picked[1], this.radiusInput];
							this.renderQuest.goto.push([ans,0])
						}
						//Un comune goto è in formato [ans,node]
						else{
            	this.renderQuest.goto.push(["",0]);
						}
          },
          rmGoto: function(){
            this.renderQuest.goto.pop();
          },
					addSolution: function(type){
						if(type == "image"){
							var ans = [this.previewdata.picked[0], this.previewdata.picked[1], this.radiusInput];
							this.renderQuest.solution.push(ans)
						}
						else {
							this.renderQuest.solution.push("");
						}
					},
					rmSolution: function(sol){
						index = this.renderQuest.solution.indexOf(sol);
						this.renderQuest.solution.splice(index,1);
					},
          addRmOptions: function(type){
            if(type == "add") {
              this.renderQuest.options.push("");
              this.renderQuest.goto.push(["",0]);
            }
            else {
              this.renderQuest.options.pop();
            }
          },
          addRmSubAddedOptions: function(type,n){
            if(type == "add") {
              this.renderQuest.subquest_rewards[n].added_options.push("");
            }
            else {
              this.renderQuest.subquest_rewards[n].added_options.pop();
            }
          },
					addAddedGoto: function(sub){
						this.renderQuest.subquest_rewards[this.renderQuest.subquest_rewards.indexOf(sub)].added_goto.push(["",0]);
					},
					rmAddedGoto: function(sub,goto){
						reward = this.renderQuest.subquest_rewards[this.renderQuest.subquest_rewards.indexOf(sub)];
						reward.added_goto.splice(reward.added_goto.indexOf(goto),1);
					},
          generateChoiceGotos: function(){
						var ok = confirm("Generating new gotos for this quest will delete the current ones, do you want to proceed?");
						if(ok){
	            gotos = [];
	            for(opt of this.renderQuest.options){
	              gotos.push([opt,0]);
	            }
	            this.renderQuest.goto = gotos;
						}
          },
					generateChoiceSolutions: function(){
						var ok = confirm("Generating new solutions for this quest will delete the current ones, do you want to proceed?");
						if(ok){
	            sols = [];
	            for(opt of this.renderQuest.options){
	              sols.push(opt);
	            }
	            this.renderQuest.solution = sols;
						}
					},
          addSubReward: function() {
						if(this.$refs.subtoadd.value){
	            reward = {
	              "number": parseInt(this.$refs.subtoadd.value),
	    					"clue": "",
	    					"added_options": [],
	    					"removed_options": [],
	    					"added_goto": [],
	    					"removed_goto": []
	            }
	            this.renderQuest.subquest_rewards.push(reward);
	            this.renderQuest.subquest_rewards.sort(questCmp);
						}
          },
					rmSubReward: function(sub) {
						this.renderQuest.subquest_rewards.splice(this.renderQuest.subquest_rewards.indexOf(sub),1);
					},
					setImageAsInput: function() {
						if(this.renderQuest.image) {
							//Update nell'oggetto quest
							this.renderQuest.image.imageuri = this.selectedImage;
							//Update del canvas nel component
							this.$refs.inputComponent.updateCanvasImage();
						}
					},
          loadJson: function(){
            var path = this.$refs.toLoad.files[0];
            var fileReader = new FileReader();
            _this = this;
            fileReader.onload = function(event){
              var text = event.target.result;
              var json = JSON.parse(text);
              _this.gamedata = json;
            };
            fileReader.readAsText(path,"utf-8");
          },
          saveJson: function(){
            var text = JSON.stringify(this.gamedata);
            var blob = new Blob([text], {type:'application/json'});
            var filename = this.$refs.fileName.value;
            var link = document.createElement("a");
            link.download = filename;
            link.innerHTML = "Download JSON";
            //Funzione createObjectURL cross-browser
            var createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function(){};
            link.href = createObjectURL(blob);
            link.click();
          },
		  createQR: function(){
			var qrname = this.$refs.fileName.value.replace('.json','');
			qr.clear();
			qr.makeCode(qrname);
			var node = this.$refs.qrcode;
			node.href = `${qr._el.getElementsByTagName("img")[0].src}`;
			node.download = `${qrname}.png`;
			node.click();
		  }
















	,
	requestHelp: function() {
      if (!this.help_msg) {
        this.$refs.requestedHelp.style.display = "inline-block";
        this.$refs.help.classList.add("disabled");
        this.help_requested = true;
      }
      // manda richiesta aiuto
      // quando la soddisfera', sara' da mettere display = "none"
    }

	,
	goToSubQuest: function (quest){
      this.currentSub = quest.number;
      this.previewdata.in_mainquest = false;
      this.$refs.questname.focus();
    },
    goToMainQuest: function(){
      this.previewdata.in_mainquest = true;
      this.$refs.questname.focus();
    },
    submitMain: function() {
      options = this.getCurrentGotos;
      for(opt of options){
        //Le risposte del tipo draw hanno un formato diverso
        if(this.gamedata.mainQuest[this.previewdata.currentQuest].type == "draw"){
          let x = opt[0][0];
          let y = opt[0][1];
          let radius = parseInt(opt[0][2]);
          if(this.previewdata.picked[0] >= x-radius && this.previewdata.picked[0] <= x+radius &&
            this.previewdata.picked[1] >= y-radius && this.previewdata.picked[1] <= y+radius){
              this.previewdata.currentQuest = opt[1];
              break;
            }
        }
        //Formato standard che controlla se opt[0] == picked
        else if(opt[0] == this.previewdata.picked){
          this.previewdata.currentQuest = opt[1];
          break;
        }
        //L'opzione di default se non ci sono corrispondenze è sempre l'ultima
        if(options.indexOf(opt) == options.length-1){
          this.previewdata.currentQuest = opt[1];
        }
      }
      if(document.getElementById("input")) {
        document.getElementById("input").value = "";
      }
      document.getElementById("submit").disabled = true;
      this.upgradeSubmitStyle(true);
      this.previewdata.picked = null;
      this.$refs.questname.focus();
    },
    submitSub: function() {
      if (this.previewdata.in_mainquest) return;
      let wrong_answer = true;
      let subQuest = this.gamedata.subQuests[this.previewdata.currentSub];
      if (subQuest.type == "input") {
        for (let accepted of subQuest.solution)
          if (this.previewdata.picked == accepted)
            wrong_answer = false;
          }
      else if (subQuest.type == "choice") {
        if (this.previewdata.picked == subQuest.solution)
          wrong_answer = false;
        }
      if (wrong_answer) return;

      // devo aver completato le subquest necessarie richieste
      for (let required of subQuest.requires_sub)
        if (!this.previewdata.completedSubs.includes(required))
          return;

      this.previewdata.completedSubs.push(subQuest.number);
      this.previewdata.in_mainquest = true;
      if(document.getElementById("input")) {
        document.getElementById("input").value = "";
      }
      document.getElementById("submit").disabled = true;
      this.upgradeSubmitStyle(true);
      this.previewdata.picked = null;
      this.$refs.questname.focus();
    }






		  ,
	overwriteMainStyle: function(styles){
    	var main_style = this.css_style.mainStyle;
	  	var main_style_cleaned = {};
	  	Object.entries(main_style).forEach( entry => {
			const[key,value] = entry;
			if (value != "")
				main_style_cleaned[key] = value;
		});
		return Object.assign(styles,main_style_cleaned);
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
					if (!this.css_style.mainStyle["color"])
						if (color = this.css_style.background.style.nav.bootstrap.textColor == "navbar-light")
							styles = Object.assign(styles,bootstrap_menu_color_dark_text);
						else if (this.css_style.background.style.nav.bootstrap.textColor == "navbar-dark")
							styles = Object.assign(styles,bootstrap_menu_color_light_text);
						else
							console.log(`error in JSON compilation: bootstrap navbar textcolor properties available are 'navbar-light' and 'navbar-dark', ${color} is not supported`);
					styles = this.overwriteMainStyle(styles);
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
					styles = this.overwriteMainStyle(styles);
					//adding background color property
					if (this.onLink[num])
						if (this.css_style.background.style.nav.customized.general["background-color"] == "white")
								styles = Object.assign(styles,{ "background-color": menu_links_white_background });
							else
								styles = Object.assign(styles,{ "background-color": menu_links });
				}
			}
			else {
				styles = Object.assign(styles, { "color" : default_image_menu_links_text_color } );
				styles = this.overwriteMainStyle(styles);
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
			if (!disabled)
				styles = Object.assign(styles,submit_button_style);
			else {
				styles = Object.assign(styles,submit_button_style_disabled);
				var temp = this.css_style.background.style.card;
				if (!this.css_style.background.image)
					if ((temp.custom && temp.customized["background-color"] == "black") || (!temp.custom && temp.bootstrap.background == "bg-dark"))
						 styles = Object.assign(styles, { "border" : submit_button_border });
			}
			this.submitStyleObject = styles;
		}
  },
      computed: {
          questList: function() {
            if(this.previewdata.in_mainquest) return this.gamedata.mainQuest;
            else return this.gamedata.subQuests;
          },
          //Restituisco una coppia [index,goto], l'index serve per accedere al v-model
          getAddedGotos: function() {
            gotos = [];
            for(sub of this.renderQuest.subquest_rewards){
              var index = this.renderQuest.subquest_rewards.indexOf(sub);
              for(goto of sub.added_goto){
                gotos.push([index,goto]);
              }
            }
            return gotos;
          },
          getRemainingSubs: function() {
            //Qua conto sul fatto che la proprietà number di ogni quest rappresenti il suo indice nella lista
            var alreadyIn = [];
            var remaining = [];
            for(sub of this.renderQuest.subquest_rewards)
              alreadyIn.push(sub.number);
            for(sub of this.gamedata.subQuests){
              if(!alreadyIn.includes(sub.number))
                remaining.push(sub);
            }
            return remaining;
          },
			//Cerco i prev iterando su tutte le quest e cercando nei goto e subquest_reward sperando non sia troppo pesante
			getPrevNodes: function() {
				current = this.renderQuest.number;
				prev = new Set();
				for(quest of this.gamedata.mainQuest){
					for(goto of quest.goto){
						if(goto[1] == current) prev.add(quest.number);
					}
					for(reward of quest.subquest_rewards){
						for(goto of reward.added_goto){
							if(goto[1] == current) prev.add(quest.number);
						}
					}
				}
				return prev;
			},
			//Se stiamo vedendo la previw di una main quest vediamo dove ci porta la risposta attuale
			getAnswerGoto: function() {
				if(!this.previewdata.picked) return "";
				options = this.getCurrentGotos;
			for(opt of options){
			//Le risposte del tipo draw hanno un formato diverso e devo assicurarmi di non accedere a null
			if(opt[0] && this.gamedata.mainQuest[this.previewdata.currentQuest].type == "draw"){
			  let x = opt[0][0];
			  let y = opt[0][1];
			  let radius = parseInt(opt[0][2]);
			  if(this.previewdata.picked[0] >= (x-radius) && this.previewdata.picked[0] <= (x+radius) && this.previewdata.picked[1] >= (y-radius) && this.previewdata.picked[1] <= (y+radius)){
							return(opt[1]);
						}
			}
			//Formato standard che controlla se opt[0] == picked
			else if(opt[0] == this.previewdata.picked){
			  return opt[1];
			}
			//L'opzione di default se non ci sono corrispondenze è sempre l'ultima
					if(options.indexOf(opt) == options.length-1){
			  return opt[1];
			}
			}
				return "";
			},
			getAnswerCorrectness: function(){
				console.log("hi:)");
				return "hey";
			},
			currentComponent: function() {
				var type = this.renderQuest.type;
				if (type == "choice") return "choiceinput";
				else if (type == "input") return "textinput";
				else if (type == "draw") return "imginput";
				else if (type == "keys") return "keyboardinput";
				else return "";
			},
    renderQuest: function() {
      if(this.gamedata == null)
        return null;
           if(this.previewdata.in_mainquest) return this.gamedata.mainQuest[this.previewdata.currentQuest];
            else return this.gamedata.subQuests[this.previewdata.currentSub];
    },
    getSubquests: function() {
      var subQuestList = [];
      if(!this.gamedata) return subQuestList;
      for(sub of this.gamedata.subQuests){
        if (!this.previewdata.completedSubs.includes(sub.number) && sub.available_on.includes(this.previewdata.currentQuest)
          && sub.requires_sub.every( val => this.previewdata.completedSubs.includes(val) ))
              subQuestList.push(sub);
            }
            return subQuestList;
    },
	getCurrentClues: function() {
		clues = [];
		for(reward of this.renderQuest.subquest_rewards){
			if(this.previewdata.completedSubs.includes(reward.number))
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
				if(this.previewdata.completedSubs.includes(reward.number)){
					for(opt of reward.added_options)
						options.push(opt);
					for(opt of reward.removed_options){
						if((index = options.indexOf(opt)) != -1){
							options.splice(index,1);
							}
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
			if(this.previewdata.completedSubs.includes(reward.number)){
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
			loadImage: function(){
				var styles = {};
				var temp = this.css_style.background;
				if (temp.image){
					styles = Object.assign(styles, { "background-image" : temp["url"], "background-position" : "center center" } );
				 	document.getElementById("preview").style.webkitBackgroundSize = "cover";
				 	document.getElementById("preview").style.mozBackgroundSize = "cover";
					document.getElementById("preview").style.oBackgroundSize = "cover";
				 	document.getElementById("preview").style.backgroundSize =  "cover";
			  	}
			  	else {
			  		styles = Object.assign(styles, { "background-image" : "none" } );
			  	}
			return styles;
			},
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
				else
					return "";
			},
			badgeStyle: function() {
				var styles = {}
				var temp = this.css_style.background.style.badge.customized;
				if (this.css_style.background.style.badge.custom)
					styles = Object.assign(styles,temp);
				return styles;
			},
			helpAlertBootstrapStyle: function() {
				var temp = this.css_style.background.style.alert.bootstrap;
				if (!this.css_style.background.style.alert.custom)
					return temp.type;
				else
					return "";
			},
			helpAlertStyle: function() {
				var styles = {}
				var temp = this.css_style.background.style.alert.customized;
				if (this.css_style.background.style.alert.custom)
					styles = Object.assign(styles,temp);
				//apply mainstyle in any case
				styles = this.overwriteMainStyle(styles);
				if (!this.togglerButtonVisible)
					styles = Object.assign(styles, { "margin-top" : "-10px" } );
				return styles;
			},
			helpAlertContainerStyle: function() {
				var styles = {};
				if (!this.css_style.background.image) {
					if (!this.css_style.background.style.nav.custom){
						var temp = this.css_style.background.style.nav.bootstrap.textColor;
						if (temp == "navbar-light")
							styles = Object.assign(styles, { "color" : "black" } );
						else if (temp == "navbar-dark")
							styles = Object.assign(styles, { "color" : "white" } );
						else
							console.log(`error in JSON compiling: bootstrap's navbar textcolor properties available are 'navbar-light' and 'navbar-dark', ${color} is not supported`);
					}
					else {
						var temp = this.css_style.background.style.nav.customized.general;
						styles = Object.assign(styles, { "color" : temp["color"] } );
					}
				} else
					styles = Object.assign(styles, { "color" : defaul_image_alert_color } );
				styles = this.overwriteMainStyle(styles);
				if (this.togglerButtonVisible)
					styles = Object.assign(styles, { "margin-top" : "-10px" } );
				return styles;
			},
			togglerButtonStyle: function() {
				var buttonColor;
				if (!this.css_style.background.image){
					if (this.css_style.background.style.nav.custom){
						if (this.css_style.mainStyle["color"])
							buttonColor = this.css_style.mainStyle["color"];
						else
							buttonColor = this.css_style.background.style.nav.customized.general["color"];
						return `url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='${buttonColor}' stroke-width='${togglerbutton_default_linesWidth}' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E") `;
					}
					else
						return "";
				}
				else {
					if (buttonColor = this.css_style.mainStyle["color"])
						;
					else
						buttonColor = default_image_togglerButton_color;
					return `url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='${buttonColor}' stroke-width='${togglerbutton_default_linesWidth}' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E") `;
				}
			},
			toggleButtonContainer: function() {
				if (!this.css_style.background.image){
					if (this.css_style.background.style.nav.custom){
						var borderColor;
						if (this.css_style.mainStyle["color"])
							borderColor = this.css_style.mainStyle["color"];
						else
							borderColor = this.css_style.background.style.nav.customized.general["color"];
						return { "border-color" : borderColor };
					}
					else
						return "";
				}
				else {
					var borderColor = default_image_togglerButton_border_color;
					if (this.css_style.mainStyle["color"])
						borderColor = this.css_style.mainStyle["color"];
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
							if (this.css_style.mainStyle["color"])
								styles = Object.assign(styles, { "border-color": this.css_style.mainStyle["color"] } );
						}
					} else {
						var temp = this.css_style.background.style.nav.customized.general;
						if (this.togglerButtonVisible)
							styles = Object.assign(styles,{ "background-color": menu_background});
						else {
							styles = Object.assign(styles,{ "background-color": temp["background-color"] });
							styles = Object.assign(styles,{ "border-color": temp["color"] });
							//overwrite occasional mainstyle
							if (this.css_style.mainStyle["color"])
								styles = Object.assign(styles,{ "border-color" : this.css_style.mainStyle["color"] });
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
							document.getElementById("quest-menu-list").style.background = this.css_style.background["url"];
							document.getElementById("quest-menu-list").style.mozBackgroundSize = "cover";
							document.getElementById("quest-menu-list").style.backgroundSize =  "cover";
						}
						else
							styles = Object.assign(styles,menu_backgroundImage);
						styles = Object.assign(styles,{ "border": default_image_menu_border });
						if (this.css_style.mainStyle["color"])
							styles = Object.assign(styles,{ "border-color": this.css_style.mainStyle["color"] });
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
					if (this.css_style.mainStyle["color"])
						styles = Object.assign(styles,{ "border-color" : this.css_style.mainStyle["color"] });
				}
				else {
					styles = Object.assign(styles, { "border-color" : default_image_divider_color } );
					if (this.css_style.mainStyle["color"])
						styles = Object.assign(styles,{ "border-color" : this.css_style.mainStyle["color"] } );
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
			submitStyle: function() {
				styles = {};
				//if the card uses bootstrap the related style is in the Object submitBootstrapStyle
				if (!this.css_style.background.image)
					if (this.css_style.background.style.card.custom)
						styles = Object.assign(styles, { "color" : this.css_style.background.style.card.customized["color"] } );
				styles = Object.assign(styles, this.submitStyleObject);
				styles = this.overwriteMainStyle(styles);
				if (this.css_style.mainStyle["color"] || !this.css_style.background.style.card.custom)
					styles = Object.assign(styles, { "color" : this.css_style.mainStyle["color"]+"!important" } );			//used in order to overwrite bootstrap text color
				return styles;
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
				return this.overwriteMainStyle({});
			},
			questsStyle: function() {
				var styles = {};
				if (this.css_style.background.image) {
					styles = Object.assign(styles, { "color" : default_image_text_color } );
					styles = this.overwriteMainStyle(styles);
				}
				else
					if (!this.css_style.background.style.nav.custom)
						styles = this.overwriteMainStyle(styles);
					else {
						styles = Object.assign(styles, { "color" : this.css_style.background.style.nav.customized.general["color"] } );
						styles = this.overwriteMainStyle(styles);
					}
				return styles;
			},
			removePredefinedStylesCard: function() {
					return this.overwriteMainStyle({});
			},
			componentStyle: function() {
				var styles = {}
				if (this.currentComponent == "choiceinput")
					;
				if (this.currentComponent == "textinput")
					style = this.overwriteMainStyle(styles);
					style = Object.assign(styles,input_backgroundImage);
					if (!this.css_style.background.image)
						if (!this.css_style.mainStyle["color"])
							styles = Object.assign(styles, { "color" : "inherit" } );
				if (this.currentComponent == "imginput")
				   ;
				return styles;
			}
		}
      });
