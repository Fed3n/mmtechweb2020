<template>
  <div>
    <label for="quests">Seleziona la missione: </label>
    <select ref="quests" id="quests" v-on:click="updateQuest()">
      <option v-for="quest in questList" v-bind:id="quest" v-bind:value="quest">{{ quest }}</option>
    </select>
  </div>
</template>

<script>
module.exports = {
  data: function() {
    return {
      questList: null
    }
  },
  mounted: function() {
    axios
    .get(`/stories`).then(response => {
      arr = response.data;
      questList = [];
      for(el of arr) {
        questList.push(el.name);
      }
      this.questList = questList;
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
