<template lang="pug">
ProbBase(probType="bg", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbBG",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "负责人",
            dataIndex: "负责人",
            width: 80,
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 80,
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 80,
          },
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 80,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
            width: 250,
          },
          {
            title: "分类名称",
            dataIndex: "分类名称",
            width: 150,
          },
          {
            title: "商品名称",
            dataIndex: "商品名称",
            width: 250,
          },
          {
            title: "价格",
            dataIndex: "价格",
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
            title: "餐盒费",
            dataIndex: "餐盒费",
            width: 80,
            _sort: true,
          },
          {
            title: "最小起购",
            dataIndex: "最小起购",
            width: 80,
            _sort: true,
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
