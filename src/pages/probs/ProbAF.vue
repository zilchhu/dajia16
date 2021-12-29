<template lang="pug">
ProbBase(probType="af", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAF",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 110,
          },
          {
            title: "店名",
            dataIndex: "店名",
            width: 250,
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 70,
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 90,
          },
          {
            title: "责任人",
            dataIndex: "责任人",
            width: 80,
          },
          {
            title: "分类",
            dataIndex: "分类",
            width: 150,
          },
          {
            title: "商品",
            dataIndex: "商品",
            width: 300,
          },
          {
            title: "库存",
            dataIndex: "库存",
            width: 100,
            _sort: true,
          },
          {
            title: "最大库存",
            dataIndex: "最大库存",
            width: 100,
            _sort: true,
          },
          {
            title: "处理",
            dataIndex: "handle",
          },
        ],
      };
    },
  };
</script>
