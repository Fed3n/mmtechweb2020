var app = new Vue({
  el: "#app",
  data: {
    players_data: {},
    players_data_changing: {},
    players_chat: {},
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
      }, 5000);
    },
    getPlayersData: function() {
      axios.get("http://localhost:8080/players/").then(response => {
        console.log(response.data);
        this.players_data = response.data;
        for (let id in this.players_data) {
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
          var prev_chat_length = this.players_chat[id] ? Object.keys(this.players_chat[id]).length : 0;
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
    patchPlayersData: function() {
        axios.patch('http://localhost:8080/players/', this.players_data_changing)
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
    }
  }
});
