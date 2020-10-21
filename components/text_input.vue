<template>
  <div>
    <label for="input"> Risposta: </label>
    <input ref="texts" type="text" name="prova" id="input" value="" class="willdisabled" autocomplete="off" :style="inputStyle" v-on:input="updateAns($event.target.value)">
  </div>
</template>

<script>
module.exports = {
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
  }
}
</script>

<style scoped>
input{
	max-width: 90vw;
}
</style>
