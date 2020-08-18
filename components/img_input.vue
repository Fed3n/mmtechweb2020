<template>
  <div style="position: relative; margin-top: 2%; margin-bottom: 2%;  width: 20rem; height: 16rem;">
    <canvas style="position: absolute; left: 0; top: 0; z-index: 0;" width="300" height="250" ref="imgcanvas"></canvas>
    <canvas style="position: absolute; left: 0; top: 0; z-index: 1;" width="300" height="250" ref="drawcanvas" v-on:click="updateAns"></canvas>
  </div>
</template>

<script>
module.exports = {
  props: ["gamedata", "current", "value"],
  methods: {
    updateAns: function(event){
      //La prima parte gestisce il disegno sul canvas
      ctx = event.target.getContext("2d");
      canvas = this.$refs.imgcanvas;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const x = event.clientX-canvas.getBoundingClientRect().x;
      const y = event.clientY-canvas.getBoundingClientRect().y;
      console.log("Clicked on: " + x + "," + y);
      ctx.font = "12px bold";
      ctx.fillStyle = "white";
      ctx.shadowColor = "red";
      ctx.shadowBlur = 1;
      ctx.lineWidth = 5;
      ctx.fillText("x", x, y);
      //La seconda parte manda la risposta
      this.$emit('input', [x,y])
      //Se ho clickato è sempre un responso valido
      if(document.getElementById("submit")) document.getElementById("submit").disabled = false;
    }
  },
  mounted:	function() {
    var c = this.$refs.imgcanvas;
    var ctx = c.getContext("2d");
    var img = new Image();
    img.src = this.gamedata.image.imguri;
    img.alt = this.gamedata.image.imgalt;
    console.log(img.src + " " + img.alt);
    img.onload = function() {
      ctx.drawImage(img,0,0, c.width, c.height);
    }
  }
}
</script>
