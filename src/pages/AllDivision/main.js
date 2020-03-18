/**
 * @Desc 所有分案
 * */
import React from 'react';
import './index.less';
import {TitleLine, Http, Apis} from '../../components';
import {Button, Col, Form, Input, Row, DatePicker, Select, message, Table, Modal} from 'antd';
import {ColConfig, PageSize, TableWidth, StateArr, StorageKeys} from '../../config';
import moment from 'moment';
import {AdjustCase} from './components';
import Division from '../DivisionDetail';
import {SessionStorage, ROOT_URL, ToQueryStr} from '../../utils';

const FormItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 6},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 18},
    },
    colon: false,
};

const ADTable = {
    sSmall: 40,
    mSmall: 60,
    rSmall: 70,
    small: 80,
    xSmall: 90,
    sMiddle: 100,
    rMiddle: 110,
    middle: 120,
    mLarge: 130,
    rLarge: 140,
    large: 150,
    xLarge: 180,
};

const {RangePicker} = DatePicker;
const DateFormat = 'YYYY-MM-DD HH:mm';
const Option = Select.Option;

class Main extends React.Component {

    state = {
        blockingInfo: {},
        blockingReason: '',
        remark: '',
        blockingReasonInfo: [],
        caseIdDetail: '',
        visibleDetail: false,
        orderSourceVal: '',
        userId: '',
        statusValue: '',
        statusVisible: false,
        data: [],
        loading: false,
        visible: false,
        title: '',
        caseId: '',
        caseSource: [],
        problemCodeArr: [],
        stateArr: [],
        overdueStage: [],
        loadDay: [],
        userOverdue: '',
        overdueUser: [],
        sysUserId: '',
        selectedRowKeys: [],
        checkType: null,
        showExportButton: false,
        pageIndex: sessionStorage.getItem('_ifBack') === '0' && sessionStorage.getItem('_pageIndex') ? JSON.parse(sessionStorage.getItem('_pageIndex')) : 1,
        queryObj: sessionStorage.getItem('_ifBack') === '0' && sessionStorage.getItem('_queryObj') ? JSON.parse(sessionStorage.getItem('_queryObj')) : {},
        pagination: sessionStorage.getItem('_ifBack') === '0' && sessionStorage.getItem('_pagination') ? JSON.parse(sessionStorage.getItem('_pagination')) : {pageSize: PageSize, showTotal: total => `共${total}条`},
    };

    componentDidMount() {
        let paginationB = this.state.pagination;
        paginationB.showTotal = total => `共${total}条`;
        sessionStorage.removeItem('_ifBack');
        this._myDivisionList(this.state.pageIndex, this.state.queryObj);
        this._dictByType();
        this._dictByTypeLoadDay();
        this._problemCode();
        this._myDivisionOverdueStage();
        this._overdueUser();
        this._buttonList();
        this._getBlockingReason();
    }

