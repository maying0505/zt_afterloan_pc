/**
 *  @Desc 添加催记
 */
import React from 'react';
import './index.less';
import {Button, Col, Input, Spin, Radio, Row, Form, Select, message} from 'antd';
import PropTypes from 'prop-types';
import {Http} from "../../components";

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

const ModalColConfig = {
    xs: 24,
    sm: 24,
    md: 24,
};

const RadioGroup = Radio.Group;
const Option = Select.Option;

class Main extends React.PureComponent {

    static propTypes = {
        mask: PropTypes.bool,
        maskStyle: PropTypes.object,
        caseId: PropTypes.string.isRequired,
        visible: PropTypes.bool.isRequired,
        type: PropTypes.string.isRequired,
        onRefresh: PropTypes.func,
        phone: PropTypes.string,
        id: PropTypes.string,
    };

    static defaultProps = {
        mask: true,
        maskStyle: {},
        phone: '',
        id: '',
    };

    state = {
        isSendMsg: false,
        isAddContact: false,
        phoneSource: '',
        phoneSourceName: '',
        phoneNumber: '',
        totalMoney: '',
        name: '',
        problemCode: [],
        smsTempleate: [],
        submit: false,
        loading: false,
    };

    componentDidMount() {
        const {type, caseId, phone} = this.props;
        if (type === 'myDivision') {
            this._preAddCollectionRecord({caseId, phone});
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.visible === true && nextProps.type === 'DivisionDetail') {
            const params = {
                caseId: this.props.caseId,
            };
            if (nextProps.phone !== this.props.phone) {
                Object.assign(params, {phone: nextProps.phone});
                this._preAddCollectionRecord(params);
            }
        }
    }

