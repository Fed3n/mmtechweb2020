var humaninput = Vue.component('human_input', {
  props: ["gamedata", "current", "value", "metadata","styles"],
  methods: {
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
			   console.log("sent answer");
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
    }
  },
  computed: {
	waitingFeedback: function(){
		return this.$parent.waiting_feedback;
	},
	canProceed: function(){
		return this.$parent.received_feedback;
	}
  },
  template: `
  <div class="container border p-3">
    <div v-if="!waitingFeedback & !canProceed">
      <p>Carica un'immagine e/o inserisci una risposta.</p>
      <form class="form-group" v-on:submit.prevent="submitAnswer">
        <textarea class="form-control willdisabled" ref="textarea"></textarea>
        <input class="form-control willdisabled" ref="imgarea" type="file" accept="image/*" capture="camera">
	<input type="submit" class="willdisabled" value="Invia" v-on:click="submitAnswer">
      </form>
    </div>
    <p v-if="waitingFeedback">Risposta inviata! In attesa della valutazione...</p>
    <p v-if="canProceed">Valutazione ricevuta, premi submit!</p>
  </div>
  `
});
