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
  import ProbAU from "./ProbAU";
  import ProbAV from "./ProbAV";
  import ProbAW from "./ProbAW";
  import ProbAX from "./ProbAX";
  import ProbAY from "./ProbAY";
  import ProbAZ from "./ProbAZ";
  import ProbBE from "./ProbBE";

  export default {
    name: "Prob2",
    components: {
      ProbAU,
      ProbAV,
      ProbAW,
      ProbAX,
      ProbAY,
      ProbAZ,
      ProbBE,
    },
    data() {
      return {
        tabs: [
          // 管理员
          { key: 53, tab: "不用上补贴但上了", comp: "ProbBE" },
          { key: 52, tab: "没有补贴门店", comp: "ProbAZ" },
          { key: 51, tab: "没有上品牌门店", comp: "ProbAY" },
          { key: 50, tab: "合作方案优惠到期时间", comp: "ProbAX" },
          { key: 49, tab: "超级吃货红包降低出资", comp: "ProbAW" },
          { key: 48, tab: "差评申诉效果", comp: "ProbAV" },
          { key: 47, tab: "差评申诉详情", comp: "ProbAU" },
        ].map((v, i) => ({ ...v, tab: `${i + 1}.${v.tab}` })),
      };
    },
  };
</script>
