import { getStoProdCount, getStorages,getStoragesList,getWarningList,getOutStock,getInoutStock} from './service'
import echarts from 'echarts';


export default {
    name: "insuranceCount",
    data () {
        return {
            dayjsTmp: dayjs,
            warningData: [],//预警统计
            stoProdData: {},//库存统计
            outStockData:[],//出库统计
            inOutStockData:[],//出入库趋势图
            todolist: [{task: '[待采购]四川区域的库管提交了要货量，请查看并采购！ ',date:'2018-12-13'},{task: '[待收货]库房向您调拨了一批设备，设备已入库，请注意签收！',date:'2018-12-13'},{task: '[待采购]四川区域的库管提交了要货量，请查看并采购！',date:'2018-12-13'},{task: '[待收货]库房向您调拨了一批设备，设备已入库，请注意签收！ ',date:'2018-12-13'},{task: '[待收货]你的小可爱，突然出现！ ',date:'2018-12-13'},{task: '[待收货]fighting！ ',date:'2018-12-13'}],
            messagelist:[{task: '由您采购给蒲琳库房的设备DB20181101235已被收货人签收！  ',date:'2018-12-13'},{task: 'XX库房的XXX型号的设备发出库存过高预警，请查看！  ',date:'2018-12-13'},{task: '由您反馈的有关单号为XXXXXXXXX的设备数量有偏差....  ',date:'2018-12-13'},{task: '做不完了',date:'2018-12-13'}],
            chartColumn: null,
            storages: [],//当前登录人的库房——级联树
            storagesTwo:[],//当前登录人的库房——下拉框
            selectForm:{
                storagename:[0],//库存统计-——级联选择器显示
                storagenameTwo:[],//预警统计
                storagenameThree:[0],//出库统计
                monthThree:dayjs().format('YYYY-MM'),//出库统计
                storagenameFour:[0],//出入库趋势图
                prodFour:'B',////出入库趋势图
            },
            props:{
                value:'id',
                label:'name',
                children:'children'
            },
            storagesFour:[{
              value: 'B',
              label: '全部物资'
            }, {
              value: 'P',
              label: '设备'
            }, {
              value: 'C',
              label: '卡'
            }, {
              value: 'A',
              label: '配件'
            }]
        }
    },
    components: {
    },
    computed: {
    },
    methods: {
        // 库存统计
        async stoProdCount (storageID) {
            try {
                const params = {
                    storageId: storageID == undefined ? 0 : storageID,
                }
                const {data} = await getStoProdCount(params)
                this.stoProdData = data.data
                this.chartColumnFuc();//加载图表
            } catch (e) {
            }
        },
        // 预警统计
        async warningCount (storageIDs) {
            try {
                const params = {
                    storageids : storageIDs
                }
                const {data} = await getWarningList(params)
                this.warningData = data.data;
                this.chartColumnFuc();//加载图表
            } catch (e) {
            }
        },
        // 出库统计
        async outStockCount (storageID,date) {
            try {
                const params = {
                    storageid : storageID == undefined ? 0 : storageID,
                    date:date
                }
                const {data} = await getOutStock(params)
                this.outStockData = data.data;
                this.chartColumnFuc();//加载图表
            } catch (e) {
            }
        },
        // 出入库趋势图统计
        async inOutStockCount (storageID,prod) {
            try {
                const params = {
                    storageid : storageID == undefined ? 0 : storageID,
                    type: prod == undefined ? 'B' : prod,
                }
                const {data} = await getInoutStock(params)
                this.inOutStockData = data.data;
                this.chartColumnFuc();//加载图表
            } catch (e) {
            }
        },
        // 页面跳转
        jump(name) {
            this.$router.push({
                name,
                params: {
                    policyno: this.policyno
                }
            })
        },
        // 初始化
        init () {
            // 库房级联
            getStorages().then((res) => {
                this.storages=this.getTreeData(res.data.data);// 调用递归方法，去除级联数据后将数据赋值给级联选择器
            });
            // 库房下拉
            getStoragesList().then((res) => {
                this.storagesTwo=res.data.data;
            });

            // 自适应
            const _this = this;//因为箭头函数会改变this指向，指向windows。所以先把this保存
            window.onresize = function() {
                _this.chartColumnOne.resize();  
                _this.chartColumnTwo.resize();  
                _this.chartColumnThree.resize();
                _this.chartColumnFour.resize();
            }
        },
        // 递归方法，处理级联选择器最后一级为空数组的bug
        getTreeData(data){
            for(var i=0;i<data.length;i++){
                if(data[i].children.length<1){
                    data[i].children=undefined;// children若为空数组，则将children设为undefined
                }else {
                    this.getTreeData(data[i].children);// children若不为空数组，则继续 递归调用 本方法
                }
            }
            return data;
        },
        // 级联选择器选择库房——库存统计
        handleChange(value) {
            this.stoProdCount(value[value.length-1]);
        },
        handleChangeThree(value) {//出库统计——选择库房
            this.outStockCount(value[value.length-1],dayjs(this.selectForm.monthThree).format('YYYY-MM'));
        },
        handleDateThree(value) {//出库统计——选择日期
            this.outStockCount(this.selectForm.storagenameThree[this.selectForm.storagenameThree.length-1],dayjs(value).format('YYYY-MM'));
        },
        handleChangeFour(value) {//初日库趋势图
            this.inOutStockCount(this.selectForm.storagenameFour[this.selectForm.storagenameFour.length-1],this.selectForm.prodFour);
        },
        // 库房下拉框多选时
        chooseStorages(value) {
            this.warningCount(value);
        },
        // 选择物资时
        chooseProd(value) {
            this.inOutStockCount(this.selectForm.storagenameFour[this.selectForm.storagenameFour.length-1],value);
        },

        /*初始化首页图表*/
        chartColumnFuc() {
            /*出入库趋势图 start*/
            this.chartColumnOne = echarts.init(document.getElementById('chartColumnOne'));
            if (this.inOutStockData.length != 0 && this.inOutStockData.length != 1) {              //有数据时
                var timescope = this.inOutStockData.map((item, index) => {
                    return item.createdate;
                });
                var instoData = this.inOutStockData.map((item, index) => {
                    return item.numberin;
                });
                var outstoData = this.inOutStockData.map((item, index) => {
                    return item.numberout;
                });
            }else{                           ///没数据时
                var timescope = [], instoData = [], outstoData = [];
            }
            

            this.chartColumnOne.setOption({
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    x: 40,
                    x2: 40,
                },
                legend: {
                    data: ['入库量', '出库量'],
                },
                calculable: true,
                dataZoom: {
                    show: true,
                    realtime: false,
                    // startValue: timescope.length == 0 ? dayjs(new Date()).subtract(7, 'day').format('YYYY-MM-DD') : dayjs(timescope[timescope.length-1]).subtract(7, 'day').format('YYYY-MM-DD') ,//开始日期-前7天
                    // endValue: timescope.length == 0 ? dayjs(new Date()).format('YYYY-MM-DD') : dayjs(timescope[timescope.length-1]).format('YYYY-MM-DD') 
                },
                xAxis: [{
                    type: 'category',
                    boundaryGap: true,
                    data: timescope
                }],
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                        name: '入库量',
                        type: 'line',
                        smooth: true,
                        data: instoData
                    },
                    {
                        name: '出库量',
                        type: 'line',
                        smooth: true,
                        data: outstoData
                    }
                ]
            });


            /*预警统计 start*/
            this.chartColumnTwo = echarts.init(document.getElementById('chartColumnTwo'));
            if (this.warningData != null) {              //有数据时
                var sourceData = [];
                this.warningData.forEach((item, index) => {
                    sourceData.push([item.modelname,item.minlimit,item.maxlimit,item.count]);
                })
                sourceData.unshift(['型号名称', '最低预警值', '最高预警值', '目前库存量']);//在数组首位添加标识
            }else{                           ///没数据时
                var sourceData = [];
            }
            
            this.chartColumnTwo.setOption({
                legend: {
                    data: ['型号名称', '最低预警值', '最高预警值', '目前库存量']
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                dataset: {
                    source:sourceData,
                },
                xAxis: {type: 'category'},
                yAxis: {},
                series: [
                    {type: 'bar',barGap:'0%',barWidth:15},
                    {type: 'bar',barWidth:15},
                    {type: 'bar',barWidth:15}
                ]
            });

            /*出库统计 start*/
            this.chartColumnThree = echarts.init(document.getElementById('chartColumnThree'));
            if (this.outStockData.length != 0) {              //有数据时
                var installData = this.outStockData[0].value,
                    lossData = this.outStockData[1].value,
                    allocationData = this.outStockData[2].value;
            }else{                           ///没数据时
                var installData = 0,
                    lossData = 0,
                    allocationData = 0;
            }
            
            this.chartColumnThree.setOption({
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                legend: {
                    bottom: 10,
                    left: 'center',
                    data:['安装量','损失量','调拨出库量']
                },
                series: [{
                    name: '出库统计',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data:[
                            {value:installData, name:'安装量'},
                            {value:lossData, name:'损失量'},
                            {value:allocationData, name:'调拨出库量'},
                    ],
                }]
            });

            /*库存统计 start*/
            this.chartColumnFour = echarts.init(document.getElementById('chartColumnFour'));
            if (this.outStockData.length != 0) {              //有数据时
                var value1 = this.stoProdData.wiredProdcutNum,
                    value2 = this.stoProdData.wifiProductNum,
                    value3 = this.stoProdData.cardNum,
                    value4 = this.stoProdData.partsNum;
            }else{                           ///没数据时
                var value1 = 0, value2 = 0, value3 = 0, value4 = 0;
            }
            
            this.chartColumnFour.setOption({
                tooltip : {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    left: 'right',
                    data: ['有线','无线','卡','配件']
                },
                series : [
                    {
                        name: '库存数量',
                        type: 'pie',
                        radius : '55%',
                        center: ['50%', '60%'],
                        data:[
                            {value:value1, name:'有线'},
                            {value:value2, name:'无线'},
                            {value:value3, name:'卡'},
                            {value:value4, name:'配件'},
                        ],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            });
        },
    },
    mounted () {
        this.init();
        this.stoProdCount();//获取库存统计数据
        this.warningCount();//预警
        this.outStockCount();//出库
        this.inOutStockCount();//出入库趋势图


        // this.chartColumnFuc();//加载图表
    }
}