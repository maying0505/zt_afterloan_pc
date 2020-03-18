import React from 'react';
import './index.less';
import {Button, Col, Form, Input, message, Row, Select, Icon, Spin} from "antd";
import {ColConfig} from '../../../../config';
import PropTypes from 'prop-types';
import {Http} from '../../../../components';

const ModalFormItemLayout = {
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

const Option = Select.Option;

class Main extends React.Component {

    static propTypes = {
        showClose: PropTypes.bool,
        handleClose: PropTypes.func,
        caseId: PropTypes.string,
        phone: PropTypes.string,
        type: PropTypes.oneOf(['sendMsg', 'contact']),
    };

    static defaultProps = {
        showClose: false,
        handleClose: () => null,
        caseId: '',
        phone: '',
    };

    state = {
        visible: false,
        loading: false,
        caseId: '',
        phone: '',
        smsTempleate: [],
        name: '',
        receivePhone: '',
        phoneSource: '',
        relationRemark: '',
        phoneSourceList: [],
        submit: false,
        validateFail: false,
        totalMoney: null,
    };

    componentDidMount() {
        const {caseId, phone, type} = this.props;
        if (type === 'contact') {
            if (caseId !== this.state.caseId && phone !== this.state.phone) {
                this.setState({
                    caseId,
                    phone,
                    loading: true,
                }, () => {
                    this._preSendMsg({caseId, phone});
                });
            }
        } else if (type === 'sendMsg') {
            this._preSendMsg();
        }

    }

    componentWillReceiveProps(nextProps, nextContext) {

    }

    _handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this._sendMsg(values);
            } else {
                this.setState({validateFail: true});
            }
        });
    };

    _sendMsg = async (params) => {
        try {
            console.log('params', params);
            this.setState({submit: true});
            const {type} = this.props;
            const newParams = {
                ...params,
                isSendSms: type === 'sendMsg' ? '1' : '0',
            };
            const {errcode, errmsg} = await Http.sendMsg(newParams);
            if (errcode === 0) {
                message.info(errmsg);
                this._handleCancel();
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

    _preSendMsg = async (params) => {
        try {
            const {errcode, errmsg, data} = await Http.preSendMsg(params);
            let newData = {};
            if (errcode === 0) {
                newData = data;
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            const {validateFail} = this.state;
            if (validateFail) {
                const {form: {setFieldsValue}} = this.props;
                const {name, phone, receivePhone, phoneSource} = data;
                setFieldsValue({name});
                setFieldsValue({phoneSource});
                setFieldsValue({receivePhone});
                setFieldsValue({phoneNumber: phone});
                this.setState({
                    loading: false,
                    ...data,
                });
            } else {
                this.setState({
                    loading: false,
                    ...newData,
                });
            }
        } catch (e) {
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    _handleCancel = () => {
        const {showClose, handleClose} = this.props;
        if (showClose) {
            handleClose && handleClose();
        }
    };

    _onCaseIdInputChange = (e) => {
        if (e.target && e.target.value) {
            const value = e.target.value;
            this.setState({
                loading: true,
            }, () => {
                this._preSendMsg({caseId: value});
            });
        }
    };

    _onSelectChange = (e) => {
        const {form: {setFieldsValue}, type} = this.props;
        const {smsTempleate, name, totalMoney} = this.state;
        const target = smsTempleate.filter(i => i.id === e);
        if (target.length > 0) {
            const c = target[0].templateContent;
            let a = null;
            if (type === 'contact' || type === 'sendMsg') {
                const temp = c.replace('XXX', name);
                a = temp.replace('$', totalMoney);
            }
            if (!a) {
                return;
            }
            setFieldsValue({'smsContent': a});
        }
    };

    render() {
        const {form: {getFieldDecorator}, showClose} = this.props;
        const {
            loading, phone, caseId, smsTempleate, name, receivePhone, phoneSource, relationRemark, phoneSourceList,
            submit,
        } = this.state;
        const prefix = loading ? <Icon type="loading" style={{color: '#E0B788'}}/> : '';
        return (
            <div className='send-msg'>
                <Spin size="large" spinning={submit}>
                    <Form onSubmit={this._handleSubmit} className='send-msg-form'>
                        <Row>
                            <Col {...ColConfig}>
                                <Form.Item {...ModalFormItemLayout} label='案件ID' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('caseId', {
                                        initialValue: caseId,
                                        rules: [{required: false, message: '请输入案件ID'},
                                        ],
                                    })(
                                        <Input
                                            placeholder='请输入案件ID'
                                            prefix={prefix}
                                            onChange={this._onCaseIdInputChange}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col {...ColConfig}>
                                <Form.Item {...ModalFormItemLayout}
                                           label='借款人姓名'
                                           style={{marginBottom: '0px'}}
                                >
                                    {getFieldDecorator('name', {
                                        initialValue: name,
                                        rules: [{required: false, message: '请输入借款人姓名'}],
                                    })(
                                        <Input
                                            placeholder="请输入借款人姓名"
                                            prefix={prefix}
                                            disabled={true}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col {...ColConfig}>
                                <Form.Item {...ModalFormItemLayout} label='借款人号码' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('phoneNumber', {
                                        initialValue: phone,
                                        rules: [{required: false, message: '请输入借款人号码'}],
                                    })(
                                        <Input
                                            placeholder="请输入借款人号码"
                                            prefix={prefix}
                                            disabled={true}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col {...ColConfig}>
                                <Form.Item {...ModalFormItemLayout} label='接收号码' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('receivePhone', {
                                        initialValue: receivePhone,
                                        rules: [{required: false, message: '请输入接收号码'},
                                        ],
                                    })(
                                        <Input
                                            placeholder="请输入接收号码"
                                            prefix={prefix}
                                        />
                                    )}
                                </Form.Item>
                            </Col>

                            <Col {...ColConfig}>
                                <Form.Item {...ModalFormItemLayout} label='号码来源' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('phoneSource', {
                                        initialValue: phoneSource,
                                        rules: [{required: false, message: '请选择号码来源'},
                                        ],
                                    })(
                                        <Select placeholder='请选择号码来源' loading={loading}>
                                            {
                                                phoneSourceList.map((item, index) => {
                                                    const {label, value} = item;
                                                    return (
                                                        <Option value={value} key={index}>{label}</Option>
                                                    )
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col {...ColConfig}>
                                <Form.Item {...ModalFormItemLayout} label='关系备注2' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('relation', {
                                        initialValue: relationRemark,
                                        rules: [{required: false, message: '请输入关系备注2'},
                                        ],
                                    })(
                                        <Input
                                            placeholder="请输入关系备注2"
                                            prefix={prefix}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col {...ColConfig}>
                                <Form.Item {...ModalFormItemLayout} label='短信模板' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('templateId', {
                                        rules: [{required: true, message: '请选择短信模板'},
                                        ],
                                    })(
                                        <Select
                                            placeholder='请选择短信模板'
                                            loading={loading}
                                            onChange={this._onSelectChange}
                                        >
                                            {
                                                smsTempleate.map((item, index) => {
                                                    const {templateContent, id} = item;
                                                    return (
                                                        <Option value={id} key={index}>{templateContent}</Option>
                                                    )
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col {...ColConfig}>
                                <Form.Item {...ModalFormItemLayout} label='短信内容' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('smsContent', {
                                        rules: [{required: true, message: '请输入短信内容'},
                                        ],
                                    })(
                                        <Input.TextArea
                                            autosize={{minRows: 3, maxRows: 6}}
                                            placeholder="请输入短信内容"
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
                                    提交
                                </Button>
                                {
                                    showClose &&
                                    <Button
                                        className="close"
                                        htmlType="button"
                                        onClick={this._handleCancel}
                                    >
                                        关闭
                                    </Button>
                                }
                            </div>
                        </Form.Item>
                    </Form>
                </Spin>
            </div>
        )
    }
}

const SendMsgForm = Form.create()(Main);
export default SendMsgForm;