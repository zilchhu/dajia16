<template lang="pug">
.column-filter-text-opts
  a-input-group(style="display: flex; padding: 4px 0")
    a-select(v-model:value="searchType" size="small")
      a-select-option(value="string") 文本
      a-select-option(value="regexp") 正则
      //- a-select-option(value="function") 函数
    a-input-search(
      v-model:value="searchText",
      :placeholder="`搜索${column.title}`",
      :allowClear="true",
      size="small"
      @change="onTextSearchChange"
    )
  a-checkbox(:checked="textAllChecked" :indeterminate="textIndeterminate" @change="onTextFilterCheckAll") 
    span 全选
    span.filter-opt-count （{{ searchedTextFilterOptionsValuesLen }}）
  .filter-opt-list(:style="`height: ${textFilterOptionListHeight}px`" @scroll="onTextFilterOptListScroll")
    div(:style="`width: 100%; padding-top: ${textFilterOptionContentPT}px; padding-bottom: ${textFilterOptionContentPB}px;`")
      .text-filter-opt(v-for="opt in showedSearchedTextFilterOptions" :key="opt.text") 
        a-checkbox(
          :checked="textFilters.includes(opt.text)",
          @change="(e) => onTextFilterCheck(e.target.checked, opt)"
        ) 
          span {{ opt.text }} 
          span.filter-opt-count （{{ opt.count }}）
        .filter-addon(@click="onFilterOnly(opt)") 仅筛选此项
</template>

<script>
function groupBy(arr, key) {
  const groups = Array.from(new Set(arr.map(v => v[key])))
  return groups.map(group => ({ group, members: arr.filter(v => v[key] == group) }))
}

export default {
  name: "column-filter-text-opts",
  props: ['column', 'table', 'currentTable', 'filterOptions', 'filterPane', 'defaultTextFilters', 'selectedKeys', 'setSelectedKeys', 'resetToken', 'delayConfirm'],
  data() {
    return {
      searchType: 'string',
      searchText: '',
      textFilters: this.defaultTextFilters,
      textFilterOptListScrollTop: 0,
    }
  },
  computed: {
    columnKey() {
      return this.column.key
    },
    filterPaneKey() {
      return this.filterPane.key
    },
    textFilterOptions() {
      const sorter = this.filterPane.sortMethod == 'str'
        ? (a, b) => a?.text?.localeCompare(b?.text, 'zh-Hans-CN')
        : (a, b) => this.toNum(a?.text) - this.toNum(b?.text)

      let groups = groupBy(this.filterOptions, this.filterPaneKey)
        .map(({ group, members }) => ({ text: group, values: members.map(m => m.value), count: members.length }))

      if (this.filterPane.sortMethod) groups = groups.sort(sorter)
      if (this.filterPane.sortDirection == 'desc') groups = groups.reverse()

      return groups
    },
    searchedTextFilterOptions() {
      if (this.searchText == '') return this.textFilterOptions

      switch (this.searchType) {
        case 'string':
          return this.textFilterOptions.filter(opt => opt.text.includes(this.searchText))
        case 'regexp':
          try {
            let reg = new RegExp(this.searchText)
            return this.textFilterOptions.filter(opt => opt.text.match(reg))
          } catch (err) {
            return this.textFilterOptions
          }
        case 'function':
          try {
            let func = new Function('v', `return ${this.searchText}`)
            return this.textFilterOptions.filter(opt => opt.values.some(v => {
              console.log(v)
              func(v)
            }))
          } catch (err) {
            console.error(err)
            return this.textFilterOptions
          }
        default:
          return this.textFilterOptions
      }
    },
    searchedTextFilterOptionsValuesLen() {
      return this.searchedTextFilterOptions
        .map(opt => opt.count)
        .reduce((p, c) => p + c, 0)
    },
    textFilterOptionListHeight() {
      return Math.min(300, this.searchedTextFilterOptions.length * 22 + 20)
    },
    textFilterOptionContentPT() {
      return this.textFilterOptListScrollTop
    },
    textFilterOptionContentPB() {
      return Math.max(
        0,
        this.searchedTextFilterOptions.length * 22 - this.textFilterOptionContentPT - 270
      )
    },
    showedSearchedTextFilterOptions() {
      return this.searchedTextFilterOptions.slice(
        Math.floor(this.textFilterOptListScrollTop / 22),
        Math.floor(this.textFilterOptListScrollTop / 22) +
        Math.floor(this.textFilterOptionListHeight / 22) +
        2
      )
    },
    textIndeterminate() {
      return !!this.textFilters.length && this.textFilters.length < this.searchedTextFilterOptions.length
    },
    textAllChecked() {
      return this.textFilters.length >= this.searchedTextFilterOptions.length
    },
  },
  methods: {
    toNum(str) {
      try {
        let f = parseFloat(str)
        if (isNaN(f)) return 0
        return f
      } catch (err) {
        return 0
      }
    },
    toString(val) {
      if (val == null) return ''
      if (typeof val == 'string') return val
      return JSON.stringify(val)
    },
    onTextSearchChange(e) {
      console.log('text-change', e.target.value)
      this.textFilters = this.searchedTextFilterOptions.map(opt => opt.text)
      this.setTextSelectedKeys()
    },
    onTextFilterCheck(checked, opt) {
      if (checked) this.textFilters = this.textFilters.concat([opt.text])
      else this.textFilters = this.textFilters.filter((v) => v != opt.text)
      this.setTextSelectedKeys()
    },
    onTextFilterCheckAll(e) {
      if (e.target.checked) this.textFilters = this.textFilterOptions.map(opt => opt.text)
      else this.textFilters = []
      this.setTextSelectedKeys()
    },
    onTextFilterOptListScroll(e) {
      this.textFilterOptListScrollTop = e.target.scrollTop
    },
    onFilterOnly(opt) {
      this.textFilters = [opt.text]
      this.setTextSelectedKeys()
      this.delayConfirm()
    },
    setTextSelectedKeys() {
      this.setSelectedKeys(Array.from(new Set(
        this.filterOptions
          .filter(opt => this.textFilters.includes(opt[this.filterPaneKey]))
          .map(opt => opt.value)
      )))
    },
  },
  watch: {
    searchType() {
      // this.searchText = ''
      this.textFilters = this.searchedTextFilterOptions.map(opt => opt.text)
      this.setTextSelectedKeys()
    },
    resetToken() {
      this.textFilters = [] // this.searchedTextFilterOptions.map(opt => opt.text)
    }
  }
}
</script>

<style lang="sass" scoped>

.filter-opt-list
  overflow: auto

.text-filter-opt
  position: relative
  width: 100%
  height: 22px
  white-space: nowrap

.filter-opt-count
  color: #999
  font-size: 12px

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

.text-filter-opt:hover .filter-addon
  visibility: visible
</style>

<style lang="sass">
.column-filter-text-opts .ant-tabs-nav
  margin: 0 0 3px 0

.column-filter-text-opts .ant-tabs-tab
  padding: 4px 0
</style>