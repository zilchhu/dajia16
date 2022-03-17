<template lang="pug">
ProbBase(probType="aw", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAW",
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
            title: "店铺ID",
            dataIndex: "店铺ID",
            width: 80,
          },
          {
            title: "店铺名称",
            dataIndex: "店铺名称",
            width: 250,
          },
          {
            title: "物理店",
            dataIndex: "物理店",
            width: 80,
          },
          {
            title: "城市",
            dataIndex: "城市",
            width: 80,
          },
          {
            title: "品牌经理",
            dataIndex: "品牌经理",
            width: 80,
          },
          {
            title: "力度",
            dataIndex: "力度",
            width: 80,
            _sort: true,
          },
          {
            title: "平台出资",
            dataIndex: "平台出资",
            width: 80,
            _sort: true,
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
