<template lang="pug">
.table-select(@keyup="onKeyUp")
  a-input-search(
    v-model:value="searchText",
    :placeholder="`搜索${columnTitle}`",
    :allowClear="true",
    @search="onSearch",
    @change="onChange"
  )

  .check-list
    .check-option
      a-checkbox(
        v-model:checked="allChecked",
        @change="onCheckAll",
        :indeterminate="indeterminate"
      ) 全选
      .filter-addon(@click="onClearFilter") 清除筛选
    .scroll(style="max-height: 400px; overflow-y: auto")
      a-checkbox-group(v-model:value="checkedList", style="width: 100%")
        .check-option(v-for="opt in checkOptions", :key="opt.value")
          a-checkbox(:value="opt.value", style="flex-grow: 1") {{ opt.label }}
          .filter-addon(@click="onFilterOnly(opt)") 筛选此项

    .btn-list 
      a-button(size="small", @click="onResetClick") reset
      a-button(type="primary", size="small", @click="confirmSelect") confirm
</template>

<script>
  import md5 from "md5";

  export default {
    name: "table-select",
    props: ["columnTitle", "filterOptions"],
    data() {
      return {
        checkOptions: [...this.filterOptions],
        checkedList: [],
        searchText: "",
        indeterminate: false,
        allChecked: false,
      };
    },
    methods: {
      onChange() {
        if (this.searchText == "") {
          this.checkOptions = this.filterOptions.slice();
          this.checkedList = [];
          return;
        }

        let reg;
        try {
          reg = new RegExp(this.searchText);
        } catch (e) {
          return;
        }

        this.checkOptions = this.filterOptions.filter((v) => reg.test(v.label));
        this.checkedList = this.checkOptions.map((v) => v.value);
      },
      onSearch() {
        this.confirmSelect();
      },
      onCheckAll(e) {
        this.checkedList = e.target.checked
          ? this.checkOptions.map((v) => v.value)
          : [];
        this.indeterminate = false;
      },
      confirmSelect() {
        this.$emit("confirm", this.checkedList);
      },
      onFilterOnly(opt) {
        this.checkedList = this.filterOptions
          .filter((v) => v.value == opt.value)
          .map((v) => v.value);
        setTimeout(() => {
          this.confirmSelect();
        }, 300);
      },
      onClearFilter() {
        this.checkedList = [];
        setTimeout(() => {
          this.confirmSelect();
        }, 300);
      },
      onKeyUp(e) {
        if (e.code == "Enter") this.confirmSelect();
      },
      onResetClick() {
        this.searchText = "";
        this.checkOptions = this.filterOptions.slice();
        this.checkedList = [];
        this.$emit("reset");
      },
    },
    watch: {
      checkedList(val) {
        console.log(val);
        this.indeterminate =
          !!val.length && val.length < this.checkOptions.length;
        this.allChecked = val.length == this.checkOptions.length;
        this.$emit("select-change", val);
      },
    },
  };
</script>


<style lang="sass" scoped>
.table-select
  width: fit-content
  padding: 2px

.check-list
  display: flex
  flex-direction: column

.check-option
  display: flex
  width: 100%
  align-items: center
  justify-content: space-between

.filter-addon
  visibility: hidden
  padding: 0 4px
  font-size: 0.88em
  cursor: pointer

.check-option:hover .filter-addon
  visibility: visible

.btn-list
  display: flex
  column-gap: 12px
  align-items: center
</style>
