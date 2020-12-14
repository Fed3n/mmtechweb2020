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
          "media": {
              "type": "",
              "uri": "",
              "alt": ""
          },
          "key_style": {
              "keys": ""
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
          "sub_score": "",
          "options": [],
          "image": {
              "imguri": "",
              "imgalt": ""
          },
          "media": {
              "type": "",
              "uri": "",
              "alt": ""
          },
          "key_style": {
              "keys": ""
          },
          "solution": []
      }],
      "scoretier": {
          "a": 0,
          "b": 0,
          "c": 0
      },
      "starting_points": [],
      "author_order": {
          "main": [0],
          "sub": [0]
      },
      "css_style": {
          "mainStyle": {
              "font-family": "Arial",
              "font-style": "normal",
              "font-weight": "normal",
              "font-size": "",
              "color": "",
              "font-url": ""
          },
          "background": {
              "image": false,
              "url": "",
              "style": {
                  "nav": {
                      "custom": false,
                      "bootstrap": {
                          "textColor": "navbar-light",
                          "background": "bg-white"
                      },
                      "customized": {
                          "general": {
                              "background-color": "#ffffff",
                              "color": "#000000"
                          },
                      }
                  },
                  "badge": {
                      "custom": false,
                      "bootstrap": {
                          "type": "badge-warning"
                      },
                      "customized": {
                          "background-color": "#ffffff",
                          "border-width": "0px",
                          "border-style": "solid",
                          "border-color": "#000000",
                          "color": "#000000"
                      }
                  },
                  "alert": {
                      "custom": false,
                      "bootstrap": {
                          "type": "alert-warning"
                      },
                      "customized": {
                          "background-color": "#ffffff",
                          "border-width": "0px",
                          "border-style": "solid",
                          "border-color": "#000000",
                          "color": "#000000"
                      }
                  },
                  "card": {
                      "custom": false,
                      "bootstrap": {
                          "textColor": "text-dark",
                          "background": "bg-white"
                      },
                      "customized": {
                          "background-color": "#ffffff",
                          "color": "#000000"
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

  var qr = new QRCode(document.getElementById("qrcode"), "placeholder");
  this.qr.clear();

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
          loadedStory: "",
          storyList: null,
          activeStoryList: null,
          inactiveStoryList: null,
          styleList: null,
          keyStylesList: null,
          imagesList: null,
          vidsList: null,
          selectedImage: "",
          selectedVideo: "",
          //swapping storie in board
          swapping: false,
          swap_selected: null,
          custom_keys: "",
          radiusInput: 10, //valore di default
          previewdata: {
              "currentQuest": 0,
              "currentSub": 0,
              "completedSubs": [],
              "in_mainquest": true,
              "picked": null
          },
          gamedata: gamedata_pholder,
          metadata: metadata_pholder,
          bootstrapConsts: bootstrapConstsExternal,
          questClipboard: {
              "main": null,
              "sub": null
          },
          storiesPanelOpened: false,
          stylesPanelOpened: false,
          mainStyleColor: false,
          currentMainStyleColor: "",
          mobileView: true,
          onLink: [],
          submitStyleObject: {},
          alertBackgroundTransparent: false,
          lastAlertBackgroundColor: "#000000",
          textSizeNotSpecified: false,
          lastTextSize: 0,
          force_recompute: 0
      },
      created: function() {
          this.updateFs();
          this.setFontUrl();
          this.mainStyleColor = (this.gamedata.css_style.mainStyle['color'] !== "");
          this.currentMainStyleColor = (this.mainStyleColor ? this.gamedata.css_style.mainStyle['color'] : "#000000");
          this.editMainColor();
      },
      methods: {
          resetData: function() {
              this.loadedStory = "";
              this.selectedImage = "";
              this.selectedVideo = "";
              this.gamedata = gamedata_pholder;
              this.metadata = metadata_pholder;
              this.previewdata = {
                  "currentQuest": 0,
                  "currentSub": 0,
                  "completedSubs": [],
                  "in_mainquest": true,
                  "picked": null
              };
              this.custom_keys = "";
              this.radiusInput = 10;
          },
          //SERVER INTERACTION METHODS//
          updateFs: function() {
              var _this = this;
              //Storie
              axios.get("/stories").then(function(res) {
                  storyList = [];
                  activeStoryList = [];
                  inactiveStoryList = [];
                  for (el of res.data) {
                      storyList.push(el.name);
                      if (el.active) activeStoryList.push(el.name);
                      else inactiveStoryList.push(el.name);
                  }
                  _this.storyList = storyList;
                  _this.activeStoryList = activeStoryList;
                  _this.inactiveStoryList = inactiveStoryList;
              });
              //Styles
              axios.get("/styles/interfaces").then(function(res) {
                  _this.styleList = res.data;
              });
              //Keyboard styles
              axios.get("/styles/keyboards").then(function(res) {
                  _this.keyStylesList = res.data;
              });
          },
          getStory: function(story) {
              if(this.$refs.selectedStory.value){
                let storyname = story ? story : this.$refs.selectedStory.value;
                console.log(storyname);
                if (storyname) {
                    var _this = this;
                    axios.get(`/stories/${storyname}`).then((res) => {
                        _this.resetData();
                        _this.gamedata = res.data.json;
                        _this.metadata = res.data.meta;
                        //Ordine di visualizzazione in autore
                        if(!_this.gamedata.author_order){
                            _this.gamedata.author_order = {
                                "main": [],
                                "sub": []
                            }
                            for(let i = 0; i < _this.gamedata.mainQuest.length; i++) _this.gamedata.author_order.main[i] = i;
                            for(let i = 0; i < _this.gamedata.subQuests.length; i++) _this.gamedata.author_order.sub[i] = i;
                        }
                        if(!_this.gamedata.scoretier)
                          _this.gamedata.scoretier = {
                                "a": 0,
                                "b": 0,
                                "c": 0
                          }
                        _this.getImagesList();
                        _this.getVideosList();
                        _this.loadedStory = storyname;
                        _this.updateFs();
                        //è necessario riaggiornare lo stile principale
                        _this.mainStyleColor = (_this.gamedata.css_style.mainStyle['color'] !== "");
                        _this.currentMainStyleColor = (_this.mainStyleColor ? _this.gamedata.css_style.mainStyle['color'] : "#000000");
                        _this.editMainColor();
                        _this.setFontUrl();
                    }).catch(err => {throw(err)});
                }
                //inizializzazione di altre variabili di stile
                this.lastAlertBackgroundColor = "#000000";
                this.lastTextSize = 0;
                this.alertBackgroundTransparent = false;
                this.textSizeNotSpecified = false;
              } else alert("Seleziona una storia dall'elenco!");
          },
          postStory: function() {
              if(this.$refs.storyName.value){
                  data = {
                      storyName: this.$refs.storyName.value,
                      json: this.gamedata,
                      meta: {
                          "name": this.$refs.storyName.value,
                          "active": this.$refs.storyActive.checked,
                          "accessible": this.$refs.storyAccess.checked,
                          "language": this.$refs.storyLan.value
                      }
                  };
                  var _this = this;
                  axios.post("/stories", data)
                      .then((res) => {
                          _this.updateFs();
                          _this.getStory(data.meta.name);
                      });
              }
          },
          cloneStory: function(){
              if(this.$refs.selectedStory.value){
                let src = this.$refs.selectedStory.value;
                let dst = prompt("Inserisci un nuovo nome per la storia");
                let data = {
                  "clone": src,
                  "storyName": dst
                }
                let _this = this;
                axios.post("/stories", data)
                    .then((res) => {
                        _this.updateFs();
                        _this.getStory(dst);
                    }).catch((err) => {throw err;});
              } else alert("Seleziona una storia dall'elenco!");
          },
          deleteStory: function() {
              if (this.$refs.selectedStory.value) {
                  data = {
                      params: {
                          storyName: this.$refs.selectedStory.value
                      }
                  };
                  ok = confirm("Sei davvero sicuro di voler rimuovere questa storia?");
                  if (ok) {
                      var _this = this;
                      axios.delete("/stories", data).then((res) => {
                          _this.updateFs();
                          if(_this.loadedStory == _this.$refs.selectedStory.value) _this.resetData()
                      });
                  }
              }
          },
          uploadImg: function() {
              if (this.$refs.img_upload.files[0] && this.loadedStory) {
                  //Mando come multipart/form-data
                  let form = new FormData();
                  let imageFile = this.$refs.img_upload.files[0];
                  let storyName = this.loadedStory;
                  form.append('image', imageFile);
                  let _this = this;
                  axios.post(`/stories/${storyName}/images`, form, {
                          headers: {
                              'Content-Type': 'multipart/form-data'
                          }
                      })
                      .then((res) => {
                          _this.getImagesList();
                          _this.selectedImage = imageFile.name;
                          _this.$refs.img_upload.value = '';
                      });
              }
          },
          getImagesList: function() {
              let _this = this;
              axios.get(`/stories/${this.metadata.name}/images`).then((res) => {
                  _this.imagesList = res.data;
              });
          },
          deleteImg: function() {
              let ok = confirm("Sei sicuro di voler rimuovere questa immagine?");
              if(ok){
                let _this = this;
                if (this.selectedImage)
                    axios.delete(`/stories/${this.metadata.name}/images`, {
                        params: {
                            img: this.selectedImage
                        }
                    }).then((res) => {
                        _this.getImagesList();
                        _this.selectedImage = "";
                    });
              }
          },
          uploadVid: function() {
              if (this.$refs.vid_upload.files[0] && this.loadedStory) {
                  //Mando come multipart/form-data
                  let form = new FormData();
                  let videoFile = this.$refs.vid_upload.files[0];
                  let storyName = this.loadedStory;
                  form.append('video', videoFile);
                  let _this = this;
                  axios.post(`/stories/${storyName}/videos`, form, {
                          headers: {
                              'Content-Type': 'multipart/form-data'
                          }
                      })
                      .then((res) => {
                          _this.getVideosList();
                          _this.selectedVideo = videoFile.name;
                          _this.$refs.vid_upload.value = '';

                      });
              }
          },
          getVideosList: function() {
              let _this = this;
              axios.get(`/stories/${this.metadata.name}/videos`).then((res) => {
                  _this.vidsList = res.data;
              });
          },
          deleteVid: function() {
              let ok = confirm("Sei sicuro di voler rimuovere questa immagine?");
              if(ok){
                  let _this = this;
                  if (this.selectedVideo)
                      axios.delete(`/stories/${this.metadata.name}/videos`, {
                          params: {
                              vid: this.selectedVideo
                          }
                      }).then((res) => {
                          _this.getVideosList();
                          _this.selectedVideo = "";
                      });
              }
          },
          getStyle: function() {
              let _this = this;
              axios.get(`/styles/interfaces/${this.$refs.select_style.value}`).then(res => {
                  this.gamedata.css_style = res.data;
              });
          },
          saveStyle: function() {
              let load = {
                  name: this.$refs.style_name.value,
                  json: this.gamedata.css_style
              };
              let _this = this;
              axios.post('/styles/interfaces', load)
                  .then(res => {
                      _this.updateFs();
                  });
          },
          deleteStyle: function() {
              let ok = confirm("Sei sicuro di voler rimuovere questo stile?");
              if(ok){
                  let _this = this;
                  axios.delete('/styles/interfaces', {
                          params: {
                              name: this.$refs.select_style.value
                          }
                      })
                      .then(res => {
                          _this.updateFs();
                      });
              }
          },
          getKeyStyle: function() {
              let _this = this;
              axios.get(`/styles/keyboards/${this.$refs.select_key_style.value}`).then(res => {
                  this.renderQuest.key_style = res.data;
              });
          },
          saveKeyStyle: function() {
              let load = {
                  name: this.$refs.key_style_name.value,
                  json: this.renderQuest.key_style
              };
              let _this = this;
              axios.post('/styles/keyboards', load)
                  .then(res => {
                      _this.updateFs();
                  });
          },
          deleteKeyStyle: function() {
              let ok = confirm("Sei sicuro di voler rimuovere questo stile?");
              if(ok){
                  let _this = this;
                  axios.delete('/styles/keyboards', {
                          params: {
                              name: this.$refs.select_key_style.value
                          }
                      })
                      .then(res => {
                          _this.updateFs();
                      });
              }
          },
          //########################################//

          jumpToQuest: function(type, number) {
              if (this.$refs.help)
                  if (this.$refs.requestedHelp.style.display !== "none") {
                      if (!((this.previewdata.in_mainquest && type == 'main' && this.previewdata.currentQuest == number) || (type == 'sub' && this.previewdata.currentSub == number))) {
                          this.$refs.requestedHelp.style.display = "none";
                          this.$refs.help.classList.remove("disabled");
                      }
                  }
              if (type == "main") {
                  this.previewdata.in_mainquest = true;
                  this.previewdata.currentQuest = number;
                  this.previewdata.picked = null;
              } else {
                  this.previewdata.in_mainquest = false;
                  this.previewdata.currentSub = number;
                  this.previewdata.picked = null;
              }
              //removes all form past selections
              this.$refs.inputForm.reset();
              this.$refs.cardbody.scrollTop = 0;
              this.swapping = false;
              this.swap_selected = null;
          },
          switchView: function(mobile) {
              this.mobileView = mobile;
          },
          switchMainSub: function() {
              this.previewdata.in_mainquest = !this.previewdata.in_mainquest;
              this.swapping = false;
              this.swap_selected = null;
          },
          switchSwap: function(){
              if(swapping){
                  swap_selected = null;
                  swapping = false;
              }
              else {
                  swapping = true;
              }
          },
          swapQuests: function(pos, is_quest) {
              //se e' il primo elemento che selezioniamo lo ricordiamo come da swappare
              if(this.swap_selected === null){
                  this.swap_selected = pos;
              }
              else{
                  let order = this.previewdata.in_mainquest ? this.gamedata.author_order.main : this.gamedata.author_order.sub;
                  //se abbiamo selezionato due quest le swappiamo
                  if(is_quest){
                      let tmp = order[this.swap_selected];
                      this.$set(order, this.swap_selected, order[pos]);
                      this.$set(order, pos, tmp);
                      this.swapping = false;
                      this.swap_selected = null;
                  }
                  //se abbiamo selezionato quest e posizione mettiamo quest in posizione
                  else {
                      //se non sto provando a metterlo gia' dove si trova
                      if(this.swap_selected != pos-1){
                        let tmp = order[this.swap_selected];
                        order.splice(this.swap_selected,1);
                        order.splice(pos,0,tmp);
                        this.swap_selected = null;
                        this.swapping = false;
                      }
                      else{
                        this.swap_selected = null;
                        this.swapping = false;
                      }
                  }
                //terribile hack perche' per qualche ragione pure usando i set correttamente il computed non aggiorna
                this.force_recompute = !this.force_recompute;
              }
          },
          addNode: function(pos) {
              num = this.previewdata.in_mainquest ? this.gamedata.mainQuest.length : this.gamedata.subQuests.length;
              mq = {
                  "number": num,
                  "text": "",
                  "type": "",
                  "description": "",
                  "options": [],
                  "image": {
                      "imguri": "",
                      "imgalt": ""
                  },
                  "media": {
                      "type": "",
                      "uri": "",
                      "alt": ""
                  },
                  "key_style": {
                      "keys": ""
                  },
                  "goto": [],
                  "subquest_rewards": []
              };
              sq = {
                  "number": num,
                  "available_on": [],
                  "requires_sub": [],
                  "text": "",
                  "type": "",
                  "description": "",
                  "sub_score": "",
                  "options": [],
                  "image": {
                      "imguri": "",
                      "imgalt": ""
                  },
                  "media": {
                      "type": "",
                      "uri": "",
                      "alt": ""
                  },
                  "key_style": {
                      "keys": ""
                  },
                  "solution": []
              };
              if (this.previewdata.in_mainquest) {
                  this.gamedata.mainQuest.push(mq);
                  this.gamedata.author_order.main.splice(pos,0,num);
              }
              else {
                  this.gamedata.subQuests.push(sq)
                  this.gamedata.author_order.sub.splice(pos,0,num);
              }
          },
          copyStory: function() {
              if (this.previewdata.in_mainquest) this.questClipboard.main = this.renderQuest;
              else this.questClipboard.sub = this.renderQuest;
          },
          pasteStory: function() {
              num = this.previewdata.in_mainquest ? this.gamedata.mainQuest.length : this.gamedata.subQuests.length;
              pos = this.previewdata.in_mainquest ? this.gamedata.author_order.main.indexOf(this.previewdata.currentQuest) : this.gamedata.author_order.sub.indexOf(this.previewdata.currentSub);
              if (this.previewdata.in_mainquest) {
                  if (this.questClipboard.main) {
                      var quest = JSON.parse(JSON.stringify(this.questClipboard.main));
                      quest.number = num;
                      this.gamedata.mainQuest.push(quest);
                      this.gamedata.author_order.main.splice(pos+1,0,num);
                      this.force_recompute = !this.force_recompute;
                  }
              } else {
                  if (this.questClipboard.sub) {
                      var quest = JSON.parse(JSON.stringify(this.questClipboard.sub));
                      quest.number = num;
                      this.gamedata.subQuests.push(quest);
                      this.gamedata.author_order.sub.splice(pos+1,0,num);
                      this.force_recompute = !this.force_recompute;
                  }
              }
          },
          //Rimuove il nodo selezionato dall'array mainquest
          //Un po' costosa computazionalmente ma l'alternativa è limitarsi al pop per la cancellazione
          rmMainNode: function(index) {
              var ok = confirm("Sei sicuro di voler cancellare questo nodo? Tutti i riferimenti ad esso rimamnenti saranno cancellati.");
              if (ok) {
                  var mains = this.gamedata.mainQuest;
                  //Deve restarne almeno una in lista
                  if (mains.length > 1) {
                      //Se sto cancellando la quest su cui mi trovo devo prima cambiare schermata o genero errori
                      if (this.previewdata.currentQuest == index) {
                          //Se sto cancellando la 0 e mi ci trovo sopra non è un problema
                          if (index != 0) this.previewdata.currentQuest--;
                      }
                      //Se sto cancellando una quest trovandomi sopra l'ultima devo cambiare schermata
                      else if (this.previewdata.currentQuest == mains.length - 1) this.previewdata.currentQuest--;
                      //Bisogna scalare in basso tutti i riferimenti ad indici con indice > index
                      //e cancellare i riferimenti con indice = index
                      //Non sto usando i for each perché mi serve il riferimento diretto all'array per cambiarne i valori...
                      for (i = 0; i < mains.length; i++) {
                          if (i != index) {
                              //number
                              if (mains[i].number > index) mains[i].number -= 1;
                              //goto
                              for (j = 0; j < mains[i].goto.length; j++) {
                                  if (mains[i].goto[j][1] == index) {
                                      mains[i].goto.splice(j, 1);
                                      j--;
                                  } else if (mains[i].goto[j][1] > index) mains[i].goto[j][1] -= 1;
                              }
                              //sub_rewards
                              for (j = 0; j < mains[i].subquest_rewards.length; j++) {
                                  //added_goto
                                  for (k = 0; k < mains[i].subquest_rewards[j].added_goto.length; k++) {
                                      if (mains[i].subquest_rewards[j].added_goto[k][1] == index) {
                                          mains[i].subquest_rewards[j].added_goto.splice(k, 1);
                                          k--;
                                      } else if (mains[i].subquest_rewards[j].added_goto[k][1] > index) mains[i].subquest_rewards[j].added_goto[k][1] -= 1;
                                  }
                                  //removed_goto
                                  for (k = 0; k < mains[i].subquest_rewards[j].removed_goto.length; k++) {
                                      if (mains[i].subquest_rewards[j].removed_goto[k] == index) {
                                          mains[i].subquest_rewards[j].removed_goto.splice(k, 1);
                                          k--;
                                      } else if (mains[i].subquest_rewards[j].removed_goto[k] > index) mains[i].subquest_rewards[j].removed_goto[k] -= 1;
                                  }
                              }
                          }
                      }
                      subs = this.gamedata.subQuests;
                      for (i = 0; i < subs.length; i++) {
                          for (j = 0; j < subs[i].available_on.length; j++) {
                              if (subs[i].available_on[j] == index) {
                                  subs[i].available_on.splice(j, 1);
                                  k--;
                              } else if (subs[i].available_on[j] > index) subs[i].available_on[j] -= 1;
                          }
                      }
                      mains.splice(index, 1);
                      //author_order.main[]
                      let order = this.gamedata.author_order.main;
                      order.splice(order.indexOf(index),1);
                      for(let i = 0; i < order.length; i++){
                          if(order[i] >= index) order[i]--;
                      }
                  } else alert("Non puoi avere meno di una quest!");
              }
          },
          //Come sopra ma per le subquests (sono funzioni separate perché controllano elementi diversi)
          rmSubNode: function(index) {
              var ok = confirm("Sei sicuro di voler cancellare questo nodo? Tutti i riferimenti ad esso rimamnenti saranno cancellati.");
              if (ok) {
                  var subs = this.gamedata.subQuests;
                  if (subs.length > 1) {
                      //Deve restarne almeno una in lista
                      if (subs.length > 1) {
                          //Se sto cancellando la quest su cui mi trovo devo prima cambiare schermata o genero errori
                          if (this.previewdata.currentSub == index) {
                              //Se sto cancellando la 0 non è un problema
                              if (index != 0) this.previewdata.currentSub--;
                          } else if (this.previewdata.currentSub == subs.length - 1) this.previewdata.currentSub--;
                          //Bisogna scalare in basso tutti i riferimenti ad indici con indice > index
                          //e cancellare i riferimenti con indice = index
                          //Non sto usando i for each perché mi serve il riferimento diretto all'mainsay per cambiarne i valori...
                          for (i = 0; i < subs.length; i++) {
                              if (i != index) {
                                  if (subs[i].number > index) subs[i].number -= 1;
                                  //available_on
                                  for (j = 0; j < subs[i].available_on.length; j++) {
                                      if (subs[i].available_on[j] == index) {
                                          subs[i].available_on.splice(j, 1);
                                          j--;
                                      } else if (subs[i].available_on[j] > index) subs[i].available_on[j] -= 1;
                                  }
                              }
                          }
                          //subquest_reward
                          mains = this.gamedata.mainQuest;
                          for (i = 0; i < mains.length; i++) {
                              for (j = 0; j < mains[i].subquest_rewards.length; j++) {
                                  if (mains[i].subquest_rewards[j].number == index) {
                                      mains[i].subquest_rewards.splice(j, 1);
                                      j--;
                                  } else if (mains[i].subquest_rewards[j].number > index) mains[i].subquest_rewards[j].number -= 1;
                              }
                          }
                      }
                      subs.splice(index, 1);
                      //author_order.main[]
                      let order = this.gamedata.author_order.sub;
                      order.splice(order.indexOf(index),1);
                      for(let i = 0; i < order.length; i++){
                          if(order[i] >= index) order[i]--;
                      }
                  } else alert("Non puoi avere meno di una quest!");
              }
          },
          addGoto: function(type) {
              //Il formato di img_input è differente [[x,y,radius],node,score]
              if (type == "draw") {
                  var ans = [this.previewdata.picked[0], this.previewdata.picked[1], this.radiusInput];
                  this.renderQuest.goto.push([ans, 0, ""])
              }
              //Un comune goto è in formato [ans,node,score]
              else {
                  this.renderQuest.goto.push(["", 0, ""]);
              }
          },
          rmGoto: function() {
              this.renderQuest.goto.pop();
          },
          addSolution: function(type) {
              if (type == "draw") {
                  var ans = [this.previewdata.picked[0], this.previewdata.picked[1], this.radiusInput];
                  this.renderQuest.solution.push(ans)
              } else {
                  this.renderQuest.solution.push("");
              }
          },
          rmSolution: function(sol) {
              index = this.renderQuest.solution.indexOf(sol);
              this.renderQuest.solution.splice(index, 1);
          },
          addRmOptions: function(type) {
              if (type == "add") {
                  this.renderQuest.options.push("");
              } else {
                  this.renderQuest.options.pop();
              }
          },
          addRmSubAddedOptions: function(type, n) {
              if (type == "add") {
                  this.renderQuest.subquest_rewards[n].added_options.push("");
              } else {
                  this.renderQuest.subquest_rewards[n].added_options.pop();
              }
          },
          addAddedGoto: function(sub) {
              this.renderQuest.subquest_rewards[this.renderQuest.subquest_rewards.indexOf(sub)].added_goto.push(["", 0, ""]);
          },
          rmAddedGoto: function(sub, goto) {
              reward = this.renderQuest.subquest_rewards[this.renderQuest.subquest_rewards.indexOf(sub)];
              reward.added_goto.splice(reward.added_goto.indexOf(goto), 1);
          },
          generateChoiceGotos: function() {
              var ok = confirm("Generare nuovi Goto per il nodo corrente cancellerà tutti i precedenti. Vuoi proseguire?");
              if (ok) {
                  gotos = [];
                  for (opt of this.renderQuest.options) {
                      gotos.push([opt, 0, ""]);
                  }
                  this.renderQuest.goto = gotos;
              }
          },
          generateChoiceSolutions: function() {
              var ok = confirm("Generare nuove Soluzioni per il nodo corrente cancellerà tutte le precedenti. Vuoi proseguire?");
              if (ok) {
                  sols = [];
                  for (opt of this.renderQuest.options) {
                      sols.push(opt);
                  }
                  this.renderQuest.solution = sols;
              }
          },
          addSubReward: function() {
              if (this.$refs.subtoadd.value) {
                  reward = {
                      "number": parseInt(this.$refs.subtoadd.value),
                      "title": this.gamedata.subQuests[this.$refs.subtoadd.value].title,
                      "clue": "",
                      "added_options": [],
                      "removed_options": [],
                      "added_goto": [],
                      "removed_goto": []
                  }
                  this.renderQuest.subquest_rewards.push(reward);
                  this.renderQuest.subquest_rewards.sort(questCmp);
              }
          },
          rmSubReward: function(sub) {
              this.renderQuest.subquest_rewards.splice(this.renderQuest.subquest_rewards.indexOf(sub), 1);
          },
          setImageAsInput: function() {
              if (this.renderQuest.image) {
                  //Update nell'oggetto quest
                  this.renderQuest.image.imageuri = this.selectedImage;
                  //Update del canvas nel component
                  this.$refs.inputComponent.updateCanvasImage();
              }
          },
          loadJson: function() {
              if(this.$refs.toLoad.files[0]){
                  var path = this.$refs.toLoad.files[0];
                  var fileReader = new FileReader();
                  _this = this;
                  fileReader.onload = function(event) {
                      try{
                      var text = event.target.result;
                      var json = JSON.parse(text);
                      _this.gamedata = json;
                      } catch(err) {
                          window.alert("Il file deve essere di tipo JSON!");
                      }
                  };
                  fileReader.readAsText(path, "utf-8");
              }
              else{
                  window.alert("Inserire un file da caricare");
              }
          },
          saveJson: function() {
              var text = JSON.stringify(this.gamedata);
              var blob = new Blob([text], {
                  type: 'application/json'
              });
              var filename = this.$refs.fileName.value;
              var link = document.createElement("a");
              link.download = filename;
              link.innerHTML = "Download JSON";
              //Funzione createObjectURL cross-browser
              var createObjectURL = (window.URL || window.webkitURL || {}).createObjectURL || function() {};
              link.href = createObjectURL(blob);
              link.click();
          },
          requestHelp: function() {
              this.$refs.requestedHelp.style.display = "inline-block";
              this.$refs.help.classList.add("disabled");
          },
          submitMain: function() {
              //Caso particolare in cui il submit si comporta diversamente perché non usa il valore picked
              if (this.renderQuest.type == "human") {
                  this.previewdata.picked = this.ans_feedback;
                  this.waiting_feedback = false;
                  this.received_feedback = false;
                  this.ans_feedback = "";
              }
              options = this.getCurrentGotos;
              for (opt of options) {
                  //Le risposte del tipo draw hanno un formato diverso
                  if (this.gamedata.mainQuest[this.previewdata.currentQuest].type == "draw") {
                      let x = opt[0][0];
                      let y = opt[0][1];
                      let radius = parseInt(opt[0][2]);
                      if (this.previewdata.picked[0] >= x - radius && this.previewdata.picked[0] <= x + radius &&
                          this.previewdata.picked[1] >= y - radius && this.previewdata.picked[1] <= y + radius) {
                          this.previewdata.currentQuest = opt[1];
                          if (this.$refs.help)
                              if (this.$refs.requestedHelp.style.display !== "none") {
                                  this.$refs.requestedHelp.style.display = "none";
                                  this.$refs.help.classList.remove("disabled");
                              }
                          break;
                      }
                  }
                  //Formato standard che controlla se opt[0] == picked
                  else if (opt[0] == this.previewdata.picked) {
                      this.previewdata.currentQuest = opt[1];
                      if (this.$refs.help)
                          if (this.$refs.requestedHelp.style.display !== "none") {
                              this.$refs.requestedHelp.style.display = "none";
                              this.$refs.help.classList.remove("disabled");
                          }
                      break;
                  }
                  //L'opzione di default se non ci sono corrispondenze è sempre l'ultima
                  if (options.indexOf(opt) == options.length - 1) {
                      this.previewdata.currentQuest = opt[1];
                      if (this.$refs.help)
                          if (this.$refs.requestedHelp.style.display !== "none") {
                              this.$refs.requestedHelp.style.display = "none";
                              this.$refs.help.classList.remove("disabled");
                          }
                  }
              }
              this.$refs.inputForm.reset();
              this.previewdata.picked = null;
              if (this.renderQuest.type == "keys") this.$refs.inputComponent.text = "";
              this.$refs.cardbody.scrollTop = 0;
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
                      if (this.previewdata.picked[0] >= x - radius && this.previewdata.picked[0] <= x + radius &&
                          this.previewdata.picked[1] >= y - radius && this.previewdata.picked[1] <= y + radius) {
                          wrong_answer = false;
                      }
                  }
              } else {
                  for (ans of subQuest.solution)
                      if (this.previewdata.picked == ans)
                          wrong_answer = false;
              }
              if (wrong_answer) return;
              this.previewdata.completedSubs.push(subQuest.number);
              this.previewdata.in_mainquest = true;
              this.previewdata.picked = null;
              this.$refs.cardbody.scrollTop = 0;
              if (this.$refs.help)
                  if (this.$refs.requestedHelp.style.display !== "none") {
                      this.$refs.requestedHelp.style.display = "none";
                      this.$refs.help.classList.remove("disabled");
                  }
          },
          styleMenuCollapse: function() {
              $('.stylepanelcollapse').collapse('hide');
          },
          storiesPanelChange: function(isVisible, entry) {
                this.storiesPanelOpened = isVisible;
          },
          stylesPanelChange: function(isVisible, entry) {
                this.stylesPanelOpened = isVisible;
          },
          //style functions
          setFontUrl: function() {
              if (this.gamedata.css_style.mainStyle['font-url'])
                  document.getElementById("externalFontUrl").setAttribute('href', this.gamedata.css_style.mainStyle['font-url']);
          },
          fontSize: function(event) {
              this.gamedata.css_style.mainStyle["font-size"] = event.target.value + "px";
          },
          textSizeSetting: function(event) {
              if (this.textSizeNotSpecified) {
                  this.lastTextSize = this.gamedata.css_style.mainStyle["font-size"];
                  this.gamedata.css_style.mainStyle["font-size"] = "";
              } else
                  this.gamedata.css_style.mainStyle["font-size"] = this.lastTextSize;
          },
          badgeBorderSize: function(event) {
              this.gamedata.css_style.background.style.badge.customized['border-width'] = event.target.value + "px";
          },
          alertBorderSize: function(event) {
              this.gamedata.css_style.background.style.alert.customized['border-width'] = event.target.value + "px";
          },
          alertBackground: function(event) {
              if (this.alertBackgroundTransparent) {
                  this.lastAlertBackgroundColor = this.gamedata.css_style.background.style.alert.customized['background-color'];
                  this.gamedata.css_style.background.style.alert.customized['background-color'] = "rgba(0,0,0,0)";
              } else {
                  this.gamedata.css_style.background.style.alert.customized['background-color'] = this.lastAlertBackgroundColor;
              }
          },
          editMainColor: function(event) {
              if (this.mainStyleColor)
                  this.gamedata.css_style.mainStyle['color'] = this.currentMainStyleColor;
              else
                  this.gamedata.css_style.mainStyle['color'] = "";
          },
          overwriteMainStyle: function(styles) {
              var main_style = this.gamedata.css_style.mainStyle;
              var main_style_cleaned = {};
              Object.entries(main_style).forEach(entry => {
                  const [key, value] = entry;
                  if (value != "")
                      main_style_cleaned[key] = value;
              });
              return Object.assign(styles, main_style_cleaned);
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
              var styles = {};
              if (!this.gamedata.css_style.background.image) {
                  if (!this.gamedata.css_style.background.style.nav.custom) {
                      //adding text color property
                      //predefined style used in addition to bootstrap navbar style
                      if (!this.gamedata.css_style.mainStyle["color"])
                          if (color = this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-light")
                              styles = Object.assign(styles, bootstrap_menu_color_dark_text);
                          else if (this.gamedata.css_style.background.style.nav.bootstrap.textColor == "navbar-dark")
                          styles = Object.assign(styles, bootstrap_menu_color_light_text);
                      else
                          ;
                      styles = this.overwriteMainStyle(styles);
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
                      styles = this.overwriteMainStyle(styles);
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
                  styles = this.overwriteMainStyle(styles);
                  //adding background color property
                  if (apply) {
                      if (this.onLink[num])
                          styles = Object.assign(styles, {
                              "background-color": default_image_menu_links_hover_backgroud_color
                          });
                  }
              }
              //used for menu responsivness
              if (this.mobileView)
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
          //We dont talk about this one pls dont ask about this one but briefly it computes another array to view quests in different order ~ fede
          questList: function() {
              //very bad hack vv
              this.force_recompute;
              let arr = [];
              for(let i = 0; i < this.gamedata.author_order.main.length; i++) arr[i] = this.gamedata.mainQuest[this.gamedata.author_order.main[i]];
              return arr;
          },
          subquestList: function() {
              //very bad hack vv
              this.force_recompute;
              let arr = [];
              for(let i = 0; i < this.gamedata.author_order.sub.length; i++) arr[i] = this.gamedata.subQuests[this.gamedata.author_order.sub[i]];
              return arr;
          },
          //Restituisco una coppia [index,goto], l'index serve per accedere al v-model
          getAddedGotos: function() {
              gotos = [];
              for (sub of this.renderQuest.subquest_rewards) {
                  var index = this.renderQuest.subquest_rewards.indexOf(sub);
                  for (goto of sub.added_goto) {
                      gotos.push([index, goto]);
                  }
              }
              return gotos;
          },
          getRemainingSubs: function() {
              //Qua conto sul fatto che la proprietà number di ogni quest rappresenti il suo indice nella lista
              var alreadyIn = [];
              var remaining = [];
              for (sub of this.renderQuest.subquest_rewards)
                  alreadyIn.push(sub.number);
              for (sub of this.gamedata.subQuests) {
                  if (!alreadyIn.includes(sub.number))
                      remaining.push(sub);
              }
              return remaining;
          },
          //Cerco i prev iterando su tutte le quest e cercando nei goto e subquest_reward sperando non sia troppo pesante
          getPrevNodes: function() {
              current = this.renderQuest.number;
              prev = new Set();
              for (quest of this.gamedata.mainQuest) {
                  for (goto of quest.goto) {
                      if (goto[1] == current) prev.add(quest.number);
                  }
                  for (reward of quest.subquest_rewards) {
                      for (goto of reward.added_goto) {
                          if (goto[1] == current) prev.add(quest.number);
                      }
                  }
              }
              return prev;
          },
          //Se stiamo vedendo la preview di una main quest vediamo dove ci porta la risposta attuale
          getAnswerGoto: function() {
              if (!this.previewdata.picked) return "";
              options = this.getCurrentGotos;
              for (opt of options) {
                  //Le risposte del tipo draw hanno un formato diverso e devo assicurarmi di non accedere a null
                  if (opt[0] && this.gamedata.mainQuest[this.previewdata.currentQuest].type == "draw") {
                      let x = opt[0][0];
                      let y = opt[0][1];
                      let radius = parseInt(opt[0][2]);
                      if (this.previewdata.picked[0] >= (x - radius) && this.previewdata.picked[0] <= (x + radius) && this.previewdata.picked[1] >= (y - radius) && this.previewdata.picked[1] <= (y + radius)) {
                          return (opt[1]);
                      }
                  }
                  //Formato standard che controlla se opt[0] == picked
                  else if (opt[0] == this.previewdata.picked) {
                      return opt[1];
                  }
                  //L'opzione di default se non ci sono corrispondenze è sempre l'ultima
                  if (options.indexOf(opt) == options.length - 1) {
                      return opt[1];
                  }
              }
              return "";
          },
          getAnswerCorrectness: function() {
              if (!this.previewdata.picked) return "";
              sols = this.renderQuest.solution;
              if (this.renderQuest.type == "draw") {
                  for (sol of sols) {
                      if (sol) {
                          let x = sol[0];
                          let y = sol[1];
                          let radius = parseInt(sol[2]);
                          if (this.previewdata.picked[0] >= (x - radius) && this.previewdata.picked[0] <= (x + radius) &&
                              this.previewdata.picked[1] >= (y - radius) && this.previewdata.picked[1] <= (y + radius)) {
                              return true;
                          }
                      }
                  }
              } else {
                  for (sol of sols) {
                      if (this.previewdata.picked == sol) return true;
                  }
              }
              return false;
          },
          currentComponent: function() {
              var type = this.renderQuest.type;
              if (type == "choice") return "choiceinput";
              else if (type == "input") return "textinput";
              else if (type == "draw") return "imginput";
              else if (type == "keys") return "keyboardinput";
              else if (type == "human") return "humaninput";
              else return "";
          },
          renderQuest: function() {
              if (this.gamedata == null)
                  return null;
              if (this.previewdata.in_mainquest) return this.gamedata.mainQuest[this.previewdata.currentQuest];
              else return this.gamedata.subQuests[this.previewdata.currentSub];
          },
          getSubquests: function() {
              var subQuestList = [];
              if (!this.gamedata) return subQuestList;
              for (sub of this.gamedata.subQuests) {
                  if (!this.previewdata.completedSubs.includes(sub.number) && sub.available_on.includes(this.previewdata.currentQuest) &&
                      sub.requires_sub.every(val => this.previewdata.completedSubs.includes(val)))
                      subQuestList.push(sub);
              }
              return subQuestList;
          },
          getCurrentClues: function() {
              clues = [];
              for (reward of this.renderQuest.subquest_rewards) {
                  if (this.previewdata.completedSubs.includes(reward.number))
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
          getCurrentGotos: function() {
              gotos = [];
              for (goto of this.renderQuest.goto)
                  gotos.push(goto);
              for (reward of this.renderQuest.subquest_rewards) {
                  if (this.previewdata.completedSubs.includes(reward.number)) {
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
              else disabled = !this.previewdata.picked;
              this.upgradeSubmitStyle(disabled);
              return disabled;
          },
          //STYLEOBJECTS
          //author
          heavyBorder: function() {
            if (this.storiesPanelOpened)
                return "border-primary-3 mt-2 mb-2 pt-4 pb-2";
            else
                return "mt-2 mb-2 pt-2 pb-2";
          },
          marginTop: function() {
            if (this.stylesPanelOpened)
                return "mt-3 ml-3 pl-0";
            else
                return "mt-3 ml-3";
          },
          //preview
          previewStyle: function() {
              var styles = {};
              //loading background image
              var temp = this.gamedata.css_style.background;
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
              if (this.mobileView)
                  styles = Object.assign(styles, {
                      "width": mobile_width,
                      "height": mobile_height,
                      "overflow": "auto"
                  });
              return styles;
          },
          //modifica la dimensione della preview
          previewMode: function() {
              if (this.mobileView)
                  return "col-8";
              else
                  return "col-12";
          },
          //oggetti presenti anche nel player
          navbarBootstrapStyle: function() {
              var classes = "";
              var temp = this.gamedata.css_style.background.style.nav.bootstrap;
              if (!this.gamedata.css_style.background.image) {
                  if (!this.gamedata.css_style.background.style.nav.custom)
                      classes = classes + temp.textColor + " " + temp.background;
                  else
                  ;
              }
              if (!this.mobileView)
                  classes = classes + " navbar-expand";
              return classes;
          },
          navbarStyle: function() {
              var styles = {};
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
              var styles = {}
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
              var styles = {}
              var temp = this.gamedata.css_style.background.style.alert.customized;
              if (this.gamedata.css_style.background.style.alert.custom)
                  styles = Object.assign(styles, temp);
              //apply mainstyle in any case
              styles = this.overwriteMainStyle(styles);
              //alert color is more important than maincolor
              if (this.gamedata.css_style.background.style.alert.custom)
                  styles = Object.assign(styles, {
                      'color': temp['color']
                  });
              if (!this.mobileView)
                  styles = Object.assign(styles, {
                      "margin-top": "-10px"
                  });
              return styles;
          },
          helpAlertContainerStyle: function() {
              var styles = {};
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
                      else
                          ;
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
              styles = this.overwriteMainStyle(styles);
              if (this.mobileView)
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
          menuStyle: function() {
              var styles = {};
              if (!this.gamedata.css_style.background.image) {
                  if (!this.gamedata.css_style.background.style.nav.custom) {
                      if (this.mobileView)
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
                          else
                              ;
                          //overwrite occasional mainstyle
                          if (this.gamedata.css_style.mainStyle["color"])
                              styles = Object.assign(styles, {
                                  "border-color": this.gamedata.css_style.mainStyle["color"]
                              });
                      }
                  } else {
                      var temp = this.gamedata.css_style.background.style.nav.customized.general;
                      if (this.mobileView)
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
                  if (this.mobileView)
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
              if (!this.mobileView)
                  styles = Object.assign(styles, {
                      "width": "max-content"
                  });
              return styles;
          },
          dividerStyle: function() {
              var styles = {};
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
                  //overwrite occasional mainstyle
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
                      if (!this.mobileView)
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
              var styles = {};
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
              //questa funzione si occupa di gestire il colore del bottone submit
              styles = {};
              //se la card utilizza bootstrap gli stili corrispondenti sono specificati in submitBootstrapStyle
              if (!this.gamedata.css_style.background.image)
                  if (this.gamedata.css_style.background.style.card.custom)
                      styles = Object.assign(styles, {
                          "color": this.gamedata.css_style.background.style.card.customized["color"]
                      });
              styles = Object.assign(styles, this.submitStyleObject);
              styles = this.overwriteMainStyle(styles);
              if (this.gamedata.css_style.mainStyle["color"] && !this.gamedata.css_style.background.style.card.custom)
                  styles = Object.assign(styles, {
                      "color": this.gamedata.css_style.mainStyle["color"] + "!important" //è necessario per sovrascrivere il colore assegnato da bootstrap
                  });
              return styles;
          },
          cardLimitStyle: function() {
              var styles = {};
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
              return this.overwriteMainStyle({});
          },
          questsStyle: function() {
              var styles = {};
              if (this.gamedata.css_style.background.image) {
                  styles = Object.assign(styles, {
                      "color": default_image_text_color
                  });
                  styles = this.overwriteMainStyle(styles);
              } else
              if (!this.gamedata.css_style.background.style.nav.custom)
                  styles = this.overwriteMainStyle(styles);
              else {
                  styles = Object.assign(styles, {
                      "color": this.gamedata.css_style.background.style.nav.customized.general["color"]
                  });
                  styles = this.overwriteMainStyle(styles);
              }
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
                  style = this.overwriteMainStyle(styles, true);
              if (this.currentComponent == "humaninput")
                  style = this.overwriteMainStyle(styles, true);
              if (this.currentComponent == "imginput")
                  ;
              if (this.gamedata.css_style.background.image){
                  style = Object.assign(styles, input_backgroundImage);
              }
              style = Object.assign(styles, input_backgroundNone);
              if (!this.gamedata.css_style.background.image)
                  if (!this.gamedata.css_style.mainStyle["color"])
                      styles = Object.assign(styles, {
                          "color": "inherit"
                      });
              return styles;
          }
      },
	  watch: {
		  loadedStory(newstory, oldstory) {
			  let node = this.$refs.qrarea;
			  if (this.loadedStory != "") {
				  node.hidden = false;
				  //Nome al file - ci possono essere spazi
				  let qrname = this.loadedStory;
				  //Nome nel contenuto del qr - non ci possono esse spazi
				  let cname = {quest: this.loadedStory};
				  cname = $.param(cname);
				  let qrcontent = window.location.protocol +  "//" + window.location.hostname + ":" + window.location.port + "/?" + cname;
				  //creo il QR
				  qr.clear();
				  qr.makeCode(qrcontent);
				  node = this.$refs.qrcode;
				  node.src = `${qr._el.getElementsByTagName("img")[0].src}`;
				  node.alt = qrname + " QR Code";
				  //Creo un link di download al QR
				  node = this.$refs.qrdownload;
				  node.href = `${qr._el.getElementsByTagName("img")[0].src}`;
				  node.download = `${qrname}.png`;
			  } else
				  node.hidden = true;
		  }
	  }
  });
