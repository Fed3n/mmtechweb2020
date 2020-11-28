var textinput = Vue.component('text_input.js', {
  props: ["gamedata", "current", "value", "metadata","styles"],
  methods: {
    updateAns: function(picked){
      this.$emit('input', picked);
    }
  },
  computed: {
  	inputStyle: function() {
  		return this.styles;
  	}
  },
  template:`
  <div class="textinput">
    <label for="input"> Risposta: </label>
    <input ref="texts" type="text" name="prova" id="input" value="" class="willdisabled" autocomplete="off" :style="inputStyle" v-on:input="updateAns($event.target.value)">
  </div>
  `
});
/*
<style scoped>
input{
	max-width: 90vw;
}
</style>
*/
