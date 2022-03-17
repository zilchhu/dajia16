<template lang="pug">
ProbBase(probType="aa", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAA",
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
            title: "门店",
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
            title: "商品",
            dataIndex: "food_name",
            width: 240,
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
            dataIndex: "box_price",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "起购",
            dataIndex: "min_order_count",
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
