<template lang="pug">
ProbBase(probType="ba", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbBA",
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
            title: "配送范围",
            dataIndex: "配送范围",
            width: 100,
          },
          {
            title: "昨日配送范围",
            dataIndex: "昨日配送范围",
            width: 100,
          },
          {
            title: "变化",
            dataIndex: "变化",
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
