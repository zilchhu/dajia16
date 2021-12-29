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
            title: "店铺ID",
            dataIndex: "店铺ID",
            width: 90,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
            width: 260
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 70,
          },
          {
            title: "负责人",
            dataIndex: "负责人",
            width: 70,
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 70,
          },
          {
            title: "变化范围/平方千米",
            dataIndex: "变化范围/平方千米",
            align: "right",
            _sort: true,
          },
        ],
      };
    },
  };
</script>
