<template lang="pug">
ProbBase(probType="az", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAZ",
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
            title: "门店ID",
            dataIndex: "门店ID",
            width: 80,
          },
          {
            title: "门店",
            dataIndex: "门店",
            width: 250,
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 80,
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 80,
          },
          {
            title: "品牌经理",
            dataIndex: "品牌经理",
            width: 80,
          },
          {
            title: "活动类型",
            dataIndex: "活动类型",
            width: 80,
          },
          {
            title: "商家出资",
            dataIndex: "商家出资",
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
