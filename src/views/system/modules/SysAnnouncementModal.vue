<template>
  <a-modal
    :title="title"

    :width="900"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    :okButtonProps="{ props: {disabled: disabled} }"
    cancelText="クローズ">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-row style="width: 100%;">
          <a-col :span="24/2">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="タイトル">
              <a-input placeholder="タイトルを入力してください" v-decorator="['titile', validatorRules.title]" :readOnly="disableSubmit"/>
            </a-form-item>
          </a-col>
          <a-col :span="24/2">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="メッセージタイプ">
              <a-select
                v-decorator="[ 'msgCategory', validatorRules.msgCategory]"
                placeholder="メッセージタイプを選択してください"
                :disabled="disableSubmit"
                :getPopupContainer = "(target) => target.parentNode">
                <a-select-option value="1">通知公告</a-select-option>
                <a-select-option value="2">システムメッセージ</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row style="width: 100%;">
          <a-col :span="24/2">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="開始時間:">
              <j-date style="width: 100%" :getCalendarContainer="node => node.parentNode" v-decorator="[ 'startTime', validatorRules.startTime]" placeholder="開始時間を選択してください" showTime dateFormat="YYYY-MM-DD HH:mm:ss" ></j-date>
            </a-form-item>
          </a-col>
          <a-col :span="24/2">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="終了時間:"
              class="endTime">
              <j-date style="width: 100%" :getCalendarContainer="node => node.parentNode" v-decorator="[ 'endTime', validatorRules.endTime]" placeholder="終了時間を選択してください" showTime dateFormat="YYYY-MM-DD HH:mm:ss"></j-date>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row style="width: 100%;">
          <a-col :span="24/2">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="優先度">
              <a-select
                v-decorator="[ 'priority', {}]"
                placeholder="優先順位を選択してください"
                :disabled="disableSubmit"
                :getPopupContainer = "(target) => target.parentNode">
                <a-select-option value="L">低</a-select-option>
                <a-select-option value="M">中</a-select-option>
                <a-select-option value="H">高</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24/2">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="通知タイプ">
              <a-select
                v-decorator="[ 'msgType', validatorRules.msgType]"
                placeholder="通知タイプを選択してください"
                :disabled="disableSubmit"
                @change="chooseMsgType"
                :getPopupContainer = "(target) => target.parentNode">
                <a-select-option value="USER">指定ユーザー</a-select-option>
                <a-select-option value="ALL">すべてのユーザー</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row style="width: 100%;">
          <a-col :span="24/2">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="概要">
              <a-textarea placeholder="概要を入力してください" v-decorator="['msgAbstract',validatorRules.msgAbstract]" />
            </a-form-item>
          </a-col>
          <a-col :span="24/2">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="指定ユーザー"
              v-if="userType">
              <a-select
                mode="multiple"
                placeholder="ユーザーを選択してください"
                :labelInValue=true
                v-model="selectedUser"
                @dropdownVisibleChange="selectUserIds"
                @change="handleChange"
              >
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row style="width: 100%;">
          <a-col :span="24">
            <a-form-item
              :labelCol="labelColX1"
              :wrapperCol="wrapperColX1"
              label="コンテンツ"
              class="j-field-content">
              <j-editor v-decorator="[ 'msgContent', {} ]" triggerChange></j-editor>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
    <select-user-list-modal ref="UserListModal" @choseUser="choseUser"></select-user-list-modal>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { getAction } from '@/api/manage'
  import JDate from '@/components/jeecg/JDate'
  import JEditor from '@/components/jeecg/JEditor'
  import SelectUserListModal from "./SelectUserListModal";
  import moment from 'moment'

  export default {
    components: { JEditor, JDate, SelectUserListModal},
    name: "SysAnnouncementModal",
    data () {
      return {
        title:"操作",
        visible: false,
        disableSubmit:false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 6 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 18 },
        },
        labelColX1: {
          xs: { span: 24 },
          sm: { span: 3 },
        },
        wrapperColX1: {
          xs: { span: 24 },
          sm: { span: 21 },
        },
        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules:{
          title:{rules: [{ required: true, message: 'タイトルを入力してください!' }]},
          msgCategory:{rules: [{ required: true, message: 'メッセージタイプを選択してください!' }]},
          msgType:{rules: [{ required: true, message: '通知対象タイプを選択してください！' }]},
          endTime:{rules:[{ required: true, message: '終了時間を選択してください!'} ,{validator: this.endTimeValidate}]},
          startTime:{rules:[{required: true, message: '開始時間を選択してください!'},{validator: this.startTimeValidate}]},
          msgAbstract:{rules: [{ required: true, message: '概要を入力してください!' }]},
        },
        url: {
          queryByIds: "/sys/user/queryByIds",
          add: "/sys/annountCement/add",
          edit: "/sys/annountCement/edit",
        },
        userType:false,
        userIds:[],
        selectedUser:[],
        disabled:false,
        msgContent:"",
        userList:[]
      }
    },
    created () {
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = {}
        this.disable = false;
        this.visible = true;
        this.getUser(record);
      },
      getUser(record){
        this.model = Object.assign({}, record);
          // 指定ユーザー
        if(record&&record.msgType === "USER"){
          this.userType =  true;
          this.userIds = record.userIds;
          getAction(this.url.queryByIds,{userIds:this.userIds}).then((res)=>{
            if(res.success){
              //update--begin--autor:wangshuai-----date:20200601------for：システムが選択をアナウンスした後、それを削除することはできません------
              var userList=[];
              for(var i=0;i<res.result.length;i++){
                var user={};
                user.label =res.result[i].realname;
                user.key=res.result[i].id;
                userList.push(user);
              }
              this.selectedUser=userList;
              //update--begin--autor:wangshuai-----date:20200601------for：システムが選択をアナウンスした後、それを削除することはできません------
              this.$refs.UserListModal.edit(res.result,this.userIds);
            }
          });
        }
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'endTime','startTime','titile','msgContent','priority','msgCategory','msgType','sendStatus','msgAbstract'))
        });
      },
      close () {
        this.$emit('close');
        this.selectedUser = [];
        this.visible = false;
      },
      handleOk () {
        const that = this;
        //指定されたユーザータイプが設定されているが、ユーザーが空の場合、バックグラウンドでエラーが報告されます
        if(this.userType &&!(this.userIds!=null && this.userIds.length >0)){
              this.$message.warning('指定されたユーザーを空にすることはできません！')
            return;
          }
        // フォームの検証をトリガーする
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            let formData = Object.assign(this.model, values);
            if(this.userType){
              formData.userIds =  this.userIds;
            }
            console.log(formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
                that.resetUser();
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })



          }
        })
      },
      handleCancel () {
        this.visible = false;
        this.$emit('close');
        this.resetUser();
      },
      resetUser (){
        this.userType =  false;
        this.userIds = [];
        this.selectedUser = [];
        this.disabled = false;
        this.$refs.UserListModal.edit(null,null);
      },
      selectUserIds() {
        this.$refs.UserListModal.add(this.selectedUser,this.userIds);
      },
      chooseMsgType(value) {
        if("USER" == value) {
          this.userType = true;
        } else {
          this.userType = false;
          this.selectedUser = [];
          this.userIds = [];
        }
      },
      // サブモーダルコールバック
      choseUser:function(userList){
        this.selectedUser = [];
        this.userIds = [];
        for(var i=0;i<userList.length;i++){
          //update--begin--autor:wangshuai-----date:20200601------for：システムが選択をアナウンスした後、それを削除することはできません------
          var user={};
          user.label =userList[i].realname;
          user.key=userList[i].id;
          this.selectedUser.push(user);
          //update--end--autor:wangshuai-----date:20200601------for：システムが選択をアナウンスした後、それを削除することはできません------
          this.userIds += userList[i].id+","
        }
      },
      startTimeValidate(rule,value,callback){
        let endTime = this.form.getFieldValue("endTime")
        if(!value || !endTime){
          callback()
        }else if(moment(value).isBefore(endTime)){
          callback()
        }else{
          callback("開始時間は終了時間よりも短くする必要があります")
        }
      },
      endTimeValidate(rule,value,callback){
        let startTime = this.form.getFieldValue("startTime")
        if(!value || !startTime){
          callback()
        }else if(moment(startTime).isBefore(value)){
          callback()
        }else{
          callback("終了時間は開始時間よりも長くする必要があります")
        }
      },
      handleChange(userList) {
        if (userList) {
          this.userIds = [];
          var users=[];
          for (var i = 0; i < userList.length; i++) {
            var user={};
            user.id=userList[i].key;
            user.realname=userList[i].label;
            this.userIds += userList[i].key + ',';
            users.push(user);
          }
        }
        this.$refs.UserListModal.edit(users,this.userIds);
      }
    }
  }
</script>

<style scoped>

</style>