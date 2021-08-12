<template lang="pug">
a-list(:dataSource="shops" :split="false")
  template(#header)
    p.header(v-html="header")
  template(#renderItem="{item, index}")
    shop-card(:shop="{...item, index}")
</template>

<script>
  import ShopCard from "../../components/shop/ShopCard";
  export default {
    name: "user-shops",
    components: {
      ShopCard,
    },
    props: {
      shops: Array,
      type: String,
      counts: Object,
    },
    computed: {
      header() {
        if (this.type == "responsibles" || this.type == "improving")
          return `优化了${this.counts.count_a}个问题，低收入${this.counts.count_a_low_income}，高推广${
            this.counts.count_a_high_consume
          }，高成本${this.counts.count_a_high_cost}，严重超跌${
            this.counts.count_a_slump
          }<br> 待优化${
            this.counts.count_q - this.counts.count_a
          }个问题，低收入${this.counts.count_q_low_income - this.counts.count_a_low_income}，高推广${
            this.counts.count_q_high_consume - this.counts.count_a_high_consume
          }，高成本${this.counts.count_q_high_cost - this.counts.count_a_high_cost}，严重超跌${
            this.counts.count_q_slump - this.counts.count_a_slump
          }`;
        if (this.type == "success") return `${this.counts.count_shop}家门店合格`;
        if (this.type == "unimproved")
          return `待优化${
            this.counts.count_q - this.counts.count_a
          }个问题，低收入${this.counts.count_q_low_income - this.counts.count_a_low_income}，高推广${
            this.counts.count_q_high_consume - this.counts.count_a_high_consume
          }，高成本${this.counts.count_q_high_cost - this.counts.count_a_high_cost}，严重超跌${
            this.counts.count_q_slump - this.counts.count_a_slump
          }`;
        if (this.type == "improved")
          return `待优化${
            this.counts.count_q - this.counts.count_a
          }个问题，低收入${this.counts.count_q_low_income - this.counts.count_a_low_income}，高推广${
            this.counts.count_q_high_consume - this.counts.count_a_high_consume
          }，高成本${this.counts.count_q_high_cost - this.counts.count_a_high_cost}，严重超跌${
            this.counts.count_q_slump - this.counts.count_a_slump
          }`;
        return "";
      },
    },
  };
</script>

<style lang="sass" scoped>
.header
  font-size: 13px
  padding: 0 12px

</style>