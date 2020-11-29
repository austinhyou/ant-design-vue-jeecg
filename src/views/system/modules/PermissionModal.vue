<template>
  <a-drawer
    :title="title"
    :width="drawerWidth"
    @close="handleCancel"
    :visible="visible"
    :confirmLoading="confirmLoading">

    <div :style="{width: '100%',border: '1px solid #e9e9e9',padding: '10px 16px',background: '#fff',}">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="メニュータイプ" :labelCol="labelCol" :wrapperCol="wrapperCol" >
          <a-radio-group @change="onChangeMenuType" v-decorator="['menuType',{'initialValue':localMenuType}]">
            <a-radio :value="0">一級メニュー</a-radio>
            <a-radio :value="1">サブメニュー</a-radio>
            <a-radio :value="2">ボタン/許可</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          :label="menuLabel"
          hasFeedback >
          <a-input placeholder="メニュー名を入力してください" v-decorator="[ 'name', validatorRules.name]" :readOnly="disableSubmit"/>
        </a-form-item>


        <a-form-item
          v-show="localMenuType!=0"
          label="上位メニュー"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          :validate-status="validateStatus"
          :hasFeedback="true"
          :required="true">
          <span slot="help">{{ validateStatus=='error'?'上位メニューを選択してください':'&nbsp;&nbsp;' }}</span>
          <a-tree-select
            style="width:100%"
            :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
            :treeData="treeData"
            v-model="model.parentId"
            placeholder="親メニューを選択してください"
            :disabled="disableSubmit"
            @change="handleParentIdChange">
          </a-tree-select>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="メニューパス">
          <a-input placeholder="メニューパスを入力してください" v-decorator="[ 'url',validatorRules.url]" :readOnly="disableSubmit"/>
        </a-form-item>

        <a-form-item
          v-show="show"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="フロントエンドコンポーネント">
          <a-input placeholder="フロントエンドコンポーネントを入力してください" v-decorator="[ 'component',validatorRules.component]" :readOnly="disableSubmit"/>
        </a-form-item>

        <a-form-item
          v-show="localMenuType==0"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="デフォルトのジャンプアドレス">
          <a-input placeholder="ルーティングパラメータリダイレクトを入力してください" v-decorator="[ 'redirect',{}]" :readOnly="disableSubmit"/>
        </a-form-item>

        <a-form-item
          v-show="!show"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="授権ID">
          <a-input placeholder="次のように、コンマで区切られた複数：user：list、user：create" v-decorator="[ 'perms', {rules:[{ required: false, message: '授権IDを入力してください！' },{validator: this.validatePerms }]}]" :readOnly="disableSubmit"/>
        </a-form-item>

        <a-form-item
          v-show="!show"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="授権策略">
          <j-dict-select-tag  v-decorator="['permsType', {}]" placeholder="授権策略を選択してください" :type="'radio'" :triggerChange="true" dictCode="global_perms_type"/>


        </a-form-item>
        <a-form-item
          v-show="!show"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ステータス">
          <j-dict-select-tag  v-decorator="['status', {}]" placeholder="ステータスを選択してください" :type="'radio'" :triggerChange="true" dictCode="valid_status"/>

        </a-form-item>

        <a-form-item
          v-show="show"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="メニューアイコン">
          <a-input placeholder="選択アイコンをクリックします" v-model="model.icon" :readOnly="disableSubmit">
            <a-icon slot="addonAfter" type="setting" @click="selectIcons" />
          </a-input>
        </a-form-item>

        <a-form-item
          v-show="show"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="ソート">
          <a-input-number placeholder="メニューの順番を入力してください" style="width: 200px" v-decorator="[ 'sortNo',validatorRules.sortNo]" :readOnly="disableSubmit"/>
        </a-form-item>

        <a-form-item
          v-show="show"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="メニューをルーティングするかどうか">
          <a-switch checkedChildren="はい" unCheckedChildren="いいえ" v-model="routeSwitch"/>
        </a-form-item>

        <a-form-item
          v-show="show"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="非表示ルーティング">
          <a-switch checkedChildren="はい" unCheckedChildren="いいえ" v-model="menuHidden"/>
        </a-form-item>

        <a-form-item
          v-show="show"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="キャッシュルーティング">
          <a-switch checkedChildren="はい" unCheckedChildren="いいえ" v-model="isKeepalive"/>
        </a-form-item>


        <a-form-item
          v-show="show"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="集約ルーティング">
          <a-switch checkedChildren="はい" unCheckedChildren="いいえ" v-model="alwaysShow"/>
        </a-form-item>

        <!--update_begin author:wuxianquan date:20190908 for:コンポーネントの追加、オプションの外部リンクを開く方法 -->
        <a-form-item
          v-show="show"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="オープン方式">
          <a-switch checkedChildren="外部" unCheckedChildren="内部" v-model="internalOrExternal"/>
        </a-form-item>
        <!--update_end author:wuxianquan date:20190908 for:コンポーネントの追加、オプションの外部リンクを開く方法 -->


      </a-form>

      <!-- アイコンを選択 -->
      <icons @choose="handleIconChoose" @close="handleIconCancel" :iconChooseVisible="iconChooseVisible"></icons>
    </a-spin>
      <a-row :style="{textAlign:'right'}">
        <a-button :style="{marginRight: '8px'}" @click="handleCancel">
          クローズ
        </a-button>
        <a-button :disabled="disableSubmit" @click="handleOk" type="primary">確定</a-button>
      </a-row>
    </div>
  </a-drawer>
