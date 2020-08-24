var app = new Vue({
  el: "#app",
  data: {
    players_data: []
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
    }
  }
});
