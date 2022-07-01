<template lang="pug">
.column-filter(@keyup="onKeyUp") 
  //- div {{ JSON.stringify(tableFilters) }}
  //- div {{ selectedKeys.length }}
  //- div {{ columnKey }}
  //- div {{ currentTable.length }} 

  a-tabs
    a-tab-pane(v-for="pane in filterPanes" :key="pane.key" :tab="pane.label")
      div(v-if="pane.key == 'color'")
        a-checkbox(:checked="colorAllChecked" :indeterminate="colorIndeterminate" @change="onColorFilterCheckAll") 全选
        .filter-opt-list
          .color-filter-opt(v-for="opt in colorFilterOptions" :key="opt.color") 
            a-checkbox(
              :checked="colorFilters.includes(opt.color)",
              @change="(e) => onColorFilterCheck(e.target.checked, opt)"
            ) 
              span.color-filter-opt-color(:style="`background: ${opt.color}`") {{ opt.color }}
              span.filter-opt-count （{{ opt.count }}）
      div(v-else)
        ColumnFilterTextOpts(
          :column="column"
          :table="table"
          :currentTable="currentTable"
          :filterOptions="filterOptions"
          :filterPane="pane"
          :defaultTextFilters="[]"
          :selectedKeys="selectedKeys"
          :setSelectedKeys="setSelectedKeys"
          :resetToken="resetToken"
        )
  
  .btn-group
    a-button(@click="delayConfirm" type="primary" size="small") 确定
    a-button(@click="reset" size="small") 重置
</template>

<script>
import ColumnFilterTextOpts from './ColumnFilterTextOpts'

function groupBy(arr, key) {
  const groups = Array.from(new Set(arr.map(v => v[key])))
  return groups.map(group => ({ group, members: arr.filter(v => v[key] == group) }))
}

export default {
  name: "column-filter",
  components: {
    ColumnFilterTextOpts
  },
  props: ['column', 'table', 'tableFilters', 'filterPanes', 'customFilterOption', 'selectedKeys', 'setSelectedKeys', 'confirm', 'clearFilters'],
  data() {
    return {
      colorFilters: Array.from(new Set(
        this.table.map(row => this.customFilterOption(row, this.column)).map(opt => opt.color)
      )),
      resetToken: 1
    }
  },
  computed: {
    columnKey() {
      return this.column.key
    },
    tableFilterKeys() {
      return Object.entries(this.tableFilters)
        .filter(([_, values]) => values != null && values.length > 0)
        .map(([key]) => key)
    },
    currentTable() {
      let _table = [...this.table]
      for (let filterKey of Object.keys(this.tableFilters)) {
        let filterValues = this.tableFilters[filterKey]
        if (filterValues == null) continue
        _table = _table.filter(row => filterValues.includes(row[filterKey]))
      }
      return _table
    },
    filterOptions() {
      if (this.tableFilterKeys.length == 1 && this.tableFilterKeys[0] == this.columnKey) {
        return this.table.map(row => this.customFilterOption(row, this.column))
      }
      return this.currentTable.map(row => this.customFilterOption(row, this.column))
    },
    colorFilterOptions() {
      return groupBy(this.filterOptions, 'color')
        .map(({ group, members }) => ({ color: group, values: members.map(m => m.value), count: members.length }))
    },
    colorIndeterminate() {
      return !!this.colorFilters.length && this.colorFilters.length < this.colorFilterOptions.length
    },
    colorAllChecked() {
      return this.colorFilters.length == this.colorFilterOptions.length
    }
  },
  methods: {
    onColorFilterCheck(checked, opt) {
      if (checked) this.colorFilters = this.colorFilters.concat([opt.color])
      else this.colorFilters = this.colorFilters.filter((v) => v != opt.color)
      this.setColorSelectedKeys()
    },
    onColorFilterCheckAll(e) {
      if (e.target.checked) this.colorFilters = this.colorFilterOptions.map(opt => opt.color)
      else this.colorFilters = []
      this.setColorSelectedKeys()
    },
    setColorSelectedKeys() {
      this.setSelectedKeys(Array.from(new Set(
        this.filterOptions
          .filter(opt => this.colorFilters.includes(opt.color))
          .map(opt => opt.value)
      )))
    },
    onKeyUp(e) {
      if (e.code == "Enter") this.delayConfirm()
    },
    delayConfirm() {
      setTimeout(() => this.confirm(), 300)
    },
    reset() {
      this.resetToken += 1
      this.clearFilters()
    },
  }
}
</script>

<style lang="sass" scoped>
.column-filter
  max-width: 300px
  padding: 0 8px 4px

.filter-opt-list
  width: 300px
  height: 300px
  max-height: 300px
  overflow: auto

.text-filter-opt
  position: relative
  width: 100%
  height: 22px
  white-space: nowrap

.color-filter-opt-color
  display: inline-block
  width: 48px
  color: transparent

.filter-opt-count
  color: #999
  font-size: 12px

.color-filter-opt
  height: 22px

.btn-group
  display: flex
  align-items: center
  column-gap: 8px
</style>

<style lang="sass">
.column-filter .ant-tabs-nav
  margin: 0 0 3px 0

.column-filter .ant-tabs-tab
  padding: 4px 0
</style>