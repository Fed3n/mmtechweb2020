window.onload = function() {
    let title = document.getElementById("questname");
    if (title) title.focus();
}

//PLACEHOLDER OBJECTS//
gamedata_pholder = {
    "mainQuest": [{
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
    }],
    "subQuests": [{
        "number": 0,
        "title": "",
        "available_on": [],
        "requires_sub": [],
        "text": "",
        "type": "",
        "description": "",
        "options": [],
        "solution": []
    }],
    "css_style": {
        "mainStyle": {
            "font-family": "",
            "font-style": "",
            "font-weight": "",
            "font-size": "",
            "color": "",
            "font-url": ""
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
                        "color": ""
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
                        "color": ""
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
        "choiceinput": choiceinput,
        "textinput": textinput,
        "imginput": imginput,
        "keyboardinput": keyboardinput,
        "humaninput": humaninput,
        "qrload": qrload
    },
    data: {
        restored: false,
        user_id: "",
        user_name: "",
        time_played: 0,
        time_inactive: 0, // entrambe in secondi
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
        firstclick: true,
        bool_inchat: false,
        gamedata: gamedata_pholder,
        metadata: metadata_pholder,
        questname: null,
        currentQuest: 0,
        currentSub: 0,
        completedSubs: [],
        in_mainquest: true,
        picked: null,
        wrong_sub_ans: false,
        togglerButtonVisible: true,
        onLink: [],
        submitStyleObject: {}
    },
    watch: {
        //Se ans_feedback cambia e stavo aspettando un feedback
        ans_feedback: function(newans, oldans) {
            if (this.waiting_feedback) {
                this.waiting_feedback = false;
                this.received_feedback = true;
            }
        }
    },
    mounted: function() {
        this.updateEverySecond();
        this.trackTimeEverySecond();
    },
    methods: {
        chatAppear: function(fromHelp) {
            let node = this.$refs.chatbtn.innerHTML;
            if (this.firstclick && fromHelp) {
                this.firstclick = false;
                this.$refs.chatbtn.click();
            } else {
                if (this.bool_inchat) {
                    this.bool_inchat = false;
                    node = "Chat";
                    this.$refs.questnamebutton.click();
                } else if ((!this.bool_inchat && fromHelp)) {
                    this.bool_inchat = true;
                    node = "X";
                }
                this.$refs.chatbtn.innerHTML = node;
            }
        },
        requestHelp: function() {
            if (!this.help_message) {
                this.$refs.requestedHelp.style.display = "inline-block";
                this.$refs.help.classList.add("disabled");
                this.help_requested = true;
            }
        },
        updateEverySecond: function() {
            let timerId = setInterval(() => {
                this.sendGameData();
                this.getGameData();
                this.getCurrentChats();
                if (this.waiting_feedback) this.checkAnsFeedback();
                if (this.currentComponent && this.help_received)
                    this.$refs.requestedHelp.style.display = "none";
            }, 1000);
        },
        trackTimeEverySecond: function() {
            let timerId = setInterval(() => {
                this.time_played++;
                this.time_inactive++;
            }, 1000);
        },
        sendGameData: function() {
            axios.patch(`/players/${this.user_id}`, {
                    user_id: this.user_id,
                    user_name: this.user_name,
                    in_mainquest: this.in_mainquest,
                    currentQuest: this.currentQuest,
                    currentSub: this.currentSub,
                    completedSubs: this.completedSubs,
                    score: this.score,
                    help_requested: this.help_requested,
                    help_received: this.help_received,
                    finished: this.renderQuest.type == 'ending',
                    time_inactive: this.time_inactive,
                    time_played: this.time_played,
                    newPlayerMsgs: this.newPlayerMsgs
                })
                .catch(err => {
                    alert("Server riavviato, elimino la sessione...");
                    this.deleteCookies();
                    location.reload();
                });
        },
        getGameData: function() {
            let uid = {
                params: {
                    user_id: this.user_id
                }
            };
            axios.get('/players/', uid).then(response => {
                for (let key in response.data) {
                    //Se arriva un help msg vuoto non sovrascrivo il vecchio
                    if(key == "help_message" && response.data[key] != "")
                        this[key] = response.data[key];
                }
                if (this.help_message !== "") {
                    this.help_received = true;
                    this.help_requested = false;
                }
            }).catch(err => {});
        },
        sendChatMsg: function() {
            if (this.chat_msg) {
                msg = {
                    sender_id: `utente_${this.user_id}`,
                    sender: this.user_name,
                    text: this.chat_msg
                };
                axios.post(`chat/${this.user_id}`, msg);
                this.chat.push(msg);
                this.chat_msg = "";
                this.$nextTick(() => {
                    scrollToBottom("chatbox");
                });
            }
        },
        getCurrentChats: function() {
            axios.get("/chat", {
                params: {
                    user_id: this.user_id
                }
            }).then(response => {
                old_chat = this.chat;
                this.chat = response.data;
                if (this.chat.length > old_chat.length) {
                    this.$nextTick(() => {
                        scrollToBottom("chatbox");
                    });
                }
            });
        },
        checkAnsFeedback: function() {
            axios.get(`/feedback/`, {
                params: {
                    user_id: this.user_id
                }
            }).then((res) => {
                this.ans_feedback = res.data;
            });
        },
        logout: function() {
            this.$refs.logoutcontainer.style.display = "block";
            this.$refs.questrender.style.filter = "blur(8px)";
            this.$refs.questrender.style.pointerEvents = "none";
            this.$refs.questrender.style.userSelect = "none";
            this.$refs.questrender.disabled = true;
            this.$refs.accordion.style.filter = "blur(10px)";
            this.$refs.accordion.style.pointerEvents = "none";
            this.$refs.accordion.style.userSelect = "none";
            this.$refs.accordion.disabled = true;
            if (!(this.$refs.accord1.classList.contains("show")) && !(this.$refs.accord2.classList.contains("show")) &&
                !(this.gamedata.css_style.background.image)) {
                if (this.gamedata.css_style.background.style.card.custom == true) {
                    this.$refs.logoutcontainer.style.backgroundColor =
                        this.gamedata.css_style.background.style.card.customized["background-color"];
                    this.$refs.logoutcontainer.style.border = "2px solid " +
                        this.gamedata.css_style.background.style.card.customized.color;
                } else {
                    try {
                        this.$refs.logoutcontainer.classList.add(this.gamedata.css_style.background.style.card.bootstrap.background);
                    } catch (error) {
                        this.$refs.logoutcontainer.style.backgroundColor = "transparent";
                        this.$refs.logoutcontainer.style.border = "none";
                    }
                }
            } else {
                this.$refs.logoutcontainer.style.backgroundColor = "transparent";
                this.$refs.logoutcontainer.style.border = "none";
            }
            var i;
            var nodes = document.getElementsByClassName("willdisabled");
            for (i = 0; i < nodes.length; i++) {
                nodes[i].disabled = true;
                nodes[i].setAttribute("tabindex", "-1");
            }
            this.$refs.logoutcontainer.focus();
        },
        logoutconfirm: function() {
            this.deleteCookies();
            location.reload();
        },
        logoutdecline: function() {
            this.$refs.logoutcontainer.style.display = "none";
            this.$refs.questrender.style.filter = "none";
            this.$refs.questrender.style.pointerEvents = "auto";
            this.$refs.questrender.style.userSelect = "auto";
            this.$refs.accordion.style.filter = "none";
            this.$refs.accordion.style.pointerEvents = "auto";
            this.$refs.accordion.style.userSelect = "auto";
            var nodes = document.getElementsByClassName("willdisabled")
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].disabled = false;
                nodes[i].removeAttribute("tabindex");
            }
            this.$refs.questname.focus();
        },
        deleteCookies: function() {
            Cookies.remove('user_id'); //1
            Cookies.remove('user_name'); //1
            Cookies.remove('questname'); //2
            Cookies.remove('logged'); //3
            Cookies.remove('time_played'); //4
            Cookies.remove('time_inactive'); //5
            Cookies.remove('score'); //6
            Cookies.remove('currentQuest'); //7
            Cookies.remove('currentSub'); //8
            Cookies.remove('completedSubs'); //9
            Cookies.remove('in_mainquest'); //10
            console.log("SESSION CLEARED");
        },
        changeQuest: function() {
            if (this.questname) {
                //Inizialmente la variabile è a false, ed in tal caso il sistema prova a ripristinare i cookies preesistenti.
                //Se la variabile restored è a true, il sistema non prova a ripristinare i cookies.
                this.restored = true;
                axios.get(`/stories/${this.questname}`).then(response => {
                    this.gamedata = response.data.json;
                    this.metadata = response.data.meta;
                    document.getElementById("questname").focus();
                    this.setFontUrl();
                    if (!Cookies.get('logged')) {
                        //Chiedo al server il mio user id che è in formato nome_storia$numero
                        axios.get("/uid", {
                            params: {
                                story_name: this.metadata.name
                            }
                        }).then(res => {
                            this.user_id = res.data.id;
                            this.user_name = res.data.pname;
                            //Creo Cookies sull'utente
                            Cookies.set('logged', true, {
                                expires: 1
                            });
                            Cookies.set('user_id', this.user_id, {
                                expires: 1
                            });
                            Cookies.set('user_name', this.user_name, {
                                expires: 1
                            });
                            Cookies.set('questname', this.questname, {
                                expires: 1
                            });
                            Cookies.set('time_played', this.time_played, {
                                expires: 1
                            });
                            Cookies.set('time_inactive', this.time_inactive, {
                                expires: 1
                            });
                            Cookies.set('score', this.score, {
                                expires: 1
                            });
                            Cookies.set('in_mainquest', true, {
                                expires: 1
                            });
                            Cookies.set('currentQuest', 0, {
                                expires: 1
                            });
                            Cookies.set('currentSub', 0, {
                                expires: 1
                            });
                            //E mi faccio assegnare uno starting point
                            this.changeState(this.parseStart(this.user_id));
                        });
                    }
                });
            }
        },
        parseStart: function(id) {
            if (this.gamedata.starting_points) {
                let len = this.gamedata.starting_points.length;
                let n = parseInt(id.substring(id.indexOf("$") + 1, id.length));
                return (n % len);
            }
        },
        changeState: function(state) {
            this.currentQuest = this.gamedata.starting_points[state];
        },
        goToSubQuest: function(quest) {
            this.picked = null;
            this.wrong_sub_ans = false;
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
            Cookies.set('in_mainquest', this.in_mainquest, {
                expires: 1
            });
            Cookies.set('currentSub', this.currentSub, {
                expires: 1
            });
            resetDivScrolling();
        },
        goToMainQuest: function() {
            this.picked = null;
            this.wrong_sub_ans = false;
            this.$refs.inputForm.reset();
            this.in_mainquest = true;
            this.$refs.questname.focus();
            if (this.$refs.help)
                this.$refs.help.classList.remove("disabled");
            this.help_message = "";
            this.help_received = false;
            this.sendGameData();
            //Aggiorno lo stato dei cookies
            Cookies.set('in_mainquest', this.in_mainquest, {
                expires: 1
            });
            Cookies.set('currentQuest', this.currentQuest, {
                expires: 1
            });
            resetDivScrolling();
        },
        submitMain: function() {
            //Caso particolare in cui il submit si comporta diversamente perché non usa il valore picked
            if (this.renderQuest.type == "human") {
                this.picked = this.ans_feedback;
                this.waiting_feedback = false;
                this.received_feedback = false;
                this.ans_feedback = "";
            }
            options = this.getCurrentGotos;
            for (opt of options) {
                //Le risposte del tipo draw hanno un formato diverso
                if (this.gamedata.mainQuest[this.currentQuest].type == "draw") {
                    let x = opt[0][0];
                    let y = opt[0][1];
                    let radius = parseInt(opt[0][2]);
                    if (this.picked[0] >= x - radius && this.picked[0] <= x + radius &&
                        this.picked[1] >= y - radius && this.picked[1] <= y + radius) {
                        this.currentQuest = opt[1];
                        //Per ragioni di compatibilità mi assicuro ci sia lo score
                        if (opt[2]) this.score += parseInt(opt[2]);
                        this.time_inactive = 0;
                        this.$refs.help.classList.remove("disabled");
                        this.help_message = "";
                        this.help_received = false;
                        this.sendGameData();
                        break;
                    }
                }
                //Formato standard che controlla se opt[0] == picked
                else if (opt[0] == this.picked) {
                    if (this.currentComponent != "")
                        this.$refs.help.classList.remove("disabled");
                    this.currentQuest = opt[1];
                    //Per ragioni di compatibilità mi assicuro ci sia lo score
                    if (opt[2]) this.score += parseInt(opt[2]);
                    this.help_message = "";
                    this.help_received = false;
                    this.sendGameData();
                    break;
                }
                //L'opzione di default se non ci sono corrispondenze è sempre l'ultima
                if (options.indexOf(opt) == options.length - 1) {
                    if (this.currentComponent != "")
                        this.$refs.help.classList.remove("disabled");
                    this.currentQuest = opt[1];
                    //Per ragioni di compatibilità mi assicuro ci sia lo score
                    if (opt[2]) this.score += parseInt(opt[2]);
                    this.time_inactive = 0;
                    this.help_message = "";
                    this.help_received = false;
                    this.sendGameData();
                    resetDivScrolling();
                }
            }
            this.$refs.inputForm.reset();
            this.picked = null;
            if (this.renderQuest.type == "keys") this.$refs.inputComponent.text = "";
            //Aggiorno lo stato dei cookies
            Cookies.set('in_mainquest', this.in_mainquest, {
                expires: 1
            });
            Cookies.set('currentQuest', this.currentQuest, {
                expires: 1
            });
            this.$refs.questname.focus();
        },
        submitSub: function() {
            this.$refs.inputForm.reset();
            let wrong_answer = (this.renderQuest.type === "") ? false : true;
            let subQuest = this.renderQuest;
            if (this.renderQuest.type == "keys") this.$refs.inputComponent.text = "";
            if (subQuest.type == "draw") {
                for (ans of subQuest.solution) {
                    let x = ans[0];
                    let y = ans[1];
                    let radius = parseInt(ans[2]);
                    if (this.picked[0] >= x - radius && this.picked[0] <= x + radius &&
                        this.picked[1] >= y - radius && this.picked[1] <= y + radius) {
                        wrong_answer = false;
                    }
                }
            } else {
                for (ans of subQuest.solution)
                    if (this.picked == ans)
                        wrong_answer = false;
            }
            //feedback in case of wrong answer
            if (wrong_answer) {
                this.wrong_sub_ans = true;
                return;
            }

            this.time_inactive = 0;
            this.completedSubs.push(subQuest.number);
            this.help_message = "";
            this.help_received = false;
            this.in_mainquest = true;
            this.picked = null;
            this.wrong_sub_ans = false;
            //If per ragioni di compatibilità...
            if (this.renderQuest.sub_score) this.score += parseInt(this.renderQuest.sub_score);
            this.$refs.questname.focus();
            this.sendGameData();
            //Aggiorno lo status dei Cookies
            Cookies.set('in_mainquest', this.in_mainquest, {
                expires: 1
            });
            Cookies.set('currentSub', this.currentSub, {
                expires: 1
            });
            let obj = JSON.stringify(this.completedSubs);
            Cookies.set('completedSubs', obj, {
                expires: 1
            });
            resetDivScrolling();
        },
        overwriteMainStyle: function(styles, color) {
            var main_style = this.gamedata.css_style.mainStyle;
            var main_style_cleaned = {};
            Object.entries(main_style).forEach(entry => {
                const [key, value] = entry;
                if (value != "" && key != "font-url") {
                    if (key != "color")
                        main_style_cleaned[key] = value;
                    else if (color)
                        main_style_cleaned[key] = value;
                }
            });
            return Object.assign(styles, main_style_cleaned);
        },
        setFontUrl: function() {
            if (this.gamedata.css_style.mainStyle['font-url'])
                document.getElementById("externalFontUrl").setAttribute('href', this.gamedata.css_style.mainStyle['font-url']);
        },
        //method that returns if navbar button is visible
        buttonChangedVisibility: function(isVisible, entry) {
            this.togglerButtonVisible = isVisible
        },
        menuLinkEvent: function(num, bool) {
            this.onLink = new Array(this.getSubquests.length + 1);
            this.onLink.fill(false);
            this.onLink[num] = bool;
        },
        menuLinkStyle: function(num, apply) {
            let styles = {};
            if (!this.gamedata.css_style.background.image) {
                if (!this.gamedata.css_style.background.style.nav.custom) {
                    //adding text color property
                    //predefined style used in addition to bootstrap navbar style
                    if (!this.gamedata.css_style.mainStyle["color"])
                        if (color = this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-light")
                            styles = Object.assign(styles, bootstrap_menu_color_dark_text);
                        else if (this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-dark")
                        styles = Object.assign(styles, bootstrap_menu_color_light_text);
                    styles = this.overwriteMainStyle(styles, true);
                    //adding background color property
                    if (apply) {
                        if (this.onLink[num]) {
                            if (this.gamedata.css_style.background.style.nav.bootstrap.background != "bg-light")
                                styles = Object.assign(styles, {
                                    "background-color": bootstrap_menu_links_light_background
                                });
                            else
                                styles = Object.assign(styles, {
                                    "background-color": bootstrap_menu_links_background
                                });
                        }
                    }
                } else {
                    //adding text color property
                    styles = Object.assign(styles, {
                        "color": this.gamedata.css_style.background.style.nav.customized.general["color"]
                    });
                    styles = this.overwriteMainStyle(styles, true);
                    //adding background color property
                    if (apply) {
                        if (this.onLink[num])
                            if (this.gamedata.css_style.background.style.nav.customized.general["background-color"] == "white")
                                styles = Object.assign(styles, {
                                    "background-color": menu_links_white_background
                                });
                            else
                                styles = Object.assign(styles, {
                                    "background-color": menu_links
                                });
                    }
                }
            } else {
                styles = Object.assign(styles, {
                    "color": default_image_menu_links_text_color
                });
                styles = this.overwriteMainStyle(styles, true);
                //adding background color property
                if (apply) {
                    if (this.onLink[num])
                        styles = Object.assign(styles, {
                            "background-color": default_image_menu_links_hover_backgroud_color
                        });
                }
            }
            //used for menu responsivness
            if (this.togglerButtonVisible)
                styles = Object.assign(styles, {
                    "white-space": "normal"
                });
            else
                styles = Object.assign(styles, {
                    "white-space": "normal"
                }, {
                    "max-width": "65vw"
                });
            return styles;
        },
        upgradeSubmitStyle: function(disabled) {
            //adding responsive style
            styles = {};
            if (!disabled)
                styles = Object.assign(styles, submit_button_style);
            else {
                styles = Object.assign(styles, submit_button_style_disabled);
                var temp = this.gamedata.css_style.background.style.card;
                if (!this.gamedata.css_style.background.image)
                    if ((temp.custom && temp.customized["background-color"] == "black") || (!temp.custom && temp.bootstrap.background == "bg-dark"))
                        styles = Object.assign(styles, {
                            "border": submit_button_border
                        });
            }
            this.submitStyleObject = styles;
        }
    },
    computed: {
        currentComponent: function() {
            try {
                var type = this.renderQuest.type;
                if (type == "choice") return "choiceinput";
                else if (type == "input") return "textinput";
                else if (type == "draw") return "imginput";
                else if (type == "keys") return "keyboardinput";
                else if (type == "human") return "humaninput";
                else return "";
            } catch (error) {
                console.log("Loading component...");
            }
        },
        renderQuest: function() {
            if (this.gamedata == null) return null;
            if (Cookies.get('logged') === 'true' && this.restored == false) {
                this.user_id = Cookies.get('user_id');
                this.user_name = Cookies.get('user_name');
                this.questname = Cookies.get('questname');
                this.time_played = Cookies.get('time_played');
                this.time_inactive = Cookies.get('time_inactive');
                this.score = Cookies.get('score');
                this.currentQuest = Cookies.get('currentQuest');
                //I Cookies vengono salvati solo come stringhe, e non come booleani
                if (Cookies.get('in_mainquest') === 'true') this.in_mainquest = true;
                else this.in_mainquest = false; //7
                this.currentSub = Cookies.get('currentSub');
                if (Cookies.getJSON('completedSubs')) this.completedSubs = Cookies.getJSON('completedSubs'); //9
                this.changeQuest();
            }
            if (this.in_mainquest) return this.gamedata.mainQuest[this.currentQuest];
            else return this.gamedata.subQuests[this.currentSub];
        },
        getSubquests: function() {
            var subQuestList = [];
            if (!this.gamedata || this.gamedata == gamedata_pholder) return subQuestList;
            else {
                for (sub of this.gamedata.subQuests) {
                    if (!this.completedSubs.includes(sub.number) && sub.available_on.includes(parseInt(this.currentQuest)) &&
                        sub.requires_sub.every(val => this.completedSubs.includes(val)))
                        subQuestList.push(sub);
                }
            }
            return subQuestList;
        },
        getCurrentClues: function() {
            clues = [];
            for (reward of this.renderQuest.subquest_rewards) {
                if (this.completedSubs.includes(reward.number))
                    clues.push(reward.clue);
            }
            return clues;
        },
        getCurrentOptions: function() {
            if (this.renderQuest.options) {
                options = [];
                for (opt of this.renderQuest.options)
                    options.push(opt);
                for (reward of this.renderQuest.subquest_rewards) {
                    if (this.completedSubs.includes(reward.number)) {
                        for (opt of reward.added_options)
                            options.push(opt);
                        for (opt of reward.removed_options) {
                            if ((index = myIndexOf(options, opt, arrCmp)) != -1)
                                options.splice(index, 1);
                        }
                    }
                }
            }
            return options;
        },
        getCurrentGotos: function() {
            gotos = [];
            for (goto of this.renderQuest.goto)
                gotos.push(goto);
            for (reward of this.renderQuest.subquest_rewards) {
                if (this.completedSubs.includes(reward.number)) {
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
            return ("story/" + this.metadata.name + (this.renderQuest.media.type == "image" ? "/images/" : "/videos/") + this.renderQuest.media.uri);
        },
        submitDisabled: function() {
            let disabled = false;
            //Se il tipo è "" (none) è sempre abilitato
            if (!this.renderQuest.type) disabled = false;
            //In un type ending è sempre disabilitato (il gioco è finito)
            else if (this.renderQuest.type == "ending") disabled = true;
            //Se siamo in human input allora il submit è abilitato se ho ricevuto feedback dal valutatore
            else if (this.renderQuest.type == "human") disabled = !this.ans_feedback;
            //Altrimenti è abilitato se c'è una risposta inserita
            else disabled = !this.picked;
            this.upgradeSubmitStyle(disabled);
            return disabled;
        },
        //styleObjects
        loadImage: function() {
            var temp = this.gamedata.css_style.background;
            if (temp.image) {
                document.getElementsByTagName("body")[0].style.background = temp["url"];
                document.getElementsByTagName("body")[0].style.webkitBackgroundSize = "cover";
                document.getElementsByTagName("body")[0].style.mozBackgroundSize = "cover";
                document.getElementsByTagName("body")[0].style.oBackgroundSize = "cover";
                document.getElementsByTagName("body")[0].style.backgroundSize = "cover";
            } else {
                document.getElementsByTagName("body")[0].style.background = "none";
            }
        },
        navbarBootstrapStyle: function() {
            var temp = this.gamedata.css_style.background.style.nav.bootstrap;
            if (!this.gamedata.css_style.background.image)
                if (!this.gamedata.css_style.background.style.nav.custom)
                    return (temp.textColor + " " + temp.background);
                else
                    return "";
            else
                return "";
        },
        navbarStyle: function() {
            let styles = {};
            if (!this.gamedata.css_style.background.image) {
                if (this.gamedata.css_style.background.style.nav.custom)
                    styles = Object.assign(styles, this.gamedata.css_style.background.style.nav.customized.general);
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
            let styles = {}
            var temp = this.gamedata.css_style.background.style.badge.customized;
            if (this.gamedata.css_style.background.style.badge.custom)
                styles = Object.assign(styles, temp);
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
            let styles = {}
            var temp = this.gamedata.css_style.background.style.alert.customized;
            if (this.gamedata.css_style.background.style.alert.custom)
                styles = Object.assign(styles, temp);
            //apply mainstyle in any case
            styles = this.overwriteMainStyle(styles, true);
            //alert color is more important than maincolor
            if (this.gamedata.css_style.background.style.alert.custom)
                styles = Object.assign(styles, {
                    'color': temp['color']
                });
            if (!this.togglerButtonVisible)
                styles = Object.assign(styles, {
                    "margin-top": "-10px"
                });
            return styles;
        },
        helpAlertContainerStyle: function() {
            let styles = {};
            if (!this.gamedata.css_style.background.image) {
                if (!this.gamedata.css_style.background.style.nav.custom) {
                    var temp = this.gamedata.css_style.background.style.nav.bootstrap.textColor;
                    if (temp == "navbar-light")
                        styles = Object.assign(styles, {
                            "color": "black"
                        });
                    else if (temp == "navbar-dark")
                        styles = Object.assign(styles, {
                            "color": "white"
                        });
                } else {
                    var temp = this.gamedata.css_style.background.style.nav.customized.general;
                    styles = Object.assign(styles, {
                        "color": temp["color"]
                    });
                }
            } else
                styles = Object.assign(styles, {
                    "color": defaul_image_alert_color
                });
            styles = this.overwriteMainStyle(styles, true);
            if (this.togglerButtonVisible)
                styles = Object.assign(styles, {
                    "margin-top": "-10px"
                });
            return styles;
        },
        togglerButtonStyle: function() {
            var buttonColor;
            if (!this.gamedata.css_style.background.image) {
                if (this.gamedata.css_style.background.style.nav.custom) {
                    if (this.gamedata.css_style.mainStyle["color"])
                        buttonColor = this.gamedata.css_style.mainStyle["color"];
                    else
                        buttonColor = this.gamedata.css_style.background.style.nav.customized.general["color"];
                    return `url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='${HextoRgb(buttonColor)}' stroke-width='${togglerbutton_default_linesWidth}' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E") `;
                } else
                    return "";
            } else {
                if (buttonColor = this.gamedata.css_style.mainStyle["color"])
                ;
                else
                    buttonColor = default_image_togglerButton_color;
                return `url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='${HextoRgb(buttonColor)}' stroke-width='${togglerbutton_default_linesWidth}' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E") `;
            }
        },
        toggleButtonContainer: function() {
            if (!this.gamedata.css_style.background.image) {
                if (this.gamedata.css_style.background.style.nav.custom) {
                    var borderColor;
                    if (this.gamedata.css_style.mainStyle["color"])
                        borderColor = this.gamedata.css_style.mainStyle["color"];
                    else
                        borderColor = this.gamedata.css_style.background.style.nav.customized.general["color"];
                    return {
                        "border-color": borderColor
                    };
                } else
                    return "";
            } else {
                var borderColor = default_image_togglerButton_border_color;
                if (this.gamedata.css_style.mainStyle["color"])
                    borderColor = this.gamedata.css_style.mainStyle["color"];
                return {
                    "border-color": borderColor
                };
            }
        },
        mainquestButtonBootstrapStyle: function() {
            if (!this.gamedata.css_style.background.image)
                if (!this.gamedata.css_style.background.style.card.custom)
                    if (!this.gamedata.css_style.mainStyle["color"])
                        return this.gamedata.css_style.background.style.card.bootstrap["textColor"];
                    else
                        return "";
        },
        menuStyle: function() {
            let styles = {};
            if (!this.gamedata.css_style.background.image) {
                if (!this.gamedata.css_style.background.style.nav.custom) {
                    if (this.togglerButtonVisible)
                        //predefined style used in addition to bootstrap navbar style
                        styles = Object.assign(styles, {
                            "background-color": bootstrap_menu_background
                        });
                    else {
                        var color = "";
                        if (color = this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-light")
                            styles = Object.assign(styles, bootstrap_menu_border_color_dark_text);
                        else if (this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-dark")
                            styles = Object.assign(styles, bootstrap_menu_border_color_light_text);
                        //overwrite occasional mainstyle
                        if (this.gamedata.css_style.mainStyle["color"])
                            styles = Object.assign(styles, {
                                "border-color": this.gamedata.css_style.mainStyle["color"]
                            });
                    }
                } else {
                    var temp = this.gamedata.css_style.background.style.nav.customized.general;
                    if (this.togglerButtonVisible)
                        styles = Object.assign(styles, {
                            "background-color": menu_background
                        });
                    else {
                        styles = Object.assign(styles, {
                            "background-color": temp["background-color"]
                        });
                        styles = Object.assign(styles, {
                            "border-color": temp["color"]
                        });
                        //overwrite occasional mainstyle
                        if (this.gamedata.css_style.mainStyle["color"])
                            styles = Object.assign(styles, {
                                "border-color": this.gamedata.css_style.mainStyle["color"]
                            });
                    }
                }
            } else {
                if (this.togglerButtonVisible)
                    //predefined style used in addition to bootstrap navbar style
                    styles = Object.assign(styles, {
                        "background-color": menu_background
                    });
                else {
                    if (document.getElementById("submit").style.backdropFilter !== "") {
                        document.getElementById("quest-menu-list").style.background = this.gamedata.css_style.background["url"];
                        document.getElementById("quest-menu-list").style.mozBackgroundSize = "cover";
                        document.getElementById("quest-menu-list").style.backgroundSize = "cover";
                    } else
                        styles = Object.assign(styles, menu_backgroundImage);
                    styles = Object.assign(styles, {
                        "border": default_image_menu_border
                    });
                    if (this.gamedata.css_style.mainStyle["color"])
                        styles = Object.assign(styles, {
                            "border-color": this.gamedata.css_style.mainStyle["color"]
                        });
                }
            }
            if (!this.togglerButtonVisible)
                styles = Object.assign(styles, {
                    "width": "max-content"
                });
            return styles;
        },
        dividerStyle: function() {
            let styles = {};
            if (!this.gamedata.css_style.background.image) {
                if (!this.gamedata.css_style.background.style.nav.custom)
                    //if the bootstrap class is "navbar-light" the text will be dark
                    if (this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-light")
                        styles = Object.assign(styles, {
                            "border-color": bootstrap_menu_divider_dark
                        });
                    else
                        styles = Object.assign(styles, {
                            "border-color": bootstrap_menu_divider_light
                        });
                else {
                    var temp = this.gamedata.css_style.background.style.nav.customized.general;
                    styles = Object.assign(styles, {
                        "border-color": temp["color"]
                    });
                }
                //overwrite mainstyle if present
                if (this.gamedata.css_style.mainStyle["color"])
                    styles = Object.assign(styles, {
                        "border-color": this.gamedata.css_style.mainStyle["color"]
                    });
            } else {
                styles = Object.assign(styles, {
                    "border-color": default_image_divider_color
                });
                if (this.gamedata.css_style.mainStyle["color"])
                    styles = Object.assign(styles, {
                        "border-color": this.gamedata.css_style.mainStyle["color"]
                    });
            }
            return styles;
        },
        menuBootstrapStyle: function() {
            if (!this.gamedata.css_style.background.image) {
                if (!this.gamedata.css_style.background.style.nav.custom) {
                    var temp = this.gamedata.css_style.background.style.nav.bootstrap;
                    if (!this.togglerButtonVisible)
                        return temp.background;
                    else
                        return "";
                } else
                    return "";
            } else
                return "";
        },
        cardBootstrapStyle: function() {
            if (!this.gamedata.css_style.background.image) {
                var temp = this.gamedata.css_style.background.style.card.bootstrap;
                if (!this.gamedata.css_style.background.style.card.custom)
                    return (temp.textColor + " " + temp.background);
                else {
                    return "";
                }
            } else
                return "";
        },
        cardStyle: function() {
            let styles = {};
            if (!this.gamedata.css_style.background.image) {
                var temp = this.gamedata.css_style.background.style.card.customized;
                if (this.gamedata.css_style.background.style.card.custom)
                    styles = Object.assign(styles, temp);
            } else
                styles = Object.assign(styles, {
                    "background": "transparent"
                });
            return styles;
        },
        submitBootstrapStyle: function() {
            if (!this.gamedata.css_style.background.image)
                if (!this.gamedata.css_style.background.style.card.custom)
                    return this.gamedata.css_style.background.style.card.bootstrap.textColor;
        },
        submitStyle: function() {
            let styles = {};
            styles = Object.assign(styles, this.submitStyleObject);
            //if the card uses bootstrap the related style is in the Object submitBootstrapStyle
            if (!this.gamedata.css_style.background.image)
                if (this.gamedata.css_style.background.style.card.custom)
                    styles = Object.assign(styles, {
                        "color": this.gamedata.css_style.background.style.card.customized["color"]
                    });
            styles = this.overwriteMainStyle(styles, true);
            //overwrite bootstrap text color
            if (this.gamedata.css_style.mainStyle["color"] && !this.gamedata.css_style.background.style.card.custom)
                styles = Object.assign(styles, {
                    "color": this.gamedata.css_style.mainStyle["color"] + "!important"
                });
            return styles;
        },
        logoutBtnStyle: function() {
            let styles = {};
            styles = Object.assign(styles, {
                "background-color": "rgba(255,255,255,0.18)"
            });
            styles = this.overwriteMainStyle(styles, true);
            if (!this.gamedata.css_style.background.image)
                if (this.gamedata.css_style.background.style.card.custom)
                    styles = Object.assign(styles, {
                        "color": this.gamedata.css_style.background.style.card.customized["color"]
                    });
            styles = this.overwriteMainStyle(styles, true);
            if (this.gamedata.css_style.mainStyle["color"] && !this.gamedata.css_style.background.style.card.custom)
                styles = Object.assign(styles, {
                    "color": this.gamedata.css_style.mainStyle["color"] + "!important"
                });
            return styles;
        },
        cardLimitStyle: function() {
            let styles = {};
            if (!this.gamedata.css_style.background.image) {
                styles = Object.assign(styles, card_headerFooter);
                var temp = this.gamedata.css_style.background.style.card;
                if ((!temp.custom && temp.bootstrap.background == "bg-dark") || (temp.custom && temp.customized["background-color"] == "black"))
                    styles = Object.assign(styles, bootstrap_card_headerFooter_black_background);
            }
            //stylistic choices lead us not to add this feature if there is a background image
            return styles;
        },
        navbarBrandStyle: function() {
            return this.overwriteMainStyle({}, true);
        },
        questsStyle: function() {
            let styles = {};
            if (this.gamedata.css_style.background.image) {
                styles = Object.assign(styles, {
                    "color": default_image_text_color
                });
                styles = this.overwriteMainStyle(styles, true);
            } else
            if (!this.gamedata.css_style.background.style.nav.custom)
                styles = this.overwriteMainStyle(styles, true);
            else {
                styles = Object.assign(styles, {
                    "color": this.gamedata.css_style.background.style.nav.customized.general["color"]
                });
                styles = this.overwriteMainStyle(styles, true);
            }
            return styles;
        },
        removePredefinedStylesCard: function() {
            let styles = {};
            var temp = this.gamedata.css_style.background;
            if (!temp.image)
                if (temp.style.card.custom)
                    styles = Object.assign(styles, {
                        "color": temp.style.card.customized.color
                    });
            return this.overwriteMainStyle(styles, true);
        },
        componentStyle: function() {
            let styles = {}
            if (this.currentComponent == "choiceinput")
            ;
            if (this.currentComponent == "imginput")
            ;
            if (this.currentComponent == "textinput")
                style = this.overwriteMainStyle(styles, true);
            style = Object.assign(styles, input_backgroundImage);
            if (!this.gamedata.css_style.background.image)
                if (!this.gamedata.css_style.mainStyle["color"])
                    styles = Object.assign(styles, {
                        "color": "inherit"
                    });
            return styles;
        },
        //if there is no image in background the default background color is white. This method adds proper chat background color
        //@global param: navbar_color (style_consts.js)
        //								true --> chat background color is navbar background textColor
        //								false --> chat background color is card background textColor
        chatBackgroundStyle: function() {
            let styles = {};
            let temp = this.gamedata.css_style.background.style;
            if (!this.gamedata.css_style.background.image)
                if (navbar_color) {
                    if (temp.nav.custom)
                        styles = Object.assign(styles, {
                            "background-color": temp.nav.customized.general['background-color']
                        });
                } else {
                    if (temp.card.custom)
                        styles = Object.assign(styles, {
                            "background-color": temp.card.customized['background-color']
                        });
                }
            return styles;
        },
        //same function of chatBackgroundStyle but for bootstrap styles
        chatBackgroundBootstrapStyle: function() {
            let temp = this.gamedata.css_style.background.style;
            if (!this.gamedata.css_style.background.image)
                if (navbar_color) {
                    if (!temp.nav.custom)
                        return temp.nav.bootstrap.background;
                } else {
                    if (!temp.card.custom)
                        return temp.card.bootstrap.background;
                }
            return;
        },
        setColorStylesChat: function() {
            let styles = {};
            let temp = this.gamedata.css_style.background;
            if (!temp.image)
                if (navbar_color) {
                    if (temp.style.nav.custom)
                        styles = Object.assign(styles, {
                            "color": temp.style.nav.customized.general.color
                        });
                } else {
                    if (temp.style.card.custom)
                        styles = Object.assign(styles, {
                            "color": temp.style.card.customized.color
                        });
                }
            return this.overwriteMainStyle(styles, true);
        },
        setBootstrapColorStylesChat: function() {
            let temp = this.gamedata.css_style.background;
            if (!temp.image)
                if (navbar_color) {
                    if (!temp.style.nav.custom)
                        if (temp.style.nav.bootstrap.textColor == "navbar-dark")
                            return "text-light";
                        else
                            return "text-dark";
                } else {
                    if (!temp.style.card.custom)
                        return temp.style.card.bootstrap.textColor;
                }
        },
    }
});
