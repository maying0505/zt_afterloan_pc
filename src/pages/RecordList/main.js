/**
 * @Desc 催收记录
 * */
import React from 'react';
import './index.less';
import {TitleLine, Http} from '../../components';
import {Button, Col, Form, Input, Row, DatePicker, Select, message, Table} from 'antd';
import {ColConfig, PageSize, TableWidth, StateArr} from '../../config';
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
        problemCode: [],
        overdueStage: [],
    };

    componentDidMount() {
        this._handleSubmit();
        this._dictByType();
        this._myDivisionOverdueStage();
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
            title: '借款人号码',
            dataIndex: 'orderPhone',
        },
        {
            title: '用户属性',
            dataIndex: 'customerType',
        },
        {
            title: '催收人',
            dataIndex: 'userOverdue',
        },
        {
            title: '催收时间',
            dataIndex: 'operatorTime',
            render: (text) => {
                if (text) {
                    return moment(text).format(DateFormat);
                } else {
                    return '';
                }
            }
        },
        {
            title: '联系人姓名',
            dataIndex: 'relationName',
        },
        {
            title: '拨打号码',
            dataIndex: 'phoneNumber',
        },
        {
            title: '问题代码',
            dataIndex: 'problemCode',
        },
        {
            title: '逾期时段',
            dataIndex: 'stageName',
        },
        {
            title: '号码来源',
            dataIndex: 'phoneSource',
        },
        {
            title: '关系备注2',
            dataIndex: 'relation',
        },
        {
            title: '问题备注',
            dataIndex: 'problemDescription',
        },
        {
            title: '还款状态',
            dataIndex: 'states',
        },
    ];

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

    _onDetail = ({caseId}) => {
        this.props.history.push(`/main/divisionDetail/${caseId}`)
    };

    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {recordTime, ...rest} = values;
                const params = {};
                const addParams = (timeArr, keyA, keyB) => {
                    if (timeArr) {
                        Object.assign(params, {
                            [keyA]: moment(timeArr[0]).format(DateFormat),
                            [keyB]: moment(timeArr[1]).format(DateFormat),
                        });
                    }
                };
                addParams(recordTime, 'recordTimeBegin', 'recordTimeEnd');
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

    _myDivisionList = async (pageIndex, params = this.state.queryObj) => {
        try {
            this.setState({loading: true});
            const {pagination} = this.state;
            const newParams = {
                ...params,
                pageSize: PageSize,
                pageNo: pageIndex,
            };
            const result = await Http.addCollectionRecordLog(newParams);
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

    _dictByType = async () => {
        try {
            const result = await Http.dictByType({type: 'problem_code'});
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({problemCode: data});
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
        const {data, pagination, loading, problemCode, overdueStage} = this.state;
        const {clientHeight} = document.body;
        const tableHeight = clientHeight - 300;
        return (
            <div>
                <TitleLine
                    title='催收记录'
                    icon='edit-1-copy'
                />
                <Form onSubmit={this._handleSubmit} className='record-list'>
                    <Row>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='借款人' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('orderId', {
                                    rules: [{required: false, message: '请输入借款人订单号/姓名/认证号码'},
                                    ],
                                })(
                                    <Input placeholder="借款人订单号/姓名/认证号码"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='催收员' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('userOverdue', {
                                    rules: [{required: false, message: '请输入催收员姓名'},
                                    ],
                                })(
                                    <Input placeholder="请输入催收员姓名"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='催收时间' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('recordTime', {
                                    rules: [{required: false, message: '请选择催收时间'}],
                                })(
                                    <RangePicker
                                        style={{width: '100%'}}
                                        format="YYYY-MM-DD"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='拨打号码' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('phoneNumber', {
                                    rules: [{required: false, message: '请输入拨打号码'},
                                    ],
                                })(
                                    <Input placeholder="请输入拨打号码"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='问题代码' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('problemCode', {
                                    rules: [{required: false, message: '请选择问题代码'}],
                                })(
                                    <Select placeholder='请选择问题代码'>
                                        {problemCode.map(i => <Option value={i.value}>{i.label}</Option>)}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='用户属性' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('customerType', {
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
                    scroll={{x: 1500}}
                />
            </div>
        )
    }
}

const PayListForm = Form.create()(Main);
export default PayListForm;