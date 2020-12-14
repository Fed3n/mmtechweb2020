var humaninput = Vue.component('human_input', {
  data () {
    return {
     pickText: "",
     pickImg: false
   }
 },
  props: ["gamedata", "current", "value", "metadata","styles","buttonstyle","preview"],
  methods: {
	//metodo alternativo per evitare overload sul server unibo tenendo in ram immagini grandi
	submitAnswer: async function() {
    if (!this.preview){
  		let form = new FormData();
          let uid = this.$parent.user_id;
          let image = this.$refs.imgarea.files[0] || "";
          let text = this.$refs.textarea.value;
  		if(image){
  			try{
  				let form = new FormData();
  				form.append('image', image);
  				await axios.post(`/tmpimage`, form, {
  					headers: {
  						'Content-Type': 'multipart/form-data'
  					}
  				});
  				await axios.post('/answers', {'text': text, 'imagedata': image.name}, {params: { 'user_id': this.$parent.user_id }});
  				console.log("sent answer");
  				this.submitted = true;
  				this.$parent.waiting_feedback = true;
  			}
  			catch {
  				alert("Impossibile mandare la risposta, riprova più tardi");
  				return;
  			}
  		} else {
  			try {
  				await axios.post('/answers', {'text': text, 'imagedata': ""}, {params: { 'user_id': this.$parent.user_id }});
  				console.log("sent answer");
  				this.submitted = true;
  				this.$parent.waiting_feedback = true;
  			}
  			catch {
  				alert("Impossibile mandare la risposta, riprova più tardi");
  				return;
  			}
  		}
    }
	},
	/*
    //Un po' complicato, mando l'immagine in base64 così che il valutatore la possa caricare
    //senza che venga salvata sul server come uri permanente
    submitAnswer: function(){
        let form = new FormData();
        let uid = this.$parent.user_id;
        let image = this.$refs.imgarea.files[0] || "";
        let text = this.$refs.textarea.value;
	if(image){
		let reader = new FileReader();
		_this = this;
		reader.onloadend = function() {
			form.append('imagedata', reader.result);
			form.append('text', text);
			console.log(reader.result);
			axios.post(`/answers`, form, {
			  headers: {
			      'Content-Type': 'multipart/form-data'
			  },
			  params: {
			      'user_id': _this.$parent.user_id
			  }
			})
			.then((res) => {
			  _this.submitted = true;
			  _this.$parent.waiting_feedback = true;
			});
		};
		reader.readAsDataURL(image);
	}
	else {
		axios.post('/answers', {'text': text, 'imagedata': ""}, {params: { 'user_id': this.$parent.user_id }}).then((res) => {
			console.log("sent answer");
			this.submitted = true;
			this.$parent.waiting_feedback = true;
		});
	}
	}*/
    imageChange: function(e) {
      this.pickImg = (this.$refs.imgarea.files[0]);
    }
  },
  computed: {
  	waitingFeedback: function(){
  		return this.$parent.waiting_feedback;
  	},
  	canProceed: function(){
  		return this.$parent.received_feedback;
  	},
    inputStyle: function() {
      return this.styles;
    },
    buttonStyle: function() {
      return this.buttonstyle;
    },
    disableButton: function() {
      return !(this.pickText || this.pickImg);
    }
  },
  template: `
  <div class="container m-0 p-0">
    <div v-if="!waitingFeedback & !canProceed">
      <p>Metti un'immagine e/o inserisci una risposta.</p>
      <form class="form-group m-3" v-on:submit.prevent="submitAnswer">
        <textarea class="form-control willdisabled my-2" ref="textarea" :style="inputStyle" v-model="pickText"></textarea>
        <input class="form-control willdisabled my-2" ref="imgarea" type="file" accept="image/*" v-on:change="imageChange" :style="inputStyle" style="overflow: hidden">
	      <input type="submit" class="btn willdisabled my-1" value="Invia" :disabled="disableButton" :style="buttonStyle">
      </form>
    </div>
    <p v-if="waitingFeedback">Risposta inviata! In attesa della valutazione...</p>
    <p v-if="canProceed">Valutazione ricevuta, premi Conferma!</p>
  </div>
  `
});
