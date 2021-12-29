<template lang="pug">
ProbBase(probType="ab", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAB",
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
            title: "负责",
            dataIndex: "person",
            width: 80,
          },
          {
            title: "品名",
            dataIndex: "food_name",
            width: 300,
          },
          {
            title: "活动价",
            dataIndex: "activi_price",
            width: 100,
            align: "right",
            _sort: true,
          },
          {
            title: "活动状态",
            dataIndex: "activi_status",
            width: 200,
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
