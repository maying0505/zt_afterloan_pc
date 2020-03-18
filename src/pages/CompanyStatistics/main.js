import React from 'react';
import './index.less';
import {Http, TitleLine} from '../../components';
import {Form, message, DatePicker, Row, Col, Button, Select, Table, Spin} from 'antd';
import moment from 'moment';
import {ColConfig} from "../../config";

const Option = Select.Option;
const {RangePicker} = DatePicker;
const DateFormat = 'YYYY-MM-DD';

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

const Start = moment().startOf('week');
const End = moment().endOf('week');
const Yesterday = moment(Date.now() - 24 * 60 * 60 * 1000);
const LastMonthStart = moment().month(moment().month() - 1).startOf('month');
const LastMonthEnd = moment().month(moment().month() - 1).endOf('month');

const ButtonType = [
    {id: 0, name: '今日', code: 'today'},
    {id: 1, name: '昨日', code: 'yesterday'},
    {id: 2, name: '上月', code: 'lastMonth'},
    {id: 3, name: 'range', code: 'range'},
];

class Main extends React.Component {

    state = {
        loading: false,
        dataSource: [],
        buttonType: ButtonType[0].code,
    };

    columns = [
        {
            title: '公司名称',
            dataIndex: 'companyName',
        },
        {
            title: '催收员数量',
            dataIndex: 'urgeUserCount',
        },
        {
            title: '应催笔数',
            dataIndex: 'shouldUrgeCount',
        },
        {
            title: '实催笔数',
            dataIndex: 'realUrgeCount',
        },
        {
            title: '回款笔数',
            dataIndex: 'repaymentCount',
        },
        {
            title: '人均分案笔数',
            dataIndex: 'averageUserCount',
        },
        {
            title: '应催金额',
            dataIndex: 'shouldUrgeAmount',
        },
        {
            title: '回款金额',
            dataIndex: 'repaymentAmount',
        },
        {
            title: '催收覆盖率',
            dataIndex: 'urgeCoverageRate',
        },
        {
            title: '回款率',
            dataIndex: 'repaymentRate',
        },
    ];

    componentDidMount() {
        this._handleSubmit(undefined, ButtonType[0].code);
    }

    _handleSubmit = (e, buttonType) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('values', values);
                const {form: {setFieldsValue}} = this.props;
                const {createDate, ...rest} = values;
                const params = {};
                let aTime = [];
                const addParams = (valueA, valueB, keyA, keyB) => {
                    if (valueA && valueB) {
                        Object.assign(params, {
                            [keyA]: moment(valueA).format(DateFormat),
                            [keyB]: moment(valueB).format(DateFormat),
                        });
                    }
                };
                switch (buttonType) {
                    case ButtonType[0].code: {
                        const now = moment();
                        addParams(now, now, 'createDateStart', 'createDateEnd');
                        aTime = [now, now];
                        break;
                    }
                    case ButtonType[1].code: {
                        addParams(Yesterday, Yesterday, 'createDateStart', 'createDateEnd');
                        aTime = [Yesterday, Yesterday];
                        break;
                    }
                    case ButtonType[2].code: {
                        addParams(LastMonthStart, LastMonthEnd, 'createDateStart', 'createDateEnd');
                        aTime = [LastMonthStart, LastMonthEnd];
                        break;
                    }
                    case ButtonType[3].code: {
                        addParams(createDate[0], createDate[1], 'createDateStart', 'createDateEnd');
                        aTime = [createDate[0], createDate[1]];
                        break;
                    }
                }
                this.setState({buttonType});
                setFieldsValue({'createDate': aTime});
                const queryObj = {
                    ...rest,
                    ...params,
                };
                this._statisticsCompany(queryObj);
            }
        });
    };

    _statisticsCompany = async (params) => {
        try {
            this.setState({loading: true});
            const result = await Http.statisticsCompany(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({dataSource: data});
            } else {
                this.setState({dataSource: []});
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({loading: false});
        } catch (e) {
            this.setState({
                dataSource: [],
                loading: false,
            });
            message.error('请求服务异常');
        }
    };

    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {loading, buttonType, dataSource} = this.state;
        return (
            <div className='company-statistics'>
                <TitleLine
                    title='公司统计'
                    icon='edit-1-copy'
                />
                <Form onSubmit={this._handleSubmit} className='search-form'>
                    <Row type={'flex'} align='middle' justify='start'>
                        <Col {...ColConfig}>
                            <Form.Item {...FormItemLayout} label='日期选择' style={{marginBottom: '0px'}}>
                                {getFieldDecorator('createDate', {
                                    initialValue: [moment(), moment()],
                                    rules: [{required: false, message: '日期选择'},
                                    ],
                                })(
                                    <RangePicker format={DateFormat}/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col {...ColConfig}>
                            <div className='button-view'>
                                <Button
                                    type={buttonType === ButtonType[0].code ? 'danger' : 'Default'}
                                    className='submit'
                                    htmlType="button"
                                    onClick={() => this._handleSubmit(undefined, ButtonType[0].code)}
                                >
                                    今日
                                </Button>
                                <Button
                                    type={buttonType === ButtonType[1].code ? 'danger' : 'Default'}
                                    className='submit'
                                    htmlType="button"
                                    onClick={() => this._handleSubmit(undefined, ButtonType[1].code)}
                                >
                                    昨日
                                </Button>
                                <Button
                                    type={buttonType === ButtonType[2].code ? 'danger' : 'Default'}
                                    className='submit'
                                    htmlType="button"
                                    onClick={() => this._handleSubmit(undefined, ButtonType[2].code)}
                                >
                                    上月
                                </Button>
                                <Button
                                    type="primary"
                                    className='submit'
                                    htmlType="button"
                                    onClick={() => this._handleSubmit(undefined, ButtonType[3].code)}
                                >
                                    查询
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
                <Table
                    bordered
                    rowKey='id'
                    size='small'
                    loading={loading}
                    columns={this.columns}
                    dataSource={dataSource}
                    //pagination={pagination}
                />
            </div>
        )
    }
}

export default Form.create()(Main);