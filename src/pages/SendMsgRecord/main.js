import React from 'react';
import './index.less';
import {SendMsgRecordComponent} from './components';
import {Http, TitleLine} from "../../components";
import {Button, Col, Form, Input, message, Row, Select} from "antd";
import {ColConfig} from "../../config";

const FormItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 6},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 16},
    },
    colon: false,
};

const Option = Select.Option;

class Main extends React.Component {
    state = {
        caseSource: [],
        stateArr: [],
        overdueStage: [],
        loadDay: [],
        phoneSource: [],
        queryObj: {},
    };

    componentDidMount() {
        this._dictByType();
        this._dictByTypePhoneSource();
    }

    _dictByType = async () => {
        try {
            const {errcode, errmsg, data} = await Http.dictByType({type: 'order_source'});
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

    _dictByTypePhoneSource = async () => {
        try {
            const {errcode, errmsg, data} = await Http.dictByType({type: 'phone_source'});
            if (errcode === 0) {
                this.setState({phoneSource: data});
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
        this.setState({queryObj: {}});
    };

    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('values', values);
                this.setState({queryObj: values});
            }
        });
    };

    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {caseSource, phoneSource, queryObj} = this.state;
        return (
            <div>
                <TitleLine
                    title='短信发送记录'
                    icon='edit-1-copy'
                />
                <Form onSubmit={this._handleSubmit} className='send-msg-record'>
                    <Row>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='借款订单号' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('orderId', {
                                    rules: [{required: false, message: '请输入借款订单号'},
                                    ],
                                })(
                                    <Input placeholder="请输入借款订单号"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='借款人姓名' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('name', {
                                    rules: [{required: false, message: '请输入借款人姓名'}],
                                })(
                                    <Input placeholder="请输入借款人姓名"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='借款人号码' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('phoneNumber', {
                                    rules: [{required: false, message: '请输入拨打号码'}],
                                })(
                                    <Input placeholder="请输入拨打号码"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='接收号码' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('receivePhone', {
                                    rules: [{required: false, message: '请输入接收号码'}],
                                })(
                                    <Input placeholder="请输入接收号码"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='号码来源' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('phoneSource', {
                                    rules: [{required: false, message: '请选择号码来源'}],
                                })(
                                    <Select placeholder='请选择号码来源'>
                                        {phoneSource.map(i => <Option value={i.value}>{i.label}</Option>)}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='关系备注' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('relation', {
                                    rules: [{required: false, message: '请输入关系备注'}],
                                })(
                                    <Input placeholder="请输入关系备注"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='操作人' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('operator', {
                                    rules: [{required: false, message: '请输入操作人'}],
                                })(
                                    <Input placeholder="请输入操作人"/>
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
                <SendMsgRecordComponent
                    type='sendMsg'
                    queryObj={queryObj}
                />
            </div>
        )
    }
}


const
    SendMsgRecordForm = Form.create()(Main);
export default SendMsgRecordForm;