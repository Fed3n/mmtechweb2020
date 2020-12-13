var app = new Vue({
    el: "#app",
    directives: {
        //per settare la proprietà all'elemento del dom anche quando non è raggiungibile da refs
      	cover: {
        	inserted (el) {
          	el.style.backgroundSize = "cover";
            el.style.webkitBackgroundSize = "cover";
            el.style.mozBackgroundSize = "cover";
            el.style.oBackgroundSize = "cover";
          }
        }
    },
    components: {
      "choiceinput": choiceinput,
      "textinput": textinput,
      "imginput": imginput,
      "keyboardinput": keyboardinput,
      "humaninput": humaninput,
      "qrload": qrload
    },
    data: {
        players_data: {},
        players_data_changing: {},
        ongoing_stories: {},
        players_chat: {},
        players_ans: {},
        current_chat_id: null,
        chat_msg: {},
        chat_notify: {},
        previewdata: {
            position: {
              in_mainquest: true,
              selectedCurrentQuest: 0,
              completedSubs: []
            },
            notSelectedCurrentQuest: 0,
            picked: null
        },
        currentStory: null,
        feedback_id: "",
        windowDimension: "",
        gotoPlayer: ""
    },
    created: function(){
        this.patchPlayersData();
        this.getPlayersData();
        this.getCurrentChats();
        this.getPlayerAnswers();
    },
    mounted: function() {
        this.updatesEverySecond();
    },
    destroyed: function() {
        players_data = {};
    },
    methods: {
        updatesEverySecond: function() {
            let timerId = setInterval(() => {
                this.getPlayersData();
                this.patchPlayersData();
                this.getCurrentChats();
                this.getPlayerAnswers();
            }, 1000);
        },
        getPlayersData: function() {
            axios.get("/players/").then(response => {
                this.players_data = response.data;
                for (let id in this.players_data) {
                    //Se c'è una storia nuova, si aggiunge
                    let story = this.computeStory(id);
                    if (!(story in this.ongoing_stories)) {
                        axios.get(`/stories/${story}/`).then((res) => {
                            this.ongoing_stories[story] = res.data.json;
                        }).catch(err => {return});
                    }
                    //Controllo sugli aiuti
                    if (this.players_data[id].help_received && this.players_data[id].help_message != "") {
                        this.players_data_changing[id] = this.players_data_changing[id] || {};
                        this.players_data_changing[id].help_sent = false;
                        this.players_data_changing[id].help_message = "";
                    }/*
                    // Se un giocatore ha finito, faccio partire un timer che lo rimuove dopo 10 minuti
                    if (this.players_data[id].finished === true) {
                        setTimeout(function() {
                            axios.delete(`/players/${id}`).catch(err => console.log(err));
                        }, 10 * 60 * 1000);
                    }*/
                    /*
                    // Giocatori inattivi per oltre 20 minuti vengono rimossi
                    if (this.players_data[id].time_inactive > 20 * 60 * 1000) {
                        axios.delete(`/players/${id}`).catch(err => {return});
                    }*/
                }
            }).catch(err => {return});
        },
        deletePlayer: function(id){
            let ok = confirm("Vuoi davvero cancellare questo giocatore? I suoi dati verranno rimossi definitivamente.");
            if(ok){
                let lastPlayer = false;
                let nextStory = "";
                //controllo lo stato dell'interfaccia
                if ( Object.keys(this.players_data_shown_from_story[this.currentStory]).length == 1){
                  //non sono più presenti giocatori per quella storia, devo cambiare currentStory
                  lastPlayer = true;
                  let index = this.activeStories.indexOf(this.currentStory);
                  let temp = this.activeStories;
                  temp.splice(index,1);
                  nextStory = temp.slice(0,1);  //always the first story in activeStories
                }
                //mando il segnale di rimozione del player
                let _this = this;
                axios.delete(`/players/${id}`).then(function() {
                    delete _this.players_data[id];
                    delete _this.players_data_changing[id];
                    delete _this.players_chat[id];
                    delete _this.players_ans[id];
                })
                .catch(err => {
                    alert("Failed to delete player, try again.");
                    console.log(err);
                });
                //cambio currentStory nel caso in cui vengano eliminati tutti i players della storia, altrimenti sparisce la tabella
                if (lastPlayer){
                    if (nextStory){
                        this.currentStory = nextStory;
                    } else {
                        this.currentStory = null;
                    }
                }
            }
        },
        clearAllData: function() {
            let choice = confirm("Vuoi davvero cancellare tutti i dati di gioco? La pagina sarà ricaricata.");
            if (choice) {
                axios.post("/clear/").then(response => {
                    location.reload();
                }).catch(err => {return});
            }
        },
        switchStory: function(story){
            //poichè dopo la chiamata alla funzione nella preview cambia la storia controllo che non vengano richiesti numeri di quest non presenti
            let maxQuest = this.ongoing_stories[story].mainQuest.length -1 ;
            let maxSub = this.ongoing_stories[story].subQuests.length -1 ;
            if (this.previewdata.position.in_mainquest){
                if (this.previewdata.position.selectedCurrentQuest > maxQuest)
                    this.previewdata.position.selectedCurrentQuest = maxQuest;
                if (this.previewdata.notSelectedCurrentQuest > maxSub)
                    this.previewdata.notSelectedCurrentQuest = maxSub;
            }
            if (!this.previewdata.position.in_mainquest){
                if (this.previewdata.position.selectedCurrentQuest > maxSub)
                    this.previewdata.position.selectedCurrentQuest = maxSub;
                if (this.previewdata.notSelectedCurrentQuest > maxQuest)
                    this.previewdata.notSelectedCurrentQuest = maxQuest;
            }
            //svuoto anche le subquests Completate
            this.previewdata.position.completedSubs = [];
            //inizializzo le variabili
            this.currentStory = story;
            this.current_chat_id = null;
            this.switchIndex(null);
        },
        switchMainSub: function(in_mainquest) {
            this.previewdata.position.in_mainquest = in_mainquest;
            //pass from mainQuest to SubQuest
            let temp = this.previewdata.position.selectedCurrentQuest;
            this.previewdata.position.selectedCurrentQuest = this.previewdata.notSelectedCurrentQuest;
            this.previewdata.notSelectedCurrentQuest = temp;
        },
        switchIndex: function(id) {
            if (this.players_chat) {
                this.current_chat_id = id;
                this.chat_notify[id] = false;
            }
        },
        sendChatMsg: function() {
            if (this.current_chat_id && this.chat_msg[this.current_chat_id] && this.players_chat[this.current_chat_id]) {
                msg = {
                    sender: "Valutatore",
                    text: this.chat_msg[this.current_chat_id]
                };
                axios.post(`chat/${this.current_chat_id}`, msg).catch(err => {return});
                this.players_chat[this.current_chat_id].push(msg);
                this.chat_msg[this.current_chat_id] = "";
            }
        },
        getCurrentChats: function() {
            axios.get("/chat").then(response => {
                var chats = response.data;
                for (let id in chats) {
                    //Aggiorno le chat esistenti e aggiungo le nuove
                    let prev_chat_length = this.players_chat[id] ? Object.keys(this.players_chat[id]).length : 0;
                    this.$set(this.players_chat, id, chats[id]);
                    //Se è una chat nuova aggiungo il campo per il messaggio da scrivere
                    if (!this.chat_msg[id]) this.$set(this.chat_msg, id, "");
                    //Se è una chat nuova aggiungo il campo notifica a true
                    if (!(id in this.chat_notify)) {
                        this.$set(this.chat_notify, id, true);
                    }
                    //Sennò controllo se la lunghezza dell'array è aumentata e se non mi trovo già in quella chat, nel caso imposto la notifica
                    else if (Object.keys(this.players_chat[id]).length > prev_chat_length && this.current_chat_id != id) {
                        this.chat_notify[id] = true;
                    }
                }
            }).catch(err => {return});
        },
        getPlayerAnswers: function() {
            axios.get('/answers/').then(response => {
                let answers = response.data;
                for (let id in answers) {
                    this.$set(this.players_ans, id, answers[id]);
                }
            })
            .catch(err => {return});
        },
        patchPlayersData: function() {
            axios.patch('/players/', this.players_data_changing)
                .then(res => {
                    this.players_data_changing = {};
                })
                .catch(err => {
                    return;
                });
        },
        saveJson: function() {
            var data = this.getStatistics();
            var blob = new Blob([data], {
                type: 'text/plain;charset=utf-8'
            });
            var a = document.createElement("a");
            a.download = "statistiche.txt";
            a.innerHTML = "Download FILE";
            //Funzione createObjectURL cross-browser
            var createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function() {};
            a.href = createObjectURL(blob);
            a.click();
        },
        getStatistics: function() {
            let text = "";
            if (this.players_data_from_story)
                text += "Storie Utilizzate:\n";
            for (const [key,value] of Object.entries(this.players_data_from_story)){
                text += "- "+key+"\n";
            }
            text += "\n";
            for (const [key,value] of Object.entries(this.players_data_from_story)){
                text += "Giocatori in "+key+":\n";
                for (const [index,player] of Object.entries(value)){
                    console.log(player);
                    text += "\t"+player.user_name+(player.finished ? "" : " non")+" ha finito il gioco\n";
                    text += "\t\t punteggio ottenuto: "+player.score+(player.finished ? ", Voto:"+this.computeGrade(player.user_id) : "")+",\n";
                    text += "\t\t tempo di gioco: "+this.getStringTime(player.time_played)+",\n";
                    text += "\t\t tempo di inattività: "+this.getStringTime(player.time_inactive)+",\n";
                    text += "\t\t ha completato "+player.completedSubs.length+" subquest.\n";
                }
                text += "\n";
            }
            text += "\n";
            return text;
        },
        getStringTime: function(time) {
            let text = "";
            let hours = time / 3600;
            let minutes = (time % 3600) / 60;
            let seconds = (time % 3600) % 60;
            text += Math.floor(hours)+" ore "+Math.floor(minutes)+" minuti "+seconds+" secondi";
            return text;
        },
        sendHelp: function(id) {
            this.players_data_changing[id] = this.players_data_changing[id] || {};
            this.players_data_changing[id].help_sent = true;
            var msg = prompt("Inserisci un messaggio di aiuto");
            this.players_data_changing[id].help_message = msg;
        },
        sendFeedback: function(id, feedback) {
            axios.post('/feedback/', {
                'text': feedback
            }, {
                params: {
                    user_id: id
                }
            }).then((res) => {
                this.$delete(this.players_ans, id);
                this.feedback_id = "";
                $('#feedbackmodal').modal('hide');
            }).catch(err => {return});
        },
        selectInterfaceFields: function({
            user_id,
            user_name,
            score,
            in_mainquest,
            currentQuest,
            currentSub,
            completedSubs
        }) {
            return {
                user_id,
                user_name,
                score,
                in_mainquest,
                currentQuest,
                currentSub,
                completedSubs
            };
        },
        filterPlayersData: function({
            user_id,
            user_name,
            in_mainquest,
            currentQuest,
            currentSub,
            completedSubs
        }) {
            //ordino tutti gli array per permettere al v-model di riconoscerne l'ugualianza
            completedSubs.sort(function(a, b) { return a - b; });
            if (in_mainquest) {
                let selectedCurrentQuest = currentQuest;
                return {
                    user_id,
                    user_name,
                    position: {
                      in_mainquest,
                      selectedCurrentQuest,
                      completedSubs
                    }
                  };
           } else {
             let selectedCurrentQuest = currentSub;
             return {
                 user_id,
                 user_name,
                 position: {
                   in_mainquest,
                   selectedCurrentQuest,
                   completedSubs
                 }
               };
           }
        },
        computeStory: function(id) {
            return id.substring(0, id.indexOf("$"));
        },
        computeJson: function(id) {
            let story = this.computeStory(id);
            return this.ongoing_stories[story];
        },
        computeGrade: function(id) {
            if(this.computeJson(id)){
                let grading = this.computeJson(id).scoretier;
                let player = this.players_data[id];
                if (grading){
                    if(player.score >= grading.a) return "A";
                    else if(player.score >= grading.b) return "B";
                    else if(player.score >= grading.c) return "C";
                    else return "D";
                } else {
                    console.log("grading non definito. ComputeGrade - vue_valutatore");
                }
            }
            else return "";
        },
        getQuestData: function(story) {
            if (this.previewdata.position.in_mainquest) return this.ongoing_stories[story].mainQuest[this.previewdata.position.selectedCurrentQuest];
            else return this.ongoing_stories[story].subQuests[this.previewdata.position.selectedCurrentQuest];
        },
        getQuest: function(number){
            if (this.previewdata.position.in_mainquest) return this.ongoing_stories[this.currentStory].mainQuest[number];
            else return this.ongoing_stories[this.currentStory].subQuests[number];
        },
        resetSelection: function() {
            if (this.getCurrentQuestData){
                let questType = this.getCurrentQuestData.type;
                if (questType != "human"){
                    if (questType == "keys")
                        this.$refs.inputComponent.text = "";
                    if (questType == "choice" || questType == "input")
                        this.$refs.inputForm.reset();
                    if ( questType == "draw")
                        this.previewdata.picked = null;
                }
            }
        },
        openFeedModal: function(id){
            this.feedback_id = id;
            $('#feedbackmodal').modal('toggle');
        },

        //style METHODS
        overwriteMainStyle: function(styles) {
            var main_style = this.ongoing_stories[this.currentStory].css_style.mainStyle;
            var main_style_cleaned = {};
            Object.entries(main_style).forEach(entry => {
                const [key, value] = entry;
                if (value != "")
                    main_style_cleaned[key] = value;
            });
            return Object.assign(styles, main_style_cleaned);
        },
        upgradeSubmitStyle: function(disabled) {
            styles = {};
            if (!disabled)
                styles = Object.assign(styles, submit_button_style);
            else {
                styles = Object.assign(styles, submit_button_style_disabled);
                var temp = this.ongoing_stories[this.currentStory].css_style.background.style.card;
                if (!this.ongoing_stories[this.currentStory].css_style.background.image)
                    if ((temp.custom && temp.customized["background-color"] == "black") || (!temp.custom && temp.bootstrap.background == "bg-dark"))
                        styles = Object.assign(styles, {
                            "border": submit_button_border
                        });
            }
            this.submitStyleObject = styles;
        },
        //method that returns witch div is visible now (divs are based on bootstrap parameters)
        bootstrapVisibility: function(isVisible, entry) {
            if (isVisible){
                console.log("entry: "+ entry);
                this.windowDimension = entry.target.getAttribute("data-device");
            }
        },
    },
    computed: {
        firstPlayer: function() {
            let firstKey = Object.keys(this.players_data_shown)[0];
            return this.players_data_shown[firstKey];
        },
        players_data_shown: function() {
            var filtered_data = {};
            for (const key in this.players_data) {
                filtered_data[key] = this.selectInterfaceFields(this.players_data[key]);
            }
            return filtered_data;
        },
        players_data_shown_filtered: function() {
            var filtered_data = {};
            for (const key in this.players_data) {
                filtered_data[key] = this.filterPlayersData(this.players_data[key]);
            }
            return filtered_data;
        },
        players_data_shown_from_story: function() {
            var res = {};
            for (let story of this.activeStories) {
                res[story] = {};
                for (let player in this.players_data_shown) {
                    if (player.split('$')[0] == story) {
                        res[story][player] = this.players_data_shown[player];
                    }
                }
            }
            return res;
        },
        players_data_shown_from_story_filtered: function() {
            var res = {};
            for (let story of this.activeStories) {
                res[story] = {};
                for (let player in this.players_data_shown_filtered) {
                    if (player.split('$')[0] == story) {
                        res[story][player] = this.players_data_shown_filtered[player];
                    }
                }
            }
            return res;
        },
        players_chat_from_story: function() {
            var res = {};
            for (let story of this.activeStories) {
                res[story] = {};
                for (let player in this.players_chat) {
                    if (player.split('$')[0] == story) {
                        res[story][player] = this.players_chat[player];
                    }
                }
            }
            return res;
        },
        players_data_from_story: function() {
            var res = {};
            for (let story of this.activeStories) {
                res[story] = {};
                for (let player in this.players_data) {
                    if (player.split('$')[0] == story) {
                        res[story][player] = this.players_data[player];
                    }
                }
            }
            return res;
        },
        current_chat_messages: function() {
            if (this.players_chat)
                if (this.players_chat[this.current_chat_id])
                    return this.players_chat[this.current_chat_id].length;
        },
        waitingForFeedback: function() {
            waiting_list = [];
            for (id in this.players_ans) {
                if (this.players_ans[id].waiting) waiting_list.push(id);
            }
            return waiting_list;
        },
        activeStories: function() {
            var stories = new Set();
            for (let playerID in this.players_data) {
                stories.add(playerID.split("$")[0]); // playerID = [story, id]
            }
            //inizializzo currentStory
            if (!this.currentStory) this.currentStory = Array.from(stories)[0];
            return Array.from(stories);
       },
       getCurrentQuestData: function() {
         return this.getQuestData(this.currentStory);
       },
       //oggetti della preview della storia
       getCurrentClues: function() {
           clues = [];
           for (reward of this.getCurrentQuestData.subquest_rewards) {
               if (this.previewdata.position.completedSubs.includes(reward.number))
                   clues.push(reward.clue);
           }
           return clues;
       },
       currentComponent: function() {
           var type = this.getCurrentQuestData.type;
           if (type == "choice") return "choiceinput";
           else if (type == "input") return "textinput";
           else if (type == "draw") return "imginput";
           else if (type == "keys") return "keyboardinput";
           else if (type == "human") return "humaninput";
           else return "";
       },
       getCurrentOptions: function() {
           if (this.getCurrentQuestData.options) {
               options = [];
               for (opt of this.getCurrentQuestData.options)
                   options.push(opt);
               for (reward of this.getCurrentQuestData.subquest_rewards) {
                   if (this.previewdata.position.completedSubs.includes(reward.number)) {
                       for (opt of reward.added_options)
                           options.push(opt);
                       for (opt of reward.removed_options) {
                           if ((index = options.indexOf(opt)) != -1) {
                               options.splice(index, 1);
                           }
                       }
                   }
               }
           }
           return options;
       },
       getCurrentGotos: function() {
           gotos = [];
           for (goto of this.getCurrentQuestData.goto)
               gotos.push(goto);
           for (reward of this.getCurrentQuestData.subquest_rewards) {
               if (this.previewdata.position.completedSubs.includes(reward.number)) {
                   for (goto of reward.added_goto)
                       //Aggiungo in penultima posizione
                       gotos.splice(gotos.length - 1, 0, goto);
                   for (goto of reward.removed_goto) {
                       if ((index = myIndexOf(gotos, goto, arrCmp)) != -1)
                           options.splice(index, 1);
                   }
               }
           }
           return gotos;
       },
       getMediaSrc: function() {
           return ("story/" + this.metadata.name + (this.getCurrentQuestData.media.type == "image" ? "/images/" : "/videos/") + this.getCurrentQuestData.media.uri);
       },
       submitDisabled: function() {
           let disabled = false;
           //Se il tipo è "" (none) è sempre abilitato
           if (!this.getCurrentQuestData.type) disabled = false;
           //In un type ending è sempre disabilitato (il gioco è finito)
           else if (this.getCurrentQuestData.type == "ending") disabled = true;
           //Se siamo in human input allora il submit è abilitato se ho ricevuto feedback dal valutatore
           else if (this.getCurrentQuestData.type == "human") disabled = !this.ans_feedback;
           //Altrimenti è abilitato se c'è una risposta inserita
           else disabled = !this.previewdata.picked;
           this.upgradeSubmitStyle(disabled);
           return disabled;
       },
       metadata: function() {
           return {
                  name: this.currentStory
                  };
       },
       previewdata_change: function() {
          let p = this.previewdata;
          return (p.in_mainquest && ((p.currentQuest + p.currentSub + p.completedSubs.length)) %2 == 0);
       },
       completedSubsReorder: function() {
          this.previewdata.position.completedSubs.sort(function(a, b) { return a - b; });
       },
       completedSubs_change: function() {
          return this.previewdata.position.completedSubs;
       },


       /*
       get_current_grid_option: function(){
           //returns bootstrap parameters applied (sm, md, lg, xs, xl)
           let elements = document.querySelectorAll(".device-check");
           let visible;

           elements.forEach((el, i) => {
              let style = window.getComputedStyle(el);
              console.log("dddd: "+ style.display);
              if (style.display === 'none'){
                  visible = el;
              }
           });
           return visible.getAttribute("data-device");
           //return $('.device-check:visible').attr('data-device');
       },
       */

       //oggetti di stile per la preview
       previewStyle: function() {
           var styles = {};
           //loading background image
           var temp = this.ongoing_stories[this.currentStory].css_style.background;
           if (temp.image) {
               styles = Object.assign(styles, {
                   "background-image": temp["url"],
                   "background-position": "center center"
               });
               /*document.getElementById("preview-container").style.webkitBackgroundSize = "cover";
               document.getElementById("preview-container").style.mozBackgroundSize = "cover";
               document.getElementById("preview-container").style.oBackgroundSize = "cover";
               document.getElementById("preview-container").style.backgroundSize = "cover";*/
           } else {
               styles = Object.assign(styles, {
                   "background-image": "none"
               });
           }
           //loading mobile resolution
           styles = Object.assign(styles, {
               "width": mobile_width,
               "height": mobile_height,
               "overflow": "auto"
           });
           //setting font URL
           if (this.ongoing_stories[this.currentStory].css_style.mainStyle['font-url'])
               document.getElementById("externalFontUrl").setAttribute('href', this.ongoing_stories[this.currentStory].css_style.mainStyle['font-url']);
           return styles;
       },
       cardBootstrapStyle: function() {
           if (!this.ongoing_stories[this.currentStory].css_style.background.image) {
               var temp = this.ongoing_stories[this.currentStory].css_style.background.style.card.bootstrap;
               if (!this.ongoing_stories[this.currentStory].css_style.background.style.card.custom)
                   return (temp.textColor + " " + temp.background);
               else {
                   return "";
               }
           } else
               return "";
       },
       cardStyle: function() {
           var styles = {};
           if (!this.ongoing_stories[this.currentStory].css_style.background.image) {
               var temp = this.ongoing_stories[this.currentStory].css_style.background.style.card.customized;
               if (this.ongoing_stories[this.currentStory].css_style.background.style.card.custom)
                   styles = Object.assign(styles, temp);
           } else
               styles = Object.assign(styles, {
                   "background": "transparent"
               });
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
           if (this.currentComponent == "humaninput")
               style = this.overwriteMainStyle(styles, true);
           style = Object.assign(styles, input_backgroundImage);
           if (!this.ongoing_stories[this.currentStory].css_style.background.image)
               if (!this.ongoing_stories[this.currentStory].css_style.mainStyle["color"])
                   styles = Object.assign(styles, {
                       "color": "inherit"
                   });
           if (this.currentComponent == "imginput")
           ;
           return styles;
       },
       submitBootstrapStyle: function() {
           if (!this.ongoing_stories[this.currentStory].css_style.background.image)
               if (!this.ongoing_stories[this.currentStory].css_style.background.style.card.custom)
                   return this.ongoing_stories[this.currentStory].css_style.background.style.card.bootstrap.textColor;
       },
       submitStyle: function() {
           //questa funzione si occupa di gestire il colore del bottone submit
           styles = {};
           //se la card utilizza bootstrap gli stili corrispondenti sono specificati in submitBootstrapStyle
           if (!this.ongoing_stories[this.currentStory].css_style.background.image)
               if (this.ongoing_stories[this.currentStory].css_style.background.style.card.custom)
                   styles = Object.assign(styles, {
                       "color": this.ongoing_stories[this.currentStory].css_style.background.style.card.customized["color"]
                   });
           styles = Object.assign(styles, this.submitStyleObject);
           styles = this.overwriteMainStyle(styles);
           if (this.ongoing_stories[this.currentStory].css_style.mainStyle["color"] && !this.ongoing_stories[this.currentStory].css_style.background.style.card.custom)
               styles = Object.assign(styles, {
                   "color": this.ongoing_stories[this.currentStory].css_style.mainStyle["color"] + "!important" //è necessario per sovrascrivere il colore assegnato da bootstrap
               });
           return styles;
       },
       cardLimitStyle: function() {
           var styles = {};
           if (!this.ongoing_stories[this.currentStory].css_style.background.image) {
               styles = Object.assign(styles, card_headerFooter);
               var temp = this.ongoing_stories[this.currentStory].css_style.background.style.card;
               if ((!temp.custom && temp.bootstrap.background == "bg-dark") || (temp.custom && temp.customized["background-color"] == "black"))
                   styles = Object.assign(styles, bootstrap_card_headerFooter_black_background);
           }
           //stylistic choices lead us not to add this feature if there is a background image
           return styles;
       },
       //PROPRIETA' DI STILE UTILIZZATE PER RENDERE GRADEVOLE ANCHE LA VISUALIZZAZIONE DA MOBILE
       storiesSelectorStyle: function() {
          if (this.windowDimension == "sm" || this.windowDimension == "xs"){
              return "border-bottom";
          } else {
              return "border-right pl-2 pr-3";
          }
       },
       tabContentStyle: function() {
          if (this.windowDimension == "sm" || this.windowDimension == "xs"){
              return "";
          } else {
              return "pl-3 pr-0";
          }
       },
       dataButtonStyle: function() {
         if (this.windowDimension == "sm" || this.windowDimension == "xs"){
             return "mt-4 justify-content-center";
         } else {
             return "mr-4 justify-content-end";
         }
       },
       storyPreviewStyle: function() {
         if (this.windowDimension == "sm" || this.windowDimension == "xs"){
             return "mt-2";
         } else {
             return "container-fluid mt-3";
         }
       },
       previewMenuStyle: function() {
         if (this.windowDimension == "sm" || this.windowDimension == "xs"){
             return "";
         } else {
             return "p-3 mt-0 mb-1";
         }
       },
       mainSubSwitchStyle: function() {
         if (this.windowDimension == "sm" || this.windowDimension == "xs"){
             return "mb-3 mt-2";
         } else {
             return "mx-3 mb-3 mt-2";
         }
       },
       mainSubSelectorStyle: function() {
         if (this.windowDimension == "sm" || this.windowDimension == "xs"){
             return "m-3 mb-4 px-2";
         } else {
             return "form-group m-3 mb-4 px-3";
         }
       },
       inputMainSubSelectorStyle: function() {
         if (this.windowDimension == "sm" || this.windowDimension == "xs"){
             return "col-10";
         } else {
             return "";
         }
       },
       previewContainerStyle: function() {
         if (this.windowDimension == "sm" || this.windowDimension == "xs"){
             return "mt-2 pt-2";
         } else {
             return "py-3";
         }
       },
       listGroupStyle: function() {
         if (this.windowDimension == "sm" || this.windowDimension == "xs"){
             return "border-bottom pl-2 pr-0 pb-3";
         } else {
             return "border-right pl-2 pr-0";
         }
       }
    },
    watch: {
        current_chat_messages: function(val) {
            setTimeout(function() {
                let el = document.getElementById("chatmessagecontainer");
                //effettua lo scroll della chat ad ogni messaggio ricevuto
                el.scrollTop = el.scrollHeight;
            }, 1);
        },
        previewdata_change: function() {
            this.previewdata.picked = null;
        },
        completedSubs_change: function() {
          if ( !(sort = arraySorted(this.previewdata.position.completedSubs)) ){
              this.completedSubsReorder;
          }
        }
    }
});

$('#feedbackmodal').on('hidden.bs.modal', function () {
    app.feedback_id = "";
})
