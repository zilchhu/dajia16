<template lang="pug">
.add-fresh
  .header
    span.title add-new-shop
  .form
    a-form(:model="formState" :label-col="{span: 2, offset: 4}" labelAlign="left" :wrapper-col="{span: 14}")
      a-form-item(label="平台")
        a-radio-group(v-model:value="formState.platform" @change="platformChange")
          a-radio(:value="1") 美团
          a-radio(:value="2") 饿了么

      a-form-item(label="shopId")
        a-input(v-model:value="formState.shopId" placeholder="请输入SHOPID")

      a-form-item(label="shopName")
        a-input(v-model:value="formState.shopName" placeholder="请输入SHOPNAME")

      a-form-item(label="city")
        a-input(v-model:value="formState.city" placeholder="请输入CITY")

      a-form-item(label="物理店")
        a-auto-complete(v-model:value="formState.realName" placeholder="请输入物理店")
          template(#dataSource)
            a-select-option(v-for="name in realShopNames" :key="name") {{name}}

      a-form-item(label="负责人")
        a-auto-complete(v-model:value="formState.person" placeholder="请输入负责人")
          template(#dataSource)
            a-select-option(v-for="person in realShopPersons" :key="person") {{person}}

      a-form-item(label="新店负责人")
        a-auto-complete(v-model:value="formState.newPerson" placeholder="请输入新店负责人")
          template(#dataSource)
            a-select-option(v-for="newPerson in realShopNewPersons" :key="newPerson") {{newPerson}}

      a-form-item(label="bd")
        a-auto-complete(v-model:value="formState.bd" placeholder="请输入bd")
          template(#dataSource)
            a-select-option(v-for="bd in realShopBds" :key="bd") {{bd}}

      a-form-item(label="phone")
        a-auto-complete(v-model:value="formState.phone" placeholder="请输入phone")
          template(#dataSource)
            a-select-option(v-for="phone in realShopPhones" :key="phone") {{phone}}

      a-form-item(label="是否")
        a-checkbox-group(v-model:value="formState.isDM" :options="['原价扣点', '活动择优']")

      a-form-item(label="租金")
        a-auto-complete(v-model:value="formState.rent" placeholder="请输入租金")
          template(#dataSource)
            a-select-option(v-for="rent in realShopRents" :key="rent") {{rent}}

      a-form-item(label="roomId")
        a-input(v-model:value="formState.roomId" placeholder="请输入ROOMID")
      
      a-form-item(:wrapper-col="{ span: 14, offset: 6 }")
        a-button(type="primary" :loading="loading" @click="onSubmit") 保存

    p {{res}}

</template>

<script>
import Shop from '../../api/shop'
import { message } from 'ant-design-vue'

export default {
  name: 'tools-add-fresh',
  data() {
    return {
      formState: {
        platform: 1,
        shopId: '',
        shopName: '',
        city: '',
        realName: '',
        person: '',
        newPerson: '',
        bd: '',
        phone: '',
        isDM: [],
        rent: '',
        roomId: ''
      },
      mtShops: [],
      elmShops: [],
      realShops: [],
      loading: false,
      res: ''
    }
  },
  computed: {
    selectedShops() {
      return this.formState.platform == 1 ? this.mtShops.map(v => ({ ...v, name: v.poiName })) : this.elmShops
    },
    realShopPersons() {
      return Array.from(new Set(this.realShops.map(v => v.person)))
    },
    realShopNewPersons() {
      return Array.from(new Set(this.realShops.map(v => v.new_person)))
    },
    realShopNames() {
      return Array.from(new Set(this.realShops.map(v => v.real_shop_name)))
    },
    realShopBds() {
      return Array.from(new Set(this.realShops.map(v => v.bd)))
    },
    realShopPhones() {
      return Array.from(new Set(this.realShops.map(v => v.shop_phone)))
    },
    realShopRents() {
      return Array.from(new Set(this.realShops.map(v => v.rent)))
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
    fetchRealShops() {
      this.loading = false
      new Shop()
        .real()
        .then(res => {
          this.realShops = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    filterShop(input, option) {
      return option.props.value.includes(input.trim())
    },
    platformChange() {
      this.formState.shopId = ''
      this.formState.shopName = ''
      this.formState.city = ''
      this.formState.realName = ''
      this.formState.person = ''
      this.formState.newPerson = ''
      this.formState.bd = ''
      this.formState.phone = ''
      this.formState.rent = ''
      this.formState.isDM = []
      this.formState.roomId = ''
    },
    init() {
      this.fetchMtShops()
      this.fetchElmShops()
      this.fetchRealShops()
    },
    onSubmit() {
      ['shopId', 'shopName', 'city', 'realName', 'person', 'newPerson', 'bd', 'phone', 'roomId']
        .filter(k => this.formState[k] != null)
        .map(k => (this.formState[k] = this.formState[k].trim()))
      let data = {
        ...this.formState,
        isD: this.formState.isDM.includes('原价扣点') ? 1 : 0,
        isM: this.formState.isDM.includes('活动择优') ? 1 : 0,
        rent: parseInt(this.formState.rent)
      }
      console.log(data)
      this.loading = true
      new Shop()
        .addNewShop(data)
        .then(res => {
          this.res = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    }
  },
  created() {
    this.init()
  }
}
</script>

<style lang="sass" scoped>
.add-fresh
  width: 100%
  padding: 0 20px

.header
  display: flex
  width: 100%
  justify-content: flex-start
  height: 60px

.title
  font-size: 1.1em
  font-weight: bold
</style>
