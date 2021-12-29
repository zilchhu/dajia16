<template lang="pug">
ProbBase(probType="y", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbY",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "门店id",
            dataIndex: "shop_id",
            width: 90,
          },
          {
            title: "门店",
            dataIndex: "shop_name",
            width: 250,
          },
          {
            title: "平台",
            dataIndex: "platform",
            width: 70,
          },
          {
            title: "物理店",
            dataIndex: "real_shop_name",
            width: 90,
          },
          {
            title: "负责",
            dataIndex: "person",
            width: 80,
          },
          {
            title: "点金0曝光时间",
            dataIndex: "点金0曝光时间",
            align: "right",
            width: 150,
            _sort: true,
            _filter: true,
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
