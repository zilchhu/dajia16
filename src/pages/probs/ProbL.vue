<template lang="pug">
ProbBase(probType="l", :columns="columns")
</template>

<script>
  import ProbBase from "./ProbBaseS.vue";

  export default {
    name: "ProbL",
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
            title: "门店id",
            dataIndex: "shop_id",
            width: 90,
          },
          {
            title: "店名",
            dataIndex: "shop_name",
            width: 250,
          },
          {
            title: "平台",
            dataIndex: "platform",
            width: 70,
          },
          {
            title: "订单数",
            dataIndex: "订单数",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "实收",
            dataIndex: "实收",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "联盟津贴",
            dataIndex: "联盟津贴",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "减配送费",
            dataIndex: "减配送费",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "商家代金券",
            dataIndex: "商家代金券",
            align: "right",
            width: 120,
            _sort: true,
          },
          {
            title: "超值联盟",
            dataIndex: "超值联盟",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "新客立减",
            dataIndex: "新客立减",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "会员红包",
            dataIndex: "会员红包",
            align: "right",
            width: 100,
            _sort: true,
          },
          {
            title: "处理",
            dataIndex: "handle",
            width: 160
          },
        ],
      };
    },
  };
</script>
