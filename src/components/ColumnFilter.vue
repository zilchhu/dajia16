<template lang="pug">
.column-filter(@keyup="onKeyUp") 
  //- div {{ JSON.stringify(selectedKeys) }}
  //- div {{ JSON.stringify(tableFilterKeys) }}
  //- div {{ JSON.stringify(column) }}
  //- div {{ currentTable.length }} 
  div(v-if="filterPanes.length == 1")
    div(v-if="filterPanes[0].key == 'color'")
      ColumnFilterColorOpts(
        :column="column"
        :table="table"
        :currentTable="currentTable"
        :filterOptions="filterOptions"
        :filterPane="filterPanes[0]"
        :defaultTextFilters="[]"
        :selectedKeys="selectedKeys"
        :setSelectedKeys="setSelectedKeys"
        :resetToken="resetToken"
        :delayConfirm="delayConfirm"
      )
    div(v-else)
      ColumnFilterTextOpts(
        :column="column"
        :table="table"
        :currentTable="currentTable"
        :filterOptions="filterOptions"
        :filterPane="filterPanes[0]"
        :defaultTextFilters="[]"
        :selectedKeys="selectedKeys"
        :setSelectedKeys="setSelectedKeys"
        :resetToken="resetToken"
        :delayConfirm="delayConfirm"
      )

  a-tabs(v-else)
    a-tab-pane(v-for="pane in filterPanes" :key="pane.key" :tab="pane.label")
      div(v-if="pane.key == 'color'")
        ColumnFilterColorOpts(
          :column="column"
          :table="table"
          :currentTable="currentTable"
          :filterOptions="filterOptions"
          :filterPane="pane"
          :defaultTextFilters="[]"
          :selectedKeys="selectedKeys"
          :setSelectedKeys="setSelectedKeys"
          :resetToken="resetToken"
          :delayConfirm="delayConfirm"
        )
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
          :delayConfirm="delayConfirm"
        )

  .btn-group
    a-button(@click="reset" size="small") 重置
    a-button(@click="delayConfirm" type="primary" size="small") 确定

</template>

<script>
import ColumnFilterTextOpts from './ColumnFilterTextOpts'
import ColumnFilterColorOpts from './ColumnFilterColorOpts'

export default {
  name: "column-filter",
  components: {
    ColumnFilterTextOpts,
    ColumnFilterColorOpts
  },
  props: ['column', 'table', 'tableFilters', 'filterPanes', 'customFilterOption', 'selectedKeys', 'setSelectedKeys', 'confirm', 'clearFilters'],
  data() {
    return {
      // defaultColorFilters: Array.from(new Set(
      //   this.table.map(row => this.customFilterOption(row, this.column)).map(opt => opt.color)
      // )),
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
      if (this.tableFilterKeys.length > 0 && this.tableFilterKeys.at(-1) == this.columnKey) {
        return this.table.map(row => this.customFilterOption(row, this.column))
      }
      return this.currentTable.map(row => this.customFilterOption(row, this.column))
    },
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
  width: 350px
  padding: 0 8px 0

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
  justify-content: flex-end
  column-gap: 8px
  padding: 4px
</style>

<style lang="sass">
.column-filter .ant-tabs-nav
  margin: 0 0 3px 0

.column-filter .ant-tabs-tab
  padding: 4px 0
</style>