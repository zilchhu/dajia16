<template lang="pug">
.column-filter(@keyup="onKeyUp")
  a-input-group(compact style="display: flex; ")
    a-select(v-model:value="searchType")
      a-select-option(value="str") 字符
      //- a-select-option(value="reg") 正则
      //- a-select-option(value="func") 函数
    a-input-search(
      v-model:value="searchText",
      :placeholder="`搜索${column.title}`",
      :allowClear="true",
      @search="onSubmitSearch",
      @change="onSearchChange"
    )

  .check-list
    .check-option
      a-checkbox(
        v-model:checked="allChecked",
        @change="e => onCheckAll(e.target.checked)",
        :indeterminate="indeterminate"
      ) 全选
      .filter-addon(@click="onClearFilter") 清除筛选
    .scroll(:style="`height: ${containerHeight}px;`", @scroll="onScroll")
      .checkbox-group(
        :style="`width: 100%; padding-top: ${paddingTop}px; padding-bottom: ${paddingBottom}px;`"
      )
        .check-option(v-for="opt in realCheckOptions", :key="opt.group")
          a-checkbox(
            :checked="checks.includes(opt.group)", 
            @change="e => onCheck(e.target.checked, opt)"
          ) {{ opt.group }}
          .filter-addon(@click="onFilterOnly(opt)") 筛选此项

    .btn-list 
      a-button(size="small", @click="onResetClick") reset
      a-button(type="primary", size="small", @click="confirmSelect") confirm
</template>

<script>
import _ from 'lodash'

export default {
  name: "column-filter",
  props: ["column", 'table', 'filters', 'visible'],
  data() {
    return {
      filterOptions: this.buildFilterOpts(this.table, this.column),
      checkOptions: [],
      checks: [],
      searchType: 'str',
      searchText: "",
      debouceFilter: () => { },
      indeterminate: false,
      allChecked: false,
      scrollTop: 0,
      checkOptHeight: 22,
    }
  },
  computed: {
    currentTable() {
      return Object.entries(this.filters).reduce((rows, [key, values]) => {
        if (!values) return rows
        return rows.filter(row => values.includes(row[key]))
      }, this.table)
    },
    groupedFilterOptions() {
      return Object.entries(_.groupBy(this.filterOptions, 'label'))
        .map(([group, members]) => ({ group, count: members.length, members }))
    },
    checkedValues() {
      return Array.from(new Set(
        this.groupedFilterOptions
          .filter(v => this.checks.includes(v.group))
          .flatMap(v => v.members.map(k => k.value))
      ))
    },
    containerHeight() {
      return Math.min(300, this.filterOptions.length * this.checkOptHeight + 20)
    },
    checkBegin() {
      return Math.floor(this.scrollTop / this.checkOptHeight)
    },
    checkEnd() {
      return (
        this.checkBegin +
        Math.floor(this.containerHeight / this.checkOptHeight) +
        2
      )
    },
    realCheckOptions() {
      return this.checkOptions.slice(this.checkBegin, this.checkEnd)
    },
    paddingTop() {
      return this.scrollTop
    },
    paddingBottom() {
      return Math.max(
        0,
        this.checkOptions.length * this.checkOptHeight - this.paddingTop - 270
      )
    },
  },
  methods: {
    debounce(fn) {
      let timeout = null
      return function () {
        clearTimeout(timeout)
        timeout = setTimeout(() => fn.apply(this, arguments), 800)
      }
    },
    buildFilterOpts(table, column) {
      return table
        .map(row => row[column.dataIndex])
        .map(value => column._customFilterOption
          ? column._customFilterOption(value)
          : ({ value, label: typeof value == 'string' ? value : JSON.stringify(value) }))
    },
    confirmSelect() {
      this.$emit("confirm")
    },
    filter() {
      if (this.searchText == "") {
        this.checkOptions = this.filterOptions.slice()
        this.checkedList = []
      } else if (this.searchType == 'str') {
        this.checkOptions = this.filterOptions.filter((v) => (typeof v.value == 'string' ? v.value : JSON.stringify(v.value)).includes(this.searchText))
        this.checkedList = this.checkOptions.map((v) => v.value)
      } else if (this.searchType == "reg") {
        try {
          let reg = new RegExp(this.searchText)

          this.checkOptions = this.filterOptions.filter((v) => reg.test(typeof v.value == 'string' ? v.value : JSON.stringify(v.value)))
          this.checkedList = this.checkOptions.map((v) => v.value)
        } catch (e) {
          //
        }
      } else if (this.searchType == 'func') {
        try {
          const func = new Function('v', `return (${this.searchText})`)

          this.checkOptions = this.filterOptions.filter(v => func(v.value))
          this.checkedList = this.checkOptions.map((v) => v.value)
        } catch (e) {
          console.error(e)
        }
      }
    },
    onSearchChange() {
      if (this.searchText == "") {
        this.checkOptions = this.groupedFilterOptions.slice()
        this.checks = []
      } else if (this.searchType == 'str') {
        this.checkOptions = this.groupedFilterOptions.filter((v) => v.group.includes(this.searchText))
        this.checks = this.checkOptions.map(v => v.group)
      } else {
        // this.debouceFilter()
      }
    },
    onSubmitSearch() {
      this.confirmSelect()
    },
    onCheckAll(checked) {
      this.checkOptions = checked ? this.groupedFilterOptions.slice() : []
      this.checks = this.checkOptions.map(v => v.group)
      this.indeterminate = false
    },
    onCheck(checked, opt) {
      if (checked) this.checks = this.checks.concat([opt.group])
      else this.checks = this.checks.filter((v) => v != opt.group)
    },
    onScroll(e) {
      this.scrollTop = e.target.scrollTop
    },
    onFilterOnly(opt) {
      this.checks = this.groupedFilterOptions.filter((v) => v.group == opt.group).map(v => v.group)

      setTimeout(() => {
        this.confirmSelect()
      }, 300)
    },
    onClearFilter() {
      this.checks = []

      setTimeout(() => {
        this.confirmSelect()
      }, 300)
    },
    onKeyUp(e) {
      if (e.code == "Enter") this.confirmSelect()
    },
    onResetClick() {
      this.searchText = ""
      this.checkOptions = this.groupedFilterOptions.slice()
      this.checks = []
      this.$emit("reset")
    },
  },
  created() {
    this.debouceFilter = this.debounce(this.filter)
  },
  mounted() {
    this.checkOptions = this.groupedFilterOptions.slice()
  },
  watch: {
    checks(values) {
      this.indeterminate =
        !!values.length && values.length < this.checkOptions.length
      this.allChecked = values.length == this.checkOptions.length
    },
    checkedValues(values) {
      this.$emit("select-change", values)
    },
    visible(value) {
      console.log(4, value)
    }
  },
}
</script>


<style lang="sass" scoped>
.column-filter
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

.check-option:hover .filter-addon
  visibility: visible

.btn-list
  display: flex
  column-gap: 12px
  align-items: center
</style>
