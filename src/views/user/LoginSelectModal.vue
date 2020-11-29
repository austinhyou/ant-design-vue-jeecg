<template>
  <a-modal
    :title="title"
    :width="450"
    :visible="visible"
    :closable="false"
    :maskClosable="false">

    <template slot="footer">
      <a-button type="primary" @click="selectOk">確認</a-button>
    </template>

    <a-form>
      <a-form-item v-if="isMultiTenant" :labelCol="{span:4}" :wrapperCol="{span:20}" style="margin-bottom:10px" :validate-status="validate_status1">
        <a-tooltip placement="topLeft" >
          <template slot="title">
            <span>複数のテナントがありますので、ログインテナントを選択してください</span>
          </template>
          <a-avatar style="backgroundColor:#87d068" icon="gold" />
        </a-tooltip>

        <a-select @change="handleTenantChange" :class="{'valid-error':validate_status1=='error'}" placeholder="ログインテナントを選択してください" style="margin-left:10px;width: 80%">
          <a-icon slot="suffixIcon" type="gold" />
          <a-select-option v-for="d in tenantList" :key="d.id" :value="d.id">
            {{ d.name }}
          </a-select-option>
        </a-select>
      </a-form-item>


      <a-form-item v-if="isMultiDepart" :labelCol="{span:4}" :wrapperCol="{span:20}" style="margin-bottom:10px" :validate-status="validate_status2">
        <a-tooltip placement="topLeft" >
          <template slot="title">
            <span>複数の部門があります。ログイン部門を選択してください</span>
          </template>
          <a-avatar style="backgroundColor:rgb(104, 208, 203);" icon="gold" />
        </a-tooltip>

        <a-select @change="handleDepartChange" :class="{'valid-error':validate_status2=='error'}" placeholder="ログイン部門を選択してください" style="margin-left:10px;width: 80%">
          <a-icon slot="suffixIcon" type="gold" />
          <a-select-option v-for="d in departList" :key="d.id" :value="d.orgCode">
            {{ d.departName }}
          </a-select-option>
        </a-select>
      </a-form-item>

    </a-form>
  </a-modal>
</template>

<script>

  import Vue from 'vue'
  import { getAction,putAction } from '@/api/manage'
  import { USER_INFO } from "@/store/mutation-types"
  import store from './Login'

  export default {
    name: 'LoginSelectModal',
    data(){
      return {
        visible: false,
        isMultiDepart:false,
        departList:[],

        isMultiTenant:false,
        tenantList:[],

        username:'',
        orgCode:'',
        tenant_id:'',

        validate_status1: "",
        validate_status2: "",
      }
    },
    computed:{
      title(){
        if(this.isMultiDepart && this.isMultiTenant){
          return 'テナントと部門を選択してください'
        }else if(this.isMultiDepart && !this.isMultiTenant){
          return '部門を選択してください'
        }else if(!this.isMultiDepart && this.isMultiTenant){
          return 'テナントを選択してください'
        }
      }
    },
    methods:{
      clear(){
        this.departList = []
        this.tenantList = []
        this.visible=false
        this.validate_status1=''
        this.validate_status2=''
      },
      bizDepart(loginResult){
        let multi_depart = loginResult.multi_depart
        //0:部門なし 1:一つ部門 2:複数部門
        if(multi_depart==0){
          this.$notification.warn({
            message: 'ヒント',
            description: `あなたは部門に所属していません。アカウント情報を確認してください`,
            duration:3
          });
          this.isMultiDepart = false
        }else if(multi_depart==2){
          this.visible=true
          this.isMultiDepart = true
          this.departList = loginResult.departs
        }else {
          this.isMultiDepart = false
        }
      },
      bizTenant(ids){
        if(!ids || ids.length==0){
          this.isMultiTenant = false
        } else if(ids.indexOf(',')<0){
          this.tenant_id = ids;
          this.isMultiTenant = false
        }else{
          this.visible = true
          this.isMultiTenant = true
          getAction('/sys/tenant/queryList', {ids: ids}).then(res=>{
            this.tenantList = res.result
          })
        }
      },
      show(loginResult){
        this.clear();
        this.bizDepart(loginResult);

        let user = Vue.ls.get(USER_INFO)
        this.username = user.username
        let ids = user.relTenantIds
        this.bizTenant(ids);

        if(this.visible===false){
          this.$store.dispatch('saveTenant', this.tenant_id);
          this.$emit('success')
        }

      },
      requestFailed (err) {
        this.$notification[ 'error' ]({
          message: 'ログインに失敗しました',
          description: ((err.response || {}).data || {}).message || err.message || "リクエストにエラーがありました。しばらくしてからもう一度お試しください",
          duration: 4,
        });
        this.loginBtn = false;
      },
      departResolve(){
        return new Promise((resolve, reject)=>{
          if(this.isMultiDepart===false){
            resolve();
          }else{
            let obj = {
              orgCode:this.orgCode,
              username:this.username
            }
            putAction("/sys/selectDepart",obj).then(res=>{
              if(res.success){
                const userInfo = res.result.userInfo;
                Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000);
                this.$store.commit('SET_INFO', userInfo);
                //console.log("---組織の切り替え---userInfo-------",store.getters.userInfo.orgCode);
                resolve();
              }else{
                this.requestFailed(res)
                this.$store.dispatch('Logout');
                reject();
              }
            })
          }
        })
      },
      selectOk(){
        if(this.isMultiTenant && !this.tenant_id){
          this.validate_status1='error'
          return false
        }
        if(this.isMultiDepart && !this.orgCode){
          this.validate_status2='error'
          return false
        }
        this.departResolve().then(()=>{
          if(this.isMultiTenant){
            this.$store.dispatch('saveTenant', this.tenant_id);
            this.$emit('success')
          }else{
            this.$emit('success')
          }
        }).catch(()=>{
          console.log('ログイン選択の問題')
        })
      },
      handleTenantChange(e){
        this.validate_status1 = ''
        this.tenant_id = e
      },
      handleDepartChange(e){
        this.validate_status2 = ''
        this.orgCode = e
      }
    }
  }
</script>

<style scoped>

</style>