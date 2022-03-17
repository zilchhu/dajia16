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
            title: "责任人",
            dataIndex: "责任人",
            width: 80,
          },
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 90,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
            width: 250,
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 100,
          },
          {
            title: "可报名活动",
            dataIndex: "可报名活动",
          },
          {
            title: "处理",
            dataIndex: "handle",
            width: 260,
          },
        ],
      };
    },
  };
</script>
