<template lang="pug">
ProbBase(probType="ay", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAY",
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
            title: "店铺ID",
            dataIndex: "shop_id",
            width: 80,
          },
          {
            title: "门店名称",
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
            title: "处理",
            dataIndex: "handle",
            width: 150,
          },
        ],
      };
    },
  };
</script>
