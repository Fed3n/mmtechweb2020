Vue.component('choice_input'), {
    props: ["gamedata", "current", "value", "options", "metadata"],
    methods: {
      updateAns: function(picked){
        this.$emit('input', picked);
      }
    },
    template: `
<div>
  <div class="answerContainer" v-for="opt in options">
    <input v-bind:name="current" type="radio" class="willdisabled" v-bind:value="opt" v-bind:id="opt" v-on:click="updateAns($event.target.value)">
    <label ref="radios" v-bind:for="opt">{{ opt }}</label>
  </div>
</div>
`
});

<template>
</template>

<script>
module.exports = {
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
