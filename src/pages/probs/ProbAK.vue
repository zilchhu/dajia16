<template lang="pug">
ProbBase(probType="ak", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAK",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 90,
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
            width: 100,
          },
          {
            title: "责任人",
            dataIndex: "责任人",
            width: 80,
          },
          {
            title: "分类",
            dataIndex: "分类",
            width: 140,
          },
          {
            title: "商品",
            dataIndex: "商品",
          },
          {
            title: "折扣价",
            dataIndex: "折扣价",
            width: 100,
            _sort: true
          },
          {
            title: "起购数量",
            dataIndex: "起购数量",
            width: 100,
            _sort: true
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
