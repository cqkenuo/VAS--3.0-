import axios from 'axios';
import Qs from 'qs';
import { checkVin,checkMobile, checkVehicleNumber } from '@/utils/formValidation'

// 列表
export const getTodoInfoList = params => {
    return axios.get(`/business/order/flow/page/nodeid`, {params: params})
};
// 节点数量
export const getNodesCount = params => {
    return axios.get(`/business/order/flow/nodes?actKey=new`, {params: params})
};

// 列表
export const getTodoInfoListByUser = params => {
    return axios.get(`/business/order/flow/page/user/nodeid`, {params: params})
};
// 节点数量
export const getNodesCountByUser = params => {
    return axios.get(`/business/order/flow/user/nodes?actKey=new`, {params: params})
};

// 操作详情
export const getOperationRecord = params => {
    return axios.get(`/business/order/flow/history/operation`, {params: params})
};
//安装位置信息
export const getInstallPositionCode = params => {
    return axios.get(`/admin/sysDictionaryData/query/byDictValue?dictvalue=InstallPositionCode`)
};
// 校验车辆信息是否与派单一致
export const validateVinVeh = params => {
    return axios.post(`/business/orderNewBuild/finishInstall/validateLocalVehicleInfo`,  Qs.stringify(params) )
};
// 开始安装
export const startInstall = params => {
    return axios.post(`/business/orderNewBuild/startInstall`, params )
};
// 完成安装-查询设备类别
export const getProdCatagorys = params => {
    return axios.post(`/business/orderNewBuild/finishInstall/prodCatagorys`, Qs.stringify(params) )
};
// 完成安装-查询设备型号
export const getProdModels = params => {
    return axios.get(`/business/busiImpdetail/query/prodModels`, {params: params})
};
// 完成安装-查询该型号的设备列表
export const getModelProds = params => {
    return axios.get(`/business/busiImpdetail/query/modelProds`, {params: params})
};
// 完成安装-下一步
export const nextInstall = params => {
    return axios.put(`/business/busiVehicleinfo/addLocalVehicleInfo`, params )
};
// 完成安装按钮
export const finishInstall = params => {
    return axios.post(`/business/orderNewBuild/finishInstall/`+ params.taskid, params )
};
//检查设备是否在线
export const cldeviceIsOnstate = params => {
    return axios.post(`/gisapiservice/Prod/proddetail`, params)
};
//废单
export const deleteProcess = params =>{
    return axios.put(`
    /business/orderNewBuild/receAbandonOrder/`+ params.taskid , params)
}
//退单
export const returnProccess = params =>{
    return axios.put(`
    /business/orderNewBuild/receReturnOrder/`+ params.taskid , params)
}





// 表单验证
export const setStartFormRules = {
    vin: [{required:true,message:"请输入车架号",trigger: 'blur'},{validator: checkVin,trigger: 'blur'}],
    vehiclePic:[{required:true,message:"请上传车辆图片",trigger: 'blur'}],
    licenseplatenum :[{validator: checkVehicleNumber,trigger: 'blur'}],
    ownername:[{required:true,message:"请输入车主姓名",trigger: 'blur'}],
    mobile:[{required:true,message:"请输入车主电话",trigger: 'blur'},{validator: checkMobile,trigger: 'blur'}],
    idcard:[{required:true,message:"请输入车主身份证号",trigger: 'blur'}],
    model:[{required:true,message:"请选择厂牌型号",trigger: 'change'}],
    vehiclecategory:[{required:true,message:"请选择车辆分类",trigger: 'blur'}],
    vehicletype:[{required:true,message:"请选择车辆类型",trigger: 'blur'}],
}
