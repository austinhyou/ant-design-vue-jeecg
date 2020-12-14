<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <button @click="()=>{$i18n.locale =$i18n.locale === 'zh'?'en':'zh'}">语言</button >
      <router-view/>
    </div>
  </a-config-provider>
</template>
<script>
  import jaJP from 'ant-design-vue/lib/locale-provider/ja_JP'
  import enquireScreen from '@/utils/device'

  export default {
    data () {
      return {
        locale: jaJP,
      }
    },
    created () {
      let that = this
      enquireScreen(deviceType => {
        // tablet
        if (deviceType === 0) {
          that.$store.commit('TOGGLE_DEVICE', 'mobile')
          that.$store.dispatch('setSidebar', false)
        }
        // mobile
        else if (deviceType === 1) {
          that.$store.commit('TOGGLE_DEVICE', 'mobile')
          that.$store.dispatch('setSidebar', false)
        }
        else {
          that.$store.commit('TOGGLE_DEVICE', 'desktop')
          that.$store.dispatch('setSidebar', true)
        }

      })
    }
  }
</script>
<style>
  #app {
    height: 100%;
  }
</style>