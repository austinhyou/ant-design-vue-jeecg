<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    :width="drawerWidth"
    placement="right"
    :closable="true"
    @close="handleCancel"
    :visible="visible"
    style="height: 100%;overflow: auto;padding-bottom: 53px;">

    <template slot="title">
      <div style="width: 100%;">
        <span>{{ title }}</span>
        <span style="display:inline-block;width:calc(100% - 51px);padding-right:10px;text-align: right">
          <a-button @click="toggleScreen" icon="appstore" style="height:20px;width:20px;border:0px"></a-button>
        </span>
      </div>

    </template>

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="ユーザーアカウント" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="ユーザーアカウントを入力してください" v-decorator.trim="[ 'username', validatorRules.username]" :readOnly="!!model.id"/>
        </a-form-item>

        <template v-if="!model.id">
          <a-form-item label="ログインパスワード" :labelCol="labelCol" :wrapperCol="wrapperCol" >
            <a-input type="password" placeholder="ログインパスワードを入力してください" v-decorator="[ 'password']" />
          </a-form-item>

          <a-form-item label="パスワードを確認する" :labelCol="labelCol" :wrapperCol="wrapperCol" >
            <a-input type="password" @blur="handleConfirmBlur" placeholder="ログインパスワードを再入力してください" v-decorator="[ 'confirmpassword', validatorRules.confirmpassword]"/>
          </a-form-item>
        </template>

        <a-form-item label="ユーザー名" :labelCol="labelCol" :wrapperCol="wrapperCol" >
          <a-input placeholder="ユーザー名を入力してください" v-decorator.trim="[ 'realname', validatorRules.realname]" />
        </a-form-item>

        <a-form-item label="職務番号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="職務番号を入力してください" v-decorator.trim="[ 'workNo', validatorRules.workNo]" />
        </a-form-item>

        <a-form-item label="職務" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-select-position placeholder="職務を選択してください" :multiple="false" v-decorator="['post', {}]"/>
        </a-form-item>

        <a-form-item label="役割の割り当て" :labelCol="labelCol" :wrapperCol="wrapperCol" v-show="!roleDisabled" >
          <a-select
            mode="multiple"
            style="width: 100%"
            placeholder="ユーザー役割を選択してください"
            optionFilterProp = "children"
            v-model="selectedRole"
            :getPopupContainer= "(target) => target.parentNode">
            <a-select-option v-for="(role,roleindex) in roleList" :key="roleindex.toString()" :value="role.id">
              {{ role.roleName }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <!--部門の割り当て-->
        <a-form-item label="部門の割り当て" :labelCol="labelCol" :wrapperCol="wrapperCol" v-show="!departDisabled">
          <a-input-search
            placeholder="選択した部門をクリックします"
            v-model="checkedDepartNameString"
            readOnly
            @search="onSearch">
            <a-button slot="enterButton" icon="search">選択する</a-button>
          </a-input-search>
        </a-form-item>

        <!--テナントの割り当て-->
        <a-form-item label="テナントの割り当て" :labelCol="labelCol" :wrapperCol="wrapperCol" v-show="!departDisabled">

          <a-select
            mode="multiple"
            style="width: 100%"
            placeholder="テナントの割り当てを選択してください"
            :disabled="disableSubmit"
            v-model="currentTenant">
            <a-select-option v-for="(item, index) in tenantList" :key="index" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

       <!-- update--begin--autor:wangshuai-----date:20200108------for：新規IDと担当部門------ -->
        <a-form-item label="ID" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group
            v-model="identity"
            @change="identityChange">
            <a-radio value="1">一般ユーザー</a-radio>
            <a-radio value="2">上位</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="担当部門" :labelCol="labelCol" :wrapperCol="wrapperCol"  v-if="departIdShow==true">
          <a-select
            mode="multiple"
            style="width: 100%"
            placeholder="担当部門を選択してください"
            v-model="departIds"
            optionFilterProp = "children"
            :getPopupContainer = "(target) => target.parentNode"
            :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
          >
            <a-select-option v-for="item in resultDepartOptions" :key="item.key" :value="item.key"
            >{{item.title}}</a-select-option
            >
          </a-select>
        </a-form-item>
        <!-- update--end--autor:wangshuai-----date:20200108------for：新規IDと担当部門------ -->
        <a-form-item label="顔写真" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-image-upload class="avatar-uploader" text="アップロード" v-model="fileList" ></j-image-upload>
        </a-form-item>

        <a-form-item label="誕生日" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-date-picker
            style="width: 100%"
            placeholder="誕生日を選択してください"
            v-decorator="['birthday', {initialValue:!model.birthday?null:moment(model.birthday,dateFormat)}]"
            :getCalendarContainer="node => node.parentNode"/>
        </a-form-item>

        <a-form-item label="性別" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="[ 'sex', {}]" placeholder="性別を選択してください" :getPopupContainer= "(target) => target.parentNode">
            <a-select-option :value="1">男</a-select-option>
            <a-select-option :value="2">女</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="メールアドレス" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="メールアドレスを入力してください" v-decorator="[ 'email', validatorRules.email]" />
        </a-form-item>

          <a-form-item label="電話番号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="電話番号を入力してください" :disabled="isDisabledAuth('user:form:phone')" v-decorator="[ 'phone', validatorRules.phone]" />
        </a-form-item>

        <a-form-item label="連絡先" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="連絡先を入力してください" v-decorator="[ 'telephone', validatorRules.telephone]"/>
        </a-form-item>

        <a-form-item label="ワークフローエンジン" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag  v-decorator="['activitiSync', {}]" placeholder="ワークフローエンジンを同期するかどうかを選択してください" :type="'radio'" :triggerChange="true" dictCode="activiti_sync"/>
        </a-form-item>

      </a-form>
    </a-spin>
    <depart-window ref="departWindow" @ok="modalFormOk"></depart-window>

    <div class="drawer-bootom-button" v-show="!disableSubmit">
      <a-popconfirm title="編集をあきらめてよろしいですか？" @confirm="handleCancel" okText="確定" cancelText="キャンセル">
        <a-button style="margin-right: .8rem">キャンセル</a-button>
      </a-popconfirm>
      <a-button @click="handleSubmit" type="primary" :loading="confirmLoading">提出</a-button>
    </div>
  </a-drawer>
</template>

<script>
  import pick from 'lodash.pick'
  import moment from 'moment'
  import Vue from 'vue'
  // 検索部門のポップアップボックスのコンポーネントを紹介します
  import departWindow from './DepartWindow'
  import JSelectPosition from '@/components/jeecgbiz/JSelectPosition'
  import { ACCESS_TOKEN } from "@/store/mutation-types"
  import { getAction } from '@/api/manage'
  import {addUser,editUser,queryUserRole,queryall } from '@/api/api'
  import { disabledAuthFilter } from "@/utils/authFilter"
  import {duplicateCheck } from '@/api/api'
  import JImageUpload from '../../../components/jeecg/JImageUpload'

  export default {
    name: "UserModal",
    components: {
      JImageUpload,
      departWindow,
      JSelectPosition
    },
    data () {
      return {
        departDisabled: false, //私の部署がこのページを呼び出すかどうか
        roleDisabled: false, //役割維持がこのページを呼び出すかどうか
        modalWidth:800,
        drawerWidth:700,
        modaltoggleFlag:true,
        confirmDirty: false,
        selectedDepartKeys:[], //ユーザー選択部門IDを保存します
        checkedDepartKeys:[],
        checkedDepartNames:[], // 部門の名前を保存する=>タイトル
        checkedDepartNameString:"", // 部門の名前を保存する=>タイトル
        resultDepartOptions:[],
        userId:"", //ユーザーIDを保存します
        disableSubmit:false,
        userDepartModel:{userId:'',departIdList:[]}, // SysUserDepartのユーザー部門の中間テーブルデータを保存するために必要なオブジェクト
        dateFormat:"YYYY-MM-DD",
        validatorRules:{
          username:{
            rules: [{
              required: true, message: 'ユーザーアカウントを入力してください!'
            },{
              validator: this.validateUsername,
            }]
          },
          password:{
            rules: [{
              required: true,
              pattern:/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,./]).{8,}$/,
              message: 'パスワードは8桁、大文字と小文字、特殊記号で構成されています。'
            }, {
              validator: this.validateToNextPassword,
            }],
          },
          confirmpassword:{
            rules: [{
              required: true, message: 'ログインパスワードを再入力してください!',
            }, {
              validator: this.compareToFirstPassword,
            }],
          },
          realname:{rules: [{ required: true, message: 'ユーザー名を入力してください！' }]},
          phone:{rules: [{validator: this.validatePhone}]},
          email:{
            rules: [{
              validator: this.validateEmail
            }],
          },
          roles:{},
          //  sex:{initialValue:((!this.model.sex)?"": (this.model.sex+""))}
          workNo: {
            rules: [
              { required: true, message: '職務番号を入力してください' },
              { validator: this.validateWorkNo }
            ]
          },
          telephone: {
            rules: [
              { pattern: /^0\d{2,3}-[1-9]\d{6,7}$/, message: '正しい連絡先を入力してください' },
            ]
          }
        },
        departIdShow:false,
        departIds:[], //担当部門ID
        title:"操作",
        visible: false,
        model: {},
        roleList:[],
        selectedRole:[],
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        uploadLoading:false,
        confirmLoading: false,
        headers:{},
        form:this.$form.createForm(this),
        picUrl: "",
        url: {
          fileUpload: window._CONFIG['domianURL']+"/sys/common/upload",
          userWithDepart: "/sys/user/userDepartList", // 指定されたユーザーが部門情報を表示するために必要なURLを紹介します
          userId:"/sys/user/generateUserId", // ユーザーを追加するときに生成されるURLを紹介します
          syncUserByUserName:"/process/extActProcess/doSyncUserByUserName",//ユーザーをワークフローに同期する
          queryTenantList: '/sys/tenant/queryList'
        },
        identity:"1",
        fileList:[],
        tenantList: [],
        currentTenant:[]
      }
    },
    created () {
      const token = Vue.ls.get(ACCESS_TOKEN);
      this.headers = {"X-Access-Token":token}
      this.initTenantList()

    },
    computed:{
      uploadAction:function () {
        return this.url.fileUpload;
      }
    },
    methods: {
      isDisabledAuth(code){
        return disabledAuthFilter(code);
      },
      initTenantList(){
        getAction(this.url.queryTenantList).then(res=>{
          if(res.success){
            this.tenantList = res.result
          }
        })
      },
      //ウィンドウ最大化スイッチ
      toggleScreen(){
        if(this.modaltoggleFlag){
          this.modalWidth = window.innerWidth;
        }else{
          this.modalWidth = 800;
        }
        this.modaltoggleFlag = !this.modaltoggleFlag;
      },
      initialRoleList(){
        queryall().then((res)=>{
          if(res.success){
            this.roleList = res.result;
          }else{
            console.log(res.message);
          }
        });
      },
      loadUserRoles(userid){
        queryUserRole({userid:userid}).then((res)=>{
          if(res.success){
            this.selectedRole = res.result;
          }else{
            console.log(res.message);
          }
        });
      },
      refresh () {
          this.selectedDepartKeys=[];
          this.checkedDepartKeys=[];
          this.checkedDepartNames=[];
          this.checkedDepartNameString = "";
          this.userId=""
          this.resultDepartOptions=[];
          this.departId=[];
          this.departIdShow=false;
          this.currentTenant = []
      },
      add () {
        this.picUrl = "";
        this.refresh();
        this.edit({activitiSync:'1'});
      },
      edit (record) {
        this.resetScreenSize(); // このメソッドを呼び出して、画面の幅に応じて引き出しの幅を適応的に調整します
        let that = this;
        that.initialRoleList();
        that.checkedDepartNameString = "";
        that.form.resetFields();
        if(record.hasOwnProperty("id")){
          that.loadUserRoles(record.id);
          setTimeout(() => {
            this.fileList = record.avatar;
          }, 5)
        }
        that.userId = record.id;
        that.visible = true;
        that.model = Object.assign({}, record);
        that.$nextTick(() => {
          that.form.setFieldsValue(pick(this.model,'username','sex','realname','email','phone','activitiSync','workNo','telephone','post'))
        });
        //IDは、担当部門の上位ディスプレイです。それ以外の場合は表示されません。
        if(this.model.userIdentity=="2"){
            this.identity="2";
            this.departIdShow=true;
        }else{
            this.identity="1";
            this.departIdShow=false;
        }
        // メソッドを呼び出して、ユーザーに対応する部門情報を照会します
        that.checkedDepartKeys = [];
        that.loadCheckedDeparts();

        //update-begin-author:taoyan date:2020710 for:マルチテナント構成
        if(!record.relTenantIds || record.relTenantIds.length==0){
          this.currentTenant = []
        }else{
          this.currentTenant = record.relTenantIds.split(',').map(Number);
        }
        //update-end-author:taoyan date:2020710 for:マルチテナント構成
      },
      //
      loadCheckedDeparts(){
        let that = this;
        if(!that.userId){return}
        getAction(that.url.userWithDepart,{userId:that.userId}).then((res)=>{
          that.checkedDepartNames = [];
          if(res.success){
            var depart=[];
            var departId=[];
            for (let i = 0; i < res.result.length; i++) {
              that.checkedDepartNames.push(res.result[i].title);
              this.checkedDepartNameString = this.checkedDepartNames.join(",");
              that.checkedDepartKeys.push(res.result[i].key);
              //担当部門を選択するためのドロップダウンボックスを追加します
              depart.push({
                  key:res.result[i].key,
                  title:res.result[i].title
              })
              departId.push(res.result[i].key)
            }
            that.resultDepartOptions=depart;
            //部門IDが存在するかどうかを判断します。存在しない場合は、現在の部門に直接デフォルト設定されます。
            if(this.model.departIds){
                this.departIds=this.model.departIds.split(",");
            }else{
                this.departIds=departId;
            }
            that.userDepartModel.departIdList = that.checkedDepartKeys
          }else{
            console.log(res.message);
          }
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
        this.disableSubmit = false;
        this.selectedRole = [];
        this.userDepartModel = {userId:'',departIdList:[]};
        this.checkedDepartNames = [];
        this.checkedDepartNameString='';
        this.checkedDepartKeys = [];
        this.selectedDepartKeys = [];
        this.resultDepartOptions=[];
        this.departIds=[];
        this.departIdShow=false;
        this.identity="1";
        this.fileList=[];
      },
      moment,
      handleSubmit () {

        const that = this;
        // フォームの検証をトリガーする
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            if(!values.birthday){
              values.birthday = '';
            }else{
              values.birthday = values.birthday.format(this.dateFormat);
            }
            let formData = Object.assign(this.model, values);
            if(that.fileList != ''){
              formData.avatar = that.fileList;
            }else{
              formData.avatar = null;
            }
            //update-begin-author:taoyan date:2020710 for:マルチテナント構成
            formData.relTenantIds = this.currentTenant.length>0?this.currentTenant.join(','):''
            //update-end-author:taoyan date:2020710 for:マルチテナント構成
            formData.selectedroles = this.selectedRole.length>0?this.selectedRole.join(","):'';
            formData.selecteddeparts = this.userDepartModel.departIdList.length>0?this.userDepartModel.departIdList.join(","):'';
            formData.userIdentity=this.identity;
            //上司がdepartmentIdsを渡すことを選択した場合、それ以外の場合は空です
            if(this.identity==="2"){
              formData.departIds=this.departIds.join(",");
            }else{
              formData.departIds="";
            }
            // that.addDepartsToUser(that,formData); // 現在のユーザーに応じて部門情報を追加するメソッドを呼び出す
            let obj;
            if(!this.model.id){
              formData.id = this.userId;
              obj=addUser(formData);
            }else{
              obj=editUser(formData);
            }
            obj.then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.checkedDepartNames = [];
              that.userDepartModel.departIdList = {userId:'',departIdList:[]};
              that.close();
            })

          }
        })
      },
      handleCancel () {
        this.close()
      },
      validateToNextPassword  (rule, value, callback) {
        const form = this.form;
        const confirmpassword=form.getFieldValue('confirmpassword');

        if (value && confirmpassword && value !== confirmpassword) {
          callback('2回入力したパスワードが違います！');
        }
        if (value && this.confirmDirty) {
          form.validateFields(['confirm'], { force: true })
        }
        callback();
      },
      compareToFirstPassword  (rule, value, callback) {
        const form = this.form;
        if (value && value !== form.getFieldValue('password')) {
          callback('2回入力したパスワードが違います！');
        } else {
          callback()
        }
      },
      validatePhone(rule, value, callback){
        if(!value){
          callback()
        }else{
          //update-begin--Author:kangxiaolin  Date:20190826 for：[05] 電話番号は199番号セグメントをサポートしていません--------------------
          if(new RegExp(/^1[3|4|5|7|8|9][0-9]\d{8}$/).test(value)){
            //update-end--Author:kangxiaolin  Date:20190826 for：[05] 電話番号は199番号セグメントをサポートしていません--------------------

            var params = {
              tableName: 'sys_user',
              fieldName: 'phone',
              fieldVal: value,
              dataId: this.userId
            };
            duplicateCheck(params).then((res) => {
              if (res.success) {
                callback()
              } else {
                callback("電話番号はすでに存在します！")
              }
            })
          }else{
            callback("正しい電話番号を入力してください。");
          }
        }
      },
      validateEmail(rule, value, callback){
        if(!value){
          callback()
        }else{
          if(new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(value)){
            var params = {
              tableName: 'sys_user',
              fieldName: 'email',
              fieldVal: value,
              dataId: this.userId
            };
            duplicateCheck(params).then((res) => {
              console.log(res)
              if (res.success) {
                callback()
              } else {
                callback("メールアドレスはすでに存在します！")
              }
            })
          }else{
            callback("正しいメールアドレスを入力してください！")
          }
        }
      },
      validateUsername(rule, value, callback){
        var params = {
          tableName: 'sys_user',
          fieldName: 'username',
          fieldVal: value,
          dataId: this.userId
        };
        duplicateCheck(params).then((res) => {
          if (res.success) {
          callback()
        } else {
          callback("ユーザー名はすでに存在します！")
        }
      })
      },
      validateWorkNo(rule, value, callback){
        var params = {
          tableName: 'sys_user',
          fieldName: 'work_no',
          fieldVal: value,
          dataId: this.userId
        };
        duplicateCheck(params).then((res) => {
          if (res.success) {
            callback()
          } else {
            callback("職務番号はすでに存在します！")
          }
        })
      },
      handleConfirmBlur  (e) {
        const value = e.target.value;
        this.confirmDirty = this.confirmDirty || !!value
      },

      normFile  (e) {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
          return e
        }
        return e && e.fileList
      },
      beforeUpload: function(file){
        var fileType = file.type;
        if(fileType.indexOf('image')<0){
          this.$message.warning('写真をアップロードしてください');
          return false;
        }
        //TODO ファイルサイズを確認する
      },
      handleChange (info) {
        this.picUrl = "";
        if (info.file.status === 'uploading') {
          this.uploadLoading = true;
          return
        }
        if (info.file.status === 'done') {
          var response = info.file.response;
          this.uploadLoading = false;
          console.log(response);
          if(response.success){
            this.model.avatar = response.message;
            this.picUrl = "Has no pic url yet";
          }else{
            this.$message.warning(response.message);
          }
        }
      },
      // ユーザーの対応する部門APIを検索する
      onSearch(){
        this.$refs.departWindow.add(this.checkedDepartKeys,this.userId);
      },

      // ユーザーの対応する部門のポップアップボックスから返されたデータを取得します
      modalFormOk (formData) {
        this.checkedDepartNames = [];
        this.selectedDepartKeys = [];
        this.checkedDepartNameString = '';
        this.userId = formData.userId;
        this.userDepartModel.userId = formData.userId;
        this.departIds=[];
        this.resultDepartOptions=[];
        var depart=[];
        for (let i = 0; i < formData.departIdList.length; i++) {
          this.selectedDepartKeys.push(formData.departIdList[i].key);
          this.checkedDepartNames.push(formData.departIdList[i].title);
          this.checkedDepartNameString = this.checkedDepartNames.join(",");
          //部門の選択を追加します。上記の部門の選択が空でない場合は、担当部門に直接支払います。
          depart.push({
              key:formData.departIdList[i].key,
              title:formData.departIdList[i].title
          })
          this.departIds.push(formData.departIdList[i].key)
        }
        this.resultDepartOptions=depart;
        this.userDepartModel.departIdList = this.selectedDepartKeys;
        this.checkedDepartKeys = this.selectedDepartKeys  //現在の選択キーを更新します
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
      identityChange(e){
        if(e.target.value==="1"){
            this.departIdShow=false;
        }else{
            this.departIdShow=true;
        }
      }
    }
  }
</script>

<style scoped>
  .avatar-uploader > .ant-upload {
    width:104px;
    height:104px;
  }
  .ant-upload-select-picture-card i {
    font-size: 49px;
    color: #999;
  }

  .ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }

  .ant-table-tbody .ant-table-row td{
    padding-top:10px;
    padding-bottom:10px;
  }

  .drawer-bootom-button {
    position: absolute;
    bottom: -8px;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    left: 0;
    background: #fff;
    border-radius: 0 0 2px 2px;
  }
</style>