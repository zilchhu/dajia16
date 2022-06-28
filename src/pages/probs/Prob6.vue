<template lang="pug">
a-tabs(
  tab-position="top",
  size="small",
  :tabBarGutter="14",
  :animated="{ inkBar: true, tabPane: false }"
)
  a-tab-pane(v-for="tab in tabs", :key="tab.key", :tab="tab.tab")
    keep-alive
      component(:is="tab.comp")
</template>

<script>
  import RateFollowUp from './RateFollowUp'
  import LaborEffiencyFollowUp from './LaborEffiencyFollowUp'

  export default {
    name: "Prob6",
    components: {
      RateFollowUp,
      LaborEffiencyFollowUp
    },
    data() {
      return {
        tabs: [
          { key: 1, tab: '评分跟进', comp: 'RateFollowUp' },
          { key: 2, tab: '人效跟进', comp: 'LaborEffiencyFollowUp' },
          // { key: 3, tab: '差评', comp: 'ProbAI2' },
        ].map((v, i) => ({ ...v, tab: `${i + 1}.${v.tab}` })),
      };
    },
  };
</script>
