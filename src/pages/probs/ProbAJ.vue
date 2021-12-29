<template lang="pug">
ProbBase(probType="aj", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAJ",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "店铺id",
            dataIndex: "店铺id",
            width: 90,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 70,
          },
          {
            title: "责任人",
            dataIndex: "责任人",
            width: 80,
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 100,
          },
          {
            title: "问题",
            dataIndex: "问题",
          },
          {
            title: "到期时间",
            dataIndex: "到期时间",
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