    _preAddCollectionRecord = async (params) => {
        try {
            this.setState({loading: true});
            const {errcode, errmsg, data} = await Http.preAddCollectionRecord(params);
            if (errcode === 0) {
                const {phoneSource, phoneSourceName, phoneNumber, problemCode, name, smsTempleate, totalMoney} = data;
                this.setState({
                    phoneSource,
                    phoneSourceName,
                    phoneNumber,
                    problemCode,
                    smsTempleate,
                    totalMoney,
                    name,
                    loading: false,
                });
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
                this.setState({loading: false});
            }
        } catch (e) {
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    _handleCancel = (e) => {
        const {handleCancel, form: {resetFields}} = this.props;
        resetFields();
        handleCancel && handleCancel(e);
    };

    _handleRefresh = () => {
        const {type, onRefresh} = this.props;
        if (type === 'myDivision') {
            onRefresh && onRefresh();
        }
    };

    _onAddContact = (e) => {
        this.setState({isAddContact: e.target.value === 1});
    };

    _onSendMsg = (e) => {
        this.setState({isSendMsg: e.target.value === 1});
    };

    _handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this._onAddCollectionRecord(values);
            }
        });
    };

    _onAddCollectionRecord = async (params) => {
        try {
            this.setState({submit: true});
            const {caseId, id} = this.props;
            const {phoneSource} = this.state;
            const newParams = {
                ...params,
                caseId,
                phoneSource,
                relationId: id,
            };
            const {errcode, errmsg} = await Http.addCollectionRecord(newParams);
            if (errcode === 0) {
                this._handleCancel(true);
                this._handleRefresh();
                message.info(errmsg);
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({submit: false});
        } catch (e) {
            console.log(e)
            this.setState({submit: false});
            message.error('请求服务异常');
        }
    };

    _onSelectChange = (e) => {
        const {form: {setFieldsValue}, type} = this.props;
        const {smsTempleate, name, totalMoney} = this.state;
        const target = smsTempleate.filter(i => i.id === e);
        if (target.length > 0) {
            const c = target[0].templateContent;
            let a = null;
            if (type === 'myDivision' || type === 'DivisionDetail') {
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
        const {form: {getFieldDecorator}, type} = this.props;
        const {isSendMsg, isAddContact, phoneSourceName, phoneNumber, problemCode, smsTempleate, submit, loading} = this.state;
        console.log('this.state', this.state);
        return (
            <Spin size='large' spinning={submit}>
                <Form onSubmit={this._handleSubmit} className='add-collection-record'>
                    <Row>
                        <Col {...ModalColConfig}>
                            <Form.Item {...ModalFormItemLayout} label='号码来源' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('phoneSourceName', {
                                    initialValue: phoneSourceName,
                                    rules: [{required: false, message: '请输入号码来源'},
                                    ],
                                })(
                                    <Input
                                        placeholder="请输入号码来源"
                                        disabled={true}
                                        style={{color: '#000'}}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ModalColConfig}>
                            <Form.Item {...ModalFormItemLayout}
                                       label='拨打号码'
                                       style={{marginBottom: '0px'}}
                            >
                                {getFieldDecorator('phoneNumber', {
                                    initialValue: phoneNumber,
                                    rules: [{required: false, message: '请输入拨打号码'}],
                                })(
                                    <Input
                                        placeholder="请输入拨打号码"
                                        disabled={true}
                                        style={{color: '#000'}}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ModalColConfig}>
                            <Form.Item {...ModalFormItemLayout} label='问题代码' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('problemCode', {
                                    rules: [{required: true, message: '请选择问题代码'}],
                                })(
                                    <Select placeholder='请选择问题代码' loading={loading}>
                                        {
                                            problemCode.map((item, index) => {
                                                const {label, value, type, description} = item;
                                                return (
                                                    <Option value={value} key={index}>{`${label}`}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ModalColConfig}>
                            <Form.Item {...ModalFormItemLayout} label='关系备注2' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('relation', {
                                    rules: [{required: false, message: '请输入关系备注2'},
                                    ],
                                })(
                                    <Input
                                        placeholder="请输入关系备注2"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col {...ModalColConfig}>
                            <Form.Item {...ModalFormItemLayout} label='问题备注' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('problemDescription', {
                                    rules: [{required: false, message: '请输入问题备注'},
                                    ],
                                })(
                                    <Input.TextArea
                                        placeholder="请输入问题备注"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>

                    {/*<Row>*/}
                    {/*<Col {...ModalColConfig}>*/}
                    {/*<Form.Item {...ModalFormItemLayout} label='短信模板' style={{marginBottom: '0px'}}>*/}
                    {/*{getFieldDecorator('templateId', {*/}
                    {/*rules: [{required: false, message: '请选择短信模板'},*/}
                    {/*],*/}
                    {/*})(*/}
                    {/*<Select*/}
                    {/*placeholder='请选择短信模板'*/}
                    {/*loading={loading}*/}
                    {/*onChange={this._onSelectChange}*/}
                    {/*>*/}
                    {/*{*/}
                    {/*smsTempleate.map((item, index) => {*/}
                    {/*const {id, templateContent} = item;*/}
                    {/*return (*/}
                    {/*<Option value={id} key={index}>{templateContent}</Option>*/}
                    {/*)*/}
                    {/*})*/}
                    {/*}*/}
                    {/*</Select>*/}
                    {/*)}*/}
                    {/*</Form.Item>*/}
                    {/*</Col>*/}
                    {/*<Col {...ModalColConfig}>*/}
                    {/*<Form.Item {...ModalFormItemLayout} label='发送短信' style={{marginBottom: '0px'}}>*/}
                    {/*{getFieldDecorator('isSendSms', {*/}
                    {/*initialValue: 0,*/}
                    {/*rules: [{required: false, message: '请选择是否发送短信'},*/}
                    {/*],*/}
                    {/*})(*/}
                    {/*<RadioGroup onChange={this._onSendMsg}>*/}
                    {/*<Radio value={1}>是</Radio>*/}
                    {/*<Radio value={0}>否</Radio>*/}
                    {/*</RadioGroup>*/}
                    {/*)}*/}
                    {/*</Form.Item>*/}
                    {/*</Col>*/}
                    {/*</Row>*/}
                    {/*<Row style={isSendMsg ? null : {display: 'none'}}>*/}
                    {/*<Col {...ModalColConfig}>*/}
                    {/*<Form.Item {...ModalFormItemLayout} label='短信内容' style={{marginBottom: '0px'}}>*/}
                    {/*{getFieldDecorator('smsContent', {*/}
                    {/*rules: [{required: false, message: '请输入短信内容'},*/}
                    {/*],*/}
                    {/*})(*/}
                    {/*<Input.TextArea*/}
                    {/*autosize={{minRows: 4, maxRows: 6}}*/}
                    {/*placeholder="请输入短信内容"*/}
                    {/*/>*/}
                    {/*)}*/}
                    {/*</Form.Item>*/}
                    {/*</Col>*/}
                    {/*</Row>*/}

                    <Row>
                        <Col {...ModalColConfig}>
                            <Form.Item {...ModalFormItemLayout} label='催收评价' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('evaluation', {
                                    rules: [{required: true, message: '请选择催收评价'},
                                    ],
                                })(
                                    <Select placeholder='请选择催收评价'>
                                        <Option value="1">优</Option>
                                        <Option value="2">良</Option>
                                        <Option value="3">中</Option>
                                        <Option value="4">差</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col {...ModalColConfig}>
                            <Form.Item {...ModalFormItemLayout} label='添加联系人' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('isAddRelation', {
                                    initialValue: 0,
                                    rules: [{required: false, message: '请选择是否添加联系人'},
                                    ],
                                })(
                                    <RadioGroup onChange={this._onAddContact}>
                                        <Radio value={1}>是</Radio>
                                        <Radio value={0}>否</Radio>
                                    </RadioGroup>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row style={isAddContact ? null : {display: 'none'}}>
                        <Col {...ModalColConfig}>
                            <Form.Item {...ModalFormItemLayout} label='姓名' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('relationName', {
                                    rules: [{required: false, message: '请输入联系人姓名'},
                                    ],
                                })(
                                    <Input placeholder="请输入联系人姓名"/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ModalColConfig}>
                            <Form.Item {...ModalFormItemLayout}
                                       label='号码'
                                       style={{marginBottom: '0px'}}
                            >
                                {getFieldDecorator('relationPhone', {
                                    rules: [{required: false, message: '请输入联系人号码'}],
                                })(
                                    <Input placeholder="请输入联系人号码"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ModalColConfig}>
                            <Form.Item {...ModalFormItemLayout} label='关系备注' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('relationRemark', {
                                    rules: [{required: false, message: '请输入联系人关系备注'}],
                                })(
                                    <Input placeholder="请输入联系人关系备注"/>
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
                            <Button
                                className="close"
                                htmlType="button"
                                onClick={()=>this._handleCancel(false)}
                            >
                                关闭
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Spin>
        )
    }
}

const CollectionRecordForm = Form.create()(Main);
export default CollectionRecordForm;