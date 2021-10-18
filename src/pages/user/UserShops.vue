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
          return `优化了<b>${this.counts.count_a}</b>个问题，低收入<b class="success-color">${
            this.counts.count_a_low_income
          }</b>，高推广<b class="success-color">${this.counts.count_a_high_consume}</b>，高成本<b class="success-color">${
            this.counts.count_a_high_cost
          }</b>，严重超跌<b class="success-color">${this.counts.count_a_slump}</b>，自定义<b class="success-color">${
            this.counts.count_a_custom
          }</b><br> 待优化<b>${this.counts.count_q - this.counts.count_a}</b>个问题，低收入<b class="error-color">${
            this.counts.count_q_low_income - this.counts.count_a_low_income
          }</b>，高推广<b class="error-color">${
            this.counts.count_q_high_consume - this.counts.count_a_high_consume
          }</b>，高成本<b class="error-color">${
            this.counts.count_q_high_cost - this.counts.count_a_high_cost
          }</b>，严重超跌<b class="error-color">${this.counts.count_q_slump - this.counts.count_a_slump}</b>`;

        if (this.type == "success") return `${this.counts.count_shop}家门店合格`;

        if (this.type == "unimproved")
          return `待优化<b>${
            this.counts.count_q - this.counts.count_a
          }</b>个问题，低收入<b class="error-color">${
            this.counts.count_q_low_income - this.counts.count_a_low_income
          }</b>，高推广<b class="error-color">${
            this.counts.count_q_high_consume - this.counts.count_a_high_consume
          }</b>，高成本<b class="error-color">${
            this.counts.count_q_high_cost - this.counts.count_a_high_cost
          }</b>，严重超跌<b class="error-color">${this.counts.count_q_slump - this.counts.count_a_slump}</b>`;

        if (this.type == "improved")
          return `优化了<b>${this.counts.count_a}</b>个问题，低收入<b class="success-color">${
            this.counts.count_a_low_income
          }</b>，高推广<b class="success-color">${this.counts.count_a_high_consume}</b>，高成本<b class="success-color">${
            this.counts.count_a_high_cost
          }</b>，严重超跌<b class="success-color">${this.counts.count_a_slump}</b>，自定义<b class="success-color">${
            this.counts.count_a_custom
          }</b>`;

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