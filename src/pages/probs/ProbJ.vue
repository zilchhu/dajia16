<template lang="pug">
ProbBase(probType="j", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbJ",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "门店id",
            dataIndex: "shop_id",
            width: 90,
          },
          {
            title: "店名",
            dataIndex: "shop_name",
            width: 250,
          },
          {
            title: "平台",
            dataIndex: "platform",
            width: 70,
          },
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 90,
          },
          {
            title: "责任人",
            dataIndex: "person",
            width: 80,
          },
          {
            title: "分类",
            dataIndex: "分类",
            width: 140,
          },
          {
            title: "品名",
            dataIndex: "品名",
            width: 300,
          },
          {
            title: "原价",
            dataIndex: "原价",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "餐盒费",
            dataIndex: "餐盒费",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "起购数",
            dataIndex: "起购数",
            align: "right",
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
