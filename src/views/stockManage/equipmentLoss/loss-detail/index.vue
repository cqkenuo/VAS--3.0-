<template>
    <div class="invoice-detail">
        <h2>报损单</h2>
        <svg ref="invoice-bar-code"></svg>
        <el-form label-width="100px" ref="facilityForm" :model="facilityForm" :rules="facilityFormRules" style="margin-top:10px;">
            <p class="invoice-title">基础信息</p>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="报损日期" prop="damageDate">
                        <el-date-picker value-format="yyyy-MM-dd" v-model="facilityForm.damageDate" type="date" :disabled="isView" placeholder="选择日期"></el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="经办人" prop="username">
                        <el-select
                                :disabled="isView"
                                v-model="facilityForm.username"
                                filterable clearable
                                @visible-change="userChange"
                                @change="chooseUser"
                                remote
                                placeholder="请选择经办人"
                                :remote-method="remoteMethod"
                                :loading="selectLoading"
                                value-key="employeename">
                            <el-option v-for="item in employeeInfoLis" :key="item.ID" :label="item.employeename + '-' + item.mobile + '-' + item.deptname" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                 <el-col :span="12">
                    <el-form-item label="报损数量：" >
                        <span class="totol-price">{{ qty }}</span>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <p class="invoice-title">设备信息</p>
                <el-button style="float: right; margin-left: 10px;" type="danger" v-if="!isView" @click="addParts()" :disabled="editable"><i class="iconfont icon-zhibiao"></i> 添加配件</el-button>
                <el-button style="float: right; margin-left: 10px;" type="danger" v-if="!isView" @click="addFacility(true)" :disabled="editable"><i class="iconfont icon-qiandao"></i> 添加设备</el-button>
                 <el-form ref="typeForm" :model="typeForm">
                    <el-table :data="listUpload" border highlight-current-row v-loading="facilityLoading" class="choose_table">
                        <el-table-column type="index" align="center" label="序号" width="50"></el-table-column>
                        <el-table-column align="center" label="库房">
                            <template slot-scope="scope">
                                <div v-if="scope.$index == listUpload.length-1 && editable" >
                                    <el-form-item prop="storagename" :rules="{required: true, message: '库房不能为空', trigger: 'blur'}">
                                        <el-select v-model="typeForm.storagename" @change="chooseStorageParts" filterable clearable value-key="storagename">
                                            <el-option v-for="item in storages" :key="item.storagename" :label="item.storagename" :value="item"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </div>
                                <span v-else>{{ scope.row.storagename }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="modelcategoryname" align="center" label="规格" width="80">
                            <template slot-scope="scope">
                                <div v-if="scope.$index == listUpload.length-1 && editable" >{{ typeForm.modelcategoryname }}</div>
                                <span v-else>{{ scope.row.modelcategoryname }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="型号名称" align="center">
                             <template slot-scope="scope">
                                <div v-if="scope.$index == listUpload.length-1 && editable" >
                                    <el-form-item prop="modelnameArr" :rules="{required: true, message: '型号不能为空', trigger: 'blur'}">
                                        <el-cascader @focus="modelCascader" @change="handleChange" :options="modelOptions" v-model="typeForm.modelnameArr" ref="cascader" clearable></el-cascader>
                                    </el-form-item>
                                </div>
                                <span v-else>{{ scope.row.modelname }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="数量" align="center" width="100">
                            <template slot-scope="scope">
                                <div v-if="scope.$index == listUpload.length-1 && editable" >
                                    <el-form-item prop="qty" :rules="{required: true, message: '不能为空', trigger: 'blur'}">
                                        <el-input v-model="typeForm.qty" > </el-input>
                                    </el-form-item>
                                </div>
                                <el-tooltip v-else class="item" effect="dark" content="点击查看详情" placement="left" >
                                    <!-- 设备查看详情 -->
                                    <el-popover v-if="scope.row.modelcategory !== 'A'" trigger="click" placement="right" @show="getDetails(scope.row)" width="900" >
                                        <el-table :data="chooseProdDetail" border v-loading="detailsLoading">
                                            <el-table-column type="index" align="center" label="#" width="30"></el-table-column>
                                            <el-table-column prop="prodnum" label="设备编号" align="center"></el-table-column>
                                            <el-table-column prop="modelspecname" label="设备规格" align="center" width="80"></el-table-column>
                                            <el-table-column prop="modelname" label="设备类型" align="center" width=    "120"></el-table-column>
                                            <el-table-column prop="modelcategoryname" label="规格" align="center" width="80"></el-table-column>
                                            <el-table-column prop="simnum" label="SIM卡通讯号" align="center" width="140"></el-table-column>
                                            <el-table-column prop="simmodelspecname" label="卡规格" align="center" width="80"></el-table-column>
                                            <el-table-column prop="simmodelname" label="卡类型" align="center"></el-table-column>
                                            <el-table-column label="操作" width="80" align="center" fixed="right" v-if="!isView">
                                                <template slot-scope="scope">
                                                    <el-button type="danger" size="mini" @click="remove(scope.$index,scope.row)">删 除</el-button>
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                        <div slot="reference" class="name-wrapper">
                                            <el-tag size="medium">{{ scope.row.qty }}</el-tag>
                                        </div>
                                    </el-popover>
                                    <!-- 配件数量无详情，删除按钮 -->
                                    <el-popover v-else trigger="click" placement="right">
                                                <el-button v-if="!isView" type="danger" size="mini" @click="remove(scope.$index,scope.row)">删除配件</el-button>
                                                <span v-else>暂无配件详情</span>
                                                <div slot="reference" class="name-wrapper">
                                                    <el-tag size="medium">{{ scope.row.qty }}</el-tag>
                                                </div>
                                    </el-popover>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                         <el-table-column v-if="editable" label="操作" width="140" align="center" fixed="right">
                            <template slot-scope="scope">
                                <div  v-if="scope.$index == listUpload.length-1 && editable">
                                    <el-button-group>
                                        <el-button type="primary" size="mini" @click="confirmParts(scope.$index,scope.row)">确认</el-button>
                                        <el-button type="info" size="mini" @click="cancelParts()">取消</el-button>
                                    </el-button-group>
                                </div>
                            </template>
                         </el-table-column>
                    </el-table>
                </el-form>
            </el-row>
            <el-row style="margin-top: 20px;">
                <el-form-item label="备注">
                    <el-input type="textarea" :disabled="isView" v-model="facilityForm.remarks"></el-input>
                </el-form-item>
                <el-button type="primary" style="float: right" @click="submit" :loading="addLoading" v-if="!isView"> 提 交 </el-button>
            </el-row>
            <el-row class="bar-code-footer">
                <el-col :span="6">
                    <el-form-item label="制单人："> {{facilityForm.username}} </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="制单日期："> {{ Dayjs(createdate).format('YYYY-MM-DD HH:mm:ss') }} </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <!-- 手动添加设备 -->
        <el-dialog title="选择设备" :visible.sync="chooseFacilityVisible" append-to-body width="60%">
            <el-col :span="24" class="toolbar">
                <el-form :inline="true" :model="filtersProd">
                    <el-form-item>
                        <el-select v-model="filtersProd.storagename" @change="chooseStorageProd" filterable clearable placeholder="请选择库房">
                            <el-option v-for="item in storages" :key="item.storagename" :label="item.storagename" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                    <div style="display:inline-block;margin:0 10px 10px 0;">
                        <el-input class="noborder color icon nofocus" @keyup.native.ctrl.8="clearAll()" @keyup.native.13="getDeciceListInfo()" placeholder="请输入查询内容" v-model="filtersProd.domSearch[0].content">
                            <el-select class="wp_select" multiple clearable filterable v-model="filtersProd.domSearch[0].select" slot="prepend" placeholder="选择条件">
                                <el-option label="设备编号" value="prodnum"></el-option>
                                <el-option label="型号" value="modelname"></el-option>
                                <el-option label="状态" value="statusname"></el-option>
                                <el-option label="规格" value="modelspecname"></el-option>
                            </el-select>
                        </el-input>
                    </div>
                    <el-form-item>
                        <el-button type="primary" @click="getDeciceListInfo()" @keyup.native.13="getDeciceListInfo()" icon="el-icon-search">查询</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
            <!-- 列表 -->
            <el-table :data="facilities" border highlight-current-row @selection-change="selectFacility" max-height="500" v-loading="prodLoading"  :row-style="defaultSelectable" ref="facilitiesTable">
                <el-table-column align="center" type="selection" width="35"></el-table-column>
                <el-table-column type="index" align="center" label="序号" width="50"></el-table-column>
                <el-table-column prop="modelspecname" label="规格" align="center" width="80"></el-table-column>
                <el-table-column prop="modelname" label="型号" align="center"></el-table-column>
                <el-table-column prop="prodnum" label="设备编号" align="center"></el-table-column>
                <el-table-column prop="simnum" label="SIM卡通讯号" align="center"></el-table-column>
                <el-table-column prop="simmodelname" label="卡类型" align="center"></el-table-column>
                <el-table-column prop="simmodelspecname" label="卡规格" align="center"></el-table-column>
                <el-table-column prop="unitprice" label="单价" align="center" width="80"></el-table-column>
                <el-table-column prop="statusname" label="设备状态" align="center" width="80"></el-table-column>
            </el-table>
            <div slot="footer">
                <span style="margin-right:10px;">共 {{ dtotal }} 条</span>
                <el-button @click="chooseFacilityVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmFacility">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script src="./index.js">

</script>
<style type="text/css" media="screen">
    .choose_table .el-form-item .el-form-item__content{margin-left :0 !important;}
</style>
<style scoped lang="stylus">
    head-title-bg = #41B883

    .invoice-detail
        position relative
        h2
            text-align center
            margin 10px 0 0 0
            font-size 20px
        svg
            position absolute
            right 20px;
            top -15px;

    .invoice-title
        color white
        margin-bottom 10px;
        background head-title-bg
        width 100px;
        height 35px;
        line-height 35px;
        padding-left 20px;
        font-size 15px;
        display inline-block
        /*float left*/
        position relative
        &::after
            content: ''
            width: 0;
            height: 0;
            display block
            position absolute
            border: 18px solid transparent;
            border-left-color: head-title-bg;
            border-right-width: 0;
            right -18px
            top 0

    .bar-code-footer
        .el-form-item
            margin 0

    .dis_newInstallTitle
        h3
            margin 10px 0;
        > div
            border 1px solid #ccc
            padding 5px;
            border-radius 5px

    .color-red
        color rgb(224, 70, 89)

</style>