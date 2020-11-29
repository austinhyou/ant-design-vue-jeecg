<template>
  <a-card :bordered="false">

    <!-- クエリエリア -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="8">
            <a-form-item label="ルール名">
              <a-input placeholder="ルール名を入力してください" v-model="queryParam.ruleName"/>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="ルールコード">
              <a-input placeholder="ルールコードを入力してください" v-model="queryParam.ruleCode"/>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
          </template>
          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">クエリ</a-button>
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

    <!-- 操作ボタンエリア -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">追加</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('エンコーディング検証ルール')">エクスポート</a-button>
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
    <a-alert type="info" showIcon style="margin-bottom: 16px;">
      <template slot="message">
        <span>選択された</span>
        <a style="font-weight: 600;padding: 0 4px;">{{ selectedRowKeys.length }}</a>
        <span>項目</span>
        <template v-if="selectedRowKeys.length>0">
          <a-divider type="vertical"/>
          <a @click="onClearSelected">クリア</a>
        </template>
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

      <template slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">編集</a>
        <a-divider type="vertical"/>
        <a @click="handleTest(record)">機能テスト</a>
        <a-divider type="vertical"/>
        <a-dropdown>
          <a class="ant-dropdown-link">
            <span>もっと</span>
            <a-icon type="down"/>
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a-popconfirm title="削除を確認しますか？" @confirm="handleDelete(record.id)">削除</a-popconfirm>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>

    </a-table>
    <!-- テーブルエリア-end -->

    <!-- フォームエリア -->
    <sys-check-rule-modal ref="modalForm" @ok="modalFormOk"/>

    <sys-check-rule-test-modal ref="testModal"/>

  </a-card>
</template>

<script>
  import JEllipsis from '@/components/jeecg/JEllipsis'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SysCheckRuleModal from './modules/SysCheckRuleModal'
  import SysCheckRuleTestModal from './modules/SysCheckRuleTestModal'

  export default {
    name: 'SysCheckRuleList',
    mixins: [JeecgListMixin],
    components: { SysCheckRuleModal, SysCheckRuleTestModal, JEllipsis },
    data() {
      return {
        description: 'エンコーディング検証ルール管理页面',
        // トップ
        columns: [
          {
            title: '#',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: (t, r, i) => i + 1
          },
          {
            title: 'ルール名',
            align: 'center',
            dataIndex: 'ruleName'
          },
          {
            title: 'ルールコード',
            align: 'center',
            dataIndex: 'ruleCode'
          },
          {
            title: 'ルール説明',
            align: 'center',
            dataIndex: 'ruleDescription',
            customRender: (t) => (<j-ellipsis value={t} length={48}/>)
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: '/sys/checkRule/list',
          delete: '/sys/checkRule/delete',
          deleteBatch: '/sys/checkRule/deleteBatch',
          exportXlsUrl: 'sys/checkRule/exportXls',
          importExcelUrl: 'sys/checkRule/importExcel',
        },
      }
    },
    computed: {
      importExcelUrl: function () {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },
    methods: {
      handleTest(record) {
        this.$refs.testModal.open(record.ruleCode)
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>