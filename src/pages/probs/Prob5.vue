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
  import ProbBB from "./ProbBB";
  import ProbBC from "./ProbBC";
  import ProbAI2 from "./ProbAI2";

  export default {
    name: "Prob5",
    components: {
      ProbBB,
      ProbBC,
      ProbAI2,
    },
    data() {
      return {
        tabs: [
          { key: 1, tab: '下架商品销量', comp: 'ProbBB' },
          { key: 2, tab: '早晨推广费', comp: 'ProbBC' },
          { key: 3, tab: '差评', comp: 'ProbAI2' },
        ].map((v, i) => ({ ...v, tab: `${i + 1}.${v.tab}` })),
      };
    },
  };
</script>
