var app = new Vue({
  el: "#app",
  data: {
    players_data: {},
    players_data_changing: {},
    ongoing_stories: {},
    players_chat: {},
    players_ans: {},
    current_chat_id: null,
    chat_msg: {},
    chat_notify: {}
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
            console.log(story);
            if(!(story in this.ongoing_stories)){
              console.log(`${story} missing from ongoing_stories!`);
              axios.get(`/stories/${story}/`).then((res) => {
                this.ongoing_stories[story] = res.data.json;
              });
            }
            //Controllo sugli aiuti
            if (this.players_data[id].help_received && this.players_data[id].help_message != "") {
                this.players_data_changing[id] = this.players_data_changing[id] || {};
                this.players_data_changing[id].help_sent = false;
            }
        }
      });
    },
    switchIndex: function(id){
      if(this.players_chat) {
        this.current_chat_id = id;
        this.chat_notify[id] = false;
      }
    },
    sendChatMsg: function() {
      if(this.chat_msg[this.current_chat_id]){
        msg = {
          sender: "Valutatore",
          text: this.chat_msg[this.current_chat_id]
        };
        axios.post(`chat/${this.current_chat_id}`, msg)
        .then(() => { console.log("sent message successfully :)")});
        this.players_chat[this.current_chat_id].push(msg);
        this.chat_msg[this.current_chat_id] = "";
      }
    },
    getCurrentChats: function() {
      axios.get("/chat").then(response => {
        var chats = response.data;
        for(let id in chats){
          //Aggiorno le chat esistenti e aggiungo le nuove
          let prev_chat_length = this.players_chat[id] ? Object.keys(this.players_chat[id]).length : 0;
          this.$set(this.players_chat, id, chats[id]);
          //Se è una chat nuova aggiungo il campo per il messaggio da scrivere
          if(!this.chat_msg[id]) this.$set(this.chat_msg, id, "");
          //Se è una chat nuova aggiungo il campo notifica a true
          if(!(id in this.chat_notify)) {
            this.$set(this.chat_notify, id, true);
          }
          //Sennò controllo se la lunghezza dell'array è aumentata e se non mi trovo già in quella chat, nel caso imposto la notifica
          else if(Object.keys(this.players_chat[id]).length > prev_chat_length && this.current_chat_id != id) {
            this.chat_notify[id] = true;
          }
        }
      });
    },
    getPlayerAnswers: function() {
      axios.get('/answers/').then(response => {
        let answers = response.data;
        for(let id in answers){
          this.$set(this.players_ans, id, answers[id]);
        }
      });
    },
    patchPlayersData: function() {
        axios.patch('/players/', this.players_data_changing)
            .then(res => {
              this.players_data_changing = {};
            })
            .catch(err => {console.log(err)});
    },
    sendHelp: function(id) {
        this.players_data_changing[id] = this.players_data_changing[id] || {};
        this.players_data_changing[id].help_sent = true;
        // dai un messaggio di aiuto
        this.players_data_changing[id].help_message = "Su quel ramo del lago di como";
    },
    sendFeedback: function(id,feedback) {
      axios.post('/feedback/', { 'text': feedback }, { params: { user_id: id } }).then((res) => {
        this.$delete(this.players_ans, id);
      });
    },
    computeStory: function(id) {
      return id.substring(0,id.indexOf("$"));
    },
    computeJson: function(id) {
      let story = this.computeStory(id);
      return this.ongoing_stories[story];
    }
  },
  computed: {
    waitingForFeedback: function(){
      waiting_list = [];
      for(id in this.players_ans){
        if(this.players_ans[id].waiting) waiting_list.push(id);
      }
      return waiting_list;
    }
  }
});
