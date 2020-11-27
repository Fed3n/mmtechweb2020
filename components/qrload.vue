<template>
  <div>
    <p class="alert alert-danger" role="alert" ref="texterror" style="font-weight: bold; color: red;">{{ error }}</p>

	<p class="alert alert-info" role="alert">Scansiona o carica un QR Code compatibile per iniziare una missione!</p>

    <div id="qrstream" ref="qrstream" v-on:click="clicked"><qrcode-stream @decode="check" @init="init"></qrcode-stream></div>
	<div id="qrdrop" ref="qrdrop" hidden>
		<qrcode-drop-zone @detect="onDetect" @dragover="updateStatus" @init="consoleLog">
		<div class="drop-area" :class="{ 'dragover': dragover }">
			<br>
			Trascina il QR Code qui
			<br><br><br>
			Oppure carica un file:
			<br>
			<qrcode-capture @decode="check" />
		</div>
		</qrcode-drop-zone>
	</div>
  </div>
</template>

<script>
module.exports = {
  data () {
    return {
      error: '',
	  dragover: false,
	  questlist: null
    }
  },
  props: ["questname"],
  mounted: function() {
	axios.get('/stories').then(response => {
		questlist = [];
			for(el of response.data) {
				questlist.push(el);
			}
		this.questlist = questlist;
	});
  },
  watch: {
	  questlist: function(newlist, oldlist) {
		  let name = null;
		  if(window.location.pathname.indexOf("/player_") != -1){
			for(story of this.questlist){
			  name = window.location.pathname.substring(8,window.location.pathname.length);
			}
		  }
		  if(name != null) {
			this.$parent.questname = name;
			this.$parent.changeQuest();
		  }
	   }
  },
  methods: {
    check (result) {
		console.log(result);
		console.log(this.questlist);
		if(questlist.filter(el => el.name === result).length > 0) {
			this.error = "Loading quest!";
			this.$parent.questname = result;
			this.$parent.changeQuest();
		} else this.error = `ERRORE: La missione ${result} non è disponibile!`;
    },
	async onDetect (promise) {
      try {
        const { content } = await promise

		console.log(content);
		console.log(this.questlist);
		if(questlist.filter(el => el.name === content).length > 0) {
			this.error = "Loading quest!";
			this.$parent.questname = content;
			this.$parent.changeQuest();
		} else this.error = `ERRORE: La missione ${content} non è disponibile!`
      } catch (error) {
        if (error.name === 'DropImageFetchError') {
          this.error = "Puoi importare un'immagine solo dal filesystem locale."
        } else if (error.name === 'DropImageDecodeError') {
          this.error = 'Media non compatibile. Importa un qr code in formato immagine.'
        } else if (!error.name) {
		  this.error = 'Media non compatibile. Importa un qr code in formato immagine.'
		} else {
          this.error = `ERRORE: ${error.message}`
        }
      }
    },
    async init (promise) {
		try {
			await promise
		} catch (error) {
			this.$refs.qrstream.remove();
			this.$refs.qrdrop.removeAttribute("hidden");
			if (error.name === 'NotAllowedError') {
			  this.error = "ERRORE: Per continuare devi garantire i permessi alla fotocamera"
			} else if (error.name === 'NotFoundError') {
			  this.error = "ERRORE: Nessuna fotocamera disponibile, importa il QR Code manualmente."
			} else if (error.name === 'NotSupportedError') {
			  this.error = "ERRORE: Connessione HTTPS non stabilita."
			} else if (error.name === 'NotReadableError') {
			  this.error = "ERRORE: la fotocamera è già in uso da un'altra applicazione."
			} else if (error.name === 'OverconstrainedError') {
			  this.error = "ERRORE: la tua webcam non è compatibile."
			} else if (error.name === 'StreamApiNotSupportedError') {
			  this.error = "ERRORE: Browser non compatibile. Per favore utilizza Chrome o Firefox."
			} else if (error.name === 'InsecureContextError') {
			  this.error = "ERRORE: Connessione HTTPS non stabilita.";
			}
		}
    },
	consoleLog (promise) {
      promise.catch(console.error);
    },
	updateStatus (isDraggingOver) {
		this.dragover = isDraggingOver;
	},
	clicked: function() {
		console.log(document.getElementsByName("image")[0]);
		document.getElementsByName("image")[0].click();
	}
  }
}
</script>

<style>
.drop-area {
  height: 300px;
  color: #fff;
  text-align: center;
  font-weight: bold;
  padding: 10px;
  background-color: rgba(0,0,0,.5);
}

.dragover {
  background-color: rgba(0,0,0,.8);
}
</style>
