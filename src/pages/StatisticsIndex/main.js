import React from 'react';
import './index.less';
import {Http, Iconfont, TitleLine} from '../../components';
import {Form, message, Spin, Row, Col, Button, Select, Progress} from 'antd';
import {ColConfig} from "../../config";

const Option = Select.Option;

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

const MyColConfig = {
    ...ColConfig,
    xs: 12,
    sm: 8,
    md: 6,
};

class Main extends React.Component {

    state = {
        data: [],
        loading: false,
        organization: [],
        overdueStage: [],
    };

    componentDidMount() {
        this._organization();
        this._myDivisionOverdueStage();
    }

    _organization = async () => {
        try {
            const result = await Http.collectionMemberOrganization();
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                this._statisticsIndex({companyId: data[0].id});
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
                this.setState({overdueStage: data});
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
                const {companyId, overdueStageId} = values;
                const params = {
                    companyId,
                    overdueStageId: overdueStageId === -1 ? null : overdueStageId,
                };
                this._statisticsIndex(params);
            }
        });
    };

    _statisticsIndex = async (params) => {
        try {
            this.setState({loading: true});
            const result = await Http.statisticsIndex(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            if (errcode === 0) {
                const newArr = [
                    {id: 0, label: '在案案件数', value: data.onCaseCount},
                    {id: 1, label: '新增案件数', value: data.addCaseCount},
                    {id: 2, label: '电话拨打总数量', value: data.phoneCallCount},
                    {id: 3, label: '电话接通总量', value: data.phoneCallingCount},
                    {id: 4, label: '电话接通率', value: data.phoneCallingPercent},
                    {id: 5, label: '金额回收率', value: data.amountRate},
                    {id: 6, label: '案件回收率', value: data.caseCoverageRate},
                    {
                        id: 7,
                        label: !data.urgeCoverageRate ? '委外笔数' : '催收覆盖率',
                        value: !data.urgeCoverageRate ? data.outerCaseCount : data.urgeCoverageRate
                    },
                ];
                this.setState({data: newArr});
            } else {
                this.setState({data: []});
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({loading: false});
        } catch (e) {
            this.setState({loading: false, data: []});
            message.error('请求服务异常');
        }
    };

    _renderItem = ({id, label, value}) => {
        const infoObj = {};
        switch (id) {
            case 0: {
                Object.assign(infoObj, {icon: 'dangan', bgColor: '#e5f2ff'});
                break;
            }
            case 1: {
                Object.assign(infoObj, {icon: 'xinzeng', bgColor: '#f3f0ff'});
                break;
            }
            case 2: {
                Object.assign(infoObj, {icon: 'frequency', bgColor: '#fff8e6'});
                break;
            }
            case 3: {
                Object.assign(infoObj, {icon: '002dianhua', bgColor: '#ebf9eb'});
                break;
            }
            case 4: {
                Object.assign(infoObj, {icon: 'dianhua2', bgColor: '#fff3f2'});
                break;
            }
            case 5: {
                Object.assign(infoObj, {icon: 'jinbi', bgColor: '#ebfafd'});
                break;
            }
            case 6: {
                Object.assign(infoObj, {icon: 'pie-chart_icon', bgColor: '#faefff'});
                break;
            }
            case 7: {
                Object.assign(infoObj, {icon: 'weiwaishengchan-copy', bgColor: '#fff3f6'});
                break;
            }
        }
        return (
            <div className='i'>
                <div className='icon' style={{backgroundColor: infoObj.bgColor}}>
                    <Iconfont icon={infoObj.icon} size={35}/>
                </div>
                <div className='value'>
                    {value}
                </div>
                <div className='label'>
                    {label}
                </div>
                {
                    (id === 4 || id === 5 || id === 6) &&
                    <div className='progress'>
                        <Progress
                            percent={value.replace('%', '')}
                            size="small"
                            status="active"
                            showInfo={false}
                            strokeColor={'#30c7c9'}
                        />
                    </div>
                }
            </div>
        )
    };

    render() {
        const {form: {getFieldDecorator}} = this.props;
        const {loading, organization, overdueStage, data} = this.state;
        return (
            <Spin size='large' spinning={loading}>
                <TitleLine
                    title='统计首页'
                    icon='edit-1-copy'
                />
                <div className='statistics-index'>
                    <div className='search-form'>
                        <Form onSubmit={this._handleSubmit}>
                            <Row type={'flex'} align='middle' justify='start'>
                                <Col {...ColConfig}>
                                    <Form.Item {...FormItemLayout} label='公司' style={{marginBottom: '0px'}}>
                                        {getFieldDecorator('companyId', {
                                            rules: [{required: false, message: '请选择公司'},
                                            ],
                                        })(
                                            <Select placeholder='请选择公司'>
                                                {organization.map(i => <Option key={i.id}
                                                                               value={i.id}>{i.name}</Option>)}
                                            </Select>
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
                    </div>
                    <Row type={'flex'} align='middle' justify='start' style={{marginTop: '10px'}}>
                        {
                            data.length > 0 && data.map(i => {
                                const {id} = i;
                                return (
                                    <Col key={id} {...MyColConfig}>
                                        <div className='item'>
                                            {this._renderItem(i)}
                                        </div>
                                    </Col>
                                )
                            })
                        }
                    </Row>
                </div>

            </Spin>
        )
    }
}

export default Form.create()(Main);