<template lang="pug">
.tools-white-list
  a-tabs(v-model:activeKey="activeTab")
    a-tab-pane(key="1" tab="美团铂金推广")
      .toolbar
        a-select(v-model:value="addMtSmartInput" showSearch :filterOption="filterShop" placeholder="添加门店" size="small" style="width: 320px;")
          a-select-option(v-for="shop in mtShops" :key="shop.id" :value="`${shop.id}|${shop.poiName}`") {{shop.id}} {{shop.poiName}}
        a-button(:loading="addMtSmartLoading" @click="onAddMtSmart" size="small") 添加

      a-list.list(item-layout="horizontal" :data-source="mtSmartAds" :grid="{column: 4}" size="small")
        template(#renderItem="{item}")
          a-list-item
            template(#actions)
              span(@click="e => onDelMtSmart(item)") 删除
            a-list-item-meta(:title="`${item.shopId} ${item.shopName}`")

    a-tab-pane(key="2" tab="美团点金推广")
      .toolbar
        a-select(v-model:value="addMtCpcInput" showSearch :filterOption="filterShop" placeholder="添加门店" size="small" style="width: 320px;")
          a-select-option(v-for="shop in mtShops" :key="shop.id" :value="`${shop.id}|${shop.poiName}`") {{shop.id}} {{shop.poiName}}
        a-button(:loading="addMtCpcLoading" @click="onAddMtCpc" size="small") 添加

      a-list.list(item-layout="horizontal" :data-source="mtCpcAds" :grid="{column: 4}" size="small")
        template(#renderItem="{item}")
          a-list-item
            template(#actions)
              span(@click="e => onDelMtCpc(item)") 删除
            a-list-item-meta(:title="`${item.shopId} ${item.shopName}`")

    a-tab-pane(key="3" tab="饿了么推广")
      .toolbar
        a-select(v-model:value="addElmSmartInput" showSearch :filterOption="filterShop" placeholder="添加门店" size="small" style="width: 320px;")
          a-select-option(v-for="shop in elmShops" :key="shop.id" :value="`${shop.id}|${shop.name}`") {{shop.id}} {{shop.name}}
        a-button(:loading="addElmSmartLoading" @click="onAddElmSmart" size="small") 添加

      a-list.list(item-layout="horizontal" :data-source="elmSmartAds" :grid="{column: 4}" size="small")
        template(#renderItem="{item}")
          a-list-item
            template(#actions)
              span(@click="e => onDelElmSmart(item)") 删除
            a-list-item-meta(:title="`${item.shopId} ${item.shopName}`")
</template>

<script>
import Shop from '../../api/shop'
import WhiteList from '../../api/whitelist'
import { message } from 'ant-design-vue'

export default {
  name: 'tools-white-list',
  data() {
    return {
      mtShops: [],
      elmShops: [],
      mtSmartAds: [], // 美团推广铂金白名单
      mtCpcAds: [], // 美团点金推广白名单
      elmSmartAds: [], // 饿了么推广白名单
      activeTab: '1',
      addMtSmartInput: '',
      addMtCpcInput: '',
      addElmSmartInput: '',
      loading: false,
      addMtSmartLoading: false,
      delMtSmartLoading: false,
      addMtCpcLoading: false,
      delMtCpcLoading: false,
      addElmSmartLoading: false,
      delElmSmartLoading: false
    }
  },
  methods: {
    fetchMtShops() {
      this.loading = true
      new Shop()
        .shops('mt')
        .then(res => {
          this.mtShops = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    fetchElmShops() {
      this.loading = true
      new Shop()
        .shops('elm')
        .then(res => {
          this.elmShops = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    fetchMtSmartAds() {
      this.loading = true
      new WhiteList()
        .mtSmartAds()
        .then(res => {
          this.mtSmartAds = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    fetchMtCpcAds() {
      this.loading = true
      new WhiteList()
        .mtCpcAds()
        .then(res => {
          this.mtCpcAds = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    fetchElmSmartAds() {
      this.loading = true
      new WhiteList()
        .elmSmartAds()
        .then(res => {
          this.elmSmartAds = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    filterShop(input, option) {
      return option.value.includes(input.trim())
    },
    init() {
      this.fetchMtShops()
      this.fetchElmShops()
      this.fetchMtSmartAds()
      this.fetchMtCpcAds()
      this.fetchElmSmartAds()
    },
    onAddMtSmart() {
      this.addMtSmartLoading = true
      if (!this.addMtSmartInput) return
      let shopId = this.addMtSmartInput.split('|')[0]
      let shopName = this.addMtSmartInput.split('|')[1]
      new WhiteList()
        .saveMtSmartAds({ shopId })
        .then(res => {
          this.mtSmartAds.push({ shopId, shopName })
          message.success(res)
          this.addMtSmartLoading = false
        })
        .catch(err => {
          message.error(err)
          this.addMtSmartLoading = false
        })
    },
    onDelMtSmart(item) {
      this.delMtSmartLoading = true
      let shopId = item.shopId
      new WhiteList()
        .delMtSmartAds({ shopId })
        .then(res => {
          this.mtSmartAds.splice(
            this.mtSmartAds.findIndex(v => v.shopId == shopId),
            1
          )
          message.success(res)
          this.delMtSmartLoading = false
        })
        .catch(err => {
          message.error(err)
          this.delMtSmartLoading = false
        })
    },
    onAddMtCpc() {
      this.addMtCpcLoading = true
      if (!this.addMtCpcInput) return
      let shopId = this.addMtCpcInput.split('|')[0]
      let shopName = this.addMtCpcInput.split('|')[1]
      new WhiteList()
        .saveMtCpcAds({ shopId })
        .then(res => {
          this.mtCpcAds.push({ shopId, shopName })
          message.success(res)
          this.addMtCpcLoading = false
        })
        .catch(err => {
          message.error(err)
          this.addMtCpcLoading = false
        })
    },
    onDelMtCpc(item) {
      this.delMtCpcLoading = true
      let shopId = item.shopId
      new WhiteList()
        .delMtCpcAds({ shopId })
        .then(res => {
          this.mtCpcAds.splice(
            this.mtCpcAds.findIndex(v => v.shopId == shopId),
            1
          )
          message.success(res)
          this.delMtCpcLoading = false
        })
        .catch(err => {
          message.error(err)
          this.delMtCpcLoading = false
        })
    },
    onAddElmSmart() {
      this.addElmSmartLoading = true
      if (!this.addElmSmartInput) return
      let shopId = this.addElmSmartInput.split('|')[0]
      let shopName = this.addElmSmartInput.split('|')[1]
      new WhiteList()
        .saveElmSmartAds({ shopId })
        .then(res => {
          this.elmSmartAds.push({ shopId, shopName })
          message.success(res)
          this.addElmSmartLoading = false
        })
        .catch(err => {
          message.error(err)
          this.addElmSmartLoading = false
        })
    },
    onDelElmSmart(item) {
      this.delElmSmartLoading = true
      let shopId = item.shopId
      new WhiteList()
        .delElmSmartAds({ shopId })
        .then(res => {
          this.elmSmartAds.splice(
            this.elmSmartAds.findIndex(v => v.shopId == shopId),
            1
          )
          message.success(res)
          this.delElmSmartLoading = false
        })
        .catch(err => {
          message.error(err)
          this.delElmSmartLoading = false
        })
    }
  },
  created() {
    this.init()
  }
}
</script>

<style lang="sass" scoped>
.tools-white-list
  width: 100%
  padding: 0 20px

.list
  max-height: calc(100vh - 140px)
  overflow-y: scroll

.toolbar
  display: flex
  align-items: center
  margin-bottom: 14px
</style>
