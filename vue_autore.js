  //PLACEHOLDER OBJECT//
			pholder = {
				      "mainQuest": [
				            {
						               "number": 0,
						               "text": "",
						               "type": "",
						               "description": "",
						               "options": [],
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

      var app = new Vue({
        el: "#app",
        components: {
          "choiceinput": httpVueLoader("components/choice_input.vue"),
          "textinput": httpVueLoader("components/text_input.vue"),
          "imginput": httpVueLoader("components/img_input.vue")
        },
        data: {
              previewdata: {
                "currentQuest": 0,
                "currentSub": 0,
                "completedSubs": [],
                "in_mainquest": true,
                "picked": null
              },
              gamedata: pholder
        },
        methods: {
          changeQuest: function(number){
            console.log(number);
            if(this.previewdata.in_mainquest) this.previewdata.currentQuest = number;
            else this.previewdata.currentSub = number;
          },
          switchMainSub: function() {
            this.previewdata.in_mainquest = !this.previewdata.in_mainquest;
          },
          addNode: function() {
            num = this.previewdata.in_mainquest ? this.gamedata.mainQuest.length : this.gamedata.subQuests.length;
            mq = {
                   "number": num,
                   "text": "",
                   "type": "",
                   "description": "",
                   "options": [],
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
          rmNode: function() {
            var ok = confirm("Are you sure you want to delete the last node?");
            if(ok){
              if(this.previewdata.in_mainquest){
                if(this.gamedata.mainQuest.length > 1) {
                  if(this.previewdata.currentQuest == this.gamedata.mainQuest.length-1) this.previewdata.currentQuest -= 1;
                  this.gamedata.mainQuest.pop();
                }
                else alert("Cannot have fewer than one quest.")
              }
              else{
                if(this.gamedata.subQuests.length > 1) {
                  if(this.previewdata.currentSub == this.gamedata.subQuests.length-1) this.previewdata.currentSub -= 1;
                  this.gamedata.subQuests.pop();
                }
                else alert("Cannot have fewer than one quest.")
              }
            }
          },
          addGoto: function(){
            this.renderQuest.goto.push(["",0]);
          },
          rmGoto: function(){
            this.renderQuest.goto.pop();
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
          generateChoiceGotos: function(){
            gotos = [];
            for(opt of this.renderQuest.options){
              gotos.push([opt,0]);
            }
            this.renderQuest.goto = gotos;
          },
          setCompleted: function(event,n) {
            if(event.target.checked) this.previewdata.completedSubs.push(n);
            else this.previewdata.completedSubs.splice(this.previewdata.completedSubs.indexOf(n),1);
          },
          setRemovedOpt: function(event,index,opt) {
            if(event.target.checked) this.renderQuest.subquest_rewards[index].removed_options.push(opt);
            else this.renderQuest.subquest_rewards[index].removed_options.splice(this.renderQuest.subquest_rewards[index].removed_options.indexOf(opt),1);
          },
          setRemovedGoto: function(event,index,goto) {
            if(event.target.checked) this.renderQuest.subquest_rewards[index].removed_goto.push(goto);
            else this.renderQuest.subquest_rewards[index].removed_goto.splice(this.renderQuest.subquest_rewards[index].removed_goto.indexOf(goto),1);
          },
          setAvailableOn: function(event,n) {
            if(event.target.checked) this.renderQuest.available_on.push(n);
            else this.renderQuest.available_on.splice(this.renderQuest.available_on.indexOf(n),1);
          },
          addSubReward: function() {
            reward = {
              "number": this.$refs.subtoadd.value,
    					"clue": "",
    					"added_options": [],
    					"removed_options": [],
    					"added_goto": [],
    					"removed_goto": []
            }
            this.renderQuest.subquest_rewards.push(reward);
            this.renderQuest.subquest_rewards.sort(questCmp);
          },
          loadJson: function(){
            var path = this.$refs.toLoad.files[0];
            console.log(path);
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
            //Qua conto sul fatto che la proprietà number di ogni quest rappresenta il suo indice nella lista
            var alreadyIn = [];
            var remaining = [];
            for(sub of this.renderQuest.subquest_rewards)
              alreadyIn.push(sub.number);
            for(sub of this.gamedata.subQuests){
              if(!alreadyIn.includes(sub.number))
                remaining.push(sub);
            }
            console.log(alreadyIn);
            console.log(remaining);
            return remaining;
          }
				}
      });
