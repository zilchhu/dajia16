<template lang="pug">
ProbBase(probType="ac", :columns="columns" :xScroll="true")
</template>

<script>
  import ProbBase from "./ProbBaseA.vue";

  export default {
    name: "ProbAC",
    components: {
      ProbBase,
    },
    data() {
      return {
        columns: [
          {
            title: "门店编号",
            dataIndex: "门店编号",
            width: 90,
          },
          {
            title: "店名",
            dataIndex: "店铺",
            width: 200,
          },
          {
            title: "平台",
            dataIndex: "平台",
            width: 70,
          },
          {
            title: "责任人",
            dataIndex: "组员",
            width: 80,
          },
          {
            title: "生效时段",
            dataIndex: "生效时段",
          },
          {
            title: "到期时间",
            dataIndex: "到期时间",
            width: 100,
          },
          {
            title: "起送价",
            dataIndex: "起送价",
            align: "right",
            width: 90,
            _sort: true
          },
          {
            title: "基础配送",
            dataIndex: "基础配送",
            align: "right",
            width: 90,
            _sort: true
          },
          {
            title: "实际减配",
            dataIndex: "实际减配",
            align: "right",
            width: 90,
            _sort: true
          },
          {
            title: "商家出资",
            dataIndex: "商家出资",
            align: "right",
            width: 90,
            _sort: true
          },
          {
            title: "平台出资",
            dataIndex: "平台出资",
            align: "right",
            width: 90,
            _sort: true
          },
          {
            title: "适配标品",
            dataIndex: "适配标品",
          },
          {
            title: "配送方式",
            dataIndex: "配送方式",
          },
          {
            title: "问题",
            dataIndex: "问题",
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