    columns = [
        {
            title: '借款订单号',
            dataIndex: 'orderId',
        },
        {
            title: '设备信息',
            dataIndex: 'clintTypeName',
        },
        {
            title: '借款人姓名',
            dataIndex: 'name',
        },
        {
            title: '认证号码',
            dataIndex: 'phone',
        },
        {
            title: '问题代码',
            dataIndex: 'problemCode',
        },
        {
            title: '问题备注',
            dataIndex: 'problemDescription',
        },
        {
            title: '用户属性',
            dataIndex: 'customerType',
        },
        {
            title: '逾期天数',
            dataIndex: 'overdueDay',
        },
        {
            title: '应还金额',
            dataIndex: 'totalMoney',
        },
        {
            title: '实还金额',
            dataIndex: 'trueTotalMoney',
        },
        {
            title: '剩余未还金额',
            dataIndex: 'remainingMoeny',
        },
        {
            title: '结清日期',
            dataIndex: 'settleTime',
            render: (text) => {
                if (text) {
                    return moment(text).format('YYYY-MM-DD')
                }
            }
        },
        {
            title: '最近跟进日期',
            dataIndex: 'nearestDate',
        },
        {
            title: '催收员',
            dataIndex: 'userOverdue',
        },
        {
            title: '案件ID',
            dataIndex: 'id',
        },
        {
            title: '案件来源',
            dataIndex: 'orderSource',
        },
        {
            title: '放款时间',
            dataIndex: 'loanTime',
        },
        {
            title: '借款金额',
            dataIndex: 'principal',
        },
        {
            title: '借款期限',
            dataIndex: 'loanDay',
        },
        {
            title: '应还时间',
            dataIndex: 'planFeeTime',
        },
        {
            title: '利息',
            dataIndex: 'interests',
        },
        {
            title: '手续费',
            dataIndex: 'counterFee',
        },
        {
            title: '是否逾期',
            dataIndex: 'isOverdue',
        },
        {
            title: '逾期时段',
            dataIndex: 'stageName',
        },
        {
            title: '逾期罚息利率',
            dataIndex: 'lateFeeApr',
        },
        {
            title: '逾期金额',
            dataIndex: 'lateFee',
        },
        {
            title: '还款状态',
            dataIndex: 'states',
        },
        {
            title: '是否黑名单',
            dataIndex: 'blackStatus',
            render: (text)=> this.blackStatusShow(text)
        },
        {
            title: '查看',
            fixed: 'right',
            width: 50,
            render: (text, record) => {
                const {id: caseId} = record;
                return (
                    <a
                        href="javascript:;"
                        onClick={() => this._onDetail({caseId})}
                    >
                        详情
                    </a>

                )
            },
        },
        {
            title: '操作',
            fixed: 'right',
            width: 100,
            render: (text, record) => {
                const {sysUserId, userId, orderSourceVal} = record;
                return (<span>
                        <a
                            href="javascript:;"
                            onClick={() => this._onStatusChange({sysUserId,userId,orderSourceVal})}
                        >
                            名单状态更改
                        </a>
                    </span>
                )
            },
        },
        {
            title: '调案',
            fixed: 'right',
            width: 50,
            render: (text, record) => {
                const {id: caseId, userOverdue, sysUserId, states, transCaseFlag} = record;
                if (states === '已还款' || transCaseFlag === false) {
                    return '调案';
                } else {
                    return (
                        <a
                            href="javascript:;"
                            onClick={() => this._onAdjust({caseId, userOverdue, sysUserId, checkType: 'single'})}
                        >
                            调案
                        </a>
                    )
                }
            },
        },
    ];

    _onStatusChange = ({sysUserId,userId,orderSourceVal}) => {
        console.log(sysUserId,userId)
        this.setState({
            sysUserId,userId,orderSourceVal
        })
        this._handleStatusVisible(true,userId,orderSourceVal);
    }

    blackStatusShow = (text) => {
        let showText = '';
        if(text === '0') {
            showText = '否'
        } else if (text === '1') {
            showText = '是'
        }
        return showText;
    };

    _onAdjust = ({caseId, userOverdue, sysUserId, checkType}) => {
        this.setState({
            caseId,
            sysUserId,
            checkType,
            userOverdue,
            visible: true,
        });
    };

    _onDetail = ({caseId}) => {
        sessionStorage.setItem('_queryObj',JSON.stringify(this.state.queryObj));
        sessionStorage.setItem('_pageIndex',JSON.stringify(this.state.pageIndex));
        sessionStorage.setItem('_pagination',JSON.stringify(this.state.pagination));
        this.setState({
            visibleDetail: true,
            caseIdDetail: caseId
        })
        // this.props.history.push(`/main/divisionDetail/${caseId}`)
    };

    _buttonList = () => {
        const buttonList = SessionStorage.get(StorageKeys.buttonList);
        if (Array.isArray(buttonList)) {
            const targetArr = buttonList.filter(i => i.target === 'caseExport');
            if (targetArr.length > 0) {
                this.setState({showExportButton: true});
            }
        }
    };

    _handleSubmit = (type) => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {loanTime, planFeeTime, settleTime, operatorTime, ...rest} = values;
                const params = {};
                const addParams = (timeArr, keyA, keyB) => {
                    if (timeArr) {
                        Object.assign(params, {
                            [keyA]: moment(timeArr[0]).format(DateFormat),
                            [keyB]: moment(timeArr[1]).format(DateFormat),
                        });
                    }
                };
                addParams(loanTime, 'loanTimeBegin', 'loanTimeEnd');
                addParams(planFeeTime, 'planFeeTimeBegin', 'planFeeTimeEnd');
                addParams(settleTime, 'settleTimeBegin', 'settleTimeEnd');
                addParams(operatorTime, 'operatorTimeBegin', 'operatorTimeEnd');
                const queryObj = {
                    ...rest,
                    ...params,
                };
                console.log('queryObj', queryObj);

