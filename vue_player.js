window.onload = function(){
    document.getElementById("questname").focus();
}

//PLACEHOLDER OBJECT//
pholder = {
  "mainQuest": [
    {
      "number": 0,
      "text": "",
      "type": "choice",
      "description": "",
      "options": [],
      "goto": [],
      "subquest_rewards": []
    }
  ],

  "subQuests": []
}

var app = new Vue({
  el: "#app",
  components: {
    "choiceinput": httpVueLoader("components/choice_input.vue"),
    "textinput": httpVueLoader("components/text_input.vue"),
    "imginput": httpVueLoader("components/img_input.vue"),
    "qrload": httpVueLoader("components/qrload.vue")
  },
  data: {
    user_id: 0,          // TODO lo deve assegnare il server
    inactive_time: 0,    // in seconds
    gamedata: pholder,
    questname: null,
    currentQuest: 0,
    currentSub: 0,
    completedSubs: [],
    in_mainquest: true,
    picked: null,
    css_style: {
      nav: {
        textFont: "monospace",
        textColor: "red",
        textStyle: "bold",
        bgColor: "white"
      },
      card: {
        textFont: "Comic Sans",
        textColor: "black",
        textStyle: "",
        bgColor: "white"
      }
    }
  },
  created: function (){
          req = new XMLHttpRequest();
          req.open("GET", "/json/testing.json");
          var _this = this;
          req.onreadystatechange = function (){
            if(req.readyState == 4 && req.status == 200){
            var json = JSON.parse(req.responseText);
            console.log(json);
            _this.gamedata = json;
            }
          };
          req.send();
  },
  mounted: function() {
    this.sendUpdatesEvery5Seconds();
    this.updateInactiveTimeEverySecond();
  },
  methods: {
    sendUpdatesEvery5Seconds: function() {
      let timerId = setInterval(() => {
        this.sendGameData();
      }, 5000);
    },
    updateInactiveTimeEverySecond: function() {
      let timerId = setInterval(() => {
        this.inactive_time++;
      }, 1000);
    },
    testRequest: function() {
       axios.get('http://localhost:8080/prova').then(response => {
           console.log("response: " + response)
       });
    },
    sendGameData: function(){
      axios.post('http://localhost:8080/players',
          {
            user_id: this.user_id,
            in_mainquest: this.in_mainquest,
            currentQuest: this.currentQuest,
            currentSub: this.currentSub,
            completedSubs: this.completedSubs,
            finished: this.renderQuest.type == 'ending',
            inactive_time: this.inactive_time
          })
        .then(response => {console.log(response)})
        .catch(err => {console.log(err)});
    },
    changeQuest: function() {
      console.log(`Il valore è: ${questname}`);
      if(questname) {
      console.log("dentro");
      axios
        .get(`/quest${questname}`).then(response =>
        (this.gamedata = response.data))
      }
    },
    changeState: function (state){
      this.currentQuest = state;
    },
    goToSubQuest: function (quest){
      this.currentSub = quest.number;
      this.in_mainquest = false;
      this.$refs.questname.focus();
    },
    goToMainQuest: function(){
      this.in_mainquest = true;
      this.$refs.questname.focus();
    },
    submitMain: function() {
      options = this.getCurrentGotos;
      for(opt of options){
        console.log(opt);
        //Le risposte del tipo draw hanno un formato diverso
        if(this.gamedata.mainQuest[this.currentQuest].type == "draw"){
          let x = opt[0][0];
          let y = opt[0][1];
          let radius = opt[0][2];
          if(this.picked[0] >= x-radius && this.picked[0] <= x+radius &&
             this.picked[1] >= y-radius && this.picked[1] <= y+radius){
              this.currentQuest = opt[1];
              this.inactive_time = 0;
              this.sendGameData();
              break;
            }
        }
        //Formato standard che controlla se opt[0] == picked
        else if(opt[0] == this.picked){
          this.currentQuest = opt[1];
          this.inactive_time = 0;
          this.sendGameData();
          break;
        }
        //L'opzione di default se non ci sono corrispondenze è sempre l'ultima
        if(options.indexOf(opt) == options.length-1){
          this.currentQuest = opt[1];
        }
      }
      if(document.getElementById("input")) {
        document.getElementById("input").value = "";
      }
      document.getElementById("submit").disabled = true;
      this.picked = null;
      this.$refs.questname.focus();
    },
    submitSub: function() {
      if (this.in_mainquest) return;
      let wrong_answer = true;
      let subQuest = this.gamedata.subQuests[this.currentSub];
      if (subQuest.type == "input") {
        for (let accepted of subQuest.solution)
          if (this.picked == accepted)
            wrong_answer = false;
          }
      else if (subQuest.type == "choice") {
        if (this.picked == subQuest.solution)
          wrong_answer = false;
        }
      if (wrong_answer) return;

      // devo aver completato le subquest necessarie richieste
      for (let required of subQuest.requires_sub)
        if (!this.completedSubs.includes(required))
          return;

      this.sendGameData();
      this.inactive_time = 0;
      this.completedSubs.push(subQuest.number);
      this.in_mainquest = true;
      if(document.getElementById("input")) {
        document.getElementById("input").value = "";
      }
      document.getElementById("submit").disabled = true;
      this.picked = null;
      this.$refs.questname.focus();
    }
  },
  computed: {
    currentComponent: function() {
      if(this.gamedata == null)
            return "";
      var type;
        if(this.in_mainquest)
            type = this.gamedata.mainQuest[this.currentQuest].type;
        else
          type = this.gamedata.subQuests[this.currentSub].type;

      if (type == "choice") return "choiceinput";
        else if (type == "input") return "textinput";
        else if (type == "draw") return "imginput";
      else return "";
    },
    renderQuest: function() {
      if(this.gamedata == null)
        return null;
            if(this.in_mainquest) return this.gamedata.mainQuest[this.currentQuest];
                else return this.gamedata.subQuests[this.currentSub];
    },
    getSubquests: function() {
      var subQuestList = [];
      if(!this.gamedata) return subQuestList;
            for(sub of this.gamedata.subQuests){
        if (!this.completedSubs.includes(sub.number) && sub.available_on.includes(this.currentQuest)
          && sub.requires_sub.every( val => this.completedSubs.includes(val) ))
              subQuestList.push(sub);
            }
            return subQuestList;
    },
    getCurrentClues: function() {
      clues = [];
      for(reward of this.renderQuest.subquest_rewards){
        if(this.completedSubs.includes(reward.number))
          clues.push(reward.clue);
      }
      return clues;
    },
    getCurrentOptions: function() {
      if(this.renderQuest.options){
        options = [];
        for(opt of this.renderQuest.options)
          options.push(opt);
        for(reward of this.renderQuest.subquest_rewards){
          if(this.completedSubs.includes(reward.number)){
            for(opt of reward.added_options)
              options.push(opt);
            for(opt of reward.removed_options){
              if((index = myIndexOf(options,opt,arrCmp)) != -1)
                options.splice(index,1);
            }
          }
        }
      }
      return options;
    },
    getCurrentGotos: function() {
      gotos = [];
      for(goto of this.renderQuest.goto)
        gotos.push(goto);
      for(reward of this.renderQuest.subquest_rewards){
        if(this.completedSubs.includes(reward.number)){
          for(goto of reward.added_goto)
            //Aggiungo in penultima posizione
            gotos.splice(gotos.length-1,0,goto);
          for(goto of reward.removed_goto){
            if((index = myIndexOf(gotos,goto,arrCmp)) != -1)
              options.splice(index,1);
          }
        }
      }
      return gotos;
    }
  }
  });
