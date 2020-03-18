import React from 'react';
import './index.less';
import {TitleLine, Http,} from '../../components';
import {Button, Table, message, Modal, Input, InputNumber, Form, Spin} from 'antd';
import {PageSize, TableWidth} from '../../config';
import CollectionLog from '../CollectionLog';

const FormItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 5},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 12},
    },
};

const SubmitType = [
    {id: 0, label: '添加', code: 'add'},
    {id: 1, label: '编辑', code: 'edit'},
];

class Main extends React.Component {

    state = {
        configArr: [],
        visible: false,
        startTime: undefined,
        endTime: undefined,
        stageName: undefined,
        configId: null,
        submitTypeIndex: 0,
        loading: false,
        submit: false,
    };


    _onEdit = ({id, startTime, endTime, stageName}) => {
        this.setState({
            startTime,
            endTime,
            stageName,
            configId: id,
            visible: true,
            submitTypeIndex: 1,
        });
    };

    columns = [
        {
            title: '逾期阶段',
            dataIndex: 'stageName',
            width: TableWidth.middle,
        },
        {
            title: '起始日',
            dataIndex: 'startTime',
            width: TableWidth.small,
        },
        {
            title: '截止日',
            dataIndex: 'endTime',
            width: TableWidth.small,
        },
        {
            title: '添加用户',
            dataIndex: 'operatorName',
            width: TableWidth.large,
        },
        {
            title: '添加时间',
            dataIndex: 'operatorTime',
            width: TableWidth.xLarge,
        },
        {
            title: '操作',
            render: (text, record) => {
                const {id, startTime, endTime, stageName} = record;
                return (
                    <a
                        href="javascript:;"
                        onClick={() => this._onEdit({id, startTime, endTime, stageName})}
                        style={{marginRight: 8}}
                    >
                        编辑
                    </a>
                )
            },
        },

    ];

    componentDidMount() {
        this._getConfigList();
    }

    _getConfigList = async () => {
        try {
            this.setState({loading: true});
            const result = await Http.collectionConfigList();
            if (!result) {
                return;
            }
            const {errcode, data} = result;
            let dataArr = [];
            if (errcode === 0) {
                if (Array.isArray(data)) {
                    dataArr = data;
                }
            } else {
                message.error('请求服务失败');
            }
            this.setState({
                configArr: dataArr,
                loading: false,
            });
        } catch (e) {
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    _onAdd = () => {
        this.setState({
            visible: true,
            startTime: undefined,
            endTime: undefined,
            stageName: undefined,
            configId: null,
            submitTypeIndex: 0,
        });
    };

    _handleCancel = () => {
        this.setState({visible: false});
    };

    _handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({submit: true}, () => {
                    this._onSubmit(values);
                });
            }
        });
    };

    _onSubmit = async (params) => {
        try {
            const {configId} = this.state;
            const newParams = {
                id: configId,
                ...params,
            };
            const {errcode, errmsg} = await Http.collectionConfigAddAndEdit(newParams);
            if (errcode === 0) {
                message.info('提交成功');
                this.setState({visible: false});
                this._getConfigList();
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({submit: false});
        } catch (e) {
            this.setState({submit: false});
            message.error('请求服务异常');
        }
    };


    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {configArr, visible, stageName, configId, startTime, endTime, submitTypeIndex, loading, submit} = this.state;
        const {clientHeight} = document.body;
        const tableScrollY = clientHeight - 170;
        return (
            <div>
                <TitleLine
                    title='配置列表'
                    icon='edit-1-copy'
                    rightContent={() => <Button type='primary' onClick={this._onAdd}>添加逾期阶段</Button>}
                />
                <Table
                    rowKey='id'
                    size='small'
                    bordered={true}
                    loading={loading}
                    columns={this.columns}
                    dataSource={configArr}
                    scroll={{y: tableScrollY}}
                    pagination={{
                        pageSize: configArr.length,
                        showTotal: total => `共${total}条`,
                    }}
                />
                <Modal
                    centered
                    destroyOnClose={true}
                    title={`${SubmitType[submitTypeIndex].label}逾期阶段`}
                    visible={visible}
                    footer={null}
                    onCancel={this._handleCancel}
                >
                    <Spin size='large' spinning={submit}>
                        <Form onSubmit={this._handleSubmit} className='collection-config'>
                            <Form.Item {...FormItemLayout} label='逾期阶段'>
                                {getFieldDecorator('stageName', {
                                    initialValue: stageName,
                                    rules: [{required: true, message: '请输入逾期阶段名称'},
                                    ],
                                })(
                                    <Input
                                        placeholder="请输入逾期阶段名称"
                                    />
                                )}
                            </Form.Item>
                            <Form.Item {...FormItemLayout} label='起始日'>
                                {getFieldDecorator('startTime', {
                                    initialValue: startTime,
                                    rules: [{required: true, message: '请输入起始日'}],
                                })(
                                    <InputNumber
                                        min={0}
                                        max={1000}
                                        style={{width: '100%'}}
                                        placeholder="请输入起始日"
                                    />
                                )}
                            </Form.Item>
                            <Form.Item {...FormItemLayout} label='截止日'>
                                {getFieldDecorator('endTime', {
                                    initialValue: endTime,
                                    rules: [{required: true, message: '请输入截止日'}],
                                })(
                                    <InputNumber
                                        min={0}
                                        max={1000}
                                        style={{width: '100%'}}
                                        placeholder="请输入截止日"
                                    />
                                )}
                            </Form.Item>
                            <Form.Item>
                                <div className='button-view'>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="submit"
                                    >
                                        提交
                                    </Button>
                                    <Button
                                        className="close"
                                        htmlType="button"
                                        onClick={this._handleCancel}
                                    >
                                        关闭
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    </Spin>
                    {
                        configId &&
                        <div>
                            <h3>编辑逾期阶段记录</h3>
                            <CollectionLog
                                id={configId}
                                type='modal'
                            />
                        </div>
                    }
                </Modal>
            </div>
        )
    }
}

const CollectionForm = Form.create({name: 'collection_config'})(Main);
export default CollectionForm;