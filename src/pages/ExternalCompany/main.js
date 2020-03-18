/**
 * @desc 委外公司管理
 * */
import React from 'react';
import './index.less';
import {TitleLine, Http} from '../../components';
import {Button, Col, Form, Input, Row, DatePicker, Select, message, Table} from 'antd';
import {ColConfig, PageSize, TableWidth} from '../../config';
import moment from 'moment';
import {DetailForm} from './components';

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

const DateFormat = 'YYYY-MM-DD HH:mm';
const Option = Select.Option;
const {RangePicker} = DatePicker;


class Main extends React.Component {

    state = {
        data: [],
        pagination: {pageSize: PageSize, showTotal: total => `共${total}条`},
        loading: false,
        pageIndex: 1,
        queryObj: {},
        visible: false,
        title: '',
        overdueStage: [],
        organization: [],
        detailObj: {},
        operatorList: [],
    };

    componentDidMount() {
        this._handleSubmit();
        this._operatorList();
        this._myDivisionOverdueStage();
        //this._collectionMemberOrganization();
    }

    columns = [
        {
            title: '逾期时段',
            dataIndex: 'overdueStageNames',
            width: TableWidth.middle,
            render: (text) => {
                if (text !== null) {
                    return text.toString();
                } else {
                    return '';
                }
            },
        },
        {
            title: '姓名',
            dataIndex: 'name',
            width: TableWidth.middle,
        },
        {
            title: '性别',
            dataIndex: 'gender',
            width: TableWidth.small,
            render: (text) => {
                if (text !== null) {
                    if (text === '0') {
                        return '女';
                    }
                    if (text === '1') {
                        return '男';
                    }
                } else {
                    return '';
                }
            },
        },
        {
            title: '手机',
            dataIndex: 'phone',
            width: TableWidth.large,
        },
        {
            title: '参与分案',
            dataIndex: 'isAllocationName',
            width: TableWidth.small,
        },
        {
            title: '添加时间',
            dataIndex: 'createDate',
            width: TableWidth.xLarge,
        },
        {
            title: '所属机构',
            dataIndex: 'companyName',
            width: TableWidth.xLarge,
        },
        {
            title: '操作员',
            dataIndex: 'updateByName',
            width: TableWidth.middle,
        },
        {
            title: '操作',
            render: (text, record) => {
                const {id, name, gender, phone, isAllocation, notDutyStartTime, notDutyEndTime, overdueStageIds} = record;
                return (
                    <a
                        href="javascript:;"
                        onClick={() => this._onDetail({
                            id,
                            name,
                            gender,
                            phone,
                            isAllocation,
                            notDutyStartTime,
                            notDutyEndTime,
                            overdueStageIds
                        })}
                        style={{marginRight: 8}}
                    >
                        编辑
                    </a>
                )
            },
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

    _collectionMemberOrganization = async () => {
        try {
            const result = await Http.externalCompanyOrganization();
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
            const result = await Http.externalCompanyOperatorList();
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

    _onDetail = (detailObj) => {
        this.setState({
            detailObj,
            title: '查看',
            visible: true,
        });
    };

    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                const {createTime, ...rest} = values;
                let createStartTime = null;
                let createEndTime = null;
                if (createTime) {
                    createStartTime = moment(createTime[0]).format(DateFormat);
                    createEndTime = moment(createTime[1]).format(DateFormat);
                }
                const queryObj = {
                    createStartTime,
                    createEndTime,
                    ...rest,
                };
                this.setState({queryObj});
                this._collectionMemberList(1, queryObj);
            }
        });
    };

    _collectionMemberList = async (pageIndex, params = this.state.queryObj) => {
        try {
            this.setState({loading: true});
            const {pagination} = this.state;

            const newParams = {
                ...params,
                pageSize: PageSize,
                pageNo: pageIndex,
            };
            console.log('newParams', newParams);
            const result = await Http.externalCompanyList(newParams);
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
        } catch
            (e) {
            message.error('请求服务异常');
            this.setState({loading: false});
        }
    };

    _handleReset = () => {
        const {form: {resetFields}} = this.props;
        resetFields();
        this.setState({queryObj: {}}, () => {
            this._collectionMemberList(1);
        });
    };

    _handleAdd = () => {
        this.setState({
            title: '新增',
            visible: true,
            detailObj: {},
        });
    };

    _handleCancel = () => {
        this.setState({
            visible: false,
        });
    };

    _handleTableChange = (pagination, filters, sorter) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        }, () => {
            this._collectionMemberList(pagination.current);
        });
    };

    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {data, pagination, loading, visible, title, overdueStage, organization, detailObj, operatorList} = this.state;
        return (
            <div>
                <TitleLine
                    title='委外公司催收人员管理'
                    icon='edit-1-copy'
                />
                <Form onSubmit={this._handleSubmit} className='member-set'>
                    <Row>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='逾期阶段' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('overdueStageId', {
                                    rules: [{required: false, message: '请选择逾期阶段名称'},
                                    ],
                                })(
                                    <Select placeholder='请选择逾期时段'>
                                        {
                                            overdueStage.map(i => {
                                                return (
                                                    <Option
                                                        key={i.id}
                                                        value={i.id}
                                                    >
                                                        {i.stageName}
                                                    </Option>
                                                )
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='催收人员' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('nameOrphone', {
                                    rules: [{required: false, message: '催收人员姓名/手机'}],
                                })(
                                    <Input
                                        placeholder="催收人员姓名/手机"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='参与分案' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('isAllocation', {
                                    rules: [{required: false, message: '请选择是否参与分案'}],
                                })(
                                    <Select placeholder='请选择是否参与分案'>
                                        <Option value="1">是</Option>
                                        <Option value="0">否</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='操作员' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('operator', {
                                    rules: [{required: false, message: '请选择操作员'}],
                                })(
                                    <Select placeholder='请选择操作员'>
                                        {operatorList.map(i => <Option key={i.id} value={i.id}>{i.name}</Option>)}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='添加时间' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('createTime', {
                                    rules: [{required: false, message: '添加时间'}],
                                })(
                                    <RangePicker
                                        style={{width: '100%'}}
                                        format="YYYY-MM-DD"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        {/*<Col {...ColConfig}>*/}
                        {/*<Form.Item {...FormItemLayout} label='所属机构' style={{marginBottom: '0px'}}>*/}
                        {/*{getFieldDecorator('companyId', {*/}
                        {/*rules: [{required: false, message: '请选择所属机构'}],*/}
                        {/*})(*/}
                        {/*<Select placeholder='请选择所属机构'>*/}
                        {/*{organization.map(i => <Option key={i.id} value={i.id}>{i.name}</Option>)}*/}
                        {/*</Select>*/}
                        {/*)}*/}
                        {/*</Form.Item>*/}
                        {/*</Col>*/}
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
                        <div className='add'>
                            <Button
                                type="primary"
                                htmlType="button"
                                onClick={this._handleAdd}
                            >
                                添加催收人员
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
                />
                <DetailForm
                    title={title}
                    visible={visible}
                    detailObj={detailObj}
                    overdueStage={overdueStage}
                    handleCancel={this._handleCancel}
                    handleSubmit={this._handleSubmit}
                />
            </div>
        )
    }
}


const
    CollectionMemberSetForm = Form.create()(Main);
export default CollectionMemberSetForm;