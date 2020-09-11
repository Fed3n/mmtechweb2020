<template>
  <div>
    <div id="custom-keyboard">
      <p :style="textStyle">{{ text }}</p>
      <div v-for="row in key_style.keys">
        <div id="button-line">
          <span v-for="key in row">
            <button v-if="key.startsWith('!!')" class="input-button" :class="keyboardAnim" :style="keyboardStyle(key)" v-on:click="delValue">{{ key.substring(2,key.length) }}</button>
            <button v-if="!key.startsWith('!!')" class="input-button" :class="keyboardAnim" :value="key" :style="keyboardStyle(key)" v-on:click="emitValue($event.target.value)">{{ key }}</button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {
  props: ["gamedata", "current", "value", "metadata","styles"],
  data: function() {
    return {
      text: "",
      key_style: {
        keys: [["1","2","3"],["4","5","6"],["7","8","9"],["","0",""],["!!X","","!!DEL"]],
        width: "3em",
        height: "2em",
        text_color: "white",
        font_weight: "bold",
        bg_color: "grey",
        border_color: "",
        border_size: "",
        margin: "0.2em",
        radius: "", 
        shadow: true,
        animation: "press",
        screen_font: "Courier",
        screen_color: "white",
        screen_weight: "bold",
        screen_bg: "black",
        screen_border_color: "",
        screen_border_size: "",
        screen_length: "10em"
      }
    }
  },
  methods: {
    emitValue: function(value) {
      this.text += value;
      this.$emit('input', this.text);
    },
    delValue: function() {
      this.text = this.text.substring(0,this.text.length-1);
      this.$emit('input', this.text);
    },
    keyboardStyle: function(val){
      let style = {};
      
      style["width"] = (this.key_style.width || "2em");
      style["height"] = (this.key_style.height || "2em");
      style["color"] = (this.key_style.text_color || "black");
      style["font-size"] = (this.key_style.text_size || "16px");
      style["font-family"] = (this.key_style.text_font || "");
      style["font-weight"] = (this.key_style.font_weight || "");
      style["background-color"] = (this.key_style.bg_color || "white");
      style["border"] = "solid " + (this.key_style.border_color || "black") + " " + (this.key_style.border_size || "0px");
      style["border-radius"] = (this.key_style.radius || "0px");
      style["margin"] = (this.key_style.margin || "0em");
      if(this.key_style.shadow){
        let shad_height = parseFloat(style["height"])/8;
        style["box-shadow"] = `0em ${shad_height}em black`;
      } 
      //Se un bottone e' vuoto e' per riempimento e va nascosto
      if(val === '') style["visibility"] = "hidden";
      return style;
    }
  },
  computed: {
    keyboardAnim: function() {
      let anim = {};
      if(this.key_style.animation == "press"){
        anim["press-anim"] = true;
      }
      else if(this.key_style.animation == "flash"){
        anim["flash-anim"] = true;
        console.log("hey");
      }
      return anim;
    },
    textStyle: function() {
      let style = {};
      style["width"] = (this.key_style.screen_length || "7em");
      style["height"] = "2em";
      style["padding"] = "3px";
      style["text-align"] = "center";
      style["font-family"] = (this.key_style.screen_font || "");
      style["color"] = (this.key_style.screen_color || "black");
      style["font-weight"] = (this.key_style.screen_weight || "");
      style["background-color"] = (this.key_style.screen_bg || "white");
      style["border"] = "solid " + (this.key_style.screen_border_color || "black") + " " + (this.key_style.screen_border_size || "0em");
      return style;
    }
  }
}
</script>

<style scoped>
.input-button{
  overflow: hidden;
  user-select: none;
  text-align: center;
  vertical-align: top;
  outine: none;
}

#button-line {
  display: block;
  font-size: 0px;
}

.press-anim:active {
  transform: translateY(0.1em);
}

.flash-anim:active {
  background-color: white !important;
}

</style>
