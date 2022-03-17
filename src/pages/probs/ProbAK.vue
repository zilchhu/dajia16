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
            title: "责任人",
            dataIndex: "责任人",
            width: 80,
          },
          {
            title: "店铺ID",
            dataIndex: "店铺ID",
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
            title: "分类",
            dataIndex: "分类",
            width: 140,
          },
          {
            title: "商品",
            dataIndex: "商品",
            width: 250,
          },
          {
            title: "原价",
            dataIndex: "原价",
            width: 80,
            _sort: true,
          },
          {
            title: "餐盒费",
            dataIndex: "餐盒费",
            width: 80,
            _sort: true,
          },
          {
            title: "起购",
            dataIndex: "起购",
            width: 80,
            _sort: true,
          },
          {
            title: "折扣价",
            dataIndex: "折扣价",
            width: 80,
            _sort: true,
          },
          {
            title: "折扣限购",
            dataIndex: "折扣限购",
            width: 80,
            _sort: true,
          },
          {
            title: "特殊备注",
            dataIndex: "handle",
            width: 150
          },
        ],
      };
    },
  };
</script>
