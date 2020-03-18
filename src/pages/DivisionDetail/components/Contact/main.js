import React from 'react';
import './index.less';
import PropTypes from 'prop-types';
import {Form, message, Row, Col, Spin, Table, Input, Modal, Select,Button} from "antd";
import {TitleLine, Http} from '../../../../components';
import {TableWidth, ColConfig, PageSize} from "../../../../config";
import MsgDetail from '../MsgDetail';
import AddCollectionRecordLog from '../../../AddCollectionRecordLog';
// import {SendMsgRecordComponent} from '../../../SendMsgRecord/components';
import {SendMsgComponent} from '../../../SendMsg/components';
import TaoBaoContactDetail from './TaoBaoContactDetail';

const Search = Input.Search;
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

class MainForm extends React.Component {
    static propTypes = {
        caseId: PropTypes.string.isRequired,
    };

    static defaultProps = {};

    constructor(props) {
        super(props);
        this.columns = [
            {
                title: '姓名',
                dataIndex: 'name',
                width: TableWidth.large,
            },
            {
                title: '主叫联系次数',
                dataIndex: 'callCnt',
                width: TableWidth.small,
            },
            {
                title: '被叫联系次数',
                dataIndex: 'calledCnt',
                width: TableWidth.small,
            },
            {
                title: '号码来源',
                dataIndex: 'phoneSourceName',
                width: TableWidth.small,
            },
            {
                title: '应催时段',
                dataIndex: 'urgeTime',
                width: TableWidth.middle,
            },
            {
                title: '手机号码',
                dataIndex: 'phone',
                width: TableWidth.large,
            },
            {
                title: '当天催收',
                dataIndex: 'isUrgeName',
                width: TableWidth.small,
            },
            {
                title: '短信详情',
                width: TableWidth.small,
                render: (text, record) => {
                    const {phone, detailBtn} = record;
                    if (detailBtn === true) {
                        return (
                            <a
                                key='op_0'
                                href="javascript:;"
                                onClick={() => this._onMsgDetail(phone)}
                            >
                                详情
                            </a>
                        )
                    } else {
                        return <span style={{color: '#888'}}>详情</span>
                    }
                },
            },
            {
                title: '淘宝详情',
                width: TableWidth.small,
                render: (text, record) => {
                    const {id, detailBtn2} = record;
                    if (detailBtn2 === true) {
                        return (
                            <a
                                key='op_0'
                                href="javascript:;"
                                onClick={() => this._onTaoBaoDetail(id)}
                            >
                                详情
                            </a>
                        )
                    } else {
                        return <span style={{color: '#888'}}>详情</span>
                    }
                },
            },
            {
                title: '操作',
                width: TableWidth.middle,
                render: (text, record) => {
                    const {phone, id} = record;
                    return (
                        <span key='op_1'>
                            <a
                                key='op_1_0'
                                href="javascript:;"
                                onClick={(e) => this._onAddCollectionRecord({phone, id, ele: e})}
                            >
                                添加催记
                            </a>
                            {/*<Divider type="vertical" key='op_1_1'/>*/}
                            {/*<a*/}
                            {/*key='op_1_2'*/}
                            {/*href="javascript:;"*/}
                            {/*onClick={() => this._onSendMsg(phone)}*/}
                            {/*>*/}
                            {/*发送短信*/}
                            {/*</a>*/}
                        </span>
                    )
                },
            },
        ];
    }


    state = {
        loading: false,
        loadingTable: true,
        pagination: {pageSize: PageSize, showTotal: total => `共${total}条`},
        contactArr: [],
        msgVisible: false,
        msgDetailPhone: '',
        phoneNumber: '',
        phoneSource: '',
        sendMsgRecordSearchInput: '',
        sendMsgVisible: false,
        sendMsgPhone: '',
        contactPageIndex: 1,
        taoBaoVisible: false,
        relationId: null,
        ifRefresh: false,
        mobileSource: []
    };

    componentDidMount() {
        this.props.onRef(this);
        this._divisionContact(1,true);
        this._phoneSourceGet();
        this.propsGet(this.props);
    }

    componentWillReceiveProps(nextProps){ //组件接收到新的props时调用
        this.propsGet(nextProps);
        
    }

