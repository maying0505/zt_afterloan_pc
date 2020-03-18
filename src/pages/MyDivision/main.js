import React from 'react';
import './index.less';
import {TitleLine, Http} from '../../components';
import {Button, Col, Form, Input, Row, DatePicker, Select, message, Table, Divider, Modal} from 'antd';
import {ColConfig, PageSize, TableWidth, StateArr} from '../../config';
import moment from 'moment';
import AddCollectionRecord from '../AddCollectionRecord';
import AddCollectionRecordLog from '../AddCollectionRecordLog';
import Division from '../DivisionDetail';

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
        statusValue: '',
        statusVisible: false,
        data: [],
        loading: false,
        visible: false,
        title: '',
        LogModalVisible: false,
        caseId: '',
        phone: '',
        caseSource: [],
        stateArr: [],
        overdueStage: [],
        loadDay: [],
        pageIndex: sessionStorage.getItem('_ifBack') === '0' && sessionStorage.getItem('_pageIndex') ? JSON.parse(sessionStorage.getItem('_pageIndex')) : 1,
        queryObj: sessionStorage.getItem('_ifBack') === '0' && sessionStorage.getItem('_queryObj') ? JSON.parse(sessionStorage.getItem('_queryObj')) : {},
        pagination: sessionStorage.getItem('_ifBack') === '0' && sessionStorage.getItem('_pagination') ? JSON.parse(sessionStorage.getItem('_pagination')) : {pageSize: PageSize, showTotal: total => `共${total}条`},
        ifRefresh: false,
        orderSourceVal: '',
        sysUserId: '',
        userId: '',
        caseIdDetail: '',
        visibleDetail: false,
    };

    componentDidMount() {
        let paginationB = this.state.pagination;
        paginationB.showTotal = total => `共${total}条`;
        sessionStorage.removeItem('_ifBack');
        this._myDivisionList(this.state.pageIndex, this.state.queryObj);
        this._dictByType();
        this._dictByTypeLoadDay();
        this._myDivisionOverdueStage();
        this._getBlockingReason();
    }

    columns = [
        {
            title: '借款订单号',
            dataIndex: 'orderId',
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
            width: 110,
            render: (text, record) => {
                const {id: caseId} = record;
                return (
                    <span>
                        <a
                            href="javascript:;"
                            onClick={() => this._onDetail({caseId})}
                        >
                            详情
                        </a>
                        <Divider type="vertical"/>
                        <a
                            href="javascript:;"
                            onClick={() => this._onHistory({caseId})}
                        >
                            催收记录
                        </a>
                    </span>
                )
            },
        },
        {
            title: '操作',
            fixed: 'right',
            width: 170,
            render: (text, record) => {
                const {id: caseId, phone, sysUserId, userId, orderSourceVal} = record;
                return (<span>
                        <a
                            href="javascript:;"
                            onClick={() => this._onAdd({caseId, phone})}
                        >
                            添加催记
                        </a>
                        <Divider type="vertical"/>
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
    ];

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
    }

    _onAdd = ({caseId, phone}) => {
        this.setState({
            caseId,
            phone,
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

    _onHistory = ({caseId}) => {
        this.setState({
            caseId,
            ifRefresh: true,
            LogModalVisible: true,
        });
    };

    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {loanTime, planFeeTime, settleTime, ...rest} = values;
                const params = {};
                if (loanTime) {
                    Object.assign(params, {
                        loanTimeBegin: moment(loanTime[0]).format(DateFormat),
                        loanTimeEnd: moment(loanTime[1]).format(DateFormat),
                    });
                }
                if (planFeeTime) {
                    Object.assign(params, {
                        planFeeTimeBegin: moment(planFeeTime[0]).format(DateFormat),
                        planFeeTimeEnd: moment(planFeeTime[1]).format(DateFormat),
                    });
                }
                if (settleTime) {
                    Object.assign(params, {
                        settleTimeBegin: moment(settleTime[0]).format(DateFormat),
                        settleTimeEnd: moment(settleTime[1]).format(DateFormat),
                    });
                }
                const queryObj = {
                    ...rest,
                    ...params,
                };
                console.log('queryObj', queryObj);
                this.setState({queryObj});
                this._myDivisionList(1, queryObj);
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
            const result = await Http.myDivisionList(newParams);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            let dataArr = [];
            if (errcode === 0) {
                const {total, rows} = data;
                pagination.total = total;
                pagination.current = pageIndex;
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

    _handleReset = () => {
        const {form: {resetFields}} = this.props;
        resetFields();
        this.setState({queryObj: {}}, () => {
            this._myDivisionList(1);
        });
    };

    _handleCancel = (stateName) => {
        if (stateName === 'LogModalVisible') {
            this.setState({
                ifRefresh: false
            })
        }
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

    _onApply = () => {
        Modal.confirm({
            title: '提醒',
            content: '确认申请号码？',
            onOk: () => this._onApplyAccount(),
            onCancel() {
            },
        });
    };

    _onApplyAccount = async () => {
        try {
            const result = await Http.applyAccount();
            if (!result) {
                return;
            }
            const {errcode, errmsg} = result;
            if (errcode === 0) {
                message.info(errmsg);
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
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
            remark: this.state.remark,
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
        const {blockingInfo, blockingReasonInfo, caseIdDetail, visibleDetail,statusVisible, ifRefresh, queryObj, data, pagination, loading, visible, LogModalVisible, caseId, phone, caseSource, overdueStage, loadDay} = this.state;
        const {clientHeight} = document.body;
        const tableHeight = clientHeight - 340;
        return (
            <div>
                <TitleLine
                    title='我的分案'
                    icon='edit-1-copy'
                    rightContent={() => <Button type='primary' onClick={this._onApply}>申请号码</Button>}
                />
                <Form onSubmit={this._handleSubmit} className='my-division'>
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
                                        {loadDay.map(i => <Option value={i.value} key={i.value}>{i.label}</Option>)}
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
                                        {overdueStage.map(i => <Option value={i.id} key={i.id}>{i.stageName}</Option>)}
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
                    </Row>
                    <Form.Item style={{marginBottom: '10px'}}>
                        <div className='button-view'>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="submit"
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
                    scroll={{x: 2220}}
                />
                <Modal
                    destroyOnClose={true}
                    title='添加催记'
                    visible={visible}
                    footer={null}
                    onCancel={() => this._handleCancel('visible')}
                >
                    <AddCollectionRecord
                        caseId={caseId}
                        phone={phone}
                        visible={visible}
                        type={'myDivision'}
                        handleCancel={() => this._handleCancel('visible')}
                        onRefresh={this._myDivisionList}
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
                    title='催收记录'
                    visible={LogModalVisible}
                    footer={null}
                    onCancel={() => this._handleCancel('LogModalVisible')}
                    width={'80%'}
                >
                    <AddCollectionRecordLog caseId={caseId} ifRefresh={ifRefresh}/>
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

const MyDivisionForm = Form.create()(Main);
export default MyDivisionForm;