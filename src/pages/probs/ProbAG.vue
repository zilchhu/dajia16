<template lang="pug">
ProbBase(probType="ag", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseA.vue";

  export default {
    name: "ProbAG",
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
            title: "店铺id",
            dataIndex: "店铺id",
            width: 110,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
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
            title: "分类名",
            dataIndex: "分类名",
            width: 150,
          },
          {
            title: "商品名",
            dataIndex: "商品名",
            width: 300,
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
