import alarmComponent from '@/views/orderManage/UnusualVehicleStandby/alarmComponent/index.vue';
import newLabel from '@/views/orderManage/UnusualVehicleStandby/newLabel/index.vue';
import processingDetailsRecord from '@/views/orderManage/UnusualVehicleStandby/processingDetailsRecord/index.vue';
export default {
    name:'offlineEquipmentTable',
    props: ['windowOutHeight'],
    components:{
        alarmComponent,
        newLabel,
        processingDetailsRecord
    },
    data(){
        return {
            listData: [{
                index:1,
                toDoNum:'YC2018122800005',
                AbnormalCauses:'2018-12-27 10:30，停车超时（8天12小时25分钟）',
                vechicleSituation:'2018-12-28 10:30:35，离线（5天12小时25分钟）',
                currentState:'2018-12-28 10:30:35，离线（5天12小时25分钟）',
                stopCarSituation:'2018-12-28 10:30:35，离线（5天12小时25分钟）',
                generationtime:'2018-12-28 10:30:35',
                AffiliatedCompany:'中厚公司',
                VehicleLabels:['有保险','已结清'],
                Handler:'小明',
                LatestProcessingDetails:"【小智-派单维护】2018/12/28 09:50:25已派单-维修",
                handlerTime:'2019-03-25 10:00:00',
                handlerType:'待办关闭',
                equipmentTime:'2019-01-03',
                equipmentInfo:'无线WH39173251336'
            }],//列表数据
            filters: {
                domSearch: [{
                    select: ['toDoNum'],
                    content: '',
                    startDate: '',
                }], //查询框
                isdelete: '0',
            },
            formDialogTableVisible: false,
            listLoading: false,
            // 推动给客户
            pushToCustomersVisible:false,
            openMore:false,//打开更多
            pushInstructions:'',
            //处理详情（时间轴线）
            activities: [{
                    name: '万网-小张',
                    timestamp: '2018-12-29 10:30:35',
                    currentNode:'【派单维护】',
                    currentState:'已派单-维修'
                },
                {
                    name: '万网-小张',
                    timestamp: '2018-12-29 10:30:35',
                    currentNode:'【需客户帮助处理】',
                    currentState:'无法联系到车主，需帮忙联系'
                },
                {
                    name: '万网-小张',
                    timestamp: '2018-12-29 10:30:35',
                    currentNode:'【派单维护】',
                    currentState:'已派单-维修'
               }
            ],

        }
    },
    methods:{
        // 添加查询条件
        addSelect() {
            this.filters.domSearch.push({
                select: [],
                content: ''
            });
        },
        // 移除查询条件
        removeSelect(index) {
            this.filters.domSearch.splice(index, 1); //从当前index位置开始，删除一项
        },
        //搜索按钮——模糊查询
        handleQuerySelect() {
            let para = {
                page: this.currentPage,
                limit: this.pageSize,
                domSearch: this.filters.domSearch,
            };
            if (this.filters.domSearch[0].select.length == 0) {
                this.$message.error('请选择查询条件！');
                return;
            }
            this.listLoading = true;
            // getVehTypeListSelect(para).then((res) => {
            //     this.total = res.data.data.total;
            //     this.listData = res.data.data.records;
            //     this.listLoading = false;
            // }).catch((error) => {
            //     this.listLoading = false;
            // });
        },
        // 有效无效颜色切换
        tableRowClassName(row, index) {
            if (row.isdelete == 1) {
                return 'warning-row';
            }
            return '';
        },
         // 排序
         sortChange(col, prop, order) {
            let para = {
                prop: col.prop,
                order: col.order.substring(0, col.order.length - 6),
            }
        },
        handleNote(index){
            if(index==2){
                this.followUpProcessVisible=true;
            }
            if(index==3){
                this.closeToDoVisible=true;
            }
            if(index==6){
                this.taskToDoVisible=true;
            }
        },
        //打开弹框--推动给客户
        pushToCustomers(index){
            this.pushToCustomersVisible=true;
            console.log(index,"index")
        },
        //展开详情
        formDetailHandle(index){
            this.formDialogTableVisible=true;
            console.log(index,"index")
        },
        
        
    },
    mounted(){
        
    },
    created(){
        
    }
}