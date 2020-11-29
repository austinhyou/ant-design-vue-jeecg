<template>
  <a-card :bordered="false">
    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :span="6">
            <a-form-item label="タイトル">
              <a-input placeholder="タイトルを入力してください" v-model="queryParam.titile"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="公開者">
              <a-input placeholder="公開者を入力してください" v-model="queryParam.sender"></a-input>
            </a-form-item>
          </a-col>

          <a-col :span="8" >
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">クエリ</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" @click="readAll" icon="book">すべて既読としてマーク</a-button>
    </div>

    <a-table
      ref="table"
      size="default"
      bordered
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      @change="handleTableChange">
      <span slot="action" slot-scope="text, record">
        <a @click="showAnnouncement(record)">表示</a>
      </span>
    </a-table>
    <show-announcement ref="ShowAnnouncement"></show-announcement>
    <dynamic-notice ref="showDynamNotice" :path="openPath" :formData="formData"/>
  </a-card>
</template>

<script>
  import { filterObj } from '@/utils/util'
  import { getAction,putAction } from '@/api/manage'
  import ShowAnnouncement from '@/components/tools/ShowAnnouncement'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import DynamicNotice from '../../components/tools/DynamicNotice'

  export default {
    name: "UserAnnouncementList",
    mixins: [JeecgListMixin],
    components: {
      DynamicNotice,
      ShowAnnouncement
    },
    data () {
      return {
        description: 'システム通知フォーム管理ページ',
        queryParam: {},
        columns: [{
          title: 'タイトル',
          align:"center",
          dataIndex: 'titile'
        },{
          title: 'メッセージタイプ',
          align: "center",
          dataIndex: 'msgCategory',
          customRender: function (text) {
            if (text == '1') {
              return "通知公告";
            } else if (text == "2") {
              return "システムメッセージ";
            } else {
              return text;
            }
          }
        },{
          title: '公開者',
          align:"center",
          dataIndex: 'sender'
        },{
          title: '公開時間',
          align:"center",
          dataIndex: 'sendTime'
        },{
          title: '優先度',
          align:"center",
          dataIndex: 'priority',
          customRender:function (text) {
            if(text=='L'){
              return "低";
            }else if(text=="M"){
              return "中";
            }else if(text=="H"){
              return "高";
            } else {
              return text;
            }
          }
        },{
          title: '読み取りステータス',
          align:"center",
          dataIndex: 'readFlag',
          customRender:function (text) {
            if(text=='0'){
              return "未読";
            }else if(text=="1"){
              return "既読";
            } else {
              return text;
            }
          }
        },{
          title: '操作',
          dataIndex: 'action',
          align:"center",
          scopedSlots: { customRender: 'action' },
        }],
		    url: {
          list: "/sys/sysAnnouncementSend/getMyAnnouncementSend",
          editCementSend:"sys/sysAnnouncementSend/editByAnntIdAndUserId",
          readAllMsg:"sys/sysAnnouncementSend/readAll",
        },
        loading:false,
        openPath:'',
        formData:''
      }
    },
    methods: {
      handleDetail: function(record){
        this.$refs.sysAnnouncementModal.detail(record);
        this.$refs.sysAnnouncementModal.title="表示";
      },
      showAnnouncement(record){
        putAction(this.url.editCementSend,{anntId:record.anntId}).then((res)=>{
          if(res.success){
            this.loadData();
            this.syncHeadNotic(record.anntId)
          }
        });
        if(record.openType==='component'){
          this.openPath = record.openPage;
          this.formData = {id:record.busId};
          this.$refs.showDynamNotice.detail();
        }else{
          this.$refs.ShowAnnouncement.detail(record);
        }
      },
      syncHeadNotic(anntId){
        getAction("sys/annountCement/syncNotic",{anntId:anntId})
      },
      readAll(){
        var that = this;
        that.$confirm({
          title:"確認操作",
          content:"すべて既読にするかどうか？",
          onOk: function(){
            putAction(that.url.readAllMsg).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.loadData();
                that.syncHeadNotic();
              }
            });
          }
        });
      },
    }
  }
</script>
<style scoped>
  .ant-card-body .table-operator{
    margin-bottom: 18px;
  }
  .anty-row-operator button{margin: 0 5px}
  .ant-btn-danger{background-color: #ffffff}z

  .ant-modal-cust-warp{height: 100%}
  .ant-modal-cust-warp .ant-modal-body{height:calc(100% - 110px) !important;overflow-y: auto}
  .ant-modal-cust-warp .ant-modal-content{height:90% !important;overflow-y: hidden}
</style>