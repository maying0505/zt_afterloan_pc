import React from 'react';
import './index.less';
import {TitleLine, Http} from '../../components';
import {Button, Col, Form, Input, Row, DatePicker, Select, message, Table, Divider, Modal} from 'antd';
import {ColConfig, PageSize, TableWidth, StateArr,} from '../../config';
import moment from 'moment';
import AddCollectionRecord from '../AddCollectionRecord';
import AddCollectionRecordLog from '../AddCollectionRecordLog';

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

const {RangePicker} = DatePicker;
const DateFormat = 'YYYY-MM-DD HH:mm';
const Option = Select.Option;

class Main extends React.Component {

    state = {
        data: [],
        loading: false,
        visible: false,
        title: '',
        LogModalVisible: false,
        caseId: '',
        caseSource: [],
        stateArr: [],
        overdueStage: [],
        loadDay: [],
        ifRefresh: false,
        pageIndex: sessionStorage.getItem('_ifBack') === '0' && sessionStorage.getItem('_pageIndex') ? JSON.parse(sessionStorage.getItem('_pageIndex')) : 1,
        queryObj: sessionStorage.getItem('_ifBack') === '0' && sessionStorage.getItem('_queryObj') ? JSON.parse(sessionStorage.getItem('_queryObj')) : {},
        pagination: sessionStorage.getItem('_ifBack') === '0' && sessionStorage.getItem('_pagination') ? JSON.parse(sessionStorage.getItem('_pagination')) : {pageSize: PageSize, showTotal: total => `共${total}条`},
    };

    componentDidMount() {
        const {match: {params: {companyId}}} = this.props;
        let paginationB = this.state.pagination;
        paginationB.showTotal = total => `共${total}条`;
        sessionStorage.removeItem('_ifBack');
        this._myDivisionList(this.state.pageIndex, companyId, this.state.queryObj);
        this._dictByType();
        this._dictByTypeLoadDay();
        this._myDivisionOverdueStage();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const {match: {params: {companyId}}} = nextProps;
        console.log('companyId', companyId);
        console.log('last Id', this.props.match.params.companyId);
        let paginationB = this.state.pagination;
        paginationB.showTotal = total => `共${total}条`;
        sessionStorage.removeItem('_ifBack');
        if (companyId !== this.props.match.params.companyId) {
            this._handleReset();
            this.setState({
                pageIndex: 1,
                queryObj: {},
                pagination: {pageSize: PageSize, showTotal: total => `共${total}条`},
            },function(){
                this._myDivisionList(this.state.pageIndex, companyId, this.state.queryObj);
            })
        }
    }

    columns = [
        {
            title: '案件ID',
            dataIndex: 'id',
        },
        {
            title: '案件来源',
            dataIndex: 'orderSource',
        },
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
            title: '逾期天数',
            dataIndex: 'overdueDay',
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
            title: '委外时间',
            dataIndex: 'outerTime',
        },
        {
            title: '查看',
            fixed: 'right',
            width: TableWidth.middle,
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
                        {/*<Divider type="vertical"/>*/}
                        {/*<a*/}
                        {/*href="javascript:;"*/}
                        {/*onClick={() => null}*/}
                        {/*>*/}
                        {/*合同*/}
                        {/*</a>*/}
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
    ];

    _onAdd = ({caseId}) => {
        this.setState({
            caseId,
            visible: true,
        });
    };

    _onDetail = ({caseId}) => {
        sessionStorage.setItem('_queryObj',JSON.stringify(this.state.queryObj));
        sessionStorage.setItem('_pageIndex',JSON.stringify(this.state.pageIndex));
        sessionStorage.setItem('_pagination',JSON.stringify(this.state.pagination));
        this.props.history.push(`/main/divisionDetail/${caseId}`)
    };

    _onHistory = ({caseId}) => {
        this.setState({
            caseId,
            ifRefresh: true,
            LogModalVisible: true,
        });
    };

    _handleSubmit = (e, companyId) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {loanTime, planFeeTime, settleTime, outerTime, ...rest} = values;
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
                if (outerTime) {
                    Object.assign(params, {
                        outerTimeBegin: moment(outerTime[0]).format(DateFormat),
                        outerTimeEnd: moment(outerTime[1]).format(DateFormat),
                    });
                }
                const queryObj = {
                    ...rest,
                    ...params,
                };
                console.log('queryObj', queryObj);
                this.setState({queryObj});
                this._myDivisionList(1, companyId, queryObj);
            }
        });
    };

    _myDivisionList = async (pageIndex, companyId, params = this.state.queryObj) => {
        try {
            this.setState({loading: true});
            const {pagination} = this.state;
            const newParams = {
                ...params,
                companyId,
                pageSize: PageSize,
                pageNo: pageIndex,
            };
            const result = await Http.outerCaseList(newParams);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            let dataArr = [];
            if (errcode === 0) {
                const {total, rows} = data;
                pagination.total = total;
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
            const {match: {params: {companyId}}} = this.props;
            this._myDivisionList(1, companyId);
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
            const {match: {params: {companyId}}} = this.props;
            this._myDivisionList(pagination.current, companyId);
        });
    };

    render() {
        const {form: {getFieldDecorator}, match: {params: {companyId}}} = this.props;
        const {ifRefresh, queryObj, data, pagination, loading, visible, LogModalVisible, caseId, caseSource, overdueStage, loadDay} = this.state;
        const {clientHeight} = document.body;
        const tableHeight = clientHeight - 340;
        console.log('this.props', this.props);
        return (
            <div>
                <TitleLine
                    title='委外分案'
                    icon='edit-1-copy'
                />
                <Form onSubmit={(e) => this._handleSubmit(e, companyId)} className='outer-case'>
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
                            <Form.Item {...FormItemLayout} label='委外时间' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('outerTime', {
                                    initialValue: queryObj['outerTimeBegin'] && queryObj['outerTimeEnd'] ? [moment(queryObj['outerTimeBegin'],"YYYY-MM-DD"),moment(queryObj['outerTimeEnd'],"YYYY-MM-DD")] :undefined,
                                    rules: [{required: false, message: '委外时间'}],
                                })(
                                    <RangePicker
                                        style={{width: '100%'}}
                                        format="YYYY-MM-DD"
                                    />
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
                    scroll={{x: 2100}}
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
                        visible={visible}
                        type={'myDivision'}
                        handleCancel={() => this._handleCancel('visible')}
                    />
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
            </div>
        )
    }
}

const MyDivisionForm = Form.create()(Main);
export default MyDivisionForm;