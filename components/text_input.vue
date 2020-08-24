<template>
  <div>
    <label for="input"> Risposta: </label>
    <input ref="texts" type="text" name="prova" id="input" value="" v-on:input="updateAns($event.target.value)">
  </div>
</template>

<script>
module.exports = {
  props: ["gamedata", "current", "value", "metadata"],
  methods: {
    updateAns: function(picked){
      this.$emit('input', picked);
      if(document.getElementById("submit")){
        if(picked != "") document.getElementById("submit").disabled = false;
        else document.getElementById("submit").disabled = true;
      }
    }
  }
}
</script>
