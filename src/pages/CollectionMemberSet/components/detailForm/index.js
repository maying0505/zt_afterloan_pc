import React from 'react';
import {Button, Checkbox, Col, Input, Modal, Radio, Row, DatePicker, Form, Spin, message} from "antd";
import {ColConfig} from "../../../../config";
import PropTypes from 'prop-types';
import './index.less';
import moment from 'moment';
import {Http} from "../../../../components";

const ModalFormItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 4},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 18},
    },
    colon: false,
};

const ModalColConfig = {
    ...ColConfig,
    xs: 24,
    sm: 8,
    md: 6,
};
const DateFormat = 'YYYY-MM-DD HH:mm:ss';

const RadioGroup = Radio.Group;
const CheckGroup = Checkbox.Group;
const {RangePicker} = DatePicker;

class Detail extends React.Component {

    static propTypes = {
        visible: PropTypes.bool.isRequired,
        title: PropTypes.string.isRequired,
        overdueStage: PropTypes.array.isRequired,
        detailObj: PropTypes.object,
        handleCancel: PropTypes.func,
        handleSubmit: PropTypes.func,
    };

    static defaultProps = {
        detailObj: {},
        handleCancel: () => null,
        handleSubmit: () => null,
    };

    state = {
        detailObj: {},
        submit: false,
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        const {detailObj} = nextProps;
        if (Object.keys(detailObj).length > 0) {
            return {detailObj};
        } else {
            return {detailObj: {}};
        }
    }

    _handleCancel = () => {
        const {handleCancel} = this.props;
        handleCancel && handleCancel();
    };

    _onSuccess = () => {
        const {handleSubmit} = this.props;
        handleSubmit && handleSubmit();
    };

    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({submit: true}, () => {
                    const {notDutyTime, overdueStageIds, ...rest} = values;
                    const params = {};
                    if (notDutyTime) {
                        Object.assign(params, {
                            'notDutyStartTime': moment(notDutyTime[0]).format(DateFormat),
                            'notDutyEndTime': moment(notDutyTime[1]).format(DateFormat),
                        });
                    }
                    this._collectionMemberAddEdit({
                        ...params,
                        ...rest,
                        overdueStageIds: overdueStageIds ? overdueStageIds.toString() : '',
                    });
                });
            }
        });
    };

    _collectionMemberAddEdit = async (params) => {
        try {
            const result = await Http.collectionMemberAddEdit(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg} = result;
            if (errcode === 0) {
                this._onSuccess();
                this._handleCancel();
                message.info(errmsg);
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({submit: false});
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    render() {
        const {title, visible, overdueStage, form: {getFieldDecorator}} = this.props;
        const {detailObj, submit} = this.state;
        const {clientWidth} = document.body;
        const modalWidth = clientWidth * 0.6;
        const modalDisabled = title === '查看';
        const notDutyTime = ((obj) => {
            if (obj.notDutyStartTime && obj.notDutyEndTime) {
                return [moment(obj.notDutyStartTime), moment(obj.notDutyEndTime)];
            } else {
                return undefined;
            }
        })(detailObj);
        const overdueStageIds = (() => {
            if (detailObj.overdueStageIds && detailObj.overdueStageIds !== null) {
                const temp = detailObj.overdueStageIds.replace(/\s+/g, "");
                return temp.split(',');
            } else {
                return [];
            }
        })();
        console.log('overdueStageIds', overdueStageIds);
        return (
            <Modal
                centered
                destroyOnClose={true}
                title={`${title}催收人员`}
                visible={visible}
                footer={null}
                width={modalWidth}
                onCancel={this._handleCancel}
            >
                <Spin size={"large"} spinning={submit}>
                    <Form onSubmit={this._handleSubmit} className='detail-form'>
                        <Row type="flex" align="middle" justify="start">
                            <Col span={4}>
                                <span>人员信息：</span>
                            </Col>
                            <Col {...ModalColConfig} style={{display: 'none'}}>
                                <Form.Item {...ModalFormItemLayout} label='用户id' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('id', {
                                        initialValue: detailObj.id,
                                        rules: [{required: false, message: '请输入用户id'},
                                        ],
                                    })(
                                        <Input
                                            placeholder="请输入用户id"
                                            disabled={modalDisabled}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col {...ModalColConfig}>
                                <Form.Item {...ModalFormItemLayout} label='姓名' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('name', {
                                        initialValue: detailObj.name,
                                        rules: [{required: false, message: '请输入姓名'},
                                        ],
                                    })(
                                        <Input
                                            placeholder="请输入姓名"
                                            disabled={modalDisabled}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col {...ModalColConfig}>
                                <Form.Item {...ModalFormItemLayout}
                                           label='性别'
                                           colon={true}
                                           style={{marginBottom: '0px'}}
                                >
                                    {getFieldDecorator('gender', {
                                        initialValue: detailObj.gender,
                                        rules: [{required: false, message: '请选择性别'}],
                                    })(
                                        <RadioGroup
                                            disabled={modalDisabled}
                                        >
                                            <Radio value='1'>男</Radio>
                                            <Radio value='0'>女</Radio>
                                        </RadioGroup>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col {...ModalColConfig}>
                                <Form.Item {...ModalFormItemLayout} label='手机' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('phone', {
                                        initialValue: detailObj.phone,
                                        rules: [{required: false, message: '请输入手机'}],
                                    })(
                                        <Input
                                            placeholder="请输入手机"
                                            disabled={modalDisabled}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row type="flex" align="middle" justify="start">
                            <Col span={4}>
                                <span>分案设置：</span>
                            </Col>
                            <Col span={18}>
                                <Form.Item {...ModalFormItemLayout} style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('isAllocation', {
                                        initialValue: detailObj.isAllocation,
                                        rules: [{required: false, message: '请选择分案设置'},
                                        ],
                                    })(
                                        <RadioGroup>
                                            <Radio value='1'>参与分案</Radio>
                                            <Radio value='0'>不参与分案</Radio>
                                        </RadioGroup>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row type="flex" align="middle">
                            <Col span={4}>
                                <span>不值班设置：</span>
                            </Col>
                            <Col span={18}>
                                <Form.Item {...ModalFormItemLayout} style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('notDutyTime', {
                                        initialValue: notDutyTime,
                                        rules: [{required: false, message: '请选择不值班设置'},
                                        ],
                                    })(
                                        <RangePicker
                                            showTime={{format: 'HH:mm'}}
                                            format="YYYY-MM-DD HH:mm"
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row type="flex" align="middle">
                            <Col span={4}>
                                <span>逾期时段：</span>
                            </Col>
                            <Col span={18}>
                                <Form.Item
                                    {...ModalFormItemLayout}
                                    wrapperCol={{xs: {span: 24}, sm: {span: 24}}}
                                    style={{marginBottom: '0px'}}
                                >
                                    {getFieldDecorator('overdueStageIds', {
                                        initialValue: overdueStageIds,
                                        rules: [{required: false, message: '请选择逾期时段'},
                                        ],
                                    })(
                                        <CheckGroup>
                                            {overdueStage.map(i => <Checkbox key={i.id}
                                                                             value={i.id}>{i.stageName}</Checkbox>)}
                                        </CheckGroup>
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
                                    onClick={this._handleCancel}
                                >
                                    取消
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        )
    }
}

const DetailForm = Form.create()(Detail);
export default DetailForm;