                const newObj = {};
                for (let key in queryObj) {
                    if (queryObj[key]) {
                        newObj[key] = queryObj[key];
                    }
                }
                console.log('newObj', newObj);
                this.setState({queryObj: newObj});
                SessionStorage.set(StorageKeys.allDivisionQuery, newObj);

                if (type === 'search') {
                    this._myDivisionList(1, newObj);
                }
                if (type === 'export') {
                    this._exportDivision(newObj);
                }
            }
        });
    };

    _myDivisionList = async (pageIndex = this.state.pageIndex, params = this.state.queryObj) => {
        try {
            this.setState({loading: true});
            const {pagination} = this.state;
            const newParams = {
                ...params,
                pageSize: PageSize,
                pageNo: pageIndex,
            };
            const result = await Http.allDivision(newParams);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            let dataArr = [];
            if (errcode === 0) {
                const {total, rows} = data;
                pagination.total = total;
                pagination.current = Number(pageIndex);
                if (Array.isArray(rows)) {
                    dataArr = rows;
                }
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({
                pageIndex,
                pagination,
                data: dataArr,
                loading: false,
            });
        } catch (e) {
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    _exportDivision = async (params) => {
        const token = SessionStorage.get(StorageKeys.token);
        const url = ROOT_URL + Apis.exportDivision + '?token=' + token + '&' + ToQueryStr(params);
        window.open(url);
    };

    _dictByType = async () => {
        try {
            const result = await Http.dictByType({type: 'order_source'});
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({caseSource: data});
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _problemCode = async () => {
        try {
            const result = await Http.dictByType({type: 'problem_code'});
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({problemCodeArr: data});
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _dictByTypeLoadDay = async () => {
        try {
            const result = await Http.dictByType({type: 'loan_day'});
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({loadDay: data});
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _myDivisionOverdueStage = async () => {
        try {
            const result = await Http.myDivisionOverdueStage();
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({overdueStage: data});
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _getBlockingReason = async () => {//获取拉黑原因下拉框数据
        try {
            const result = await Http.getBlockingReason();
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({blockingReasonInfo: data ? data : []});
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _getBlockingDetail = async (userId,orderSourceVal) => {//获取拉黑原因下拉框数据
        try {
            const result = await Http.blackDetail({
                userId: userId,
                orderSourceVal: orderSourceVal,
            });
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({
                    statusVisible: true,
                    blockingInfo: data ? data : {},
                    blockingReason: data && data.blockingReason ? data.blockingReason : undefined,
                    remark: data && data.remark ? data.remark: '',
                    statusValue:  data && data.status ? data.status : undefined
                });
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _overdueUser = async () => {
        try {
            const result = await Http.overdueUser();
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({overdueUser: data});
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _handleReset = () => {
        const {form: {resetFields}} = this.props;
        resetFields();
        this.setState({queryObj: {}}, () => {
            this._myDivisionList(1);
        });
    };

    _handleCancel = (stateName) => {
        this.setState({[stateName]: false});
    };

    _handleTableChange = (pagination, filters, sorter) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        }, () => {
            this._myDivisionList(pagination.current);
        });
    };

    _onHandleRowSelectionChange = (selectedRowKeys, selectedRows) => {
        this.setState({selectedRowKeys});
    };

    _getCheckboxProps = (record) => {
        const {states, transCaseFlag} = record;
        let disabled = false;
        if (states === '已还款' || transCaseFlag === false) {
            disabled = true;
        }
        return {
            disabled: disabled,
        };
    };

    _onRefresh = () => {
        this.setState({selectedRowKeys: []});
        this._handleSubmit('search');
    };

    _handleStatusVisible = (e,userId,orderSourceVal) => {
        if (e) {
            this._getBlockingDetail(userId,orderSourceVal);
        } else {
            this.setState({
                statusVisible: e
            })
        }
        
    }

    _handleStatusSubmit = async () => {//名单状态更改
        const params = {
            userId: this.state.userId,
            sysUserId: this.state.sysUserId,
            status: this.state.statusValue,
            blockingReason: this.state.blockingReason,
            remark:  this.state.remark,
            orderSourceVal: this.state.orderSourceVal
        };

        try {
            const result = await Http.saveOrUpdateStatus(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg} = result;
            if (errcode === 0) {
                this._handleStatusVisible(false);
                const current  = this.state.pagination['current'];
                this._myDivisionList(current);
                message.info('操作成功');
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _handleStatusChange = (value) => {
        console.log(value)
        this.setState({
            statusValue: value
        })
    }

    _handleRemarkChange = (event) => {
        console.log(event.target.value)
        this.setState({
            remark: event.target.value
        })
    }

    _blockingReasonChange = (value) => {
        console.log(value)
        this.setState({
            blockingReason: value
        })
    }

    _handleCancelDetail = () => {
        this.setState({
            visibleDetail: false
        })
    }

    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {
            blockingInfo, blockingReasonInfo, caseIdDetail, visibleDetail, statusVisible, queryObj, data, pagination, loading, visible, caseId, caseSource, problemCodeArr, overdueStage, loadDay, userOverdue, overdueUser,
            sysUserId, selectedRowKeys, checkType, showExportButton,
        } = this.state;
        const {clientHeight} = document.body;
        const tableHeight = clientHeight - 400;
        console.log('this.state', this.state);
        return (
            <div>
                <TitleLine
                    title='所有分案'
                    icon='edit-1-copy'
                />
                <Form className='all-division'>
                    <Row>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='借款人' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('name', {
                                    initialValue: queryObj['name'] ? queryObj['name'] :undefined,
                                    rules: [{required: false, message: '请输入借款人订单号/姓名/认证号码'},
                                    ],
                                })(
                                    <Input placeholder="借款人订单号/姓名/认证号码"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='借款金额' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('minPrincipal', {
                                    initialValue: queryObj['minPrincipal'] ? queryObj['minPrincipal'] :undefined,
                                    rules: [{required: false, message: '请输入最小借款金额'}],
                                })(
                                    <Input
                                        style={{width: '46%'}}
                                        placeholder='最小金额'
                                    />
                                )}
                                <span style={{
                                    width: '8%',
                                    lineHeight: '32px',
                                    textAlign: 'center',
                                    color: 'rgba(0, 0, 0, 0.45)',
                                    display: 'inline-block',
                                }}>~
                                </span>
                                {getFieldDecorator('maxPrincipal', {
                                    initialValue: queryObj['maxPrincipal'] ? queryObj['maxPrincipal'] :undefined,
                                    rules: [{required: false, message: '请输入最大借款金额'}],
                                })(
                                    <Input
                                        style={{width: '46%'}}
                                        placeholder='最大金额'
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='放款时间' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('loanTime', {
                                    initialValue: queryObj['loanTimeBegin'] && queryObj['loanTimeEnd'] ? [moment(queryObj['loanTimeBegin'],"YYYY-MM-DD"),moment(queryObj['loanTimeEnd'],"YYYY-MM-DD")] :undefined,
                                    rules: [{required: false, message: '请选择放款时间'}],
                                })(
                                    <RangePicker
                                        style={{width: '100%'}}
                                        format="YYYY-MM-DD"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='借款期限' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('loanDay', {
                                    initialValue: queryObj['loanDay'] ? queryObj['loanDay'] :undefined,
                                    rules: [{required: false, message: '请选择借款期限'}],
                                })(
                                    <Select placeholder='请选择借款期限'>
                                        {loadDay.map(i => <Option value={i.value}>{i.label}</Option>)}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='是否逾期' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('isOverdue', {
                                    initialValue: queryObj['isOverdue'] ? queryObj['isOverdue'] :undefined,
                                    rules: [{required: false, message: '请选择是否逾期'}],
                                })(
                                    <Select placeholder='请选择是否逾期'>
                                        <Option value="1">是</Option>
                                        <Option value="0">否</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='应还时间' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('planFeeTime', {
                                    initialValue: queryObj['planFeeTimeBegin'] && queryObj['planFeeTimeEnd'] ? [moment(queryObj['planFeeTimeBegin'],"YYYY-MM-DD"),moment(queryObj['planFeeTimeEnd'],"YYYY-MM-DD")] :undefined,
                                    rules: [{required: false, message: '应还时间'}],
                                })(
                                    <RangePicker
                                        style={{width: '100%'}}
                                        format="YYYY-MM-DD"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='结清时间' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('settleTime', {
                                    initialValue: queryObj['settleTimeBegin'] && queryObj['settleTimeEnd'] ? [moment(queryObj['settleTimeBegin'],"YYYY-MM-DD"),moment(queryObj['settleTimeEnd'],"YYYY-MM-DD")] :undefined,
                                    rules: [{required: false, message: '添加时间'}],
                                })(
                                    <RangePicker
                                        style={{width: '100%'}}
                                        format="YYYY-MM-DD"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='还款状态' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('states', {
                                    initialValue: queryObj['states'] ? queryObj['states'] :undefined,
                                    rules: [{required: false, message: '请选择还款状态'}],
                                })(
                                    <Select placeholder='请选择还款状态'>
                                        {StateArr.map(i => <Option key={i[0]} value={i[0]}>{i[1]}</Option>)}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='逾期时段' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('overdueStageId', {
                                    initialValue: queryObj['overdueStageId'] ? queryObj['overdueStageId'] :undefined,
                                    rules: [{required: false, message: '请选择逾期时段'}],
                                })(
                                    <Select placeholder='请选择逾期时段'>
                                        {overdueStage.map(i => <Option value={i.id}>{i.stageName}</Option>)}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='最近跟进日期' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('operatorTime', {
                                    initialValue: queryObj['operatorTimeBegin'] && queryObj['operatorTimeEnd'] ? [moment(queryObj['operatorTimeBegin'],"YYYY-MM-DD"),moment(queryObj['operatorTimeEnd'],"YYYY-MM-DD")] :undefined,
                                    rules: [{required: false, message: '最近跟进日期'}],
                                })(
                                    <RangePicker
                                        style={{width: '100%'}}
                                        format="YYYY-MM-DD"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='催收员' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('userOverdue', {
                                    initialValue: queryObj['userOverdue'] ? queryObj['userOverdue'] :undefined,
                                    rules: [{required: false, message: '请选择催收员'},
                                    ],
                                })(
                                    <Select placeholder='请选择催收员'>
                                        {overdueUser.map(i => <Option value={i.id}>{i.name}</Option>)}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='案件ID' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('id', {
                                    initialValue: queryObj['id'] ? queryObj['id'] :undefined,
                                    rules: [{required: false, message: '请输入案件ID'},
                                    ],
                                })(
                                    <Input placeholder="请输入案件ID"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='案件来源' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('orderSource', {
                                    initialValue: queryObj['orderSource'] ? queryObj['orderSource'] :undefined,
                                    rules: [{required: false, message: '请选择案件来源'}],
                                })(
                                    <Select placeholder='请选择案件来源'>
                                        {
                                            caseSource.map(i => {
                                                return (
                                                    <Option key={i.value} value={i.value}>{i.label}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='逾期天数' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('overdueDayMin', {
                                    initialValue: queryObj['overdueDayMin'] ? queryObj['overdueDayMin'] :undefined,
                                    rules: [{required: false, message: '请输入开始天数'}],
                                })(
                                    <Input
                                        style={{width: '46%'}}
                                        placeholder='开始天数'
                                    />
                                )}
                                <span style={{
                                    width: '8%',
                                    lineHeight: '32px',
                                    textAlign: 'center',
                                    color: 'rgba(0, 0, 0, 0.45)',
                                    display: 'inline-block',
                                }}>~
                                </span>
                                {getFieldDecorator('overdueDayMax', {
                                    initialValue: queryObj['overdueDayMax'] ? queryObj['overdueDayMax'] :undefined,
                                    rules: [{required: false, message: '请输入结束天数'}],
                                })(
                                    <Input
                                        style={{width: '46%'}}
                                        placeholder='结束天数'
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='用户属性' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('customerType', {
                                    initialValue: queryObj['customerType'] ? queryObj['customerType'] :undefined,
                                    rules: [{required: false, message: '请选择用户属性'},
                                    ],
                                })(
                                    <Select placeholder='请选择用户属性'>
                                        <Option value='0'>新用户</Option>
                                        <Option value='1'>老用户</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='是否黑名单' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('blackStatus', {
                                    initialValue: queryObj['blackStatus'] ? queryObj['blackStatus'] :undefined,
                                    rules: [{required: false, message: '请选择是否黑名单'}],
                                })(
                                    <Select placeholder='请选择是否黑名单'>
                                        <Option value="1">是</Option>
                                        <Option value="0">否</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='问题代码' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('problemCode', {
                                    initialValue: queryObj['problemCode'] ? queryObj['problemCode'] :undefined,
                                    rules: [{required: false, message: '请选择问题代码'}],
                                })(
                                    <Select placeholder='请选择问题代码'>
                                        {
                                            problemCodeArr.map(i => {
                                                return (
                                                    <Option key={i.value} value={i.value}>{i.label}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='设备信息' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('clintTypeName', {
                                    initialValue: queryObj['clintTypeName'] ? queryObj['clintTypeName'] :undefined,
                                    rules: [{required: false, message: '请输入设备信息'},
                                    ],
                                })(
                                    <Input placeholder="请输入设备信息"/>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item style={{marginBottom: '10px'}}>
                        <div className='button-view'>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="submit"
                                onClick={() => this._handleSubmit('search')}
                            >
                                查询
                            </Button>
                            <Button
                                className="close"
                                htmlType="button"
                                onClick={this._handleReset}
                            >
                                重置
                            </Button>
                            {
                                showExportButton &&
                                <Button
                                    className="export"
                                    htmlType="button"
                                    onClick={() => this._handleSubmit('export')}
                                >
                                    分案导出
                                </Button>
                            }
                            <Button
                                type="primary"
                                className="forward"
                                htmlType="button"
                                disabled={selectedRowKeys.length === 0}
                                onClick={() => this._onAdjust({
                                    caseId: selectedRowKeys.toString(),
                                    sysUserId: null,
                                    userOverdue: null,
                                    checkType: 'multiple'
                                })}
                            >
                                批量调案
                            </Button>
                            {selectedRowKeys.length > 0 && <span className='forward'>已选{selectedRowKeys.length}条</span>}
                        </div>
                    </Form.Item>
                </Form>
                <Table
                    bordered
                    size='small'
                    columns={this.columns}
                    rowKey='id'
                    dataSource={data}
                    pagination={pagination}
                    loading={loading}
                    onChange={this._handleTableChange}
                    scroll={{x: 2250}}
                    rowSelection={{
                        fixed: true,
                        hideDefaultSelections: false,
                        selectedRowKeys: selectedRowKeys,
                        getCheckboxProps: this._getCheckboxProps,
                        onChange: this._onHandleRowSelectionChange
                    }}
                />
                <Modal
                    centered
                    destroyOnClose={true}
                    title='调案'
                    visible={visible}
                    footer={null}
                    onCancel={() => this._handleCancel('visible')}
                >
                    <AdjustCase
                        caseId={caseId}
                        checkType={checkType}
                        sysUserId={sysUserId}
                        refresh={this._onRefresh}
                        oldUserName={userOverdue}
                        handleCancel={() => this._handleCancel('visible')}
                    />
                </Modal>
                <Modal
                    centered
                    destroyOnClose={true}
                    title='详情'
                    visible={visibleDetail}
                    width='88%'
                    style={{marginTop: 10}}
                    footer={null}
                    onCancel={() => this._handleCancelDetail()}>
                    <Division caseId={caseIdDetail} ifModal={true}/>
                </Modal>
                <Modal
                    centered
                    destroyOnClose={true}
                    title='名单状态更改'
                    visible={statusVisible}
                    footer={[
                        <Button type="primary" onClick={() => this._handleStatusSubmit()}>提交</Button>,
                        <Button onClick={() => this._handleStatusVisible(false)}>关闭</Button>
                    ]}
                    onCancel={() => this._handleStatusVisible(false)}
                    width={'40%'}
                >   
                    <div className="status_change flex-a-i flex">
                        <span className="status_label">状态更改：</span>
                        <Select placeholder='请选择' className="flex1" onChange={this._handleStatusChange} defaultValue={blockingInfo['status']}>
                            <Option value="1">拉黑</Option>
                            <Option value="0">启用</Option>
                        </Select>
                    </div>
                    <div className="status_change flex-a-i flex">
                        <span className="status_label">拉黑原因：</span>
                        <Select placeholder='请选择' className="flex1" onChange={this._blockingReasonChange} defaultValue={blockingInfo['blockingReason'] ? Number(blockingInfo['blockingReason']) : undefined}>
                            {blockingReasonInfo.map((item,index)=>
                                <Option value={item.code} key={index}>{item.msg}</Option>
                            )}
                        </Select>
                    </div>
                    <div className="status_change flex-a-i flex">
                        <span className="status_label">备注：</span>
                        <Input onChange={this._handleRemarkChange} defaultValue={blockingInfo['remark']}/>
                    </div>
                </Modal>
            </div>
        )
    }
}


const AllDivisionForm = Form.create()(Main);
export default AllDivisionForm;