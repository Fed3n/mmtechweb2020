var imginput = Vue.component('img_input', {
  props: ["gamedata", "current", "value", "metadata","wrong"],
  methods: {
    updateAns: function(event){
      //La prima parte gestisce il disegno sul canvas
      ctx = event.target.getContext("2d");
      canvas = this.$refs.imgcanvas;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const x = parseInt(event.clientX-canvas.getBoundingClientRect().x);
      const y = parseInt(event.clientY-canvas.getBoundingClientRect().y);
      console.log("Clicked on: " + x + "," + y);
      ctx.font = "20px bold";
      ctx.fillStyle = "white";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 1;
      ctx.lineWidth = 12;
      //+-10 per centrare verso il cursore
      ctx.fillText("O", x-10, y+10);
      //La seconda parte manda la risposta
      this.$emit('input', [x,y])
    },
    updateCanvasImage: function() {
      var c = this.$refs.imgcanvas;
      var ctx = c.getContext("2d");
      var img = new Image();
      img.src = this.gamedata.image.imguri ? ("story/" + this.metadata.name + "/images/" + this.gamedata.image.imguri) : "";
      img.alt = this.gamedata.image.imgalt;
      img.onload = function() {
        ctx.drawImage(img,0,0, c.width, c.height);
      }
    }
  },
  mounted:	function() {
    this.updateCanvasImage();
  },
  template:`
  <div style="position: relative; margin-top: 2%; margin-bottom: 2%;  width: 20rem; height: 16rem;">
    <canvas style="position: absolute; left: 0; top: 0; z-index: 0;" width="300" height="250" ref="imgcanvas"></canvas>
    <canvas style="position: absolute; left: 0; top: 0; z-index: 1;" width="300" height="250" ref="drawcanvas" v-on:click="updateAns"></canvas>
	<p v-if="wrong">Riprova!</p>
  </div>
  `
});
