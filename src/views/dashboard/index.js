import TWEEN from '@tweenjs/tween.js'
import lineChart from '@/components/linechart'
import pieChart from '@/components/piechart'
import dayjs from 'dayjs'
import { getIndexBoxInfo, getArtcileList, getArtcileListItem } from './service'
import vueGridLayout from 'vue-grid-layout';

const GridLayout = vueGridLayout.GridLayout;
const GridItem = vueGridLayout.GridItem;

const testLayout = [
    {"x": 0, "y": 0, "w": 3, "h": 4, "i": "0", title: "本月安装车辆", type: "card", data: 0, icon: "user", box:'box1'},
    {"x": 3, "y": 0, "w": 3, "h": 4, "i": "1", title: "本月安装设备", type: "card", data: 0, icon: "eye", box:'box2'},
    {"x": 6, "y": 0, "w": 3, "h": 4, "i": "2", title: "平台设备接入", type: "card", data: 0, icon: "download", box:'box3'},
    {"x": 9, "y": 0, "w": 3, "h": 4, "i": "3", title: "平台车辆接入", type: "card", data: 0, icon: "ns", box:'box4'},
    {"x": 0, "y": 4, "w": 3, "h": 8, "i": "4", title: "待办事宜", type: "todoList", data: 0},
    {"x": 3, "y": 4, "w": 9, "h": 8, "i": "5", title: "订单统计", type: "ordersReceived", data: 0},
    {"x": 0, "y": 13, "w": 6, "h": 12, "i": "6", title: "信息中心", type: "messageCenter", data: 0},
    {"x": 6, "y": 13, "w": 6, "h": 12, "i": "7", title: "占比统计", type: "statistical", data: 0}
];

export default {
    name: 'dashboard',
    components: {
        lineChart,
        pieChart,
        GridLayout,
        GridItem
    },
    data () {
        return {
            layout: testLayout,
            dayjsTmp: dayjs,
            newTasks: '',
            todolist: [ {task: '昨天要开会'},
                {
                    state: false,
                    task: '今天要开会'
                },
                {
                    state: true,
                    task: '明天要开会'
                },
                {
                    state: false,
                    task: '留言四'
                },
                {
                    state: false,
                    task: '留言六'
                },
                {
                    state: false,
                    task: '留言七'
                },
                {
                    state: false,
                    task: '留言八'
                },
                {
                    state: false,
                    task: '留言九'
                },
                {
                    state: false,
                    task: '留言十'
                }
            ],
            start: 1,
            activeName: 'first',
            newlist: [], //新闻
            noticeList: [], //通知
            redFileList: [], //红头
            dtitle: "详情",
            showDetailVisible: false,
            rowHeight: 30
        }
    },
    mounted () {
        this.firstLoginnotify();//初始化第一次登陆
        this.getBarData();//获取四个bar的数据
        this.getInfoList();//获取信息中心数据
        this.getAmountCount();//获取提醒待办数量
    },
    methods: {
        // 首次登陆
        firstLoginnotify () {
            const USERNAME = this.$store.state.user.name
            if (this.$store.state.app.firstLogin === 'yep') {
                this.$notify.info({
                    title: `欢迎你，${USERNAME}！工作要加油哦~`,
                    message: '上次登录时间：' + dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    duration: 6000,
                    offset: 60
                })
                this.$store.dispatch('setFirstLogin')
            }
        },
        // 添加备注代办
        addTasks () {
            this.todolist.push({
                state: false,
                task: this.newTasks
            })
            this.newTasks = ''
        },
        //获取四个bar数据
        getBarData () {
            getIndexBoxInfo().then((res) => {
                if (res.data.result.code == 0) {
                    let indexBoxData = res.data.data[0];
                    //本月安装车辆
                    this.layout[0].data = indexBoxData.VECHILECOUNT ? indexBoxData.VECHILECOUNT : 0;
                    //本月安装设备
                    this.layout[1].data = indexBoxData.INSTALLCOUNT ? indexBoxData.INSTALLCOUNT : 0;
                    //平台设备接入
                    this.layout[2].data = indexBoxData.ONLINECOUNT.split('_')[0] ? indexBoxData.ONLINECOUNT.split('_')[0] : 0;
                    //平台车辆接入
                    this.layout[3].data = indexBoxData.ONLINECOUNT.split('_')[1] ? indexBoxData.ONLINECOUNT.split('_')[1] : 0;
                }
            });
        },
        //信息中心数据
        getInfoList () {
            // 新闻中心
            let params = {
                doctype: 10,
                showCount: 11,
                categoryid: 1, //文章类型——新闻
            };
            getArtcileList(params).then((res) => { //获取新闻
                this.newlist = res.data.data.records;
            });
            // 通知公告
            params = {
                doctype: 8,
                showCount: 11,
                categoryid: 2, //文章类型——通知
            };
            getArtcileList(params).then((res) => {
                this.noticeList = res.data.data.records;
            });
            // 红头文件
            params = {
                doctype: 9,
                showCount: 11,
                categoryid: 3, //文章类型——红头
            };
            getArtcileList(params).then((res) => {
                this.redFileList = res.data.data.records;
            });
            // 留言板
            // params = {
            //   showCount: 5,
            //   categoryid: 22, //文章类型——留言板
            // };
            // getSelectListArtcile(params).then((res) => {
            //   this.leaveMsgList = res.data.data.records;
            // });
        },
        //进入信息中心详情
        infoDetail (id) {
            let params = {id: id}
            this.showDetailVisible = true;
            getArtcileListItem(params).then((res) => {
                $("div.el-dialog__body").html(res.data.data.content);
            });
        },
        // 提醒待办数量
        getAmountCount () {
            this.$store.dispatch('getAmountCount')
        },
        resizedEvent () {
            console.log(1)
        }
    }
}