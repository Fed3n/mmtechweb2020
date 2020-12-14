var qrload = Vue.component('qrload', {
  data () {
    return {
      error: '',
	  dragover: false,
	  questlist: null,
	  loadcamera: true,
    }
  },
  props: ["questname"],
  mounted: function() {
	axios.get('/stories').then(response => {
		questlist = [];
			//pusho solo le quest attive, le altre non sono accessibili
			for(el of response.data) {
				if(el.active) questlist.push(el);
			}
		this.questlist = questlist;
	});
  },
  methods: {
	checkName (str) {
		let result = str;
		if (result.indexOf("quest=")) {
			result = result.substring(result.lastIndexOf("quest=")+6, result.length);
			while (result.indexOf("%20") != -1)
				result = result.replace("%20"," ");
		}
		return result;
	},
    check (result) {
		var name = this.checkName(result);
		if(questlist.filter(el => el.name === name).length > 0) {
			this.error = "Loading quest!";
			this.$parent.questname = name;
			this.$parent.changeQuest();
		} else this.error = `ERRORE: La missione ${name} non è disponibile!`;
    },
	async onDetect (promise) {
      try {
        const { content } = await promise
		var name = this.checkName(content)
		if(questlist.filter(el => el.name === name).length > 0) {
			this.error = "Loading quest!";
			this.$parent.questname = name;
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
			if(document.getElementById("qrstream")) document.getElementById("qrstream").remove();
			if(document.getElementById("qrdrop")) document.getElementById("qrdrop").removeAttribute("hidden");
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
		document.getElementsByName("image")[0].click();
	}
  },
  beforeMount: function() {
	let index = window.location.href.indexOf("quest=");
	if (Cookies.get('logged') === 'true'  || index != -1) {
		this.loadcamera = false;
		if(index != -1){
			let name = "";
			this.$parent.questname = this.checkName(window.location.href);
			this.$parent.changeQuest();
		}
	}
  },
  template:`
  <div v-if="loadcamera" class="qrload">
    <p class="alert alert-danger" role="alert" ref="texterror" style="font-weight: bold; color: red;">{{ error }}</p>

	<p class="alert alert-info" role="alert">Scansiona o carica un QR Code compatibile per iniziare una missione!</p>

    <div id="qrstream" v-on:click="clicked"><qrcode-stream @decode="check" @init="init"></qrcode-stream></div>
	<div id="qrdrop" hidden>
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
  `
});
