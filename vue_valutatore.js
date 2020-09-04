var app = new Vue({
  el: "#app",
  data: {
    players_data: [],
    chatIndex: 0,
    chatMsg: "",
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
        this.getCurrentPlayers();
      }, 5000);
    },
    getCurrentPlayers: function() {
      axios.get("http://localhost:8080/players/").then(response => {
        this.players_data = (response.data).map(el => JSON.parse(el));
      });
    },
    switchIndex: function(index){
      if(players_data) {
        this.chatIndex = players_data.indexOf(player);
      }
    },
    sendChatMsg: function() {
      msg = {
        sender: "Valutatore",
        text: this.chatMsg
      };
      this.players_data[chatIndex].chat.push(msg);
      this.players_data[chatIndex].newMsgs.push(msg);
      this.chatMsg = "";
    }
  }
});
