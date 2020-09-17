<template>
  <div>
    <p :style="textStyle" tabindex=0 aria-live="polite" aria-label="codice inserito">{{ text }}</p>
    <div id="custom-keyboard" role="grid">
      <div v-for="(row,index) in genKeyboard" :aria-label="'riga'+index">
        <div id="button-line">
          <span v-for="key in row">
            <button v-if="key.startsWith('!!')" type="button" class="input-button" :class="keyboardAnim" :style="keyboardStyle(key)" v-on:click="delValue">{{ key.substring(2,key.length) }}</button>
            <button v-if="!key.startsWith('!!')" type="button" class="input-button" :class="keyboardAnim" :value="key" :style="keyboardStyle(key)" 
            v-on:click="emitValue($event.target.value)">{{ key }}</button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {
  props: ["gamedata", "current", "value", "metadata","styles","key_style"],
  data: function() {
    return {
      text: ""
     }
  },
  methods: {
    emitValue: function(value) {
      this.text += value;
      this.$emit('input', this.text);
      this.$parent.$refs.submitbutton.disabled = !this.text;
    },
    delValue: function() {
      this.text = this.text.substring(0,this.text.length-1);
      this.$parent.$refs.submitbutton.disabled = !this.text;
      this.$emit('input', this.text);
    },
    keyboardStyle: function(val){
      let style = {};

      style["width"] = (this.gamedata.key_style.width || "2") + "em";
      style["height"] = (this.gamedata.key_style.height || "2") + "em";
      style["color"] = (this.gamedata.key_style.text_color || "black");
      style["font-size"] = (this.gamedata.key_style.text_size || "16") + "px";
      style["font-family"] = (this.gamedata.key_style.text_font || "");
      style["font-weight"] = this.gamedata.key_style.bold ? "bold" : "";
      style["background-color"] = (this.gamedata.key_style.bg_color || "white");
      style["border"] = "solid " + (this.gamedata.key_style.border_color || "black") + " " + (this.gamedata.key_style.border_size || "0") + "px";
      style["border-radius"] = (this.gamedata.key_style.radius || "0") + "px";
      style["margin"] = (this.gamedata.key_style.margin || "0") + "em";
      if(this.gamedata.key_style.shadow){
        let shad_height = parseFloat(style["height"])/8;
        style["box-shadow"] = `0em ${shad_height}em black`;
      }
      //Se un bottone e' vuoto e' per riempimento e va nascosto
      if(val === "_") style["visibility"] = "hidden";
      return style;
    }
  },
  computed: {
    keyboardAnim: function() {
      let anim = {};
      if(this.gamedata.key_style.animation == "press"){
        anim["press-anim"] = true;
      }
      else if(this.gamedata.key_style.animation == "flash"){
        anim["flash-anim"] = true;
      }
      return anim;
    },
    textStyle: function() {
      let style = {};
      style["width"] = (this.gamedata.key_style.screen_length || "7") + "em";
      style["height"] = "2em";
      style["padding"] = "3px";
      style["text-align"] = "center";
      style["font-family"] = (this.gamedata.key_style.screen_font || "");
      style["color"] = (this.gamedata.key_style.screen_color || "black");
      style["font-weight"] = this.gamedata.key_style.screen_bold ? "bold" : "";
      style["background-color"] = (this.gamedata.key_style.screen_bg || "white");
      style["border"] = "solid " + (this.gamedata.key_style.screen_border_color || "black") + " " + (this.gamedata.key_style.screen_border_size || "0") + "px";
      return style;
    },
    //Partendo da una stringa in cui ogni riga è separata da ; e ogni colonna da , genero la tastiera
    //Se l'elemento inizia con !! è un tasto delete
    genKeyboard: function() {
      if(!this.gamedata.key_style.keys) return [];
      //Uso prima una regex per eliminare i whitespaces e poi splitto le righe
      let rows = this.gamedata.key_style.keys.replace(/\s/g,"").split(";");
      let res = [];
      for(row of rows){
        res.push(row.split(","));
      }
      return res;
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
  outline: none;
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