</template>

<script>
  import {addPermission,editPermission,queryTreeList, duplicateCheck} from '@/api/api'
  import Icons from './icon/Icons'
  import pick from 'lodash.pick'

  export default {
    name: "PermissionModal",
    components: {Icons},
    data () {
      return {
        drawerWidth:700,
        treeData:[],
        treeValue: '0-0-4',
        title:"操作",
        visible: false,
        disableSubmit:false,
        model: {},
        localMenuType:0,
        alwaysShow:false,//フォーム要素-集約ルート
        menuHidden:false,//フォーム要素-非表示ルート
        routeSwitch:true, //メニューをルーティングするかどうか
        /*update_begin author:wuxianquan date:20190908 for:変数を定義します。初期値は内部オープンを表します*/
        internalOrExternal:false,//メニューの開き方
        /*update_end author:wuxianquan date:20190908 for:変数を定義します。初期値は内部オープンを表します*/
        isKeepalive:true, //キャッシュルーティング
        show:true,//メニューの種類に応じて、非表示のフォーム要素を動的に表示します
        menuLabel:'メニュー名',
        isRequrie:true,  // 確認が必要ですか
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },

        confirmLoading: false,
        form: this.$form.createForm(this),

        iconChooseVisible: false,
        validateStatus:""
      }
    },
    computed:{
      validatorRules:function() {
        return {
          name:{rules: [{ required: true, message: 'メニュータイトルを入力してください！' }]},
          component:{rules: [{ required: this.show, message: 'フロントエンドコンポーネントを入力してください!' }]},
          url:{rules: [{ required: this.show, message: 'メニューパスを入力してください!' }]},
          permsType:{rules: [{ required: true, message: '授権策略を入力してください！' }]},
          sortNo:{initialValue:1.0},
        }
      }
    },
    created () {
      this.initDictConfig();
    },
    methods: {
      loadTree(){
        var that = this;
        queryTreeList().then((res)=>{
          if(res.success){
            console.log('----queryTreeList---')
            console.log(res)
            that.treeData = [];
            let treeList = res.result.treeList
            for(let a=0;a<treeList.length;a++){
              let temp = treeList[a];
              temp.isLeaf = temp.leaf;
              that.treeData.push(temp);
            }
          }
        });
      },
      add () {
        // デフォルト
        this.edit({status:'1',permsType:'1',route:true});
      },
      edit (record) {
        this.resetScreenSize(); // このメソッドを呼び出して、画面の幅に応じて引き出しの幅を適応的に調整します
        this.form.resetFields();
        this.model = Object.assign({}, record);
        //--------------------------------------------------------------------------------------------------
        //メニューの種類に応じて、ページフィールドを動的に表示します
        console.log(record)
        this.alwaysShow = !record.alwaysShow?false:true;
        this.menuHidden = !record.hidden?false:true;

        if(record.route!=null){
          this.routeSwitch = record.route?true:false;
        }

        if(record.keepAlive!=null){
          this.isKeepalive = record.keepAlive?true:false;
        }else{
          this.isKeepalive = false; // アップグレード互換性がない（バックグラウンドから渡されていない、または新しく作成された）場合、デフォルトはfalseです
        }

        /*update_begin author:wuxianquan date:20190908 for:初期化データの編集*/
        if(record.internalOrExternal!=null){
          this.internalOrExternal = record.internalOrExternal?true:false;
        }else{
          this.internalOrExternal = false;
        }
        /*update_end author:wuxianquan date:20190908 for:初期化データの編集*/


        //console.log('record.menuType', record.menuType);
        this.show = record.menuType==2?false:true;
        this.menuLabel = record.menuType==2?'ボタン/許可':'メニュー名';

        if(this.model.parentId){
          this.localMenuType = 1;
        }else{
          this.localMenuType = 0;
        }
        //----------------------------------------------------------------------------------------------

        this.visible = true;
        this.loadTree();
        let fieldsVal = pick(this.model,'name','perms','permsType','component','url','sortNo','menuType','status');
        this.$nextTick(() => {
          this.form.setFieldsValue(fieldsVal)
        });
      },
      close () {
        this.$emit('close');
        this.disableSubmit = false;
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // フォームの検証をトリガーする
        this.form.validateFields((err, values) => {
          if (!err) {
            this.model.alwaysShow = this.alwaysShow;
            this.model.hidden = this.menuHidden;
            this.model.route = this.routeSwitch;
            this.model.keepAlive = this.isKeepalive;
            /*update_begin author:wuxianquan date:20190908 for:取得値*/
            this.model.internalOrExternal = this.internalOrExternal;
            /*update_end author:wuxianquan date:20190908 for:取得値*/

            let formData = Object.assign(this.model, values);
            if ((formData.menuType == 1 || formData.menuType == 2) && !formData.parentId) {
              that.validateStatus = 'error';
              that.$message.error("入力したタイプと情報が正しいことを確認してください。");
              return;
            } else {
              that.validateStatus = 'success';
            }
            that.confirmLoading = true;
            console.log(formData);
            let obj;
            if (!this.model.id) {
              obj = addPermission(formData);
            } else {
              obj = editPermission(formData);
            }
            obj.then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.$emit('ok');
              } else {
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            });
          }
        })
      },
      handleCancel () {
        this.close()
      },
      validateNumber(rule, value, callback){
        if(!value || new RegExp(/^[0-9]*[1-9][0-9]*$/).test(value)){
          callback();
        }else{
          callback("正整数を入力してください！");
        }
      },
      validatePerms(rule, value, callback){
        if(value && value.length>0){
          //授権IDが存在することを確認します
          var params = {
            tableName: 'sys_permission',
            fieldName: 'perms',
            fieldVal: value,
            dataId: this.model.id
          };
          duplicateCheck(params).then((res) => {
            if (res.success) {
              callback()
            } else {
              callback("授権IDはすでに存在します！")
            }
          })
        }else{
          callback()
        }
      },
      onChangeMenuType(e) {
        //console.log('localMenuType checked', e.target.value)
        this.localMenuType=e.target.value
        if(e.target.value == 2){
          this.show = false;
          this.menuLabel = 'ボタン/許可';
        }else{
          this.show = true;
          this.menuLabel = 'メニュー名';
        }
        this.$nextTick(() => {
          this.form.validateFields(['url','component'], { force: true });
        });
      },
      selectIcons(){
        this.iconChooseVisible = true
      },
      handleIconCancel () {
        this.iconChooseVisible = false
      },
      handleIconChoose (value) {
        console.log(value)
        this.model.icon = value
        this.form.icon = value
        this.iconChooseVisible = false
      },
      // 画面の変化に合わせて引き出しサイズを設定
      resetScreenSize(){
        let screenWidth = document.body.clientWidth;
        if(screenWidth < 500){
          this.drawerWidth = screenWidth;
        }else{
          this.drawerWidth = 700;
        }
      },
      initDictConfig() {
      },
      handleParentIdChange(value){
        if(!value){
          this.validateStatus="error"
        }else{
          this.validateStatus="success"
        }
      }
    }
  }
</script>

<style scoped>

</style>