    propsGet = (nextProps) => {
        console.log('dsfdf:',nextProps)
    }

    _onMsgDetail = (msgDetailPhone) => {
        this.setState({
            msgDetailPhone,
            msgVisible: true,
        });
    };

    _onTaoBaoDetail = (id) => {
        this.setState({relationId: id, taoBaoVisible: true});
    };

    _onAddCollectionRecord = (paramsObj) => {
        const {handleVisible} = this.props;
        handleVisible && handleVisible(true, paramsObj);
    };

    _onSendMsg = (phone) => {
        this.setState({
            sendMsgVisible: true,
            sendMsgPhone: phone,
        });
    };

    _phoneSourceGet = async () => {
        try {
            const {errcode, errmsg, data} = await Http.phoneSourceCase();
            let contactArr = [];
            if (errcode === 0) {
                if (Array.isArray(data)) {
                    contactArr = data;
                }
            } else {
                const msg = errmsg ? errmsg : '请求服务异常';
                message.error(msg)
            }
            this.setState({
                mobileSource: contactArr,
            });
        } catch (e) {
            message.error('请求服务异常');
        }
    };

    _divisionContact = async (contactPageIndex,ifRefresh) => {
        
        contactPageIndex = contactPageIndex ? contactPageIndex : this.state.pagination['current']
        if (ifRefresh) {
            this.setState({
                ifRefresh: true
            })
        }
        console.log('dsfdf:',contactPageIndex)
        this.setState({
            loadingTable: true
        })
        try {
            const {caseId} = this.props;
            const {pagination} = this.state;
            const params = {
                caseId,
                pageSize: PageSize,
                pageNo: contactPageIndex,
            };
            const {errcode, errmsg, data} = await Http.divisionContact(params);
            let contactArr = [];
            if (errcode === 0) {
                const {total, rows} = data;
                pagination.total = total;
                pagination.current= contactPageIndex;
                if (Array.isArray(rows)) {
                    contactArr = rows;
                }
            } else {
                const msg = errmsg ? errmsg : '请求服务异常';
                message.error(msg)
            }
            this.setState({
                contactArr,
                pagination,
                loadingTable: false,
                pageIndex: contactPageIndex,
                ifRefresh: false
            });
        } catch (e) {
            this.setState({loadingTable: false, ifRefresh: false});
            message.error('请求服务异常');
        }
    };

    _handleVisible = (stateName, stateValue) => {
        this.setState({[stateName]: stateValue});
    };

    _sendMsgRecordSearch = (sendMsgRecordSearchInput) => {
        this.setState({sendMsgRecordSearchInput});
    };

