<template>
  <a-card :bordered="false">
    <!--案内エリア-->
    <div>
      <a-tabs defaultActiveKey="1" @change="callback">
        <a-tab-pane tab="ログインログ" key="1"></a-tab-pane>
        <a-tab-pane tab="操作ログ" key="2"></a-tab-pane>
      </a-tabs>
    </div>

    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="8">
            <a-form-item label="検索ログ">
              <a-input placeholder="検索キーワードを入力してください" v-model="queryParam.keyWord"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="10">
            <a-form-item label="作成時間" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-range-picker
                style="width: 210px"
                v-model="queryParam.createTimeRange"
                format="YYYY-MM-DD"
                :placeholder="['開始時間', '終了時間']"
                @change="onDateChange"
                @ok="onDateOk"
              />
            </a-form-item>
          </a-col>
          <a-col :md="5" :sm="8" v-if="tabKey === '2'">
            <a-form-item label="操作タイプ" style="left: 10px">
              <j-dict-select-tag v-model="queryParam.operateType" placeholder="操作タイプを選択してください" dictCode="operate_type"/>
            </a-form-item>
          </a-col>

          <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="24" >
                <a-button type="primary"  style="left: 10px" @click="searchQuery" icon="search">クエリ</a-button>
                <a-button type="primary"  @click="searchReset" icon="reload" style="margin-left: 8px;left: 10px">リセット</a-button>
            </a-col>
          </span>

        </a-row>
      </a-form>
    </div>

    <!-- テーブルエリア-begin -->
    <a-table
      ref="table"
      size="middle"
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      @change="handleTableChange">

      <div v-show="queryParam.logType==2" slot="expandedRowRender" slot-scope="record" style="margin: 0">
        <div style="margin-bottom: 5px"><a-badge status="success" style="vertical-align: middle;"/><span style="vertical-align: middle;">リクエスト方法:{{ record.method }}</span></div>
        <div><a-badge status="processing" style="vertical-align: middle;"/><span style="vertical-align: middle;">リクエストパラメータ:{{ record.requestParam }}</span></div>
      </div>
      <!-- 長い文字列の切り捨ての省略形の表示-->
      <span slot="logContent" slot-scope="text, record">
          <j-ellipsis :value="text" :length="40"/>
        </span>
    </a-table>
    <!-- テーブルエリア-end -->
  </a-card>
</template>

<script>
  import { filterObj } from '@/utils/util';
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JEllipsis from '@/components/jeecg/JEllipsis'

  export default {
    name: "LogList",
    mixins:[JeecgListMixin],
    components: {
      JEllipsis
    },
    data () {
      return {
        description: 'これはログ管理ページです',
        // クエリ条件
        queryParam: {
          ipInfo:'',
          createTimeRange:[],
          logType:'1',
          keyWord:'',
        },
        tabKey: "1",
        // トップ
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title: 'ログコンテンツ',
            align:"left",
            dataIndex: 'logContent',
            scopedSlots: { customRender: 'logContent' },
            sorter: true
          },
          {
            title: 'オペレーターID',
            dataIndex: 'userid',
            align:"center",
            sorter: true
          },
          {
            title: 'オペレーター名',
            dataIndex: 'username',
            align:"center",
            sorter: true
          },
          {
            title: 'IP',
            dataIndex: 'ip',
            align:"center",
            sorter: true
          },
          {
            title: '時間のかかる（ミリ秒）',
            dataIndex: 'costTime',
            align:"center",
            sorter: true
          },
          {
            title: 'ログタイプ',
            dataIndex: 'logType_dictText',
            /*customRender:function (text) {
              if(text==1){
                return "ログインログ";
              }else if(text==2){
                return "操作ログ";
              }else{
                return text;
              }
            },*/
            align:"center",
          },
          {
            title: '作成時間',
            dataIndex: 'createTime',
            align:"center",
            sorter: true
          }
        ],
        operateColumn:
        {
          title: '操作タイプ',
          dataIndex: 'operateType_dictText',
          align:"center",
        },
        labelCol: {
          xs: { span: 1 },
          sm: { span: 2 },
        },
        wrapperCol: {
          xs: { span: 10 },
          sm: { span: 16 },
        },
        url: {
          list: "/sys/log/list",
        },
      }
    },
    methods: {
      getQueryParams(){
        var param = Object.assign({}, this.queryParam,this.isorter);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        delete param.createTimeRange; // 時間パラメータはバックグラウンドに渡されません
        if (this.superQueryParams) {
          param['superQueryParams'] = encodeURI(this.superQueryParams)
          param['superQueryMatchType'] = this.superQueryMatchType
        }
        return filterObj(param);
      },

      // リセット
      searchReset(){
        var that = this;
        var logType = that.queryParam.logType;
        that.queryParam = {}; //クエリ領域のパラメータをクリアする
        that.queryParam.logType = logType;
        that.loadData(this.ipagination.current);
      },
      // ログタイプ
      callback(key){

        // 操作タイプ列を動的に追加
        if (key == 2) {
          this.tabKey = '2';
          this.columns.splice(7, 0, this.operateColumn);
        }else if(this.columns.length == 9)
        {
          this.tabKey = '1';
          this.columns.splice(7,1);
        }

        let that=this;
        that.queryParam.logType=key;
        that.loadData();
      },
      onDateChange: function (value, dateString) {
        console.log(dateString[0],dateString[1]);
        this.queryParam.createTime_begin=dateString[0];
        this.queryParam.createTime_end=dateString[1];
      },
      onDateOk(value) {
        console.log(value);
      },
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>