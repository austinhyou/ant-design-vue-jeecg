<template>
  <a-card :bordered="false">

    <!-- 操作ボタンエリア -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">追加</a-button>
      <a-button
        @click="batchDel"
        v-if="selectedRowKeys.length > 0"
        ghost
        type="primary"
        icon="delete">バッチ削除
      </a-button>
    </div>

    <!-- テーブルエリア-begin -->
    <div>

      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>選択された&nbsp;<a style="font-weight: 600">{{
        selectedRowKeys.length }}</a>項目&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">クリア</a>
      </div>

      <a-table
        :columns="columns"
        size="middle"
        :pagination="false"
        :dataSource="dataSource"
        :loading="loading"
        @expand="expandSubmenu"
        :expandedRowKeys="expandedRowKeys"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @expandedRowsChange="handleExpandedRowsChange">

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">編集</a>

          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">
              もっと <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">詳細</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="handleAddSub(record)">部下を追加</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="handleDataRule(record)">データルール</a>
              </a-menu-item>

              <a-menu-item>
                <a-popconfirm title="削除を確認しますか？" @confirm="() => handleDelete(record.id)">
                  <a>削除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
        <!-- 長い文字列の切り捨ての省略形の表示 -->
        <span slot="url" slot-scope="text">
          <j-ellipsis :value="text" :length="25"/>
        </span>
        <!-- 長い文字列の切り捨ての省略形の表示-->
        <span slot="component" slot-scope="text">
          <j-ellipsis :value="text"/>
        </span>
      </a-table>

    </div>
    <!-- テーブルエリア-end -->

    <permission-modal ref="modalForm" @ok="modalFormOk"></permission-modal>
    <permission-data-rule-list ref="PermissionDataRuleList" @ok="modalFormOk"></permission-data-rule-list>

  </a-card>
</template>

<script>
  import PermissionModal from './modules/PermissionModal'
  import { getSystemMenuList, getSystemSubmenu, getSystemSubmenuBatch } from '@/api/api'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import PermissionDataRuleList from './PermissionDataRuleList'
  import JEllipsis from '@/components/jeecg/JEllipsis'

  const columns = [
    {
      title: 'メニュー名',
      dataIndex: 'name',
      key: 'name'
    }, {
      title: 'メニュータイプ',
      dataIndex: 'menuType',
      key: 'menuType',
      customRender: function(text) {
        if (text == 0) {
          return 'メニュー'
        } else if (text == 1) {
          return 'メニュー'
        } else if (text == 2) {
          return 'ボタン/許可'
        } else {
          return text
        }
      }
    },/*{
      title: '許可コード',
      dataIndex: 'perms',
      key: 'permissionCode',
    },*/{
      title: 'icon',
      dataIndex: 'icon',
      key: 'icon'
    },
    {
      title: 'コンポーネント',
      dataIndex: 'component',
      key: 'component',
      scopedSlots: { customRender: 'component' }
    },
    {
      title: 'パス',
      dataIndex: 'url',
      key: 'url',
      scopedSlots: { customRender: 'url' }
    },
    {
      title: 'ソート',
      dataIndex: 'sortNo',
      key: 'sortNo'
    },
    {
      title: '操作',
      dataIndex: 'action',
      scopedSlots: { customRender: 'action' },
      align: 'center',
      width: 150
    }
  ]

  export default {
    name: 'PermissionListAsync',
    mixins: [JeecgListMixin],
    components: {
      PermissionDataRuleList,
      PermissionModal,
      JEllipsis
    },
    data() {
      return {
        description: 'これはメニュー管理ページです',
        // トップ
        columns: columns,
        loading: false,
        // 拡張された行、制御された属性
        expandedRowKeys: [],
        url: {
          list: '/sys/permission/list',
          delete: '/sys/permission/delete',
          deleteBatch: '/sys/permission/deleteBatch'
        }
      }
    },
    methods: {
      loadData() {
        this.loading = true
        getSystemMenuList().then((res) => {
          if (res.success) {
            this.dataSource = res.result
            return this.loadDataByExpandedRows(this.dataSource)
          }
        }).finally(()=>{
          this.loading = false
        })
      },
      expandSubmenu(expanded, record){
        if (expanded && (!record.children || record.children.length === 0)) {
          getSystemSubmenu({parentId:record.id}).then((res) => {
            if (res.success) {
              record.children = res.result
            }
          })
        }
      },
      // 拡張された行に基づいてデータを照会します（保存後に更新されたときに子のデータを非同期にロードするために使用されます）
      loadDataByExpandedRows(dataList) {
        if (this.expandedRowKeys.length > 0) {
          return getSystemSubmenuBatch({ parentIds: this.expandedRowKeys.join(',') }).then((res) => {
            if (res.success) {
              let childrenMap = res.result
              let fn = (list) => {
                list.forEach(data => {
                  if (this.expandedRowKeys.includes(data.id)) {
                    data.children = childrenMap[data.id]
                    fn(data.children)
                  }
                })
              }
              fn(dataList)
            }
          })
        } else {
          return Promise.resolve()
        }
      },
      // オープンデータルールの編集
      handleDataRule(record) {
        this.$refs.PermissionDataRuleList.edit(record)
      },
      handleAddSub(record) {
        this.$refs.modalForm.title = "サブメニューを追加";
        this.$refs.modalForm.localMenuType = 1;
        this.$refs.modalForm.disableSubmit = false;
        this.$refs.modalForm.edit({status:'1',permsType:'1',route:true,'parentId':record.id});
      },
      handleExpandedRowsChange(expandedRows) {
        this.expandedRowKeys = expandedRows
      },
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>