    _handleTableChange = (pagination) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        }, () => {
            this._divisionContact(pagination.current);
        });
    };
    _handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            console.log('_addCollectionRecordLog',values)
            if (!err) {
                this.setState({
                    phoneNumber: values.phoneNumber,
                    phoneSource: values.phoneSource,
                    ifRefresh: true
                },function(){
                    this.setState({
                        ifRefresh: false
                    })
                })
                // this._myDivisionList(1, queryObj);
            }
        });
    };
    _handleReset = () => {
        const {form: {resetFields}} = this.props;
        resetFields();
        this.setState({
            phoneNumber: '',
            phoneSource: '',
            ifRefresh: true
        },function(){
            this.setState({
                ifRefresh: false
            })
        })
        // this._myDivisionList(1);
    };
    render() {
        const {caseId} = this.props;
        const {form: {getFieldDecorator}} = this.props;
        const {
            phoneSource, phoneNumber, loadingTable, ifRefresh, loading, pagination, contactArr, msgVisible, msgDetailPhone,
            mobileSource, sendMsgVisible, sendMsgPhone, taoBaoVisible, relationId,
        } = this.state;
        console.log('this.state', this.state);
        return (
            <div className='division-contact'>
                <Spin size="large" spinning={loading}>
                    <TitleLine
                        title='联系人'
                        icon='edit-1-copy'
                    />
                    <Table
                        bordered
                        size='small'
                        columns={this.columns}
                        rowKey={'id'}
                        dataSource={contactArr}
                        pagination={pagination}
                        loading={loadingTable}
                        onChange={this._handleTableChange}
                    />
                    <MsgDetail
                        visible={msgVisible}
                        receivePhone={msgDetailPhone}
                        handleCancel={(v) => this._handleVisible('msgVisible', v)}
                    />
                    <TitleLine
                        title='催收记录'
                        icon='edit-1-copy'
                    />
                    <Form className='all-division'>
                        <Row>
                            <Col {...ColConfig}>
                                <Form.Item {...FormItemLayout} label='拨打号码' style={{marginBottom: '10px'}}>
                                    {getFieldDecorator('phoneNumber', {
                                        rules: [{required: false, message: '请输入拨打号码'},
                                        ],
                                    })(
                                        <Input placeholder="拨打号码"/>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col {...ColConfig}>
                                <Form.Item {...FormItemLayout} label='号码来源' style={{marginBottom: '10px'}}>
                                    {getFieldDecorator('phoneSource', {
                                        rules: [{required: false, message: '请选择号码来源'}],
                                    })(
                                        <Select placeholder='请选择号码来源' allowClear={true}>
                                            {
                                                mobileSource.map(i => {
                                                    return (
                                                        <Option key={i.code} value={i.code}>{i.msg}</Option>
                                                    )
                                                })
                                            }
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
                                    onClick={this._handleSubmit}
                                >
                                    查询
                                </Button>
                                <Button
                                    className="close"
                                    htmlType="button"
                                    onClick={this._handleReset}
                                >
                                    重置
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                    {/* <Row type='flex' align='middle' justify='start' style={{margin: '10px 0'}}>
                        <span>拨打号码：</span> 
                        <Col {...ColConfig}>
                            <Search
                                placeholder="请输入拨打号码"
                                enterButton="搜索"
                                size="default"
                                onSearch={v => this._collectionRecordSearch(v)}
                            />
                        </Col>
                        <span>号码来源：</span> 
                        <Col {...ColConfig}>
                            <Search
                                placeholder="请输入号码来源"
                                enterButton="搜索"
                                size="default"
                                onSearch={v => this._collectionRecordSearch(v)}
                            />
                        </Col>
                    </Row> */}
                    <AddCollectionRecordLog
                        caseId={caseId}
                        phoneNumber={phoneNumber}
                        phoneSource={phoneSource}
                        ifRefresh={ifRefresh}
                    />
                    {/*<TitleLine*/}
                    {/*title='发送短信记录'*/}
                    {/*icon='edit-1-copy'*/}
                    {/*/>*/}
                    {/*<Row type='flex' align='middle' justify='start'>*/}
                    {/*<Col {...ColConfig} xs={3} sm={3} md={3}>*/}
                    {/*筛选条件：*/}
                    {/*</Col>*/}
                    {/*<Col {...ColConfig}>*/}
                    {/*<Search*/}
                    {/*placeholder="请输入接收号码"*/}
                    {/*enterButton="搜索"*/}
                    {/*size="default"*/}
                    {/*onSearch={v => this._sendMsgRecordSearch(v)}*/}
                    {/*/>*/}
                    {/*</Col>*/}
                    {/*</Row>*/}
                    {/*<SendMsgRecordComponent*/}
                    {/*type='contact'*/}
                    {/*queryObj={{*/}
                    {/*caseId: caseId,*/}
                    {/*receivePhone: sendMsgRecordSearchInput,*/}
                    {/*}}*/}
                    {/*/>*/}
                    <Modal
                        centered
                        destroyOnClose={true}
                        title='发送短信'
                        visible={sendMsgVisible}
                        footer={null}
                        onCancel={() => this._handleVisible('sendMsgVisible', false)}
                        width={'70%'}
                    >
                        <SendMsgComponent
                            caseId={caseId}
                            phone={sendMsgPhone}
                            type={'contact'}
                            showClose={true}
                            handleClose={() => this._handleVisible('sendMsgVisible', false)}
                        />
                    </Modal>
                    <TaoBaoContactDetail
                        id={relationId}
                        visible={taoBaoVisible}
                        handleCancel={() => this._handleVisible('taoBaoVisible', false)}
                    />
                </Spin>
            </div>
        )
    }

}
const Main = Form.create()(MainForm);
export default Main;