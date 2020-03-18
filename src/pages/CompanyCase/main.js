/**
 * @Desc 机构分案管理
 * */
import React from 'react';
import './index.less';
import {TitleLine, Http} from '../../components';
import {Button, Col, Form, Input, Row, DatePicker, Select, message, Table, Modal, Divider} from 'antd';
import {ColConfig, PageSize, TableWidth, OverdueState,} from '../../config';
import {ForwardForm} from './component';
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
        visible: false,
        caseSource: [],
        overdueStage: [],
        organization: [],
        operatorList: [],
        selectedRowKeys: [],
    };

    componentDidMount() {
        this._handleSubmit();
        this._dictByType();
        this._operatorList();
        this._myDivisionOverdueStage();
        this._collectionMemberOrganization();
    }

    columns = [
        {
            title: '逾期时段',
            dataIndex: 'stageName',
        },
        {
            title: '逾期天数',
            dataIndex: 'overdueDay',
        },
        {
            title: '案件ID',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: '案件来源',
            dataIndex: 'orderSource',
        },
        {
            title: '借款编号',
            dataIndex: 'orderId',
            sorter: (a, b) => a.orderId - b.orderId,
            sortDirections: ['descend', 'ascend'],
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
            title: '当前逾期状态',
            dataIndex: 'states',
        },
        {
            title: '分案机构',
            dataIndex: 'companyName',
        },
        {
            title: '分案时间',
            dataIndex: 'operatorTime',
        },
        {
            title: '操作员',
            dataIndex: 'operator',
        },
        {
            title: '留案时间',
            dataIndex: 'leaveCaseDate',
            render: (text) => {
                if (text) {
                    return moment(text).format('YYYY-MM-DD')
                }
            },
        },
        {
            title: '预分案机构',
            dataIndex: 'preCompanyName',
        },
        {
            title: '预分案时间',
            dataIndex: 'preOperatorTime',
        },
        {
            title: '预分案操作员',
            dataIndex: 'preOperator',
        },
        {
            title: '操作',
            fixed: 'right',
            width: TableWidth.middle,
            render: (text, record) => {
                const {id: caseId, status, checked, states, recordId} = record;
                if (states === '已结清') {
                    return null;
                }
                return (
                    <span>
                        {
                            checked === 'false' && '留案'
                        }
                        {
                            checked === 'true' &&
                            <a
                                href="javascript:;"
                                onClick={() => this._handleLiuAn({caseId})}
                            >
                                留案
                            </a>
                        }
                        {
                            status === '0' && (
                                <span>
                                     <Divider type="vertical"/>
                                <a
                                    href="javascript:;"
                                    onClick={() => this._handleCancelForward({recordId})}
                                >
                                取消转派
                                </a>
                                </span>
                            )
                        }
                    </span>
                )
            },
        },
    ];

    _handleLiuAn = ({caseId}) => {
        Modal.confirm({
            title: '留案提示',
            content: '是否确认留案在当前催收员名下？',
            onOk: () => this._onLiuAn({caseId}),
            onCancel: () => null,
        });
    };

    _handleCancelForward = (params) => {
        Modal.confirm({
            title: '取消转派提示',
            content: '确认要取消转派吗？',
            onOk: () => this._onCancelForward(params),
            onCancel: () => null,
        });
    };

    _onCancelForward = async (params) => {
        try {
            const result = await Http.cancelForward(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg} = result;
            if (errcode === 0) {
                this.setState({selectedRowKeys: []}, () => {
                    this._myDivisionList(1);
                });
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _onLiuAn = async (params) => {
        try {
            const result = await Http.liuAn(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg} = result;
            if (errcode === 0) {
                this._myDivisionList(1);
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {operatorTime, loanTime, planFeeTime, ...rest} = values;
                const params = {};
                const addParams = (timeArr, keyA, keyB) => {
                    if (timeArr) {
                        Object.assign(params, {
                            [keyA]: moment(timeArr[0]).format(DateFormat),
                            [keyB]: moment(timeArr[1]).format(DateFormat),
                        });
                    }
                };
                addParams(operatorTime, 'operatorTimeBegin', 'operatorTimeEnd');
                addParams(loanTime, 'loanTimeBegin', 'loanTimeEnd');
                addParams(planFeeTime, 'planFeeTimeBegin', 'planFeeTimeEnd');

                const queryObj = {
                    ...rest,
                    ...params,
                };
                this.setState({queryObj});
                this._myDivisionList(1, '0', '0', queryObj);
            }
        });
    };

    _myDivisionList = async (pageIndex, sortCaseId = '0', sortOrderId = '0', params = this.state.queryObj) => {
        try {
            this.setState({loading: true});
            const {pagination} = this.state;
            const newParams = {
                ...params,
                sortCaseId,
                sortOrderId,
                pageSize: PageSize,
                pageNo: pageIndex,

            };
            console.log('newParams', newParams);
            const result = await Http.companyCaseList(newParams);
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

    _collectionMemberOrganization = async () => {
        try {
            const result = await Http.collectionMemberOrganization();
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({organization: data});
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
        const {field, order} = sorter;
        let sortCaseId = '0', sortOrderId = '0';
        if (field === 'id') {
            sortCaseId = order === 'descend' ? '0' : '1';
        }
        if (field === 'orderId') {
            sortOrderId = order === 'descend' ? '0' : '1';
        }
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        }, () => {
            this._myDivisionList(pagination.current, sortCaseId, sortOrderId);
        });
    };

    _handleForward = () => {
        // 批量转派
        const {selectedRowKeys} = this.state;
        if (selectedRowKeys.length === 0) {
            message.warn('请选择要转派的案件');
            return;
        }
        this.setState({visible: true});
    };

    _onHandleRowSelectionChange = (selectedRowKeys, selectedRows) => {
        this.setState({selectedRowKeys});
    };

    _getCheckboxProps = (record) => {
        const {preOperatorTime, checked, states} = record;
        let disabled = false;
        if (preOperatorTime !== null || checked === 'false' || states === '已结清') {
            disabled = true;
        }
        return {
            disabled: disabled,
        };
    };

    _refreshTable = () => {
        this.setState({selectedRowKeys: []}, () => {
            this._handleSubmit();
        });
    };

    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {
            data, pagination, loading, caseSource, overdueStage, organization, operatorList, selectedRowKeys, visible
        } = this.state;
        const {clientHeight} = document.body;
        const tableHeight = clientHeight - 400;
        return (
            <div>
                <TitleLine
                    title='机构分案管理'
                    icon='edit-1-copy'
                />
                <Form onSubmit={this._handleSubmit} className='company-case'>
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
                            <Form.Item {...FormItemLayout} label='逾期天数' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('overdueDay', {
                                    rules: [{required: false, message: '请输入逾期天数'},
                                    ],
                                })(
                                    <Input placeholder="请输入逾期天数"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='案件ID' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('id', {
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
                            <Form.Item {...FormItemLayout} label='借款编号' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('orderId', {
                                    rules: [{required: false, message: '请输入借款编号'},
                                    ],
                                })(
                                    <Input placeholder="请输入借款编号"/>
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
                            <Form.Item {...FormItemLayout} label='实还金额' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('trueTotalMoneyStart', {
                                    rules: [{required: false, message: '请输入实还金额'}],
                                })(
                                    <Input
                                        style={{width: '46%'}}
                                        placeholder='开始金额金额'
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
                                {getFieldDecorator('trueTotalMoneyEnd', {
                                    rules: [{required: false, message: '请输入实还金额'}],
                                })(
                                    <Input
                                        style={{width: '46%'}}
                                        placeholder='结束金额金额'
                                    />
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
                                {getFieldDecorator('operatorTime', {
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
                            <Form.Item {...FormItemLayout} label='所属机构' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('companyId', {
                                    rules: [{required: false, message: '请选择所属机构'}],
                                })(
                                    <Select placeholder='请选择所属机构'>
                                        {organization.map(i => <Option key={i.id} value={i.id}>{i.name}</Option>)}
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
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='是否留案' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('leaveCase', {
                                    rules: [{required: false, message: '请选择是否留案'}],
                                })(
                                    <Select placeholder='请选择是否留案'>
                                        <option value='1'>是</option>
                                        <option value='0'>否</option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='借款时间' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('loanTime', {
                                    rules: [{required: false, message: '请选择借款时间'}],
                                })(
                                    <RangePicker
                                        style={{width: '100%'}}
                                        format="YYYY-MM-DD"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='应还时间' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('planFeeTime', {
                                    rules: [{required: false, message: '请选择应还时间'}],
                                })(
                                    <RangePicker
                                        style={{width: '100%'}}
                                        format="YYYY-MM-DD"
                                    />
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
                            <Button
                                type="primary"
                                className="forward"
                                htmlType="button"
                                disabled={selectedRowKeys.length === 0}
                                onClick={this._handleForward}
                            >
                                批量转派
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
                    scroll={{x: 2050}}
                    rowSelection={{
                        fixed: true,
                        hideDefaultSelections: false,
                        selectedRowKeys: selectedRowKeys,
                        getCheckboxProps: this._getCheckboxProps,
                        onChange: this._onHandleRowSelectionChange
                    }}
                />
                <ForwardForm
                    visible={visible}
                    organization={organization}
                    selectedRowKeys={selectedRowKeys}
                    refreshTable={this._refreshTable}
                    handleCancel={() => this._handleCancel('visible')}
                />
            </div>
        )
    }
}

const CompanyCaseForm = Form.create()(Main);
export default CompanyCaseForm;