<template lang="pug">
.add-fengniao
  .header
    span.title add-dada
  .form
    a-form(:model="formState" :label-col="{span: 2, offset: 4}" labelAlign="left" :wrapper-col="{span: 14}")

      a-form-item(label="shopId")
        a-input(v-model:value="formState.shopId" placeholder="请输入shopId")

      a-form-item(label="门店名")
        a-input(v-model:value="formState.shopName" placeholder="请输入门店名")

      a-form-item(label="账号")
        a-auto-complete(v-model:value="formState.username" placeholder="请输入账号" @change="accountChange")
          template(#dataSource)
            a-select-option(v-for="login in dadaLogins" :key="login") {{login}}

      a-form-item(label="密码")
        a-input(v-model:value="formState.password" placeholder="请输入密码" @change="passwordChange")

      a-form-item(label="MD5密码")
        a-input(v-model:value="formState.password_md5")
      
      a-form-item(:wrapper-col="{ span: 14, offset: 6 }")
        a-button(type="primary" :loading="loading" @click="onSubmit") 保存
        a-button(:loading="loading_del" @click="onDel" style='margin-left: 10px;') 删除
       
    p {{res}}

</template>

<script>
import Shop from '../../api/shop'
import { message } from 'ant-design-vue'
import md5 from 'md5'

export default {
  name: 'tools-add-dada',
  data() {
    return {
      formState: {
        shopId: '',
        shopName: '',
        username: '',
        password: '',
        password_md5: ''
      },
      loading: false,
      loading_del: false,
      res: '',
      dadas: []
    }
  },
  computed: {
    dadaLogins() {
      return Array.from(new Set(this.dadas.map(v => v.username)))
    }
  },
  methods: {
    fetchDada() {
      this.loading = false
      new Shop()
        .dada()
        .then(res => {
          this.dadas = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    accountChange(value) {
      let f = this.dadas.find(v => v.username == value)
      if (f) {
        this.formState.shopId = f.shop_id
        this.formState.shopName = f.shop_name
        this.formState.password = ''
        this.formState.password_md5 = f.pw
      } else {
        this.formState.shopId = ''
        this.formState.shopName = ''
        this.formState.password = ''
        this.formState.password_md5 = ''
      }
    },
    passwordChange() {
      this.formState.password_md5 = md5(this.formState.password)
    },
    onSubmit() {
      Object.keys(this.formState)
        .filter(k => this.formState[k] != null)
        .map(k => (this.formState[k] = this.formState[k].trim()))
      console.log({ ...this.formState, password: this.formState.password_md5 })
      this.loading = true
      new Shop()
        .addDada({ ...this.formState, password: this.formState.password_md5 })
        .then(res => {
          this.res = res
          this.loading = false
        })
        .catch(err => {
          message.error(err)
          this.loading = false
        })
    },
    onDel() {
      console.log(this.formState)
      this.loading_del = true
      new Shop()
        .delDada(this.formState)
        .then(res => {
          this.res = res
          this.loading_del = false
        })
        .catch(err => {
          message.error(err)
          this.loading_del = false
        })
    }
  },
  created() {
    this.fetchDada()
  }
}
</script>

<style lang="sass" scoped>
.add-fengniao
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
