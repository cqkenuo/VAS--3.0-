import echarts from 'echarts'
import { getStockQuantityKpi, createDateDate, purchasePlanHistory, getPurchaseData, getStorages, submit, submitPurchaseQty } from './service'
import { getBarcodeCGHT, getPurchaseCascader, getSupplierList } from '../../purchaseContract/service'

const getOption = () => {
    return {
        tooltip: {
            trigger: 'axis',
                axisPointer: {
                type: 'cross',
                    crossStyle: {
                    color: '#999'
                }
            }
        },
        toolbox: {
            feature: {
                dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['line', 'bar']},
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        legend: {
            data: ['期初库存量', '期末库存量', '安装量'],
                padding: 5
        },
        grid: {
            top: '10%',
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: [],
                axisPointer: {
                    type: 'shadow'
                }
            }
        ],
            yAxis: [
        {
            type: 'value',
            name: '台',
            axisLabel: {
                formatter: '{value} 个'
            }
        }
    ],
        series: [
        {
            name: '期初库存量',
            type: 'bar',
            data: []
        },
        {
            name: '期末库存量',
            type: 'bar',
            data: []
        },
        {
            name: '安装量',
            type: 'line',
            data: []
        }
    ]
    }
};


export default {
    name: "purchasePlan",
    data () {
        return {
            options: createDateDate(),
            defaultProps: {
                children: 'children',
                label: 'storagename'
            },
            treeLoading: false,
            chartInstance: null,
            showHistory: false,
            // showDetail: false,
            historyList: [],
            historyTime: new Date().format('yyyy-MM'),
            historyLoading: false,
            currentDate: new Date().format('yyyy-MM-dd'),
            defaultExpandedKeys: [0],
            purchaseList: [],
            purchaseLoading: false,
            storageTree: [],
            storagePurchaseLoading: false,
            storagePurchaseList: [],
            storagePurchaseObj: {},
            currentNum: 0,
            addFormVisible: false,
            addForm: {
                dataList: []
            },
            addFormRules: {},
            editable: false,
            addLoading: false,
            typeListLoading: false,
            supplierLoading: false,
            supplierOptions: [],
            activeCollapse: [0],
            modelOptions: [],
            typeKeyValue: {
                A: '配件',
                C: 'SIM卡',
                P: '设备'
            }
        }
    },
    computed: {
        filterPurchaseList () {
            return _.filter(this.purchaseList, item => item.requestqty > 0)
        },
        isDisabled () {
            return Boolean(_.find(this.addForm.dataList, item => item.editable))
        }
    },
    watch: {
        showHistory (newValue) {
            if (newValue) {
                this.purchasePlanHistory()
            } else {
                this.getStockQuantityKpi()
            }
        }
    },
    methods: {
        typeFormatter (row) {
            if (this.typeKeyValue[row.modelcategory]) {
                return this.typeKeyValue[row.modelcategory]
            }
            return row.modelcategory
        },
        async handleNodeClick (storage) {
            if (!storage.id) {
                return
            }
            if (this.storagePurchaseObj[storage.id]) {
                this.storagePurchaseList = this.storagePurchaseObj[storage.id]
            }
        },
        tableRowClick (row) {
            _.forEach(this.storagePurchaseList, item => {
                item.isEdit = false
            })
            row.isEdit = true
        },
        changePurchaseNum (row) {
            if (row.parchasenum < 0) {
                row.parchasenum = 0
            }
            const num = row.parchasenum - this.currentNum
            _.forEach(this.purchaseList, item => {
                if (item.prodspec === row.modelspec) {
                    item.requestqty = item.requestqty + num
                }
            })
        },
        //日期格式化
        dateFormatter (row) {
            if (row.needdate) {
                return new Date(row.needdate).format('yyyy-MM-dd')
            } else {
                return ''
            }
        },
        async getStockQuantityKpi () {
            try {
                const params = {
                    time: new Date().format('yyyyMM')
                }
                const {data} = await getStockQuantityKpi(params)
                if (this.chartInstance) {
                    this.chartInstance.clear()
                }
                this.chartInstance = echarts.init(this.$refs.stockChart)
                const newOption = getOption()
                _.forEach(data.data, item => {
                    newOption.xAxis[0].data.push(item.yearmonth)
                    newOption.series[0].data.push(item.balanceInit)
                    newOption.series[1].data.push(item.balanceEnd)
                    newOption.series[2].data.push(item.installnum)
                })
                this.chartInstance.setOption(newOption)
            } catch (e) {
                console.log(e)
            }
        },
        //获取采购历史
        async purchasePlanHistory () {
            try {
                this.historyLoading = true
                const params = {
                    time: this.historyTime.split('-').join('')
                }
                const {data} = await purchasePlanHistory(params)
                this.historyList = data.data
                this.historyLoading = false
            } catch (e) {
                console.log(e)
                this.historyLoading = false
            }
        },
        //获取采购总量
        async getPurchaseData () {
            try {
                this.purchaseLoading = true
                const {data} = await getPurchaseData()
                this.purchaseList = data.data
                this.purchaseLoading = false
            } catch (e) {
                console.log(e)
                this.purchaseLoading = false
            }
        },
        //获取仓库
        async getStorages () {
            try {
                const {data} = await getStorages()
                // _.forEach(data.data, item => {
                //     this.storagePurchaseObj[item.id] = item.list
                // })
                this.setStorage(data.data)
                this.storageTree = data.data
            } catch (e) {
                console.log(e)
            }
        },
        setStorage (data) {
            _.forEach(data, item => {
                this.storagePurchaseObj[item.id] = item.list
                if (item.children && item.children.length) {
                    this.setStorage(item.children)
                }
            })
        },
        init () {
            this.getStockQuantityKpi()
            this.getPurchaseData()
            this.getStorages()
        },
        // 确认添加
        typeAddConfirm (index, item) {
            const ref = 'typeForm' + index
            this.$refs[ref][0].validate((valid) => {
                if (valid) {
                    // const modelNameSpan = item.typeForm.modelnameSpan.split(',')[0]
                    item.typeListData.push(item.typeForm);
                    // console.log(modelNameSpan, item.typeForm.qty)
                    this.typeAddCancel(item);
                    this.calculateAll(item);//计算总额
                }
            })
        },
        sumPurchase () {
            const obj = {}
            _.forEach(this.addForm.dataList, item => {
                _.forEach(item.typeListData, type => {
                    const modelNameSpan = type.modelnameSpan.split(',')[0] + '-' + type.modelnameSpan.split(',')[1]
                    if (!obj[modelNameSpan]) {
                        obj[modelNameSpan] = Number(type.qty)
                    } else {
                        obj[modelNameSpan] += Number(type.qty)
                    }
                })
            })

            _.forEach(this.filterPurchaseList, item => {
                if (!obj[item.prodspec]) {
                    const msg = `本次采购类型不符合要求，请完善采购合同, 采购计划中 ${item.prodspec} 类别不存在`
                    this.$message.warning(msg)
                    throw new Error(msg)
                } else if (obj[item.prodspec] !== item.requestqty) {
                    const msg = `本次采购数量不符合要求，请完善采购合同, 采购计划中该 ${item.prodspec} 类别与采购总数不相等`
                    this.$message.warning(msg)
                    throw new Error(msg)
                }
            })
        },
        // 取消新增
        typeAddCancel (item) {
            item.editable = false;//取消编辑
            item.typeListData.splice(item.typeListData.length - 1, 1); //从当前index位置开始，删除一项
        },
        // 计算总额
        calculateAll (item) {
            item.purchaseqty = _.sumBy(item.typeListData, item => +item.qty);//采购数量 = 每个设备数量相加
            item.purchaseamount = _.sumBy(item.typeListData, item => +item.amount);//采购总金额 = 每个设备金额相加
            if (item.purchaseamount === undefined) item.purchaseamount = 0;
            item.purchaseamount = item.purchaseamount.toFixed(2)
        },
        typeAddClick (item) {
            if (!item.supplierid) {
                this.$message.error('请先选择供应商！');
                return
            }
            item.typeForm = {
                modelid: '',
                modelname: [],
                modelnameSpan: '',
                unitprice: '',
                qty: '',
                amount: '',
            }

            item.typeListData.push(item.typeForm);
            item.editable = true;
        },
        // 采购合同提交
        addSubmit () {
            this.$refs.addForm.validate(async valid => {
                if (valid) {
                    let flag = false

                    _.forEach(this.addForm.dataList, item => {
                        if (!item.typeListData.length) {
                            flag = true
                        }
                    })

                    if (flag) {
                        this.$message.warning('您还没有添加设备信息，请添加设备信息')
                        return
                    }

                    // 检验合同与采购计划中相等
                    this.sumPurchase()

                    this.addLoading = true;
                    try {
                        const params = []
                        const storageQtyList = []
                        _.forEach(this.addForm.dataList, item => {
                            const data = {
                                stoPurchase: {
                                    contractname: item.contractname,
                                    contractno: item.contractno,
                                    purchaseamount: item.purchaseamount,
                                    purchaseqty: item.purchaseqty,
                                    supplierid: item.supplierid,
                                    purchasedate: item.purchasedate
                                },
                                stoPurchasedetails: item.typeListData
                            }
                            params.push(data)
                        })

                        const arr = _.chain(this.storageTree[0].children)
                            .filter(item => item.list.length)
                            .map(item => item.list)
                            .flatten()
                            .value()

                        _.forEach(arr, item => {
                            storageQtyList.push({
                                prodspec: item.modelspec,
                                storageid: item.storageid,
                                purchaseqty: item.parchasenum
                            })
                        })

                        // 提交合同
                        await submit(params)
                        // 提交最终采购数量
                        await submitPurchaseQty(storageQtyList)
                        this.$message.success('采购成功')
                        this.$router.push('/stockManage/stockInquiry/stock')
                        this.addLoading = false;
                        this.addFormVisible = false
                    } catch (e) {
                        console.log(e)
                        this.addLoading = false
                    }
                } else {
                    this.$message.warning('请完善合同')
                }
            })
        },
        supplierChange () {
            this.supplierLoading = true;
            getSupplierList({limit: 1000, isactive: 1}).then((res) => {
                this.supplierOptions = res.data.data.records;
                this.supplierLoading = false;
            });
        },
        showLink (item) {
            const val = Object.assign({}, item.suppliername)
            item.suppliername = val.suppliername
            item.supplierid = val.id;
            item.linkman = val.linkman;
            item.contactno = val.contactno;
            item.typeListData = []
            item.editable = false
        },
        // 确定采购
        openDialog () {
            if (!this.filterPurchaseList.length) {
                this.$message.warning('所有采购设备数量为0，不允许采购')
                return
            }
            this.addForm.dataList = []
            this.addFormVisible = true
            this.addContract()
        },
        // 添加合同
        async addContract () {
            try {
                const {data} = await getBarcodeCGHT()
                this.addForm.dataList.push({
                    purchaseamount: 0,
                    supplierid: '',
                    purchaseqty: 0,
                    contractno: data.data,
                    createbyname: this.$store.getters.userInfo.name,
                    createby: this.$store.getters.userInfo.userid,
                    typeListData: [],
                    typeForm: {},
                    editable: false
                })
                const ref = 'barcode' + (this.addForm.dataList.length - 1)
                this.$nextTick(() => {
                    JsBarcode(this.$refs[ref], data.data, {width: 1, height: 40});
                })
            } catch (e) {
                console.log(e)
            }
        },
        modelCascader (item) {
            getPurchaseCascader({supplierid: item.supplierid}).then((res) => {
                this.modelOptions = res.data.data;
            });
        },
        handleChange (item, index) {
            const val = item.typeForm.modelname
            const ref = 'cascader' + index
            item.typeForm.modelid = val[val.length - 1];
            item.typeForm.modelnameSpan = this.$refs[ref][0].currentLabels.toString();
        },
        calculatePrice (item) {
            item.typeForm.amount = (item.typeForm.qty * item.typeForm.unitprice).toFixed(2);//设备金额 = 单价 * 数量
        },
        // 删除类型
        handleDel (index, item) {
            this.$confirm(' 确认删除该条采购信息吗?', '提示', {
                type: 'warning'
            }).then(() => {
                item.typeListData.splice(index, 1);
                this.calculateAll(item);//计算总额
            })
        },
        // 导出历史采购计划
        exportPurchase () {
            window.location = `/sto/stoStat/parchasePlan/query/exportParchaseDetail?time=${this.historyTime.split('-').join('')}`;
        },
        jumpAllocation (row) {
            const params = Object.assign(row, {
                isPurchasePlan: true
            })
            this.$router.push({
                name: `allocation-detail`,
                query: params
            })
        },
        // 删除合同item
        removePurchase (index) {
            if (this.addForm.dataList.length > 1)
                this.addForm.dataList.splice(index, 1)
            else
                this.$message.warning('至少保留一个合同')
        }
    },
    mounted () {
        this.init()
        window.onresize = () => {
            if (this.chartInstance) {
                this.chartInstance.resize()
            }
        }
    }
}