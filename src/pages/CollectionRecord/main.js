import React from 'react';
import './index.less';
import {TitleLine} from '../../components';
import {Button, Form, Input, Row, Col} from 'antd';
import CollectionLog from '../CollectionLog';
import {ColConfig} from '../../config';

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

class Main extends React.Component {

    state = {
        stageName: '',
        operator: '',
    };

    componentDidMount() {
        this._handleSubmit();
    }

    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    ...values
                });
            }
        });
    };

    _handleReset = () => {
        const {form: {resetFields}} = this.props;
        resetFields();
        this.setState({
            stageName: '',
            operator: '',
        });
    };

    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {stageName, operator} = this.state;
        return (
            <div>
                <TitleLine
                    title='逾期时段修改记录'
                    icon='edit-1-copy'
                />
                <Form onSubmit={this._handleSubmit} className='collection-record'>
                    <Row>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='逾期阶段' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('stageName', {
                                    rules: [{required: false, message: '请输入逾期阶段名称'},
                                    ],
                                })(
                                    <Input
                                        placeholder="请输入逾期阶段名称"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='操作人' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('operator', {
                                    rules: [{required: false, message: '请输入操作人'}],
                                })(
                                    <Input
                                        placeholder="请输入操作人"
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
                                htmlType="reset"
                                onClick={this._handleReset}
                            >
                                重置
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
                <CollectionLog
                    operator={operator}
                    stageName={stageName}
                    type='page'
                />
            </div>
        )
    }
}

const CollectionRecordForm = Form.create()(Main);
export default CollectionRecordForm;