/**
 * @Desc 分案日志
 * */
import React from 'react';
import './index.less';
import {TitleLine, Http} from '../../components';
import {Button, Col, Form, Input, Row, DatePicker, Select, message, Table} from 'antd';
import {ColConfig, PageSize, TableWidth, OverdueState} from '../../config';
import moment from 'moment';

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
        pagination: {pageSize: PageSize, showTotal: total => `共${total}条`},
        loading: false,
        pageIndex: 1,
        queryObj: {},
        caseSource: [],
        overdueStage: [],
        loadDay: [],
        overdueUser: [],
        operatorList: [],
    };

    componentDidMount() {
        this._handleSubmit();
        this._dictByType();
        this._dictByTypeLoadDay();
        this._myDivisionOverdueStage();
        this._overdueUser();
        this._operatorList();
    }

    columns = [
        {
            title: '逾期时段',
            dataIndex: 'stageName',
        },
        {
            title: '案件ID',
            dataIndex: 'caseId',
        },
        {
            title: '案件来源',
            dataIndex: 'orderSourceLabel',
        },
        {
            title: '借款编号',
            dataIndex: 'orderId',
        },
        {
            title: '借款人',
            dataIndex: 'name',
        },
        {
            title: '当前逾期状态',
            dataIndex: 'states',
        },
        {
            title: '分案时间',
            dataIndex: 'operatorTime',
        },
        {
            title: '催收员',
            dataIndex: 'currentUserName',
        },
        {
            title: '操作员',
            dataIndex: 'operatorName',
        }
    ];

    _onDetail = ({caseId}) => {
        this.props.history.push(`/divisionDetail/${caseId}`)
    };

    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {caseTime, ...rest} = values;
                const params = {};
                const addParams = (timeArr, keyA, keyB) => {
                    if (timeArr) {
                        Object.assign(params, {
                            [keyA]: moment(timeArr[0]).format(DateFormat),
                            [keyB]: moment(timeArr[1]).format(DateFormat),
                        });
                    }
                };
                addParams(caseTime, 'caseStartTime', 'caseEndTime');
                const queryObj = {
                    ...rest,
                    ...params,
                };
                this.setState({queryObj});
                this._myDivisionList(1, queryObj);
            }
        });
    };

    _myDivisionList = async (pageIndex, params = this.state.queryObj) => {
        try {
            this.setState({loading: true});
            const {pagination} = this.state;
            const newParams = {
                ...params,
                pageSize: PageSize,
                pageNo: pageIndex,
            };
            const result = await Http.divisionLog(newParams);
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

    _operatorList = async () => {
        try {
            const params = {companyId: ''};
            const result = await Http.collectionMemberOperatorList(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({operatorList: data});
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

    _handleTableChange = (pagination, filters, sorter) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        }, () => {
            this._myDivisionList(pagination.current);
        });
    };

    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {data, pagination, loading, caseSource, overdueStage, operatorList, overdueUser} = this.state;
        const {clientHeight} = document.body;
        const tableHeight = clientHeight - 340;
        return (
            <div>
                <TitleLine
                    title='分案日志'
                    icon='edit-1-copy'
                />
                <Form onSubmit={this._handleSubmit} className='division-log'>
                    <Row>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='逾期时段' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('overdueStageId', {
                                    rules: [{required: false, message: '请选择逾期时段'}],
                                })(
                                    <Select placeholder='请选择逾期时段'>
                                        {overdueStage.map(i => <Option value={i.id}>{i.stageName}</Option>)}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='借款人' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('name', {
                                    rules: [{required: false, message: '请输入借款人订单号/姓名/认证号码'},
                                    ],
                                })(
                                    <Input placeholder="借款人订单号/姓名/认证号码"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='案件ID' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('caseId', {
                                    rules: [{required: false, message: '请输入案件ID'},
                                    ],
                                })(
                                    <Input placeholder="请输入案件ID"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='逾期状态' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('states', {
                                    rules: [{required: false, message: '请选择当前逾期状态'}],
                                })(
                                    <Select placeholder='请选择当前逾期状态'>
                                        {OverdueState.map(i => <Option key={i[0]} value={i[0]}>{i[1]}</Option>)}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='分案时间' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('caseTime', {
                                    rules: [{required: false, message: '请选择分案时间'}],
                                })(
                                    <RangePicker
                                        style={{width: '100%'}}
                                        format="YYYY-MM-DD"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='案件来源' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('orderSource', {
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
                            <Form.Item {...FormItemLayout} label='催收员' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('collectorName', {
                                    rules: [{required: false, message: '请输入催收员'},
                                    ],
                                })(
                                    <Select placeholder='请输入催收员'>
                                        {overdueUser.map(i => <Option value={i.id}>{i.name}</Option>)}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='操作员' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('operator', {
                                    rules: [{required: false, message: '请选择操作员'},
                                    ],
                                })(
                                    <Select placeholder='请选择操作员'>
                                        {operatorList.map(i => <Option key={i.id} value={i.id}>{i.name}</Option>)}
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
                    scroll={{x: 1000}}
                />
            </div>
        )
    }
}

const PayListForm = Form.create()(Main);
export default PayListForm;