import invoiceDetail from './invoice-detail/index.vue'
import { mapActions, mapState } from 'vuex'

export default {
    name: "putInStorageInvoices",
    data () {
        return {
            activeNames: [0]
        }
    },
    computed: {
        ...mapState({
            storageInvoice: state => state.storage.data
        })
    },
    components: {
        invoiceDetail
    },
    methods: {
        ...mapActions(['setPutInData']),
        submit (index) {
            this.storageInvoice.listReceipt.splice(index, 1)
            if (!this.storageInvoice.listReceipt.length) {
                this.setPutInData({})
                this.$router.push('/stockManage/putInStorage')
            }
        }
    },
    mounted () {
        if (!this.storageInvoice || !this.storageInvoice.listReceipt) {
            this.$message.warning('请新增入库单')
            this.$router.push('/stockManage/putInStorage')
        }
    }
}