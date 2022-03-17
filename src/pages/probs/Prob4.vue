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
  import ProbAN from "./ProbAN";

  export default {
    name: "Prob4",
    components: {
      ProbAN,
    },
    data() {
      return {
        tabs: [
          { key: 40, tab: '门店沟通', comp: 'ProbAN' },
        ].map((v, i) => ({ ...v, tab: `${i + 1}.${v.tab}` })),
      };
    },
  };
</script>
