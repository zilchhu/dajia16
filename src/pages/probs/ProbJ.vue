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
            title: "负责人",
            dataIndex: "person",
            width: 80,
          },
          {
            title: "门店id",
            dataIndex: "shop_id",
            width: 100,
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
            width: 100,
          },
          {
            title: "分类",
            dataIndex: "category_name",
            width: 140,
          },
          {
            title: "品名",
            dataIndex: "NAME",
            width: 300,
          },
          {
            title: "原价",
            dataIndex: "price",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "餐盒费",
            dataIndex: "package_fee",
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
