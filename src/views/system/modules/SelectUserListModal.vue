<template>
  <a-modal
    :title="title"
    :width="1200"
    :visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="クローズ">

    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="24">

          <a-col :span="6">
            <a-form-item label="アカウント">
              <a-input placeholder="アカウントを入力してください" v-model="queryParam.username"></a-input>
            </a-form-item>
          </a-col>

          <a-col :span="6">
            <a-form-item label="性別">
              <a-select v-model="queryParam.sex" placeholder="性別を選択してください">
                <a-select-option value="">性別クエリを選択してください</a-select-option>
                <a-select-option value="1">男性</a-select-option>
                <a-select-option value="2">女性</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>


          <template v-if="toggleSearchStatus">
            <a-col :span="6">
              <a-form-item label="メールアドレス">
                <a-input placeholder="メールアドレスを入力してください" v-model="queryParam.email"></a-input>
              </a-form-item>
            </a-col>

            <a-col :span="6">
              <a-form-item label="電話番号">
                <a-input placeholder="電話番号を入力してください" v-model="queryParam.phone"></a-input>
              </a-form-item>
            </a-col>

            <a-col :span="6">
              <a-form-item label="ステータス">
                <a-select v-model="queryParam.status" placeholder="ステータスを選択してください">
                  <a-select-option value="">ステータスを選択してください</a-select-option>
                  <a-select-option value="1">正常</a-select-option>
                  <a-select-option value="2">ロック解除</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </template>

          <a-col :span="6" >
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchByquery" icon="search">クエリ</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '畳む' : '展開する' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>
 <!--    update-begin author:kangxiaolin   date:20190921   for:システムは、複数選択が失敗したという通知をユーザーに送信します #513  -->
    <a-table
      ref="table"
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange,onSelect:onSelect}"
      @change="handleTableChange"
    >
<!--     update-end   author:kangxiaolin  date:20190921     for:システムは、複数選択が失敗したという通知をユーザーに送信します #513 -->
    </a-table>
  </a-modal>
</template>

<script>
  import { filterObj } from '@/utils/util';

  import { getUserList } from '@/api/api'

  export default {
    name: "SelectUserListModal",
    components: {
    },
    data () {
      return {
        title:"ユーザーを選択",
        queryParam: {},
        columns: [{
          title: 'ユーザーアカウント',
          align:"center",
          dataIndex: 'username',
          fixed:'left',
          width:200
        },{
          title: 'ユーザー名',
          align:"center",
          dataIndex: 'realname',
        },{
          title: '性別',
          align:"center",
          dataIndex: 'sex',
          customRender:function (text) {
            if(text==1){
              return "男";
            }else if(text==2){
              return "女";
            }else{
              return text;
            }
          }
        },{
          title: '電話番号',
          align:"center",
          dataIndex: 'phone'
        },{
          title: 'メールアドレス',
          align:"center",
          dataIndex: 'email'
        },{
          title: 'ステータス',
          align:"center",
          dataIndex: 'status',
          customRender:function (text) {
            if(text==1){
              return "正常";
            }else if(text==2){
              return "ロック";
            }else{
              return text;
            }
          }
        }],
        dataSource:[],
        ipagination:{
          current: 1,
          pageSize: 5,
          pageSizeOptions: ['5', '10', '20'],
          showTotal: (total, range) => {
            return range[0] + "-" + range[1] + " 合計" + total + "部"
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        isorter:{
          column: 'createTime',
          order: 'desc',
        },
        selectedRowKeys: [],
        selectionRows: [],
        visible:false,
        toggleSearchStatus:false,
      }
    },
    created() {
      this.loadData();
    },
    methods: {
      add (selectUser,userIds) {
        this.visible = true;
        this.edit(selectUser,userIds);
      },
      edit(selectUser,userIds){
        //コンソールエラー
        if(userIds&&userIds.length>0){
          this.selectedRowKeys = userIds.split(',');
        }else{
          this.selectedRowKeys = []
        }
        if(!selectUser){
          this.selectionRows=[]
        }else{
          var that=this;
          that.selectionRows=[];
          selectUser.forEach(function(record,index){
            console.log(record)
            that.selectionRows.push({id: that.selectedRowKeys[index],realname:record.label})
          })
          // this.selectionRows = selectUser;
        }
      },
      loadData (arg){
        if(arg===1){
          this.ipagination.current = 1;
        }
        let params = this.getQueryParams();//クエリ条件
        getUserList(params).then((res)=>{
          if(res.success){
            this.dataSource = res.result.records;
            this.ipagination.total = res.result.total;
          }
        })
      },
      getQueryParams(){
        let param = Object.assign({}, this.queryParam,this.isorter);
        param.field = this.getQueryField();
        //--update-begin----author:scott---date:20190818------for:新しいアナウンスを作成するときに特定のユーザーページめくりエラーを指定するSelectUserListModal #379----
        // param.current = this.ipagination.current;
        // param.pageSize = this.ipagination.pageSize;
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        //--update-end----author:scott---date:20190818------for:新しいアナウンスを作成するときに特定のユーザーページめくりエラーを指定するSelectUserListModal #379---
        return filterObj(param);
      },
      getQueryField(){
        let str = "id,";
        for(let a = 0;a<this.columns.length;a++){
          str+=","+this.columns[a].dataIndex;
        }
        return str;
      },
      //--update-begin----author:kangxiaolin---date:20190921------for:システムは、複数選択が失敗したという通知をユーザーに送信します #513----
      onSelectChange (selectedRowKeys) {
        this.selectedRowKeys = selectedRowKeys;
      },
      onSelect(record, selected){
        if(selected == true ){
          this.selectionRows.push(record);
        }else {
          this.selectionRows.forEach(function(item,index,arr){
            if(item.id == record.id) {
              arr.splice(index, 1);
            }
          })
        }
        //--update-end----author:kangxiaolin---date:20190921------for:システムは、複数選択が失敗したという通知をユーザーに送信します #513----
      },

      searchReset(){
        let that = this;
        Object.keys(that.queryParam).forEach(function(key){
          that.queryParam[key] = '';
        });
        that.loadData(1);
      },
      handleTableChange(pagination, filters, sorter){
        //TODO スクリーニング
        if (Object.keys(sorter).length>0){
          this.isorter.column = sorter.field;
          this.isorter.order = "ascend"==sorter.order?"asc":"desc"
        }
        this.ipagination = pagination;
        this.loadData();
      },
      handleCancel () {
        this.selectionRows = [];
        this.selectedRowKeys = [];
        this.visible = false;
      },
      handleOk () {
        this.$emit("choseUser",this.selectionRows);
        this.handleCancel();
      },
      searchByquery(){
        this.loadData(1);
      },
      handleToggleSearch(){
        this.toggleSearchStatus = !this.toggleSearchStatus;
      },
    }
  }
</script>
<style scoped>
  .ant-card-body .table-operator{
    margin-bottom: 18px;
  }

  .ant-table-tbody .ant-table-row td{
    padding-top:15px;
    padding-bottom:15px;
  }
  .anty-row-operator button{margin: 0 5px}
  .ant-btn-danger{background-color: #ffffff}

  .ant-modal-cust-warp{height: 100%}
  .ant-modal-cust-warp .ant-modal-body{height:calc(100% - 110px) !important;overflow-y: auto}
  .ant-modal-cust-warp .ant-modal-content{height:90% !important;overflow-y: hidden}

  .anty-img-wrap{height:25px;position: relative;}
  .anty-img-wrap > img{max-height:100%;}
</style>