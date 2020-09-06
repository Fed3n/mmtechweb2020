var app = new Vue({
  el: "#app",
  data: {
    players_data: {},
    players_chat2: {
      "12": [
        {sender: "Fede", text: "Ciao"},
        {sender: "Fede", text: "come stai?"}
      ],
      "26": [
        {sender: "Thom", text: "Hey"},
        {sender: "Thom", text: "mi puoi aiutare?"}
      ]
    },
    players_chat: {},
    current_chat_id: null,
    chat_msg: ""
  },
  mounted: function() {
    this.getUpdatesEvery5Seconds();
  },
  destroyed: function() {
    players_data = [];
  },
  methods: {
    getUpdatesEvery5Seconds: function() {
      let timerId = setInterval(() => {
        //this.getCurrentPlayers();
        this.getCurrentChats();
      }, 5000);
    },
    getCurrentPlayers: function() {
      axios.get("http://localhost:8080/players/").then(response => {
        this.players_data = (response.data).map(el => JSON.parse(el));
        for(i = 0; i < this.players_data.length; i++){
          for(msg of this.players_data[i].newPlayerMsgs){
            this.players_data[i].chat.push(msg);
          }
          this.players_data[i].newMsgs = [];
        }
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
        var chats = response.data;
        for(let id in chats){
          this.$set(this.players_chat, id, chats[id]);
        }
      });
    }
  }
});
