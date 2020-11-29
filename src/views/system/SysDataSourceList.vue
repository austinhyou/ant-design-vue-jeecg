<template>
  <a-card :bordered="false">

    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="8">
            <a-form-item label="データソース名">
              <a-input placeholder="データソース名を入力してください" v-model="queryParam.name"/>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <a-form-item label="データベースタイプ">
              <j-dict-select-tag v-model="queryParam.dbType" placeholder="データベースの種類を選択してください" dict-code="database_type"/>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">クエリ</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">リセット</a-button>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作ボタンエリア -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">追加</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('マルチデータソース管理')">エクスポート</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">インポート</a-button>
      </a-upload>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete"/>
            削除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> バッチ操作
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </div>

    <!-- テーブルエリア-begin -->
    <div>

      <a-alert type="info" showIcon style="margin-bottom: 16px;">
        <template slot="message">
          <span>選択された</span>
          <a style="font-weight: 600;padding: 0 4px;">{{ selectedRowKeys.length }}</a>
          <span>項目</span>
          <a style="margin-left: 24px" @click="onClearSelected">クリア</a>
        </template>
      </a-alert>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">編集</a>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">もっと <a-icon type="down"/></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="削除を確認しますか？" @confirm="() => handleDelete(record.id)">
                  <a>削除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>
    <!-- テーブルエリア-end -->

    <!-- フォームエリア -->
    <sys-data-source-modal ref="modalForm" @ok="modalFormOk"/>

  </a-card>
</template>

<script>
  import JEllipsis from '@/components/jeecg/JEllipsis'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SysDataSourceModal from './modules/SysDataSourceModal'

  export default {
    name: 'SysDataSourceList',
    mixins: [JeecgListMixin],
    components: { JEllipsis, SysDataSourceModal },
    data() {
      let ellipsis = (v, l = 20) => (<j-ellipsis value={v} length={l}/>)
      return {
        description: 'マルチデータソース管理管理ページ',
        // トップ
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: (t, r, index) => index + 1
          },
          {
            title: 'データソースエンコーディング',
            align: 'center',
            dataIndex: 'code'
          },
          {
            title: 'データソース名',
            align: 'center',
            dataIndex: 'name'
          },
          {
            title: 'データベースタイプ',
            align: 'center',
            dataIndex: 'dbType_dictText'
          },
          {
            title: 'ドライブクラス',
            align: 'center',
            dataIndex: 'dbDriver',
            customRender: (t) => ellipsis(t)
          },
          {
            title: 'データソースアドレス',
            align: 'center',
            dataIndex: 'dbUrl',
            customRender: (t) => ellipsis(t)
          },
          {
            title: 'データベース名',
            align: 'center',
            dataIndex: 'dbName'
          },
          {
            title: 'ユーザー名',
            align: 'center',
            dataIndex: 'dbUsername'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: '/sys/dataSource/list',
          delete: '/sys/dataSource/delete',
          deleteBatch: '/sys/dataSource/deleteBatch',
          exportXlsUrl: 'sys/dataSource/exportXls',
          importExcelUrl: 'sys/dataSource/importExcel',
        },
      }
    },
    computed: {
      importExcelUrl() {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },
    methods: {}
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>