import Apis from './Api';
import {MyFetch} from '../../utils';

export function login(params = {}) {
    return MyFetch.postForm(Apis.login, params);
}

export function collectionConfigList(params = {}) {
    return MyFetch.get(Apis.collectionConfigList, params);
}

export function collectionConfigAddAndEdit(params = {}) {
    return MyFetch.postForm(Apis.collectionConfigAddAndEdit, params);
}

export function collectionLogList(params = {}) {
    return MyFetch.get(Apis.collectionLogList, params);
}

export function collectionMemberList(params = {}) {
    return MyFetch.postForm(Apis.collectionMemberList, params);
}

export function myDivisionList(params = {}) {
    return MyFetch.postForm(Apis.myDivisionList, params);
}

export function addCollectionRecordLog(params = {}) {
    return MyFetch.postForm(Apis.addCollectionRecordLog, params);
}

export function divisionUserInfo(params = {}) {
    return MyFetch.postForm(Apis.divisionUserInfo, params);
}

export function divisionContact(params = {}) {
    return MyFetch.postForm(Apis.divisionContact, params);
}

export function contactMsgDetailList(params = {}) {
    return MyFetch.postForm(Apis.contactMsgDetailList, params);
}

export function msgSendRecord(params = {}) {
    return MyFetch.postForm(Apis.msgSendRecord, params);
}

export function sendMsg(params = {}) {
    return MyFetch.postForm(Apis.sendMsg, params);
}

export function preSendMsg(params = {}) {
    return MyFetch.get(Apis.preSendMsg, params);
}

export function addCollectionRecord(params = {}) {
    return MyFetch.postForm(Apis.addCollectionRecord, params);
}

export function preAddCollectionRecord(params = {}) {
    return MyFetch.get(Apis.preAddCollectionRecord, params);
}

export function dictByType(params = {}) {
    return MyFetch.get(Apis.dictByType, params);
}

export function myDivisionOverdueStage(params = {}) {
    return MyFetch.get(Apis.myDivisionOverdueStage, params);
}

export function allDivision(params = {}) {
    return MyFetch.postForm(Apis.allDivision, params);
}

export function allDivisionTransferCase(params = {}) {
    return MyFetch.postForm(Apis.allDivisionTransferCase, params);
}

export function overdueUser(params = {}) {
    return MyFetch.postForm(Apis.overdueUser, params);
}

export function payList(params = {}) {
    return MyFetch.postForm(Apis.payList, params);
}

export function overdueList(params = {}) {
    return MyFetch.postForm(Apis.overdueList, params);
}

export function collectionMemberOrganization(params = {}) {
    return MyFetch.get(Apis.collectionMemberOrganization, params);
}

export function collectionMemberAddEdit(params = {}) {
    return MyFetch.postForm(Apis.collectionMemberAddEdit, params);
}

export function externalCompanyList(params = {}) {
    return MyFetch.postForm(Apis.externalCompanyList, params);
}

export function externalCompanyOrganization(params = {}) {
    return MyFetch.get(Apis.externalCompanyOrganization, params);
}

export function divisionLog(params = {}) {
    return MyFetch.postForm(Apis.divisionLog, params);
}

export function outerCaseList(params = {}) {
    return MyFetch.postForm(Apis.outerCaseList, params);
}

export function externalCompanyOperatorList(params = {}) {
    return MyFetch.get(Apis.externalCompanyOperatorList, params);
}

export function collectionMemberOperatorList(params = {}) {
    return MyFetch.postForm(Apis.collectionMemberOperatorList, params);
}

export function applyAccount(params = {}) {
    return MyFetch.postForm(Apis.applyAccount, params);
}

export function outerListByCompanyId(params = {}) {
    return MyFetch.postForm(Apis.outerListByCompanyId, params);
}

export function creditUrl(params = {}) {
    return MyFetch.get(Apis.creditUrl, params);
}

export function forwardSubmit(params = {}) {
    return MyFetch.postForm(Apis.forwardSubmit, params);
}

export function companyCaseList(params = {}) {
    return MyFetch.postForm(Apis.companyCaseList, params);
}

export function cancelForward(params = {}) {
    return MyFetch.postForm(Apis.cancelForward, params);
}

export function liuAn(params = {}) {
    return MyFetch.postForm(Apis.liuAn, params);
}

export function changePassword(params = {}) {
    return MyFetch.get(Apis.changePassword, params);
}

export function dataOverview(params = {}) {
    return MyFetch.postForm(Apis.dataOverview, params);
}

export function multipleAdjustCase(params = {}) {
    return MyFetch.postForm(Apis.multipleAdjustCase, params);
}

export function overdueRate(params = {}) {
    return MyFetch.postForm(Apis.overdueRate, params);
}

export function dataOverviewList(params = {}) {
    return MyFetch.postForm(Apis.dataOverviewList, params);
}

export function statisticsIndex(params = {}) {
    return MyFetch.postForm(Apis.statisticsIndex, params);
}

export function collectionMemberRate(params = {}) {
    return MyFetch.postForm(Apis.collectionMemberRate, params);
}

export function collectionCodeRate(params = {}) {
    return MyFetch.postForm(Apis.collectionCodeRate, params);
}

export function statisticsCompany(params = {}) {
    return MyFetch.postForm(Apis.statisticsCompany, params);
}

export function sendValidateCode(params = {}) {
    return MyFetch.get(Apis.sendValidateCode, params);
}

export function contactTaobao(params = {}) {
    return MyFetch.get(Apis.contactTaobao, params);
}

export function repaymentPeriod(params = {}) {
    return MyFetch.postForm(Apis.repaymentPeriod, params);
}

export function saveOrUpdateStatus(params = {}) {
    return MyFetch.postForm(Apis.saveOrUpdateStatus, params);
}

export function phoneSourceCase(params = {}) {
    return MyFetch.get(Apis.phoneSourceCase, params);
}

export function getBlockingReason(params = {}) {
    return MyFetch.get(Apis.getBlockingReason, params);
}

export function blackDetail(params = {}) {
    return MyFetch.postForm(Apis.blackDetail, params);
}

export function checkLogList(params = {}) {
    return MyFetch.postForm(Apis.checkLogList, params);
}
