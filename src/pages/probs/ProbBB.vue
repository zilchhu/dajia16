<template lang="pug">
ProbBase(probType="bb", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbBB",
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
            title: "门店ID",
            dataIndex: "shop_id",
            width: 80,
          },
          {
            title: "门店",
            dataIndex: "shop_name",
            width: 250,
          },
          {
            title: "平台",
            dataIndex: "platform",
            width: 80,
          },
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 80,
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
            title: "销量",
            dataIndex: "sell_cnt",
            width: 80,
            _sort: true
          },
          {
            title: "7日销量",
            dataIndex: "7_days_sell_cnt",
            width: 80,
            _sort: true
          },
          {
            title: "日期",
            dataIndex: "date",
            width: 200,
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
