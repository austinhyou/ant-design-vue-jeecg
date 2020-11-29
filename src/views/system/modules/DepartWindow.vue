<template>
  <a-modal
    :width="modalWidth"
    :visible="visible"
    title="部門検索"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    cancelText="クローズ"
    wrapClassName="ant-modal-cust-warp"
    >
    <!--部門ツリー-->
    <template>
      <a-form :form="form">
      <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="上位部門">
      <a-tree
        multiple
        treeCheckable="tree"
        checkable
        @expand="onExpand"
        :expandedKeys="expandedKeysss"
        :checkedKeys="checkedKeys"
        allowClear="true"
        :checkStrictly="true"
        @check="onCheck"
        :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
        :treeData="departTree"
        placeholder="上位部門を選択してください"
        >
      </a-tree>
      </a-form-item>
      </a-form>
    </template>
  </a-modal>
</template>

<script>
  import pick from 'lodash.pick'
  import { getAction } from '@/api/manage'
  import { queryIdTree } from '@/api/api'
  import userModal from './UserModal'
  export default {
    name: "DepartWindow",
    components: {
      userModal,
    },
    data () {
      return {
        checkedKeys:[], // 選択した部門IDを保存します
        expandedKeysss:[],//拡張ノード
        userId:"", // ユーザーIDを保存します
        model:{}, // SysUserDepartsVOテーブルを保存します
        userDepartModel:{userId:'',departIdList:[]}, // ユーザーIDの1対多の部門情報を格納する対象
        departList:[], // 部門情報を保存します
        modalWidth:400,
        departTree:[],
        title:"操作",
        visible: false,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        headers:{},
        form:this.$form.createForm(this),
        url: {
          userId:"/sys/user/generateUserId", // ユーザーを追加するときに生成されるURLを紹介します
        },
      }
    },
    methods: {
      add (checkedDepartKeys,userId) {
        this.checkedKeys = checkedDepartKeys;
        this.userId = userId;
        this.edit({});
      },
      edit (record) {
        this.departList = [];
        this.queryDepartTree();
        this.form.resetFields();
        this.visible = true;
        this.model = Object.assign({}, record);
        let filedsVal = pick(this.model,'id','userId','departIdList');
        this.$nextTick(() => {
          this.form.setFieldsValue(filedsVal);
        });
      },
      close () {
        this.$emit('close');
        this.visible = false;
        this.departList = [];
        this.checkedKeys = [];
      },
      handleSubmit () {
        const that = this;
        // フォームの検証をトリガーする
        this.form.validateFields((err) => {
          if (!err) {
            that.confirmLoading = true;
            if(this.userId == null){
              getAction(this.url.userId).then((res)=>{
                if(res.success){
                  let formData = {userId:res.result,
                  departIdList:this.departList}
                  console.log(formData)
                  that.$emit('ok', formData);
                }
              }).finally(() => {
                that.departList = [];
                that.confirmLoading = false;
                that.close();
              })
            }else {
              let formData = {userId:this.userId,
                departIdList:this.departList}
              console.log(formData)
              that.departList = [];
              that.$emit('ok', formData);
              that.confirmLoading = false;
              that.close();
            }
          }
        })
      },
      handleCancel () {
        this.close()
      },

      // 部門を選択するときに使用されるAPI
      onCheck(checkedKeys, info){
        this.departList = [];
        this.checkedKeys = checkedKeys.checked;
        let checkedNodes = info.checkedNodes;
        for (let i = 0; i < checkedNodes.length; i++) {
          let de = checkedNodes[i].data.props;
          let depart = {key:"",value:"",title:""};
          depart.key = de.value;
          depart.value = de.value;
          depart.title = de.title;
          this.departList.push(depart);
        }
        console.log('onCheck', checkedKeys, info);
      },
      queryDepartTree(){
        queryIdTree().then((res)=>{
          if(res.success){
            this.departTree = res.result;
            if(this.checkedKeys&&this.checkedKeys.length >0){
              let treekey=[];
              let arr=res.result;
              if(arr&&arr.length>0){
                arr.forEach(item => {
                  treekey.push(item.key);
             /*     if(item.children&&item.children.length>0){
                    item.children.forEach(item1 => {
                      treekey.push(item1.key);
                    })
                  }*/
                })
                this.expandedKeysss = treekey
              }
            }
          }
        })
      },
      onExpand(expandedKeys){
        this.expandedKeysss = expandedKeys;
      },
      modalFormOk(){

      }
      },
  }
</script>

<style scoped>
  .ant-table-tbody .ant-table-row td{
    padding-top:10px;
    padding-bottom:10px;
  }
</style>