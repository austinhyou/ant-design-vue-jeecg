<template>
  <a-card :bordered="false" style="height: 100%">
    <div style="padding-bottom: 2px">
      <a-alert type="warning" show-icon>
        <div slot="message" style="width: 100%">
          <span>ルーティング配置には注意してください</span>
          <span style="display:inline-block;float:right;padding-right: 5px">
            <a @click="clearRedis"><a-icon type="reload" />キャッシュの消去</a>
          </span>
        </div>
      </a-alert>
    </div>
    <div :id="eleId" :style="{ height: editorHeight + 'px', width: '100%' }"></div>
    <div style="text-align: center;padding-top:10px">
      <a-button type="primary" @click="submitForm" style="width:160px">保存</a-button>
    </div>
  </a-card>
</template>

<script>
  import JsonEditor from 'jsoneditor'
  import 'jsoneditor/dist/jsoneditor.min.css'
  import { getAction, postAction } from '@/api/manage'

  export default {
    name: "SysGatewayRouteList",
    data () {
      return {
        eleId:'jsoneditor',
        description: 'ゲートウェイルーティング管理管理ページ',
        editor: null,
        editorWidth:400,
        editorHeight:500,
        url:{
          list: '/sys/gatewayRoute/list',
          update: '/sys/gatewayRoute/updateAll',
          clear: '/sys/gatewayRoute/clearRedis'
        },

      }
    },
    created() {
      let winWidth = window.innerWidth;
      console.log("ページ幅",winWidth)
      this.editorWidth = winWidth

    },
    mounted(){
      this.initJsonEditor();
    },
    methods: {
      initJsonEditor() {
        let container = document.getElementById(this.eleId);
        let options = {
          modes: ['text', 'code', 'tree', 'form', 'view'],
          mode: 'tree',
          ace: ace,
          sortObjectKeys: 'code',
          mainMenuBar:['format']
        };
        this.editor = new JsonEditor(container, options);
        this.initRouteData();
      },
      initRouteData(){
        getAction(this.url.list).then(res=>{
          if(res.success){
            let array = res.result
            console.log('現在のルーティング構成情報は', array)
            this.editor.set(array)
          }
        })
      },
      // jsonを取得します
      submitForm() {
        let text = this.editor.getText()
        console.log("保存されたjsonデータ",text)
        if(!text || text.length<=0 || text=='{}' || text=='[]'){
          this.$message.warning('情報が入力されていません')
          return ;
        }
        postAction(this.url.update,{
          routes:text
        }).then(res=>{
          if(res.success){
            this.$message.success(res.message)
          }else{
            this.$message.error(res.message)
          }
        })
      },
      clearRedis(){
        getAction(this.url.clear).then(res=>{
          if(res.success){
            this.$message.success(res.message)
          }
        })
      }

    }
  }
</script>
