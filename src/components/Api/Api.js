const prefix = '/afterloan'; // api地址前缀
const Api = (config => {
    Object.keys(config).forEach((item) => {
        config[item] = `${prefix}${config[item]}`;
    });
    return config;
})({
    login: '/user/login',//登录
    collectionConfigList: '/time/list',//逾期时段配置列表
    collectionConfigAddAndEdit: '/time/edit',//添加和修改逾期时段
    collectionLogList: '/time/logList',//查询逾期时段日志记录列表
    collectionMemberList: '/person/list',//催收人员列表
    myDivisionList: '/case/myList',//我的分案查询,
    addCollectionRecordLog: '/case/hurryRecordList',//我的分案-查看-催收记录
    divisionUserInfo: '/case/detail/baseInfo',//所有分案-查看-详情-基本信息/我的分案-查看-详情-基本信息
    divisionContact: '/case/detail/relation',//所有分案-查看-详情-联系人/我的分案-查看-详情-联系人
    contactMsgDetailList: '/relation/smsDetailList',//联系人-短信详情
    msgSendRecord: '/message/sendList',//短信发送记录
    sendMsg: '/message/send',//催收短信发送
    preSendMsg: '/record/toSmsSend',//我的分案-操作-发送短信-页面跳转接口/催收短信发送界面-根据案件id识别借款人
    addCollectionRecord: '/case/addHurryRecord',//我的分案-操作-添加催记提交
    preAddCollectionRecord: '/record/toRecoedAdd',//我的分案-操作-添加催记-页面跳转接口
    dictByType: '/sys/findDictByType',//根据类型查询字典表数据
    myDivisionOverdueStage: '/overdue/overdueStageList',//我的分案查询逾期时间段
    allDivision: '/case/allList',//所有分案查询
    allDivisionTransferCase: '/case/transferCase',//所有方案-调案
    overdueUser: '/overdueUser/list',//所有分案催收员下拉框和调案后续催收员列表
    payList: '/repayment/list',//还款列表查询
    overdueList: '/overdue/list',//逾期账户查询
    collectionMemberOrganization: '/sys/selectCompanyList',//催收人员管理-所属机构下拉框
    collectionMemberAddEdit: '/person/add',//添加/编辑-催收人员
    externalCompanyList: '/person/outerlist',//委外公司管理-列表查询
    externalCompanyOrganization: '/sys/selectOperatorOuter',//委外公司管理-操作人下拉框
    divisionLog: '/case/logList',//分案日志记录列表
    outerCaseList: '/outer/list',//委外分案
    externalCompanyOperatorList: '/sys/selectOperatorOuter',//委外公司管理-操作人下拉框
    collectionMemberOperatorList: '/sys/selectOperator',//催收人员管理-操作员下拉框
    applyAccount: '/case/applyRelationPhone2',//申请号码
    outerListByCompanyId: '/outer/list',//用这个-委外分案
    creditUrl: '/case/creditUrl',//借款协议/授权扣款委托书/平台服务协议
    forwardSubmit: '/case/transList',//批量转派-提交
    companyCaseList: '/case/companyCaseList',//机构分案管理-列表查询
    cancelForward: '/case/cancelTrans',//取消转派
    liuAn: '/case/leaveCase',//留案接口
    changePassword: '/sys/modifyPwd',//修改密码接口
    dataOverview: '/report/getOverdueDatas',//数据总览
    multipleAdjustCase: '/case/transferCaseList',//批量调案
    overdueRate: '/report/getOverdueDayUrgeInfo',//逾期天数覆盖率，汇款率
    dataOverviewList: '/report/getStageUrgeInfo',//逾期时段催收数据汇总
    statisticsIndex: '/report/getHomePageData',//统计首页接口
    collectionMemberRate: '/report/getUserUrgeInfo',//催收员覆盖率回款率
    collectionCodeRate: '/report/getProblemCodeRate',//催收代码占比
    statisticsCompany: '/report/getUrgeInfoByCompany',//公司统计-查询催收占比
    exportDivision: '/case/allCaseExport',//分案导出
    sendValidateCode: '/message/sendValidateCode',//短信验证码发送接口
    contactTaobao: '/case/detail/relation/info',//淘宝联系人详情
    repaymentPeriod: '/case/detail/repaymentPeriod',//分期还款列表查询
    saveOrUpdateStatus: '/user/black-list/saveOrUpdate',//黑名单添加修改
    phoneSourceCase: '/case/phoneSource',//号码来源
    getBlockingReason: '/user/black-list/getBlockingReason',//获取拉黑原因下拉框数据
    blackDetail: '/user/black-list/getBlack',//获取黑名单详情
    checkLogList: '/check-log/list',//审核记录信息
});

export default Api;