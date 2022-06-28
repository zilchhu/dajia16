<template lang="pug">
a-tabs(
  tab-position="top",
  size="small",
  :tabBarGutter="14",
  :animated="{ inkBar: true, tabPane: false }"
)
  a-tab-pane(v-for="tab in tabs", :key="tab.key", :tab="tab.tab")
    keep-alive
      component(:is="tab.comp")
</template>

<script>
import ToolsAddSss from "./ToolsAddSss"
import ToolsAddZps from "./ToolsAddZps"

export default {
  name: "Prob7",
  components: {
    ToolsAddZps,
    ToolsAddSss
  },
  data() {
    return {
      tabs: [
        { key: 1, tab: '自配送录入', comp: 'ToolsAddZps' },
        { key: 2, tab: '闪时送录入', comp: 'ToolsAddSss' },
        // { key: 3, tab: '差评', comp: 'ProbAI2' },
      ].map((v, i) => ({ ...v, tab: `${i + 1}.${v.tab}` })),
    }
  },
}
</script>
