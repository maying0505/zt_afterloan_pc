/**
 * @调案
 * */
import React from 'react';
import {Col, Input, Row, Form, Button, Spin, message, Select} from "antd";
import {ColConfig} from "../../../../config";
import PropTypes from 'prop-types';
import './index.less';
import {Http} from "../../../../components";

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

class AdjustCase extends React.Component {

    static propTypes = {
        caseId: PropTypes.string.isRequired,
        oldUserName: PropTypes.string.isRequired,
        handleCancel: PropTypes.func.isRequired,
        sysUserId: PropTypes.string.isRequired,
        checkType: PropTypes.oneOf(['single', 'multiple']).isRequired,
    };

    static defaultProps = {};

    state = {
        submit: false,
        loading: false,
        overdueUser: [],
    };

    componentDidMount() {
        const {sysUserId, caseId, checkType} = this.props;
        let params = {};
        if (checkType === 'single') {
            Object.assign(params, {sysUserId, caseId})
        }
        this._overdueUser(params);
    }

    _overdueUser = async (params) => {
        try {
            const result = await Http.overdueUser(params);
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

    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({submit: true}, () => {
                    const {caseId, checkType} = this.props;
                    let httpFunc = null;
                    if (checkType === 'single') {
                        httpFunc = Http.allDivisionTransferCase;
                    } else if (checkType === 'multiple') {
                        httpFunc = Http.multipleAdjustCase;
                    }
                    if (!httpFunc) {
                        return;
                    }
                    this._onSubmit({
                            ...values,
                            caseId,
                        },
                        httpFunc
                    );
                });
            }
        });
    };

    _onSubmit = async (params, httpFunc) => {
        try {
            const {errcode, errmsg} = await httpFunc(params);
            if (errcode === 0) {
                message.info(errmsg);
                this._handleClose();
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

    _handleClose = () => {
        const {handleCancel, refresh} = this.props;
        handleCancel && handleCancel();
        refresh && refresh();
    };

    render() {
        const {form: {getFieldDecorator}, caseId, oldUserName, checkType} = this.props;
        const {submit, overdueUser} = this.state;

        return (
            <Spin size='large' spinning={submit}>
                <Form onSubmit={this._handleSubmit} className='adjust-form'>
                    <Row>
                        {
                            checkType === 'single' &&
                            <Col {...ColConfig} sm={24} md={24}>
                                <Form.Item {...FormItemLayout} label='案件ID' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('caseId', {
                                        initialValue: caseId,
                                        rules: [{required: false, message: '案件ID'},
                                        ],
                                    })(
                                        <Input placeholder="案件ID" disabled={true}/>
                                    )}
                                </Form.Item>
                            </Col>
                        }
                        {
                            checkType === 'single' &&
                            <Col {...ColConfig} sm={24} md={24}>
                                <Form.Item {...FormItemLayout} label='当前催收员' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('oldUserName', {
                                        initialValue: oldUserName,
                                        rules: [{required: false, message: '当前催收员'},
                                        ],
                                    })(
                                        <Input placeholder="当前催收员" disabled={true}/>
                                    )}
                                </Form.Item>
                            </Col>
                        }
                        <Col {...ColConfig} sm={24} md={24}>
                            <Form.Item {...FormItemLayout} label='后续催收员' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('hurryUser', {
                                    rules: [{required: true, message: '请选择后续催收员'},
                                    ],
                                })(
                                    <Select placeholder='请选择后续催收员'>
                                        {overdueUser.map(i => <Option key={i.id} value={i.id}>{i.name}</Option>)}
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
                                提交
                            </Button>
                            <Button
                                className="close"
                                htmlType="button"
                                onClick={this._handleClose}
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

const AdjustCaseForm = Form.create()(AdjustCase);
export default AdjustCaseForm;