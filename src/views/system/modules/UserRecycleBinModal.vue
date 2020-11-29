<template>
  <a-modal
    :width="1000"
    :title="title"
    :visible="innerVisible"
    @cancel="handleCancel"
    cancelText="クローズ"
    :okButtonProps="{style:{display:'none'}}"
  >
    <a-alert type="info" showIcon style="margin-bottom: 16px;">
      <template slot="message">
        <span>選択された</span>
        <a style="font-weight: 600;padding: 0 4px;">{{ selectedRowKeys.length }}</a>
        <span>項目</span>
        <template v-if="selectedRowKeys.length>0">
          <a-divider type="vertical"/>
          <a @click="handleClearSelection">選択クリア</a>
          <a-divider type="vertical"/>
          <a @click="handleRevertBatch">バッチ復元</a>
          <a-divider type="vertical"/>
          <a @click="handleDeleteBatch">バッチ削除</a>
        </template>
      </template>
    </a-alert>

    <a-table
      ref="table"
      rowKey="id"
      size="middle"
      bordered
      :columns="columns"
      :loading="loading"
      :dataSource="dataSource"
      :pagination="false"
      :rowSelection="{selectedRowKeys, onChange: handleTableSelectChange}"
    >

      <!-- 顔写真を表示する -->
      <template slot="avatarslot" slot-scope="text, record, index">
        <div class="anty-img-wrap">
          <a-avatar shape="square" :src="url.getAvatar(record.avatar)" icon="user"/>
        </div>
      </template>

      <span slot="action" slot-scope="text, record">
        <a @click="handleRevert([record.id])"><a-icon type="redo"/> ユーザーを復元</a>
        <a-divider type="vertical"/>
        <a @click="handleDelete([record.id])"><a-icon type="delete"/> 完全に削除します</a>
      </span>
    </a-table>

  </a-modal>
</template>

<script>
  import { putAction,deleteAction,getFileAccessHttpUrl } from "@/api/manage"

  // 高度にカプセル化されたリクエストの場合は、superRequest.call（this、{}）を使用して呼び出してください
  function superRequest(options) {
    this.loading = !!options.loading
    options.promise.then(res => {
      if (res.success && typeof options.success === 'function') {
        options.success(res)
      } else {
        throw new Error(res.message)
      }
    }).catch(e => {
      console.error('削除されたユーザーのクエリに失敗しました：', e)
      this.$message.warning('削除されたユーザーのクエリに失敗しました：' + (e.message || e))
    }).finally(() => {
      this.loading = false
    })
  }

  export default {
    name: 'UserRecycleBinModal',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
    },
    data() {
      return {
        title: 'ユーザーリサイクル',
        loading: false,
        innerVisible: false,
        selectedRowKeys: [],
        dataSource: [],
        columns: [
          { title: '#', align: 'center', key: 'rowIndex', width: 80, customRender: (t, r, i) => i + 1 },
          { title: 'アカウント', align: 'center', dataIndex: 'username' },
          { title: '名前', align: 'center', dataIndex: 'realname', },
          { title: '顔写真', align: 'center', dataIndex: 'avatar', scopedSlots: { customRender: 'avatarslot' } },
          { title: '部門', align: 'center', dataIndex: 'orgCode' },
          { title: '操作', align: 'center', dataIndex: 'action', width: 200, scopedSlots: { customRender: 'action' } }
        ],
        url: {
          getAvatar: (path) => getFileAccessHttpUrl(`${path}`),
          // ごみ箱操作。get=リストを取得します。put=取得します。delete=完全に削除します。
          recycleBin: '/sys/user/recycleBin',
          putRecycleBin: '/sys/user/putRecycleBin',
          deleteRecycleBin: '/sys/user/deleteRecycleBin',
        },
      }
    },
    watch: {
      visible: {
        immediate: true,
        handler(val) {
          if (val) {
            this.loadData()
          }
          this.innerVisible = val
        }
      },
      innerVisible(val) {
        this.$emit('update:visible', val)
      },
    },
    methods: {
      loadData() {
        superRequest.call(this, {
          loading: true,
          promise: this.$http.get(this.url.recycleBin),
          success: res => this.dataSource = res.result
        })
      },
      handleOk() {
        this.loadData()
        this.$emit('ok')
      },
      handleCancel() {
        this.innerVisible = false
      },
      // ユーザーを復元
      handleRevert(userIds) {
        this.$confirm({
          title: 'ユーザーを復元',
          content: `これらの ${userIds.length} のユーザーを復元してもよろしいですか？`,
          centered: true,
          onOk: () => {
            putAction(this.url.putRecycleBin,{userIds:userIds.join(',')}).then((res)=>{
              if(res.success){
                this.handleOk()
                this.handleClearSelection()
                this.$message.success(`これらの ${userIds.length} のユーザーを正常に復元しました！`)
              }
            })
          }
        })
      },
      // ユーザーを完全に削除する
      handleDelete(userIds) {
        this.$confirm({
          title: 'ユーザーを完全に削除する',
          content: (<div>
            <p>これらの {userIds.length} のユーザーを完全に削除してもよろしいですか？</p>
            <p style="color:red;">注：完全に削除した後は復元できませんので、注意して操作してください。</p>
          </div>),
          centered: true,
          onOk: () => {
            var that = this;
            deleteAction(that.url.deleteRecycleBin, {userIds: userIds.join(',')}).then((res) => {
              if (res.success) {
                this.loadData()
                this.handleClearSelection()
                this.$message.success(`これらの ${userIds.length} のユーザーを完全に削除します`)
              } else {
                that.$message.warning(res.message);
              }
            });
          },
        })
      },
      handleRevertBatch() {
        this.handleRevert(this.selectedRowKeys)
      },
      handleDeleteBatch() {
        this.handleDelete(this.selectedRowKeys)
      },
      handleClearSelection() {
        this.handleTableSelectChange([], [])
      },
      handleTableSelectChange(selectedRowKeys, selectionRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectionRows = selectionRows
      },
    }
  }
</script>

<style lang="less" scoped></style>