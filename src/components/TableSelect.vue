<template lang="pug">
.table-select(@keyup="onKeyUp")
  a-input-search(
    v-model:value="searchText",
    :placeholder="`搜索${columnTitle}`",
    :allowClear="false",
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
    .scroll(:style="`height: ${containerHeight}px;`", @scroll="onScroll")
      .checkbox-group(
        :style="`width: 100%; padding-top: ${paddingTop}px; padding-bottom: ${paddingBottom}px;`"
      )
        .check-option(v-for="opt in realCheckOptions", :key="opt.value")
          a-checkbox(
            :checked="checkedList.includes(opt.value)",
            @change="(e) => onCheck(e.target.checked, opt)"
          ) {{ opt.label }}
          .filter-addon(@click="onFilterOnly(opt)") 仅筛选此项

    .btn-list 
      a-button(size="small", @click="onResetClick") reset
      a-button(type="primary", size="small", @click="confirmSelect") confirm
</template>

<script>
  export default {
    name: "table-select",
    props: ["columnTitle", "columnIndex", "tableData"],
    data() {
      return {
        checkOptions: [
          ...new Set(this.tableData.map((v) => v[this.columnIndex] ?? "")),
        ]
          .map((v) => ({ label: v ?? "", value: v ?? "" }))
          .sort((a, b) => {
            if (typeof a.value == "string") return a.value.localeCompare(b.value);
            return a.value - b.value;
          })
          .reverse(),
        checkedList: [],
        searchText: "",
        indeterminate: false,
        allChecked: false,
        scrollTop: 0,
        checkOptHeight: 22,
      };
    },
    computed: {
      filterOptions() {
        return [...new Set(this.tableData.map((v) => v[this.columnIndex] ?? ""))]
          .map((v) => ({ label: v ?? "", value: v ?? "" }))
          .sort((a, b) => {
            if (typeof a.value == "string") return a.value.localeCompare(b.value);
            return a.value - b.value;
          })
          .reverse();
        // .map((v, i) => ({ ...v, label: i + " " + v.label }));
      },
      containerHeight() {
        return Math.min(300, this.filterOptions.length * this.checkOptHeight + 20);
      },
      checkBegin() {
        return Math.floor(this.scrollTop / this.checkOptHeight);
      },
      checkEnd() {
        return (
          this.checkBegin +
          Math.floor(this.containerHeight / this.checkOptHeight) +
          2
        );
      },
      realCheckOptions() {
        // console.log(this.checkBegin, this.checkEnd);
        return this.checkOptions.slice(this.checkBegin, this.checkEnd);
      },
      paddingTop() {
        return this.scrollTop;
      },
      paddingBottom() {
        return Math.max(
          0,
          this.checkOptions.length * this.checkOptHeight - this.paddingTop - 270
        );
      },
    },
    methods: {
      onChange() {
        if (this.searchText == "") {
          this.checkOptions = this.filterOptions.slice();
          this.checkedList = [];
          return;
        }

        // let reg;
        // try {
        //   reg = new RegExp(this.searchText);
        // } catch (e) {
        //   return;
        // }

        this.checkOptions = this.filterOptions.filter((v) => String(v.value).includes(this.searchText));
        this.checkedList = this.checkOptions.map((v) => v.value);
      },
      onSearch() {
        // if (this.searchText == "") {
        //   setTimeout(() => {
        //     this.confirmSelect();
        //   }, 300);
        //   return;
        // }
        this.confirmSelect();
      },
      onCheck(checked, opt) {
        // console.log(checked, opt.value);
        if (checked) this.checkedList = this.checkedList.concat([opt.value]);
        else this.checkedList = this.checkedList.filter((v) => v != opt.value);
      },
      onCheckAll(e) {
        this.checkedList = e.target.checked
          ? this.checkOptions.map((v) => v.value)
          : [];
        this.indeterminate = false;
      },
      onScroll(e) {
        // console.log(top);
        this.scrollTop = e.target.scrollTop;
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
  width: 350px
  max-width: 600px
  padding: 2px

.check-list
  display: flex
  flex-direction: column

.scroll
  overflow: auto

.check-option
  position: relative
  width: 100%
  height: 22px
  white-space: nowrap

.filter-addon
  position: absolute
  visibility: hidden
  top: 0
  right: 4px
  line-height: 22px
  padding: 0 4px
  font-size: 0.88em
  background-color: white
  cursor: pointer
  color: #3b82f6

.check-option:hover .filter-addon
  visibility: visible

.btn-list
  display: flex
  column-gap: 12px
  align-items: center
</style>
