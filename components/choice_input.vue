<template>
  <div>
    <div class="answerContainer" v-for="opt in options">
      <input v-bind:name="current" type="radio" v-bind:value="opt" v-bind:id="opt" v-on:click="updateAns($event.target.value)">
      <label ref="radios" v-bind:for="opt">{{ opt }}</label>
    </div>
  </div>
</template>

<script>
module.exports = {
    props: ["gamedata", "current", "value", "options", "metadata"],
    methods: {
      updateAns: function(picked){
        this.$emit('input', picked);
      }
    }
}
</script>

<style scoped>
label {
  display: inline;
}
.answerContainer {
  margin-bottom: 0.7em;
}
</style>
