<template lang="pug">
.table-select
  a-input-search(
    v-model:value="searchText",
    :allowClear="true",
    @search="onSearch",
    @change="onChange"
  )
  .p8
    a-checkbox(
      v-model:checked="allChecked",
      @change="onCheckAll",
      :indeterminate="indeterminate"
    ) 全选
    a-checkbox-group.scroll(:options="checkOptions", v-model:value="checkedList")
    a-button.mr10(size="small", @click="onClick") confirm
    a-button(size="small", @click="onResetClick") reset
  //- p {{checkedList}}
</template>

<script>
  import md5 from "md5";

  export default {
    name: "table-select",
    props: ["columnIndex", "tableData", "selectedList"],
    data() {
      return {
        searchText: "",
        checkedList: [...this.selectedList],
        checkOptions: [],
        indeterminate: false,
        allChecked: false,
      };
    },
    computed: {
      filterOptions() {
        let columnDatas = this.tableData.map((row) => row[this.columnIndex] ?? "");
        return [...new Set(columnDatas)].sort().map((col) => ({
          label: col,
          value: col,
        }));
      },
    },
    methods: {
      onChange() {
        if (this.searchText == "") {
          this.checkOptions = this.filterOptions;
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
        this.onClick();
      },
      onCheckAll(e) {
        this.checkedList = e.target.checked
          ? this.checkOptions.map((v) => v.value)
          : [];
        this.indeterminate = false;
      },
      onClick() {
        this.$emit("confirm", this.checkedList);
      },
      onResetClick() {
        this.searchText = "";
        this.checkOptions = this.filterOptions;
        this.checkedList = [];
        this.$emit("reset");
      },
    },
    created() {
      console.log(this.columnIndex)
    },
    watch: {
      columnIndex(n) {
        console.log(n)
      },
      filterOptions(n) {
        console.log("filter options changed");
        this.checkOptions = n.slice();
      },
      checkOptions(n) {
        console.log("check options changed");
        console.log(n)
      },
      checkedList(n) {
        this.indeterminate = !!n.length && n.length < this.checkOptions.length;
        this.allChecked = n.length == this.checkOptions.length;
        this.$emit("select-change", n);
      },
    },
  };
</script>

<style lang="sass">
.table-select .ant-checkbox-wrapper, .table-select .ant-checkbox-group
  display: block

.scroll
  max-height: 250px
  overflow-y: scroll
  margin-bottom: 6px

.mr10
  margin-right: 10px

.p8
  padding: 4px 0 6px 10px
</style>
