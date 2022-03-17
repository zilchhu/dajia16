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
  import ProbA from "./ProbA";
  import ProbB from "./ProbB";
  import ProbC from "./ProbC";
  import ProbD from "./ProbD";
  import ProbE from "./ProbE";
  import ProbF from "./ProbF";
  import ProbG from "./ProbG";
  import ProbH from "./ProbH";
  import ProbI from "./ProbI";
  import ProbJ from "./ProbJ";
  import ProbK from "./ProbK";
  import ProbL from "./ProbL";
  import ProbM from "./ProbM";
  import ProbN from "./ProbN";
  import ProbO from "./ProbO";
  import ProbP from "./ProbP";
  import ProbQ from "./ProbQ";
  import ProbR from "./ProbR";
  import ProbS from "./ProbS";
  import ProbT from "./ProbT";
  import ProbU from "./ProbU";
  import ProbV from "./ProbV";
  import ProbW from "./ProbW";
  import ProbX from "./ProbX";
  import ProbY from "./ProbY";
  import ProbZ from "./ProbZ";
  import ProbAA from "./ProbAA";
  import ProbAB from "./ProbAB";
  import ProbAC from "./ProbAC";
  import ProbAD from "./ProbAD";
  import ProbAE from "./ProbAE";
  import ProbAF from "./ProbAF";
  import ProbAG from "./ProbAG";
  import ProbAH from "./ProbAH";
  import ProbAJ from "./ProbAJ";
  import ProbAK from "./ProbAK";
  import ProbAL from "./ProbAL";
  import ProbAM from "./ProbAM";
  import ProbAN from "./ProbAN";
  import ProbAO from "./ProbAO";
  import ProbAP from "./ProbAP";
  import ProbAQ from "./ProbAQ";
  import ProbAR from "./ProbAR";
  import ProbBA from "./ProbBA";
  import ProbBD from "./ProbBD";
  import ProbBF from "./ProbBF";
  import ProbBG from "./ProbBG";

  export default {
    name: "Prob3",
    components: {
      ProbA,
      ProbB,
      ProbC,
      ProbD,
      ProbE,
      ProbF,
      ProbG,
      ProbH,
      ProbI,
      ProbJ,
      ProbK,
      ProbL,
      ProbM,
      ProbN,
      ProbO,
      ProbP,
      ProbQ,
      ProbR,
      ProbS,
      ProbT,
      ProbU,
      ProbV,
      ProbW,
      ProbX,
      ProbY,
      ProbZ,
      ProbAA,
      ProbAB,
      ProbAC,
      ProbAD,
      ProbAE,
      ProbAF,
      ProbAG,
      ProbAH,
      ProbAJ,
      ProbAK,
      ProbAL,
      ProbAM,
      ProbAN,
      ProbAO,
      ProbAP,
      ProbAQ,
      ProbAR,
      ProbBA,
      ProbBD,
      ProbBF,
      ProbBG,
    },
    data() {
      return {
        tabs: [
          // 日检
          { key: 44, tab: "美团其它活动", comp: "ProbAR" },
          { key: 43, tab: "饿了么其它活动", comp: "ProbAQ" },
          { key: 42, tab: "单产品满减", comp: "ProbAP" },
          { key: 41, tab: "百亿补贴可报名", comp: "ProbAO" },
          // { key: 40, tab: '门店沟通', comp: 'ProbAN' },
          { key: 39, tab: "起送价变化", comp: "ProbAM" },
          { key: 37, tab: "低折扣起购错误", comp: "ProbAK" },
          { key: 38, tab: "低折扣限购错误", comp: "ProbAL" },
          // { key: 35, tab: "差评", comp: "ProbAI2" },
          { key: 31, tab: "满减", comp: "ProbAE" },
          { key: 45, tab: "满减变化", comp: "ProbBD" },
          { key: 29, tab: "减配", comp: "ProbAC" },
          { key: 36, tab: "合作方案到期", comp: "ProbAJ" },
          { key: 30, tab: "假减配", comp: "ProbAD" },
          { key: 28, tab: "折扣即将到期", comp: "ProbAB" },
          { key: 27, tab: "折扣遗漏", comp: "ProbAA" },
          { key: 26, tab: "美团配送范围对比昨日", comp: "ProbZ" },
          { key: 53, tab: "美团非自配混合送范围", comp: "ProbBA" },
          { key: 25, tab: "美团点金0曝光", comp: "ProbY" },
          // { key: 24, tab: '成本表查漏', comp: 'ProbX' },
          { key: 12, tab: "美团津贴联盟", comp: "ProbL" },
          { key: 23, tab: "单折扣起送", comp: "ProbW" },
          { key: 11, tab: "2份起购价格错误", comp: "ProbK" },
          { key: 10, tab: "0元有餐盒费", comp: "ProbJ" },
          { key: 2, tab: "无餐盒费", comp: "ProbB" },
          { key: 1, tab: "原价扣点折扣优惠大于2", comp: "ProbA" },
          { key: 32, tab: "库存过少检查", comp: "ProbAF" },
          { key: 33, tab: "查询商品多规格", comp: "ProbAG" },
          { key: 34, tab: "推广费余额查询", comp: "ProbAH" },
          { key: 46, tab: "商品差异", comp: "ProbBF" },
          { key: 47, tab: "单点不送", comp: "ProbBG" },
        ].map((v, i) => ({ ...v, tab: `${i + 1}.${v.tab}` })),
      };
    },
  };
</script>
