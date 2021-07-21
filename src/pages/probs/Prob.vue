<template lang="pug">
a-tabs(tab-position="top" size="small" :tabBarGutter="0")
  a-tab-pane(v-for="tab in tabs" :key="tab.key" :tab="tab.tab")
    component(:is="tab.comp")
</template>

<script>
import ProbA from './ProbA'
import ProbB from './ProbB'
import ProbC from './ProbC'
import ProbD from './ProbD'
import ProbE from './ProbE'
import ProbF from './ProbF'
import ProbG from './ProbG'
import ProbH from './ProbH'
import ProbI from './ProbI'
import ProbJ from './ProbJ'
import ProbK from './ProbK'
import ProbL from './ProbL'
import ProbM from './ProbM'
import ProbN from './ProbN'
import ProbO from './ProbO'
import ProbP from './ProbP'
import ProbQ from './ProbQ'
import ProbR from './ProbR'
import ProbS from './ProbS'
import ProbT from './ProbT'
import ProbU from './ProbU'
import ProbV from './ProbV'
import ProbW from './ProbW'
import ProbX from './ProbX'
import ProbY from './ProbY'
import ProbZ from './ProbZ'
import ProbAA from './ProbAA'
import ProbAB from './ProbAB'
import ProbAC from './ProbAC'
import ProbAD from './ProbAD'
import ProbAE from './ProbAE'
import ProbAF from './ProbAF'
import ProbAG from './ProbAG'
import ProbAH from './ProbAH'
import ProbAI from './ProbAI'
import ProbAJ from './ProbAJ'
import ProbAK from './ProbAK'
import ProbAL from './ProbAL'
import ProbAM from './ProbAM'

export default {
  name: 'Prob',
  components: {
    ProbA,
    ProbB,
    ProbC,
    ProbD,
    ProbE,
    ProbF,
    ProbG,
    ProbH,
    ProbI,
    ProbJ,
    ProbK,
    ProbL,
    ProbM,
    ProbN,
    ProbO,
    ProbP,
    ProbQ,
    ProbR,
    ProbS,
    ProbT,
    ProbU,
    ProbV,
    ProbW,
    ProbX,
    ProbY,
    ProbZ,
    ProbAA,
    ProbAB,
    ProbAC,
    ProbAD,
    ProbAE,
    ProbAF,
    ProbAG,
    ProbAH,
    ProbAI,
    ProbAJ,
    ProbAK,
    ProbAL,
    ProbAM,
  },
  data() {
    return {
      tabs: [
        { key: 39, tab: '起送价变化', comp: 'ProbAM' },
        { key: 37, tab: '饿了么折扣起购错误', comp: 'ProbAK' },
        { key: 38, tab: '饿了么折扣限购错误', comp: 'ProbAL' },
        { key: 35, tab: '差评', comp: 'ProbAI' },
        { key: 31, tab: '满减活动检查', comp: 'ProbAE' },
        { key: 29, tab: '减配活动检查', comp: 'ProbAC' },
        { key: 36, tab: '合作方案到期', comp: 'ProbAJ' },
        { key: 30, tab: '假减配检查', comp: 'ProbAD' },
        { key: 28, tab: '折扣到期商品检查', comp: 'ProbAB' },
        { key: 27, tab: '折扣遗漏商品查询', comp: 'ProbAA' },
        { key: 26, tab: '美团配送范围对比昨日', comp: 'ProbZ' },
        { key: 25, tab: '查询点金0曝光的时间', comp: 'ProbY' },
        { key: 24, tab: '成本表查漏', comp: 'ProbX' },
        { key: 12, tab: '津贴联盟', comp: 'ProbL' },
        { key: 23, tab: '单折扣起送', comp: 'ProbW' },
        { key: 11, tab: '两份起购餐品价格错误', comp: 'ProbK' },
        { key: 10, tab: '零元商品有餐盒费', comp: 'ProbJ' },
        { key: 2, tab: '商品无餐盒费', comp: 'ProbB' },
        { key: 1, tab: '原价扣点城市折扣与原价差距大于2', comp: 'ProbA' },
        { key: 32, tab: '库存过少检查', comp: 'ProbAF' },
        { key: 33, tab: '查询商品多规格', comp: 'ProbAG' },
        { key: 34, tab: '推广费余额查询', comp: 'ProbAH' },
        
        
        // { key: 3, tab: '美团薯饼虾饼鸡柳设置两份起购', comp: 'ProbC' },
        // { key: 4, tab: '餐盒费为0常规餐品设置餐盒费1', comp: 'ProbD' },
        // { key: 5, tab: '0.01两份起购餐盒费调整为1.5', comp: 'ProbE' },
        // { key: 6, tab: '折扣餐品原价+餐盒费会起送', comp: 'ProbF' },
        // { key: 7, tab: '原价扣点城市产品原价与折扣价差距超过1.1', comp: 'ProbG' },
        // { key: 8, tab: '0元购有餐盒费', comp: 'ProbH' },
        // { key: 9, tab: '加料门店', comp: 'ProbI' },
        
        // { key: 13, tab: '饿了么所有门店配送费批量检查', comp: 'ProbM' },
        // { key: 14, tab: '原价扣点城市折扣与原价差距大1', comp: 'ProbN' },
        // { key: 15, tab: '饿了么无餐盒费+1', comp: 'ProbO' },
        // { key: 16, tab: '饿了么两份起购无餐盒费+0.5', comp: 'ProbP' },
        // { key: 17, tab: '饿了么0.01两份起购餐盒费调整为1.5', comp: 'ProbQ' },
        // { key: 18, tab: '饿了么贡茶粉面套餐价格错误', comp: 'ProbR' },
        // { key: 19, tab: '饿了么甜品粉面套餐价格错误', comp: 'ProbS' },
        // { key: 20, tab: '饿了么折扣餐品原价+餐盒费会起送', comp: 'ProbT' },
        // { key: 21, tab: '饿了么零元购有餐盒费', comp: 'ProbU' },
        // { key: 22, tab: '饿了么两份起购餐品价格错误', comp: 'ProbV' },
      ].map((v, i) => ({...v, tab: `${i+1}.${v.tab}`}))
    }
  }
}
</script>
