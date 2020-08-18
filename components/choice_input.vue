<template>
  <div>
    <div v-for="opt in options">
      <input v-bind:name="current" type="radio" v-bind:value="opt" v-bind:id="opt" v-on:click="updateAns($event.target.value);updateBtns(opt);">
      <label ref="radios" v-bind:for="opt">{{ opt }}</label>
    </div>
  </div>
</template>

<script>
module.exports = {
    props: ["gamedata", "current", "value", "options"],
    methods: {
      updateAns: function(picked){
        this.$emit('input', picked);
        if(document.getElementById("submit")){
          if(picked != "") document.getElementById("submit").disabled = false;
          else document.getElementById("submit").disabled = true;
        }
      },
      updateBtns: function(id){
        for (el of this.$refs.radios) {
          if(el.getAttribute("for") == id) el.setAttribute("style", "color: red;");
          else el.setAttribute("style", "color: black;");
        }
      }
    }
}
</script>
