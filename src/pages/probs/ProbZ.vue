<template lang="pug">
ProbBase(probType="z", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbZ",
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
            width: 90,
          },
          {
            title: "店铺名称",
            dataIndex: "shop_name",
            width: 260
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
            title: "范围",
            dataIndex: "logisticsAreas",
            width: 200
          },
          {
            title: "前一天范围",
            dataIndex: "lastLogisticsAreas",
            width: 200
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
