<template>
  <div>
    <p ref="texterror" style="font-weight: bold; color: red;">{{ error }}</p>

	<p style="font-weight: bold; color: blue;">Scan or upload a compatible QR to get started!</p>

    <div id="qrstream" ref="qrstream" v-on:click="clicked"><qrcode-stream @decode="check" @init="init"></qrcode-stream></div>
	<div id="qrdrop" ref="qrdrop" hidden>
		<qrcode-drop-zone @detect="onDetect" @dragover="updateStatus" @init="consoleLog">
		<div class="drop-area" :class="{ 'dragover': dragover }">
			<br>
			Drop the quest QR Code here
			<br><br><br>
			Or click here to upload a file:
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
  methods: {
    check (result) {
		console.log(result);
		console.log(this.questlist);
		if(questlist.filter(el => el.name === result)) {
			this.error = "Loading quest!";
			this.$parent.questname = result;
      this.$parent.changeQuest();
		} else this.error = `Quest ${result} isn't available!`;
    },
	async onDetect (promise) {
      try {
        const { content } = await promise

		console.log(content);
		console.log(this.questlist);
		if(questlist.filter(el => el.name === result)) {
			this.error = "Loading quest!";
			this.$parent.questname = result;
			this.$parent.changeQuest();
		} else this.error = `Quest ${result} isn't available!`
      } catch (error) {
        if (error.name === 'DropImageFetchError') {
          this.error = 'Sorry, you can\'t load cross-origin images :/'
        } else if (error.name === 'DropImageDecodeError') {
          this.error = 'Ok, that\'s not an image. That can\'t be decoded.'
        } else {
          this.error = `ERROR: ${error.message}`
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
			  this.error = "ERROR: you need to grant camera access permisson"
			} else if (error.name === 'NotFoundError') {
			  this.error = "No camera found on this device, drag the QR instead."
			} else if (error.name === 'NotSupportedError') {
			  this.error = "ERROR: secure context required (HTTPS, localhost)"
			} else if (error.name === 'NotReadableError') {
			  this.error = "ERROR: is the camera already in use?"
			} else if (error.name === 'OverconstrainedError') {
			  this.error = "ERROR: installed cameras are not suitable"
			} else if (error.name === 'StreamApiNotSupportedError') {
			  this.error = "ERROR: Stream API is not supported in this browser"
			} else if (error.name === 'InsecureContextError') {
			  this.error = "ERROR: You must be either on localhost or https domain";
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
