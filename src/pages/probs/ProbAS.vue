<template lang="pug">
ProbBaseS(probType="as", :columns="columns")
</template>

<script>
  import ProbBaseS from "./ProbBaseS.vue";

  export default {
    name: "ProbAS",
    components: {
      ProbBaseS,
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
            title: "物理店",
            dataIndex: "物理店",
            width: 100,
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 80,
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
            width: 300,
          },
          {
            title: "原价",
            dataIndex: "原价",
            _sort: true,
          },
          {
            title: "折扣价",
            dataIndex: "折扣价",
            _sort: true,
          },
          {
            title: "起购数量",
            dataIndex: "起购数量",
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