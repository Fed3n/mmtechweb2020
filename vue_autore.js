  //PLACEHOLDER OBJECTS//
			gamedata_pholder = {
				      "mainQuest": [
				            {
						               "number": 0,
													 "title": "",
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
									"title": "",
            			"objective": "",
            			"available_on": [],
            			"requires_sub": [],
            			"text": "",
            			"type": "",
            			"description": "",
									"image": {
										"imguri": "",
										"imgalt": ""
									},
            			"solution": []
            		}
              ],
              "css_style": {
    						"nav": {
    							"textFont": "",
    							"textColor": "",
    							"textStyle": "",
    							"bgColor": ""
    						},
    						"card": {
    							"textFont": "",
    							"textColor": "",
    							"textStyle": "",
    							"bgColor": ""
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
          "imginput": httpVueLoader("components/img_input.vue")
        },
        data: {
							storyList: null,
							activeStoryList: null,
							inactiveStoryList: null,
							imagesList: null,
							selectedImage: "",
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
							}
        },
				created: function(){
					this.updateFs();
				},
        methods: {
					//SERVER INTERACTION METHODS//
					updateFs: function(){
						console.log("Requesting fs update...");
						var _this = this;
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
						var form = new FormData();
						imageFile = this.$refs.img_upload.files[0];
						storyName = this.$refs.selectedStory.value;
						form.append('image', imageFile);
						var _this = this;
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
						var _this = this;
						axios.get(`/stories/${this.metadata.name}/images`).then( (res) => {
							console.log("Hi!! :)");
							console.log(res.data);
							_this.imagesList = res.data;
						});
					},
					//////////////////////////////////
          changeQuest: function(number){
            if(this.previewdata.in_mainquest){
							this.previewdata.currentQuest = number;
							this.previewdata.picked = null;
						}
            else {
							this.previewdata.currentSub = number;
							this.previewdata.picked = null;
						}
          },
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
        },
        computed: {
					currentComponent: function() {
						if(this.gamedata == null)
			    	    return "";
						var type;
			  	  if(this.previewdata.in_mainquest)
			    	    type = this.gamedata.mainQuest[this.previewdata.currentQuest].type;
			  		else
			   				type = this.gamedata.subQuests[this.previewdata.currentSub].type;

			 			if (type == "choice") return "choiceinput";
			  		else if (type == "input") return "textinput";
						else if (type == "draw") return "imginput";
						else return "";
					},
          questList: function() {
            if(this.previewdata.in_mainquest) return this.gamedata.mainQuest;
            else return this.gamedata.subQuests;
          },
          renderQuest: function() {
						if(this.gamedata == null)
						      return null;
        		if(this.previewdata.in_mainquest) return this.gamedata.mainQuest[this.previewdata.currentQuest];
            else return this.gamedata.subQuests[this.previewdata.currentSub];
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
				}
			}
      });
