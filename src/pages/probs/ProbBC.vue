<template lang="pug">
ProbBase(probType="bc", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbBC",
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
            title: "店铺编号",
            dataIndex: "店铺编号",
            width: 80,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
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
            title: "可用推广费",
            dataIndex: "可用推广费",
            width: 100,
            _sort: true
          },
          {
            title: "低推广",
            dataIndex: "低推广",
            width: 100,
          },
          {
            title: "日期",
            dataIndex: "日期",
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
