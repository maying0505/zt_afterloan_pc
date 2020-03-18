import React from 'react';
import './index.less';
import {Col, DatePicker, Modal, Row, Select, Form, Spin, message} from "antd";
import moment from "moment";
import {Http} from "../../../../components";

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

class Main extends React.Component {

    state = {
        submit: false,
    };

    _handleCancel = () => {
        const {handleCancel} = this.props;
        handleCancel && handleCancel();
    };


    _refreshTable = () => {
        const {refreshTable} = this.props;
        refreshTable && refreshTable();
    };

    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {runTime, ...rest} = values;
                let newRunTime = null;
                if (runTime) {
                    newRunTime = moment(runTime).format(DateFormat);
                }
                if (!newRunTime) {
                    return;
                }
                this._onSubmit({
                    ...rest,
                    runTime: newRunTime,
                });
            }
        });
    };

    _onSubmit = async (params) => {
        try {
            this.setState({submit: true});
            const {selectedRowKeys} = this.props;
            const result = await Http.forwardSubmit({
                ...params,
                caseIds: selectedRowKeys.toString(),
            });
            if (!result) {
                return;
            }
            const {errcode, errmsg} = result;
            if (errcode === 0) {
                message.info(errmsg);
                this._refreshTable();
                this._handleCancel();
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({submit: false});
        } catch (e) {
            message.error('请求服务异常');
            this.setState({submit: false});
        }
    };

    render() {
        const {form: {getFieldDecorator}, organization, visible} = this.props;
        const {submit} = this.state;
        const theDate = moment().format('YYYY-MM-DD');
        const theTime = moment(`${theDate} 08:30`).format(DateFormat);
        const isBefore = moment(theTime).isBefore(moment().format(DateFormat));
        const nextDay = moment().add(1, 'days').format("YYYY-MM-DD");
        const time = moment(`${isBefore ? nextDay : theDate} 08:30`);
        return (
            <Modal
                centered
                destroyOnClose={true}
                title='转派'
                visible={visible}
                okText={'提交'}
                onOk={this._handleSubmit}
                onCancel={() => this._handleCancel()}
            >
                <Spin size={"large"} spinning={submit}>
                    <Row>
                        <Col>
                            <Form.Item {...FormItemLayout} label='所属机构' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('companyId', {
                                    rules: [{required: true, message: '请选择所属机构'}],
                                })(
                                    <Select
                                        placeholder='请选择所属机构'
                                        style={{width: '100%'}}
                                    >
                                        {organization.map(i => <Option key={i.id} value={i.id}>{i.name}</Option>)}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Item {...FormItemLayout} label='生效时间' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('runTime', {
                                    initialValue: time,
                                    rules: [{required: false, message: '请选择生效时间'},
                                    ],
                                })(
                                    <DatePicker
                                        disabled={true}
                                        format={DateFormat}
                                        style={{width: '100%'}}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Spin>
            </Modal>
        )
    }
}

const ForwardForm = Form.create()(Main);
export default ForwardForm;