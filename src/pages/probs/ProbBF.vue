<template lang="pug">
ProbBase(probType="bf", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbBF",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 80,
          },
          {
            title: "品牌",
            dataIndex: "品牌",
            width: 80,
          },
          {
            title: "美团店铺id",
            dataIndex: "美团店铺id",
            width: 100,
          },
          {
            title: "美团店铺名称",
            dataIndex: "美团店铺名称",
            width: 200,
          },
          {
            title: "饿了么店铺id",
            dataIndex: "饿了么店铺id",
            width: 100,
          },
          {
            title: "饿了么店铺名称",
            dataIndex: "饿了么店铺名称",
            width: 200,
          },
          {
            title: "独有",
            dataIndex: "独有",
            width: 80,
          },
          {
            title: "商品名称",
            dataIndex: "商品名称",
            width: 200,
          },
          {
            title: "分类名称",
            dataIndex: "分类名称",
            width: 150,
          },
          {
            title: "商品真名",
            dataIndex: "商品真名",
            width: 150,
          },
          {
            title: "日期",
            dataIndex: "日期",
            width: 100,
          },
          {
            title: "处理",
            dataIndex: "handle",
            width: 150,
          },
        ],
      };
    },
  };
</script>
