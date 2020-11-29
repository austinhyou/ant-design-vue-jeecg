<template>
  <a-card :bordered="false">

    <!-- 左パネル -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="12">
          <a-col :md="7" :sm="8">
            <a-form-item label="辞書名" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
              <a-input placeholder="辞書名を入力してください" v-model="queryParam.dictName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="7" :sm="8">
            <a-form-item label="辞書番号" :labelCol="{span: 6}" :wrapperCol="{span: 14, offset: 1}">
              <a-input placeholder="辞書番号を入力してください" v-model="queryParam.dictCode"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="7" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">クエリ</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>

      <div class="table-operator" style="border-top: 5px">
        <a-button @click="handleAdd" type="primary" icon="plus">追加</a-button>
        <a-button type="primary" icon="download" @click="handleExportXls('辞書情報')">エクスポート</a-button>
        <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
          <a-button type="primary" icon="import">インポート</a-button>
        </a-upload>
        <a-button type="primary" icon="sync" @click="refleshCache()">キャッシュを更新</a-button>

        <a-button type="primary" icon="hdd" @click="openDeleteList">ごみ箱</a-button>
      </div>

      <a-table
        ref="table"
        rowKey="id"
        size="middle"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange">
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">
            <a-icon type="edit"/>
            編集
          </a>
          <a-divider type="vertical"/>
          <a @click="editDictItem(record)"><a-icon type="setting"/> 辞書構成</a>
          <a-divider type="vertical"/>
          <a-popconfirm title="削除を確認しますか？" @confirm="() =>handleDelete(record.id)">
            <a>削除</a>
          </a-popconfirm>
        </span>
      </a-table>

    </div>
    <dict-modal ref="modalForm" @ok="modalFormOk"></dict-modal>  <!-- 辞書タイプ -->
    <dict-item-list ref="dictItemList"></dict-item-list>
    <dict-delete-list ref="dictDeleteList" @refresh="() =>loadData()"></dict-delete-list>
  </a-card>
</template>

<script>
  import { filterObj } from '@/utils/util';
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import DictModal from './modules/DictModal'
  import DictItemList from './DictItemList'
  import DictDeleteList from './DictDeleteList'
  import { getAction } from '@/api/manage'
  import { UI_CACHE_DB_DICT_DATA } from "@/store/mutation-types"
  import Vue from 'vue'

  export default {
    name: "DictList",
    mixins:[JeecgListMixin],
    components: {DictModal, DictItemList,DictDeleteList},
    data() {
      return {
        description: 'これはデータ辞書のページです',
        visible: false,
        // クエリ条件
        queryParam: {
          dictCode: "",
          dictName: "",
        },
        // トップ
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 120,
            align: "center",
            customRender: function (t, r, index) {
              return parseInt(index) + 1;
            }
          },
          {
            title: '辞書名',
            align: "left",
            dataIndex: 'dictName',
          },
          {
            title: '辞書番号',
            align: "left",
            dataIndex: 'dictCode',
          },
          {
            title: '説明',
            align: "left",
            dataIndex: 'description',
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: "center",
            scopedSlots: {customRender: 'action'},
          }
        ],
        dict: "",
        labelCol: {
          xs: {span: 8},
          sm: {span: 5},
        },
        wrapperCol: {
          xs: {span: 16},
          sm: {span: 19},
        },
        url: {
          list: "/sys/dict/list",
          delete: "/sys/dict/delete",
          exportXlsUrl: "sys/dict/exportXls",
          importExcelUrl: "sys/dict/importExcel",
          refleshCache: "sys/dict/refleshCache",
          queryAllDictItems: "sys/dict/queryAllDictItems",
        },
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {
      getQueryParams() {
        var param = Object.assign({}, this.queryParam, this.isorter);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        if (this.superQueryParams) {
          param['superQueryParams'] = encodeURI(this.superQueryParams)
          param['superQueryMatchType'] = this.superQueryMatchType
        }
        return filterObj(param);
      },
      //選択をキャンセル
      cancelDict() {
        this.dict = "";
        this.visible = false;
        this.loadData();
      },
      //辞書データの編集
      editDictItem(record) {
        this.$refs.dictItemList.edit(record);
      },
      // 辞書タイプ検索ボックスの内容をリセットする
      searchReset() {
        var that = this;
        that.queryParam.dictName = "";
        that.queryParam.dictCode = "";
        that.loadData(this.ipagination.current);
      },
      openDeleteList(){
        this.$refs.dictDeleteList.show()
      },
      refleshCache(){
        getAction(this.url.refleshCache).then((res) => {
          if (res.success) {
            //キャッシュをリロード
            getAction(this.url.queryAllDictItems).then((res) => {
              if (res.success) {
                Vue.ls.remove(UI_CACHE_DB_DICT_DATA)
                Vue.ls.set(UI_CACHE_DB_DICT_DATA, res.result, 7 * 24 * 60 * 60 * 1000)
              }
            })
            this.$message.success("キャッシュの更新が完了しました");
          }
        }).catch(e=>{
          this.$message.warn("キャッシュの更新に失敗しました");
          console.log("更新に失敗しました",e)
        })
      }
    },
    watch: {
      openKeys(val) {
        console.log('openKeys', val)
      },
    },
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>