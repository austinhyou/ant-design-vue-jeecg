<template>
  <a-card :bordered="false">
    <template v-if="this.departId">
      <a-spin :spinning="loading">
        <a-form>
          <a-form-item label='所有する権限'>
            <a-tree
              checkable
              @check="onCheck"
              :checkedKeys="checkedKeys"
              :treeData="treeData"
              @expand="onExpand"
              @select="onTreeNodeSelect"
              :selectedKeys="selectedKeys"
              :expandedKeys="expandedKeysss"
              :checkStrictly="checkStrictly"
              style="height:500px;overflow: auto;">
              <span slot="hasDatarule" slot-scope="{slotTitle,ruleFlag}">
                {{ slotTitle }}
                <a-icon v-if="ruleFlag" type="align-left" style="margin-left:5px;color: red;"></a-icon>
              </span>
            </a-tree>
          </a-form-item>
        </a-form>
      </a-spin>
      <div class="anty-form-btn">
        <a-dropdown style="float: left" :trigger="['click']" placement="topCenter">
          <a-menu slot="overlay">
            <!-- ツリーロジックを簡素化し、デフォルトのcheckStrictly false動作、つまりデフォルトの親子関連付けを使用します
            <a-menu-item key="1" @click="switchCheckStrictly(1)">親子リンク</a-menu-item>
            <a-menu-item key="2" @click="switchCheckStrictly(2)">リンクを解除する</a-menu-item>
            -->
            <a-menu-item key="3" @click="checkALL">すべてチェック</a-menu-item>
            <a-menu-item key="4" @click="cancelCheckALL">すべて選択解除</a-menu-item>
            <a-menu-item key="5" @click="expandAll">すべて展開</a-menu-item>
            <a-menu-item key="6" @click="closeAll">すべてをマージ</a-menu-item>
          </a-menu>
          <a-button>
            ツリー操作 <a-icon type="up" />
          </a-button>
        </a-dropdown>
        <a-button style="float: right" @click="handleSubmit" type="primary" htmlType="button" icon="form">保存</a-button>
      </div>
    </template>
    <a-card v-else :bordered="false" style="height:200px">
      <a-empty>
        <span slot="description"> 最初に部門を選択してください！ </span>
      </a-empty>
    </a-card>
    <depart-datarule-modal ref="datarule"/>
  </a-card>
</template>

<script>
  import {queryTreeListForRole,queryDepartPermission,saveDepartPermission} from '@/api/api'
  import DepartDataruleModal from './DepartDataruleModal'

  export default {
    name: 'DepartAuthModal',
    components: { DepartDataruleModal },
    data(){
      return {
        departId:"",
        treeData: [],
        defaultCheckedKeys:[],
        checkedKeys:[],
        halfCheckedKeys:[],
        expandedKeysss:[],
        allTreeKeys:[],
        autoExpandParent: true,
        checkStrictly: false,
        title:"部門権限の構成",
        visible: false,
        loading: false,
        selectedKeys:[]
      }
    },
    methods: {
      onTreeNodeSelect(id){
        if(id && id.length>0){
          this.selectedKeys = id
        }
        this.$refs.datarule.show(this.selectedKeys[0],this.departId)
      },
      onCheck (checkedKeys, { halfCheckedKeys }) {
        // 選択したものと半分選択したものを保存し、後で保存するときにマージして送信します
        this.checkedKeys = checkedKeys
        this.halfCheckedKeys = halfCheckedKeys
      },
      show(departId){
        this.departId=departId
        this.loadData();
      },
      close () {
        this.reset()
        this.$emit('close');
        this.visible = false;
      },
      onExpand(expandedKeys){
        this.expandedKeysss = expandedKeys;
        this.autoExpandParent = false
      },
      reset () {
        this.expandedKeysss = []
        this.checkedKeys = []
        this.defaultCheckedKeys = []
        this.loading = false
      },
      expandAll () {
        this.expandedKeysss = this.allTreeKeys
      },
      closeAll () {
        this.expandedKeysss = []
      },
      checkALL () {
        this.checkedKeys = this.allTreeKeys
      },
      cancelCheckALL () {
        this.checkedKeys = []
      },
      handleCancel () {
        this.close()
      },
      handleSubmit() {
        let that = this;
        if(!that.departId){
          this.$message.warning('クリックして部門を選択してください！')
        }
        let checkedKeys = [...that.checkedKeys, ...that.halfCheckedKeys]
        const permissionIds = checkedKeys.join(",")
        let params =  {
          departId:that.departId,
          permissionIds,
          lastpermissionIds:that.defaultCheckedKeys.join(","),
        };
        that.loading = true;
        saveDepartPermission(params).then((res)=>{
          if(res.success){
            that.$message.success(res.message);
            that.loading = false;
            that.loadData();
          }else {
            that.$message.error(res.message);
            that.loading = false;
          }
        })
      },
      convertTreeListToKeyLeafPairs(treeList, keyLeafPair = []) {
        for(const {key, isLeaf, children} of treeList) {
          keyLeafPair.push({key, isLeaf})
          if(children && children.length > 0) {
            this.convertTreeListToKeyLeafPairs(children, keyLeafPair)
          }
        }
        return keyLeafPair;
      },
      emptyCurrForm() {
        this.form.resetFields()
      },
      loadData(){
        this.loading = true;
        queryTreeListForRole().then((res) => {
          this.treeData = res.result.treeList
          this.allTreeKeys = res.result.ids
          const keyLeafPairs = this.convertTreeListToKeyLeafPairs(this.treeData)
          queryDepartPermission({departId:this.departId}).then((res)=>{
            // リーフノード、つまり選択したノードを除外するだけです
            // ツリーコンポーネントのcheckStrictlyがデフォルトでfalseの場合、子ノードが選択されると、親ノードが自動的に選択または半分選択されます
            // 何も行われていないときにフォームデータを送信するために、checkedKeysとhalfCheckedKeysを保存します
            const checkedKeys = [...res.result].filter(key => {
              const keyLeafPair = keyLeafPairs.filter(item => item.key === key)[0]
              return keyLeafPair && keyLeafPair.isLeaf
            })
            const halfCheckedKeys = [...res.result].filter(key => {
              const keyLeafPair = keyLeafPairs.filter(item => item.key === key)[0]
              return keyLeafPair && !keyLeafPair.isLeaf
            })
            this.checkedKeys = [...checkedKeys];
            this.halfCheckedKeys = [...halfCheckedKeys]
            this.defaultCheckedKeys = [...halfCheckedKeys, ...checkedKeys];
            this.expandedKeysss = this.allTreeKeys;
            this.loading = false;
          })
        })
      }
    },
  }
</script>

<style scoped>

</style>