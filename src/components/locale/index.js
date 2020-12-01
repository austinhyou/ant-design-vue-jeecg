import VueI18n from 'vue-i18n'
import Vue from 'vue'
Vue.use(VueI18n)
import zh from './lang/zh'
import en from './lang/jp'
export default new VueI18n(
  {
    locale:'zh',
    messages :{
      zh,
      en
    }
  }
)

