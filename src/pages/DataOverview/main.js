import React from 'react';
import './index.less';
import {Http, TitleLine} from '../../components';
import {Form, message, Spin, DatePicker, Row, Col, Button, Select, Table} from 'antd';
// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts';
// 引入柱状图
import 'echarts/lib/chart/bar';
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/legendScroll';
import 'echarts/lib/chart/line';
import moment from 'moment';
import {ColConfig, TableWidth} from "../../config";

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
const Days15Before = moment().subtract('7', 'days');
const Days15After = moment().add('7', 'days');

const ButtonType = [
    {id: 0, name: '今日', code: 'today'},
    {id: 1, name: '昨日', code: 'yesterday'},
    {id: 2, name: '上月', code: 'lastMonth'},
    {id: 3, name: 'range', code: 'range'},
];

class Main extends React.Component {

    state = {
        loading: false,
        organization: [],
        buttonType: ButtonType[0].code,
        dataSource: [],
        tipArrB: [],
    };

    myChartA = null;
    optionsA = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            },
        },
        toolbox: {
            feature: {
                dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['line', 'bar']},
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        legend: {
            data: ['到期笔数', '首逾笔数', '坏账'],
            left: 'right',
            show: true,
            textStyle: {
                fontSize: 12
            }
        },
        dataZoom: [
            {
                type: 'slider',
                show: true,
                xAxisIndex: [0],
                dataBackground: {
                    areaStyle: {
                        color: '#e0b788'
                    }
                },
                buttom: 0,
            },
            {
                type: 'inside',
                xAxisIndex: [0],
            },
        ],
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisPointer: {
                type: 'shadow'
            },
            axisLabel: {
                interval: 0,
                rotate: 40
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '笔数',
                min: 0,
                interval: 10,
                axisLabel: {
                    formatter: '{value}'
                }
            }
        ],
        series: [
            {
                name: '到期笔数',
                type: 'bar',
                data: [],
                itemStyle: {
                    color: '#30c7c9',
                    barBorderRadius: [10, 10, 0, 0]
                }
            },
            {
                name: '首逾笔数',
                type: 'bar',
                data: [],
                itemStyle: {
                    color: '#e0b788',
                    barBorderRadius: [10, 10, 0, 0]
                }
            },
            {
                name: '坏账',
                type: 'bar',
                data: [],
                itemStyle: {
                    color: '#fd867e',
                    barBorderRadius: [10, 10, 0, 0]
                }
            }
        ]
    };

    myChartB = null;
    optionsB = {
        title: {},
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            },
        },
        toolbox: {
            feature: {
                dataView: {show: true, readOnly: false},
                magicType: {show: true, type: ['line', 'bar']},
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        legend: {
            data: ['应催笔数', '实催笔数', '回款笔数', '催收覆盖率', '回款率'],
            left: 'right',
            show: true,
            textStyle: {
                fontSize: 12
            },
            top: 10,
        },
        // dataZoom: [
        //     {
        //         type: 'slider',
        //         show: true,
        //         xAxisIndex: [0],
        //     },
        //     {
        //         type: 'inside',
        //         xAxisIndex: [0],
        //     },
        // ],
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            axisPointer: {
                type: 'shadow'
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '笔数',
                min: 0,
                interval: 200,
                axisLabel: {
                    formatter: '{value}'
                }
            },
            {
                type: 'value',
                name: '比率',
                min: 0,
                max: 100,
                interval: 20,
                axisLabel: {
                    formatter: '{value}%'
                }
            }
        ],
        series: [
            {
                name: '应催笔数',
                type: 'bar',
                data: [],
                itemStyle: {
                    color: '#fd867e',
                    barBorderRadius: [10, 10, 0, 0]
                }
            },
            {
                name: '实催笔数',
                type: 'bar',
                data: [],
                itemStyle: {
                    color: '#e0b788',
                    barBorderRadius: [10, 10, 0, 0]
                }
            },
            {
                name: '回款笔数',
                type: 'bar',
                data: [],
                itemStyle: {
                    color: '#3ec8ca',
                    barBorderRadius: [10, 10, 0, 0]
                }
            },
            {
                name: '催收覆盖率',
                type: 'line',
                yAxisIndex: 1,
                data: [],
                itemStyle: {
                    color: '#e0b788',
                    barBorderRadius: [10, 10, 0, 0]
                }
            },
            {
                name: '回款率',
                type: 'line',
                yAxisIndex: 1,
                data: [],
                itemStyle: {
                    color: '#30c7c9',
                    barBorderRadius: [10, 10, 0, 0]
                }
            },
        ]
    };

    columns = [
        {
            title: '逾期阶段',
            dataIndex: 'stageName',
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
        this._createChartA();
        this._createChartB();
        this._organization();
    }

    _createChartA = () => {
        // 基于准备好的dom，初始化echarts实例，并且绘制表格
        const container = document.getElementById('main');
        this.myChartA = echarts.init(container);
        this.myChartA.setOption(this.optionsA);
        this._handleOverview({
            createDateStart: moment(Days15Before).format(DateFormat),
            createDateEnd: moment(Days15After).format(DateFormat),
        });
    };

    _createChartB = () => {
        // 基于准备好的dom，初始化echarts实例，并且绘制表格
        const containerB = document.getElementById('mainB');
        this.myChartB = echarts.init(containerB);
        this.myChartB.setOption(this.optionsB);
    };

    _eventsB = () => {
        const myChartB = this.myChartB;
        const optionsB = this.optionsB;
        const tipArrB = this.state.tipArrB;
        myChartB && myChartB.on('mouseover', function (params) {
            const {dataIndex} = params;
            const tipTxt = tipArrB[dataIndex];
            if (tipTxt) {
                optionsB.tooltip.formatter = tipTxt.replace(/\/n/g, '<br/>');
                myChartB.setOption(optionsB);
            }
        });
    };

    _organization = async () => {
        try {
            const result = await Http.collectionMemberOrganization();
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                const params = {
                    createDateStart: moment().format(DateFormat),
                    createDateEnd: moment().format(DateFormat),
                    companyId: data[0].id,
                };
                this._handleOverdueRate(params);
                this._dataOverviewList(params);
                const {form: {setFieldsValue}} = this.props;
                setFieldsValue({'companyId': data[0].id});
                this.setState({organization: data});
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _handleOverview = async (params = {}) => {
        try {
            this.setState({loading: true});
            const result = await Http.dataOverview(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                const {series, xAxis} = data;
                this.optionsA.xAxis.data = xAxis;
                this.optionsA.series[0].data = series[0].data;
                this.optionsA.series[1].data = series[1].data;
                this.optionsA.series[2].data = series[2].data;
                this.myChartA.setOption(this.optionsA);
                this.setState({loading: false});
            } else {
                this._handleNoDataA();
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({loading: false});
        } catch (e) {
            this._handleNoDataA();
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    _handleNoDataA = () => {
        this.optionsA.xAxis.data = [];
        this.optionsA.series[0].data = [];
        this.optionsA.series[1].data = [];
        this.optionsA.series[2].data = [];
        this.myChartA.setOption(this.optionsA);
    };

    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {createDate, ...rest} = values;
                const params = {};
                const addParams = (timeArr, keyA, keyB) => {
                    if (timeArr) {
                        Object.assign(params, {
                            [keyA]: moment(timeArr[0]).format(DateFormat),
                            [keyB]: moment(timeArr[1]).format(DateFormat),
                        });
                    }
                };
                addParams(createDate, 'createDateStart', 'createDateEnd');
                const queryObj = {
                    ...rest,
                    ...params,
                };
                this._handleOverview(queryObj);
            }
        });
    };

    _handleSubmitB = (e, buttonType) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('values', values);
                const {form: {setFieldsValue}} = this.props;
                const {createDateB, companyId, ...rest} = values;
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
                        addParams(createDateB[0], createDateB[1], 'createDateStart', 'createDateEnd');
                        aTime = [createDateB[0], createDateB[1]];
                        break;
                    }
                }
                this.setState({buttonType});
                setFieldsValue({'createDateB': aTime});
                const queryObj = {
                    ...rest,
                    ...params,
                    companyId,
                };
                this._handleOverdueRate(queryObj);
                this._dataOverviewList(queryObj);
            }
        });
    };

    _handleOverdueRate = async (params) => {
        try {
            this._setLoading();
            const result = await Http.overdueRate(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                const {series, xAxis} = data;
                this.optionsB.xAxis.data = xAxis;
                let arr3 = [], arr4 = [];
                series[3].data.forEach(i => arr3.push(i * 100));
                series[4].data.forEach(i => arr4.push(i * 100));
                this.optionsB.series[0].data = series[0].data;
                this.optionsB.series[1].data = series[1].data;
                this.optionsB.series[2].data = series[2].data;
                this.optionsB.series[3].data = arr3;
                this.optionsB.series[4].data = arr4;
                this.setState({tipArrB: series[5].data});
                this.myChartB.setOption(this.optionsB);
            } else {
                this._handleNoDataB();
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({loading: false});
        } catch (e) {
            this._handleNoDataB();
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    _handleNoDataB = () => {
        this.optionsB.series[0].data = [];
        this.optionsB.series[1].data = [];
        this.optionsB.series[2].data = [];
        this.optionsB.series[3].data = [];
        this.optionsB.series[4].data = [];
        this.setState({tipArrB: []});
        this.myChartB.setOption(this.optionsB);
    };

    _dataOverviewList = async (params) => {
        try {
            this._setLoading();
            const result = await Http.dataOverviewList(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                if (data && Array.isArray(data)) {
                    this.setState({dataSource: data});
                }
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({loading: false});
        } catch (e) {
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    _setLoading = () => {
        const {loading} = this.state;
        if (!loading) {
            this.setState(prevState => ({loading: true}));
        }
    };

    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {loading, organization, buttonType, dataSource} = this.state;
        this._eventsB();
        return (
            <Spin size='large' spinning={loading}>
                <TitleLine
                    title='数据总览'
                    icon='edit-1-copy'
                />
                <div className='data-overview'>
                    <Form onSubmit={this._handleSubmit} className='search-form'>
                        <Row type={'flex'} align='middle' justify='start'>
                            <Col {...ColConfig}>
                                <Form.Item {...FormItemLayout} label='日期选择' style={{marginBottom: '0px'}}>
                                    {
                                        getFieldDecorator('createDate', {
                                            initialValue: [Days15Before, Days15After],
                                            rules: [{required: false, message: '日期选择'},
                                            ],
                                        })(
                                            <RangePicker format={DateFormat}/>
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col {...ColConfig}>
                                <Button
                                    type="primary"
                                    className='submit'
                                    htmlType="button"
                                    onClick={this._handleSubmit}
                                >
                                    查询
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                    <div className="main-table" id='main' style={{height: '450px'}}/>
                    <Form onSubmit={(e) => this._handleSubmitB(e)} className='search-form'>
                        <Row type={'flex'} align='middle' justify='start'>
                            <Col {...ColConfig}>
                                <Form.Item {...FormItemLayout} label='公司' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('companyId', {
                                        rules: [{required: false, message: '请选择公司'},
                                        ],
                                    })(
                                        <Select placeholder='请选择公司'>
                                            {organization.map(i => <Option key={i.id} value={i.id}>{i.name}</Option>)}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col {...ColConfig}>
                                <Form.Item {...FormItemLayout} label='日期选择' style={{marginBottom: '0px'}}>

                                    {
                                        getFieldDecorator('createDateB', {
                                            initialValue: [moment(), moment()],
                                            rules: [{required: false, message: '日期选择'},
                                            ],
                                        })(
                                            <RangePicker format={DateFormat}/>
                                        )
                                    }
                                </Form.Item>
                            </Col>
                            <Col {...ColConfig}>
                                <Button
                                    type={buttonType === ButtonType[0].code ? 'danger' : 'Default'}
                                    className='submit'
                                    htmlType="button"
                                    onClick={() => this._handleSubmitB(undefined, ButtonType[0].code)}
                                >
                                    今日
                                </Button>
                                <Button
                                    type={buttonType === ButtonType[1].code ? 'danger' : 'Default'}
                                    className='submit'
                                    htmlType="button"
                                    onClick={() => this._handleSubmitB(undefined, ButtonType[1].code)}
                                >
                                    昨日
                                </Button>
                                <Button
                                    type={buttonType === ButtonType[2].code ? 'danger' : 'Default'}
                                    className='submit'
                                    htmlType="button"
                                    onClick={() => this._handleSubmitB(undefined, ButtonType[2].code)}
                                >
                                    上月
                                </Button>
                                <Button
                                    type="primary"
                                    className='submit'
                                    htmlType="button"
                                    onClick={() => this._handleSubmitB(undefined, ButtonType[3].code)}
                                >
                                    查询
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                    <Table
                        bordered
                        size='small'
                        columns={this.columns}
                        rowKey='id'
                        dataSource={dataSource}
                        //pagination={pagination}
                        loading={loading}
                        style={{marginTop: '10px'}}
                    />
                    <TitleLine
                        title='逾期时间覆盖率、回款率'
                        icon='edit-1-copy'
                    />
                    <div className="main-table" id='mainB'/>
                </div>
            </Spin>
        )
    }
}

export default Form.create()(Main);