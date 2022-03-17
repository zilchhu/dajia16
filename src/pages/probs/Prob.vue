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
  import ProbAS from "./ProbAS";
  import ProbAT from "./ProbAT";

  export default {
    name: "Prob",
    components: {
      ProbAS,
      ProbAT,
    },
    data() {
      return {
        tabs: [
          // 自配送
          { key: 46, tab: "自配送取消订单", comp: "ProbAT" },
          { key: 45, tab: "自配送单均配送", comp: "ProbAS" },
          // // 管理员
          // { key: 52, tab: "没有补贴门店", comp: "ProbAZ" },
          // { key: 51, tab: "没有上品牌门店", comp: "ProbAY" },
          // { key: 50, tab: "合作方案优惠到期时间", comp: "ProbAX" },
          // { key: 49, tab: "超级吃货红包降低出资", comp: "ProbAW" },
          // { key: 48, tab: "差评申诉效果", comp: "ProbAV" },
          // { key: 47, tab: "差评申诉详情", comp: "ProbAU" },
          // // 日检
          // { key: 44, tab: "美团其它活动", comp: "ProbAR" },
          // { key: 43, tab: "饿了么其它活动", comp: "ProbAQ" },
          // { key: 42, tab: "单产品满减", comp: "ProbAP" },
          // { key: 41, tab: "百亿补贴可报名", comp: "ProbAO" },
          // // { key: 40, tab: '门店沟通', comp: 'ProbAN' },
          // { key: 39, tab: "起送价变化", comp: "ProbAM" },
          // { key: 37, tab: "低折扣起购错误", comp: "ProbAK" },
          // { key: 38, tab: "低折扣限购错误", comp: "ProbAL" },
          // { key: 35, tab: "差评", comp: "ProbAI2" },
          // { key: 31, tab: "满减", comp: "ProbAE" },
          // { key: 29, tab: "减配", comp: "ProbAC" },
          // { key: 36, tab: "合作方案到期", comp: "ProbAJ" },
          // { key: 30, tab: "假减配", comp: "ProbAD" },
          // { key: 28, tab: "折扣即将到期", comp: "ProbAB" },
          // { key: 27, tab: "折扣遗漏", comp: "ProbAA" },
          // { key: 26, tab: "美团配送范围对比昨日", comp: "ProbZ" },
          // { key: 53, tab: "美团非自配混合送范围", comp: "ProbBA" },
          // { key: 25, tab: "美团点金0曝光", comp: "ProbY" },
          // // { key: 24, tab: '成本表查漏', comp: 'ProbX' },
          // { key: 12, tab: "美团津贴联盟", comp: "ProbL" },
          // { key: 23, tab: "单折扣起送", comp: "ProbW" },
          // { key: 11, tab: "2份起购价格错误", comp: "ProbK" },
          // { key: 10, tab: "0元有餐盒费", comp: "ProbJ" },
          // { key: 2, tab: "无餐盒费", comp: "ProbB" },
          // { key: 1, tab: "原价扣点折扣优惠大于2", comp: "ProbA" },
          // { key: 32, tab: "库存过少检查", comp: "ProbAF" },
          // { key: 33, tab: "查询商品多规格", comp: "ProbAG" },
          // { key: 34, tab: "推广费余额查询", comp: "ProbAH" },

          // { key: 3, tab: '美团薯饼虾饼鸡柳设置两份起购', comp: 'ProbC' },
          // { key: 4, tab: '餐盒费为0常规餐品设置餐盒费1', comp: 'ProbD' },
          // { key: 5, tab: '0.01两份起购餐盒费调整为1.5', comp: 'ProbE' },
          // { key: 6, tab: '折扣餐品原价+餐盒费会起送', comp: 'ProbF' },
          // { key: 7, tab: '原价扣点城市产品原价与折扣价差距超过1.1', comp: 'ProbG' },
          // { key: 8, tab: '0元购有餐盒费', comp: 'ProbH' },
          // { key: 9, tab: '加料门店', comp: 'ProbI' },

          // { key: 13, tab: '饿了么所有门店配送费批量检查', comp: 'ProbM' },
          // { key: 14, tab: '原价扣点城市折扣与原价差距大1', comp: 'ProbN' },
          // { key: 15, tab: '饿了么无餐盒费+1', comp: 'ProbO' },
          // { key: 16, tab: '饿了么两份起购无餐盒费+0.5', comp: 'ProbP' },
          // { key: 17, tab: '饿了么0.01两份起购餐盒费调整为1.5', comp: 'ProbQ' },
          // { key: 18, tab: '饿了么贡茶粉面套餐价格错误', comp: 'ProbR' },
          // { key: 19, tab: '饿了么甜品粉面套餐价格错误', comp: 'ProbS' },
          // { key: 20, tab: '饿了么折扣餐品原价+餐盒费会起送', comp: 'ProbT' },
          // { key: 21, tab: '饿了么零元购有餐盒费', comp: 'ProbU' },
          // { key: 22, tab: '饿了么两份起购餐品价格错误', comp: 'ProbV' },
        ].map((v, i) => ({ ...v, tab: `${i + 1}.${v.tab}` })),
      };
    },
  };
</script>
