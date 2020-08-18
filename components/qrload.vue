<template>
  <div>
    <label for="quests">Seleziona la missione: </label>
    <select ref="quests" id="quests" v-on:click="updateQuest()">
      <option v-for="quest in questlist" v-bind:id="quest" v-bind:value="quest">{{ quest }}</option>
    </select>
  </div>
</template>

<script>
module.exports = {
  data: function() {
    return {
      questlist: null
    }
  },
  mounted: function() {
    axios
    .get(`/quest`).then(response => {
      this.questlist = response.data;
      for(var i=0; i < this.questlist.length; i++) {
        this.questlist[i] = this.questlist[i].replace(".json", "");
      }
    })
  },
  methods: {
    updateQuest: function(){
      questname = this.$refs.quests.value;
      console.log(questname);
    }
  }
}
</script>
