<template lang="pug">
ProbBase(probType="ao", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAO",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "店铺id",
            dataIndex: "shop_id",
            width: 90,
          },
          {
            title: "店名",
            dataIndex: "shop_name",
            width: 250,
          },
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 100,
          },
          {
            title: "责任人",
            dataIndex: "person",
            width: 80,
          },
          {
            title: "可报名活动",
            dataIndex: "可报名活动",
          },
          {
            title: "处理",
            dataIndex: "handle",
            width: 160
          },
        ],
      };
    },
  };
</script>
