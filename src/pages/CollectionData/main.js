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
        organization: [],
        buttonType: ButtonType[0].code,
        dataSource: [],
        overdueStage: [],
        tipArrB: [],
        rateData: [],
        xAxisName: [],
    };

    myChartA = null;
    optionsA = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            },
            formatter: function (params) {
                return null;
            }
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
            data: ['应催笔数', '实催笔数', '回款笔数', '回款率', '逾期率'],
            left: 'right',
            show: true,
            textStyle: {
                fontSize: 12
            }
        },
        xAxis: {
            type: 'value',
            axisPointer: {
                type: 'shadow'
            },

        },
        yAxis: [
            {
                type: 'category',
                name: '问题代码',
                data: []
            },
        ],
        series: [
            {
                name: '代码占比',
                type: 'bar',
                data: [],
                label: {
                    show: true,
                    position: 'right',
                    formatter: function (params) {
                        return null
                    }
                },
                itemStyle: {
                    color: '#30c7c9',
                    barBorderRadius: [0, 0, 0, 0]
                }
            },
        ]
    };

    myChartB = null;
    optionsB = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            },
            formatter: '',
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
            data: ['应催笔数', '实催笔数', '回款笔数', '电话拨打量', '催收覆盖率', '回款率'],
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
                bottom: 0,
                dataBackground: {
                    areaStyle: {
                        color: '#e0b788'
                    }
                }
            },
            {
                type: 'inside',
                xAxisIndex: [0],
            },
        ],
        xAxis: {
            type: 'category',
            data: [],
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
                //interval: 500,
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
                name: '电话拨打量',
                type: 'bar',
                data: [],
                itemStyle: {
                    color: '#3ecb7d',
                    barBorderRadius: [10, 10, 0, 0]
                }
            },
            {
                name: '催收覆盖率',
                type: 'line',
                yAxisIndex: 1,
                data: [],
                itemStyle: {
                    color: '#30c7c9',
                    barBorderRadius: [10, 10, 0, 0]
                }
            },
            {
                name: '回款率',
                type: 'line',
                yAxisIndex: 1,
                data: [],
                itemStyle: {
                    color: '#e0b788',
                    barBorderRadius: [10, 10, 0, 0]
                }
            },
        ]
    };

    componentDidMount() {
        this._createChartB();
        this._createChartA();
        this._organization();
        this._myDivisionOverdueStage();
    }

    _createChartA = () => {
        // 基于准备好的dom，初始化echarts实例，并且绘制表格
        const container = document.getElementById('main');
        this.myChartA = echarts.init(container);
        this.myChartA.setOption(this.optionsA);
    };

    _createChartB = () => {
        // 基于准备好的dom，初始化echarts实例，并且绘制表格
        const containerB = document.getElementById('mainB');
        this.myChartB = echarts.init(containerB);
        this.myChartB.setOption(this.optionsB);
    };

    _eventsA = () => {
        const myChartA = this.myChartA;
        const optionA = this.optionsA;
        const {rateData, xAxisName} = this.state;
        optionA.series[0].label.formatter = function (params) {
            const {dataIndex, value} = params;
            const rateTxt = rateData[dataIndex];
            const xAxisTxt = xAxisName[dataIndex];
            if (rateTxt && xAxisTxt) {
                return `${xAxisTxt}，${value}，${rateTxt}`
            }
            return '';
        };
        myChartA && myChartA.setOption(optionA);
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
            const {errcode, errmsg, data} = await Http.collectionMemberOrganization();
            if (errcode === 0) {
                const params = {
                    createDateStart: moment().format(DateFormat),
                    createDateEnd: moment().format(DateFormat),
                    companyId: data[0].id,
                };
                this._collectionMemberRate(params);
                this._collectionCodeRate(params);
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

    _myDivisionOverdueStage = async () => {
        try {
            const result = await Http.myDivisionOverdueStage();
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this.setState({overdueStage: data.filter(i => i.stageName !== 'S0')});
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _handleSubmitB = (e, buttonType) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('values', values);
                const {form: {setFieldsValue}} = this.props;
                const {createDate, companyId, overdueStageId, ...rest} = values;
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
                    companyId,
                    overdueStageId: overdueStageId === -1 ? null : overdueStageId,
                };
                this._collectionMemberRate(queryObj);
                this._collectionCodeRate(queryObj);
            }
        });
    };

    //催收人员
    _collectionMemberRate = async (params) => {
        try {
            this._setLoading();
            const result = await Http.collectionMemberRate(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                const {series, xAxis} = data;
                this.optionsB.xAxis.data = xAxis;
                let arr4 = [], arr5 = [];
                series[4].data.forEach(i => arr4.push(i * 100));
                series[5].data.forEach(i => arr5.push(i * 100));
                this.optionsB.series[0].data = series[0].data;
                this.optionsB.series[1].data = series[1].data;
                this.optionsB.series[2].data = series[2].data;
                this.optionsB.series[3].data = series[3].data;
                this.optionsB.series[4].data = arr4;
                this.optionsB.series[5].data = arr5;
                this.myChartB.setOption(this.optionsB);
                this.setState({tipArrB: series[6].data});
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
        this.optionsB.series[5].data = [];
        this.myChartB.setOption(this.optionsB);
        this.setState({tipArrB: []});
    };

    //催收代码
    _collectionCodeRate = async (params) => {
        try {
            this._setLoading();
            const result = await Http.collectionCodeRate(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                const {series, yAxis} = data;
                this.optionsA.yAxis[0].data = yAxis;
                this.optionsA.series[0].data = series[0].data;
                this.myChartA.setOption(this.optionsA);
                this.setState({
                    rateData: series[1].data,
                    xAxisName: series[2].data,
                });
            } else {
                this._handleNoDataA();
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({loading: false});
        } catch (e) {
            console.log('e', e);
            this._handleNoDataA();
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    _handleNoDataA = () => {
        this.optionsA.yAxis[0].data = [];
        this.optionsA.series[0].data = [];
        this.myChartA.setOption(this.optionsA);
        this.setState({tipArrA: []});
    };

    _setLoading = () => {
        const {loading} = this.state;
        if (!loading) {
            this.setState(prevState => ({loading: true}));
        }
    };

    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {loading, organization, buttonType, overdueStage} = this.state;
        this._eventsA();
        this._eventsB();
        return (
            <Spin size='large' spinning={loading}>
                <TitleLine
                    title='催收员覆盖率、回款率'
                    icon='edit-1-copy'
                />
                <div className='collection-data'>
                    <Form onSubmit={this._handleSubmit} className='search-form'>
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
                                <Form.Item {...FormItemLayout} label='逾期时段' style={{marginBottom: '0px'}}>
                                    {getFieldDecorator('overdueStageId', {
                                        initialValue: -1,
                                        rules: [{required: false, message: '请选择逾期时段'}],
                                    })(
                                        <Select placeholder='请选择逾期时段'>
                                            <Option value={-1}>全部</Option>
                                            {overdueStage.map(i => <Option value={i.id}>{i.stageName}</Option>)}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col {...ColConfig}>
                                <div className='button-view'>
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
                                </div>
                            </Col>
                        </Row>
                    </Form>
                    <div className="main-table" id='mainB' style={{height: 400}}/>
                    <TitleLine
                        title='催收代码占比'
                        icon='edit-1-copy'
                    />
                    <div className="main-table" id='main' style={{height: 400}}/>
                </div>
            </Spin>
        )
    }
}

export default Form.create()(Main);