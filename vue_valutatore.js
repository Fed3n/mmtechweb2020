var app = new Vue({
  el: "#app",
  data: {
    players_data: {},
    players_data_changing: {}
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
      }, 5000);
    },
    getPlayersData: function() {
      axios.get("http://localhost:8080/players/").then(response => {
        this.players_data = response.data;
        for (let id in this.players_data) {
            if (this.players_data[id].help_received && this.players_data[id].help_message != "") {
                this.players_data_changing[id] = this.players_data_changing[id] || {};
                this.players_data_changing[id].help_sent = false;
            }
        }
      });
    },
    patchPlayersData: function() {
        axios.patch('http://localhost:8080/players/', this.players_data_changing)
            .then(this.players_data_changing = {})
            .catch(err => {console.log(err)});
    },
    sendHelp: function(id) {
        this.players_data_changing[id] = this.players_data_changing[id] || {};
        this.players_data_changing[id].help_sent = true;
        // dai un messaggio di aiuto
        this.players_data_changing[id].help_message = "Su quel ramo del lago di como inizia quel tomo che ti devasta con i suoi 24 capitoli";
    }
  }
});
