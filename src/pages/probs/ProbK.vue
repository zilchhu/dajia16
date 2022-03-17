<template lang="pug">
ProbBase(probType="k", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbK",
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
            title: "分类",
            dataIndex: "category_name",
            width: 140,
          },
          {
            title: "品名",
            dataIndex: "name",
          },
          {
            title: "商品原价",
            dataIndex: "商品原价",
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
            title: "起购量",
            dataIndex: "起购量",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "凑满减/起送价格",
            dataIndex: "凑满减/起送价格",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "处理",
            dataIndex: "handle",
            width: 160,
          },
        ],
      };
    },
  };
</script>
