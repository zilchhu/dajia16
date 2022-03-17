<template lang="pug">
ProbBase(probType="ax", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbAX",
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
            title: "门店名称",
            dataIndex: "门店名称",
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
            width: 100,
          },
          {
            title: "配送方式",
            dataIndex: "配送方式",
            width: 100,
          },
          {
            title: "优惠到期日期",
            dataIndex: "优惠到期日期",
            width: 100,
            _sort: true,
            _filter: true,
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
