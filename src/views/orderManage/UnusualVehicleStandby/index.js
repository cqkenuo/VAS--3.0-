
import newLabel from './newLabel/index.vue';
import processingDetailsRecord from './processingDetailsRecord/index.vue';
import alarmComponent from './alarmComponent/index.vue';
import { personalStandby } from './service.js';

export default {
    name: 'UnusualVehicleStandby',
    props: ['windowOutHeight'],
    components:{
        newLabel,
        processingDetailsRecord,
        alarmComponent
    },
    data() {
        return {
            listData: [{
                index:1,
                toDoNum:'YC2018122800005',
                AbnormalCauses:'2018-12-27 10:30，停车超时（8天12小时25分钟）',
                generationtime:'2018-12-28 10:30:35',
                AffiliatedCompany:'中厚公司',
                VehicleLabels:['有保险','已结清'],
                TaskHandler:'小明',
                LatestProcessingDetails:"【小智-派单维护】2018/12/28 09:50:25已派单-维修"
            }],//列表数据
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

            formDialogTableVisible: false,//详情页面弹框
            
            listLoading: false,
            //筛选条件（下拉框）
            filters: {
                domSearch: [{
                    select: ['toDoNum'],
                    content: '',
                    startDate: '',
                }], //查询框
                isdelete: '0',
            },
            openMore:false,//打开更多

            total: 0,
            currentPage: 1,
            pageSize: 15,
            //工具条---下拉
            options: [{
                value: '1',
                label: '全部待办'
              }, {
                value: '2',
                label: '交接过来的待办'
              }, {
                value: '3',
                label: '全部已办'
            }],
            valueTodo:'',
            Labels:[{
                value: '1',
                label: '添加其他标签'
            }],
            labelsValue:'',
            
            // 推动给客户
            pushToCustomersVisible:false,
            pushInstructions:'',
            // receiver:'',//微信接收人
            // receiverArray:[
            //     {
            //         value:0,
            //         label:'请选择微信接收人'
            //     },
            //     {
            //         value:1,
            //         label:'小甲'
            //     },
            //     {
            //         value:2,
            //         label:'小乙'
            //     }
            // ],
            //待办任务交接
            taskToDoVisible:false,
            taskList:[
                {
                    date:'2019/03/15',
                    name:'小甲',
                    address:"成都"
                }
            ],
            checked: true,
            //跟进处理
            followUpProcessVisible:false,
            handleDetailListVisible:false,//跟进处理详情记录
            show:true,
            handleClassify:'', //处理分类
            handleClassifyArray:[
                {
                    value:1,
                    label:'待观察'
                },
                {
                    value:2,
                    label:'跟进中'
                },
                {
                    value:3,
                    label:'需客户帮助处理'
                },
                {
                    value:4,
                    label:'其他'
                }
            ],
            handleRemarks:'',//处理备注
            closeToDoDetailListVisible:false,//处理详情记录
            //关闭代办
            closeToDoVisible:false,
            closeToDo:false,//是否永久关闭待办
            closeToDoRemarks:'',//关闭待办的原因
        }
    },
    methods: {
        getListData(){
        //     personalStandby(para).then((res)=>{
        //        console.log(res,"res")
        //        if(res.data.code==0){
        //            this.listData=res.data.data.records
        //        }
        //     })
        },
        // 添加查询条件
        addSelect() {
            this.filters.domSearch.push({
                select: [],
                content: ''
            });
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
        // 移除查询条件
        removeSelect(index) {
            this.filters.domSearch.splice(index, 1); //从当前index位置开始，删除一项
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
        //切换当前页
        handleCurrentChange(val) {
            this.currentPage = val;
            this.handleQuerySelect();
            // this.GetPositions();
        },
        //切换每页显示数量
        handleSizeChange(val) {
            this.pageSize = val;
            this.GetPositions();
        },
        //展开详情
        formDetailHandle(index){
            this.formDialogTableVisible=true;
            console.log(index,"index")
        },
        //获取列表
        GetPositions() {
            let para = {
                page: this.currentPage,
                limit: this.pageSize,
                // isdelete:this.filters.isdelete,
            };
            this.listLoading = true;
            // getVehTypeList(para).then((res) => {
            //     this.total = res.data.data.total;
            //     this.listData = res.data.data.records;
            //     this.listLoading = false;
            // }).catch((error) => {
            //     this.listLoading = false;
            // });
        },
        // 页面跳转
        jump(name) {
            this.$router.push({
                name,
                params: {
                    policyno: '1221212'
                }
            })
        },
        //打开弹框--推动给客户
        pushToCustomers(index){
            this.pushToCustomersVisible=true;
            console.log(index,"index")
        },
        handleNote(index){
            if(index==2){
                this.followUpProcessVisible=true;
            }
            if(index==3){
                this.closeToDoVisible=true;
            }
            if(index==5){
                this.taskToDoVisible=true;
            }
        }
    },
    created() {
        this.getListData();
    }
}