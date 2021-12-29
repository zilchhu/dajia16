<template lang="pug">
ProbBase(probType="ap", :columns="columns" :xScroll="true")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAP",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "店铺ID",
            dataIndex: "店铺ID",
            width: 90,
          },
          {
            title: "店铺名",
            dataIndex: "店铺名",
            width: 250,
          },
          {
            title: "城市",
            dataIndex: "城市",
            width: 100,
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 70,
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 100,
          },
          {
            title: "负责人",
            dataIndex: "负责人",
            width: 80,
          },
          {
            title: "分类",
            dataIndex: "分类",
            width: 180,
          },
          {
            title: "商品",
            dataIndex: "商品",
            width: 250,
          },
          {
            title: "原价",
            dataIndex: "原价",
            width: 100,
            _sort: true
          },
          {
            title: "餐盒费",
            dataIndex: "餐盒费",
            width: 100,
            _sort: true
          },
          {
            title: "起购量",
            dataIndex: "起购量",
            width: 100,
            _sort: true
          },
          {
            title: "折扣价",
            dataIndex: "折扣价",
            width: 100,
            _sort: true
          },
          {
            title: "折扣限购",
            dataIndex: "折扣限购",
            width: 100,
            _sort: true
          },
          {
            title: "上下架",
            dataIndex: "上下架",
            width: 250,
          },
          {
            title: "10以上的最小满减门槛",
            dataIndex: "10以上的最小满减门槛",
            width: 100,
            _sort: true
          },
          {
            title: "满减力度",
            dataIndex: "满减力度",
            width: 100,
            _sort: true
          },
          {
            title: "起购折扣价格",
            dataIndex: "起购折扣价格",
            width: 100,
            _sort: true
          },
          {
            title: "起购满减价格",
            dataIndex: "起购满减价格",
            width: 100,
            _sort: true
          },
          {
            title: "处理",
            dataIndex: "handle",
            width: 160
          },
        ],
      };
    },
  };
</script>
