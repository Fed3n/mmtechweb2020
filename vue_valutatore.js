var app = new Vue({
  el: "#app",
  data: {
    players_data: {},
    players_data_changing: {},
    players_chat: {},
    current_chat_id: null,
    chat_msg: ""
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
        this.players_data = response.data;
      });
    },
    switchIndex: function(id){
      if(this.players_chat) {
        this.current_chat_id = id;
      }
    },
    sendChatMsg: function() {
      if(this.chat_msg){
        msg = {
          sender: "Valutatore",
          text: this.chat_msg
        };
        axios.post(`chat/${this.current_chat_id}`, msg)
        .then(() => { console.log("sent message successfully :)")});
        this.players_chat[this.current_chat_id].push(msg);
        this.chat_msg = "";
      }
    },
    getCurrentChats: function() {
      axios.get("/chat").then(response => {
        console.log(response.data);
        var chats = response.data;
        for(let id in chats){
          this.$set(this.players_chat, id, chats[id]);
        }
      });
    },
    patchPlayersData: function() {
        axios.patch('http://localhost:8080/players/', this.players_data_changing)
            .catch(err => {console.log(err)});
    },
    sendHelp: function(id) {
        this.players_data_changing[id] = this.players_data_changing[id] || {};
        this.players_data_changing[id].help_requested = true;
    }
  }
});
