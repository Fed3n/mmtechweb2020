var app = new Vue({
    el: "#app",
    components: {
        "choiceinput": httpVueLoader("components/choice_input.vue"),
        "textinput": httpVueLoader("components/text_input.vue"),
        "imginput": httpVueLoader("components/img_input.vue"),
        "keyboardinput": httpVueLoader("components/keyboard_input.vue")
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
            in_mainquest: true,
            currentQuest: 0,
            currentSub: 0,
            picked: null,
            completedSubs: []
        },
        metadata: {
            name: null
        },
        currentStory: null
    },
    created: function(){
        this.patchPlayersData();
        this.getPlayersData();
        this.getCurrentChats();
        this.getPlayerAnswers();
    },
    mounted: function() {
        this.updatesEvery5Seconds();
    },
    destroyed: function() {
        players_data = {};
    },
    methods: {
        updatesEvery5Seconds: function() {
            let timerId = setInterval(() => {
                this.patchPlayersData();
                this.getPlayersData();
                this.getCurrentChats();
                this.getPlayerAnswers();
            }, 5000);
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
                        });
                    }
                    //Controllo sugli aiuti
                    if (this.players_data[id].help_received && this.players_data[id].help_message != "") {
                        this.players_data_changing[id] = this.players_data_changing[id] || {};
                        this.players_data_changing[id].help_sent = false;
                    }
                    // Se un giocatore ha finito, faccio partire un timer che lo rimuove dopo 2 minuti
                    if (this.players_data[id].finished === true) {
                        setTimeout(function() {
                            axios.delete(`/players/${id}`);
                        }, 2 * 60 * 1000);
                    }
                    // Giocatori inattivi per oltre 10 minuti vengono rimossi
                    if (this.players_data[id].time_inactive > 10 * 60 * 1000) {
                        axios.delete(`/players/${id}`);
                    }
                }
            });
        },
        clearAllData: function() {
            let choice = confirm("Vuoi davvero cancellare tutti i dati di gioco? La pagina sarà ricaricata.");
            if (choice) {
                axios.post("/clear/").then(response => {
                    location.reload();
                });
            }
        },
        switchIndex: function(id) {
            if (this.players_chat) {
                this.current_chat_id = id;
                this.chat_notify[id] = false;
            }
        },
        sendChatMsg: function() {
            if (this.chat_msg[this.current_chat_id]) {
                msg = {
                    sender: "Valutatore",
                    text: this.chat_msg[this.current_chat_id]
                };
                axios.post(`chat/${this.current_chat_id}`, msg);
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
            });
        },
        getPlayerAnswers: function() {
            axios.get('/answers/').then(response => {
                let answers = response.data;
                for (let id in answers) {
                    this.$set(this.players_ans, id, answers[id]);
                }
            });
        },
        patchPlayersData: function() {
            axios.patch('/players/', this.players_data_changing)
                .then(res => {
                    this.players_data_changing = {};
                })
                .catch(err => {
                    console.log(err)
                });
        },
        saveJson: function() {
            var data = JSON.stringify(this.players_data, null, 4);
            var blob = new Blob([data], {
                type: 'application/json'
            });
            var a = document.createElement("a");
            a.download = "stats.json";
            a.innerHTML = "Download JSON";
            //Funzione createObjectURL cross-browser
            var createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function() {};
            a.href = createObjectURL(blob);
            a.click();
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
            });
        },
        selectInterfaceFields: function({
            user_id,
            in_mainquest,
            currentQuest,
            currentSub,
            completedSubs
        }) {
            return {
                user_id,
                in_mainquest,
                currentQuest,
                currentSub,
                completedSubs
            };
        },
        computeStory: function(id) {
            return id.substring(0, id.indexOf("$"));
        },
        computeJson: function(id) {
            let story = this.computeStory(id);
            return this.ongoing_stories[story];
        },
        getQuestData: function(story) {
            if (this.previewdata.in_mainquest) return this.ongoing_stories[story].mainQuest[this.previewdata.currentQuest];
            else return this.ongoing_stories[story].subQuests[this.previewdata.currentSub];
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
        }







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





       getCurrentClues: function() {
           clues = [];
           for (reward of this.getCurrentQuestData.subquest_rewards) {
               if (this.previewdata.completedSubs.includes(reward.number))
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
           else return "";
       },
       getCurrentOptions: function() {
           if (this.getCurrentQuestData.options) {
               options = [];
               for (opt of this.getCurrentQuestData.options)
                   options.push(opt);
               for (reward of this.getCurrentQuestData.subquest_rewards) {
                   if (this.previewdata.completedSubs.includes(reward.number)) {
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









       //preview della storia
       /*
       getMediaSrc: function() {
           return ("story/" + this.metadata.name + (this.getCurrentQuestData.media.type == "image" ? "/images/" : "/videos/") + this.getCurrentQuestData.media.uri);
       },*/
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
               document.getElementById("preview").style.webkitBackgroundSize = "cover";
               document.getElementById("preview").style.mozBackgroundSize = "cover";
               document.getElementById("preview").style.oBackgroundSize = "cover";
               document.getElementById("preview").style.backgroundSize = "cover";
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
           style = Object.assign(styles, input_backgroundImage);
           if (!this.ongoing_stories[this.currentStory].css_style.background.image)
               if (!this.ongoing_stories[this.currentStory].css_style.mainStyle["color"])
                   styles = Object.assign(styles, {
                       "color": "inherit"
                   });
           if (this.currentComponent == "imginput")
           ;
           return styles;
       }
    }
});
