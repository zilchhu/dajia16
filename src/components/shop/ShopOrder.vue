<template lang="pug">
a-table.ant-table-change(
  :columns="cols",
  :data-source="data",
  rowKey="订单编号",
  :loading="loading",
  :expandRowByClick="true",
  :pagination="false",
  :expandIconAsCell="false",
  :expandIconColumnIndex="-1",
  size="small",
  style="width: 1180px",
  :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
)
  //- template(#expandedRowRender="{record}")
  //-   shop-data(:shop_data="omit(record, history_hiddens)" style="width: 936px;")
  template(#订单编号="{ text }")
    div(style="font-size: 10px") {{ text }}
    //- a(v-else
    //-   :href="`https://melody.shop.ele.me/app/shop/${goods_meta.shopId}/order__searchings#app.shop.order.searchings?searchInfo={"searchType":"orderId","keyWord":"${text}","searchValue":null}`"
    //-   style="font-size: 10px; color: rgba(0, 0, 0, 0.65);") {{text}}
  template(#订单信息="{ text }")
    div(style="white-space: pre-wrap; font-size: 0.93em") {{ text }}
</template>

<script>
  import Shop from "../../api/shop";
  import { message } from "ant-design-vue";
  // import dayjs from "dayjs";

  let cols = [
    {
      title: "订单编号",
      dataIndex: "订单编号",
      slots: { customRender: "订单编号" },
      width: 110,
      align: 'right',
    },
    {
      title: "订单信息",
      dataIndex: "订单信息",
      slots: { customRender: "订单信息" },
      align: "right",
    },
    {
      title: "理论成本",
      dataIndex: "理论成本",
      width: 70,
      align: "right",
    },
    {
      title: "商家收入",
      dataIndex: "商家收入",
      width: 70,
      align: "right",
    },
    {
      title: "成本比例",
      dataIndex: "成本比例",
      width: 70,
      align: "right",
    },
    {
      title: "订单配送",
      dataIndex: "订单配送",
      width: 70,
      align: "right",
    },
    {
      title: "减配支出",
      dataIndex: "减配支出",
      width: 70,
      align: "right",
    },
    {
      title: "新客立减",
      dataIndex: "新客立减",
      width: 70,
      align: "right",
    },
    {
      title: "红包支出",
      dataIndex: "红包支出",
      width: 70,
      align: "right",
    },
    {
      title: "代金券支出",
      dataIndex: "代金券支出",
      width: 90,
      align: "right",
    },
    {
      title: "订单距离/m",
      dataIndex: "订单距离/m",
      width: 90,
      align: "right",
    },
  ];

  export default {
    name: "shop-order",
    props: ["goods_meta"],
    data() {
      return {
        cols,
        data: [],
        loading: false,
      };
    },
    methods: {
      fetchOrder() {
        this.loading = true;
        let { shopId, activi, counts, date } = this.goods_meta;
        new Shop(shopId)
          .order(activi, counts, date)
          .then((res) => {
            this.data = res;
            this.loading = false;
          })
          .catch((err) => {
            message.error(err);
            this.loading = false;
          });
      },
    },
    mounted() {
      this.fetchOrder();
    },
    watch: {
      goods_meta() {
        this.fetchOrder();
      },
    },
  };
</script>
