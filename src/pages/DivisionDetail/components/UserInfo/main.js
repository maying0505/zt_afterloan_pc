import React from 'react';
import './index.less';
import PropTypes from 'prop-types';
import {Http, TitleLine} from '../../../../components';
import {Col, message, Row, Spin, Table, Modal} from 'antd';
import {ColConfig, TableWidth, PageSize} from '../../../../config';

export default class Main extends React.PureComponent {

    static propTypes = {
        caseId: PropTypes.string.isRequired,
    };

    static defaultProps = {};

    state = {
        loading: true,
        baseInfo: [],
        lendingInfo: [],
        repaymentList: [],
        pagination: {pageSize: PageSize},
        visible: false,
        userImg: null,
        repaymentList1: [], 
        loading1: true,
        orderSource: ''
    };

    componentDidMount() {
        const {caseId} = this.props;
        this._divisionUserInfo(caseId);
        this._repaymentPeriod(caseId);
    }

    columns = [
        {
            title: '借款订单号',
            dataIndex: 'orderId',
            width: TableWidth.large,
        },
        {
            title: '借款人姓名',
            dataIndex: 'name',
            width: TableWidth.middle,
        },
        {
            title: '认证号码',
            dataIndex: 'phone',
            width: TableWidth.middle,
        },
        {
            title: '放款时间',
            dataIndex: 'loanTime',
            width: TableWidth.xLarge,
        },
        {
            title: '借款金额',
            dataIndex: 'principal',
            width: TableWidth.large,
        },
        // {
        //     title: '应还时间',
        //     dataIndex: 'planFeeTime',
        //     width: TableWidth.large,
        // },
        // {
        //     title: '应还金额',
        //     dataIndex: 'totalMoney',
        //     width: TableWidth.middle,
        // },
        {
            title: '实还金额',
            dataIndex: 'trueTotalMoney',
            width: TableWidth.middle,
        },
        {
            title: '实还时间',
            dataIndex: 'createTime',
            width: TableWidth.xLarge,
        },
        // {
        //     title: '剩余未还金额',
        //     dataIndex: 'remainingMoeny',
        //     width: TableWidth.large,
        // },
    ];

    columns1 = [
        {
            title: '借款订单号',
            dataIndex: 'orderId',
            width: TableWidth.large,
        },
        {
            title: '姓名',
            dataIndex: 'name',
            width: TableWidth.middle,
        },
        {
            title: '号码',
            dataIndex: 'phone',
            width: TableWidth.middle,
        },
        {
            title: '放款时间',
            dataIndex: 'loanTime',
            width: TableWidth.middle,
        },
        {
            title: '借款金额',
            dataIndex: 'totalPrincipal',
            width: TableWidth.middle,
        },
        {
            title: '借款期限',
            dataIndex: 'loanDay',
            width: TableWidth.middle,
        },
        {
            title: '期数',
            dataIndex: 'phase',
            width: TableWidth.middle,
        },
        {
            title: '应还时间',
            dataIndex: 'shouldRepayTime',
            width: TableWidth.middle,
        },
        {
            title: '应还本金',
            dataIndex: 'principal',
            width: TableWidth.middle,
        },
        {
            title: '应还利息',
            dataIndex: 'interests',
            width: TableWidth.middle,
        },

        {
            title: '应还手续费',
            dataIndex: 'serviceFee',
            width: TableWidth.middle,
        },
        {
            title: '是否逾期',
            dataIndex: 'isOverdue',
            width: TableWidth.middle,
        },
        {
            title: '逾期天数',
            dataIndex: 'overdueDay',
            width: TableWidth.middle,
        },
        {
            title: '逾期金额',
            dataIndex: 'lateFee',
            width: TableWidth.middle,
        },
        {
            title: '还款状态',
            dataIndex: 'status',
            width: TableWidth.middle,
        },
        {
            title: '应还金额',
            dataIndex: 'totalMoney',
            width: TableWidth.middle,
        },
        {
            title: '实还金额',
            dataIndex: 'trueTotalMoney',
            width: TableWidth.middle,
        },
        {
            title: '实还日期',
            dataIndex: 'actualRepayTime',
            width: TableWidth.middle,
        },
    ];

    _repaymentPeriod = async (caseId) => {
        try {
            const {errcode, errmsg, data} = await Http.repaymentPeriod({caseId});
            if (errcode === 0) {
                this.setState({
                    repaymentList1: data ? data : [],
                });
            } else {
                console.log('errmsg', errmsg);
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({
                loading1: false
            });
        } catch
            (e) {
            this.setState({loading1: false});
            message.error('请求服务异常');
        }
    }

    _divisionUserInfo = async (caseId) => {
        try {
            const {errcode, errmsg, data} = await Http.divisionUserInfo({caseId});
            let baseInfoArr = [];
            let lendingArr = [];
            let repaymentListArr = [];
            if (errcode === 0) {
                const {baseInfo, lendingInfo, repaymentList} = data;
                const {
                    baseImages,
                    name,
                    age,
                    property,
                    degrees,
                    marriage,
                    phone,
                    idNumber,
                    zmScore,
                    workUnit,
                    permanentAddress,
                    loanAddress,
                    bankName,
                    accountName,
                    cardNo,
                } = baseInfo;
                baseInfoArr = [
                    {id: 0, label: '图片集合', value: baseImages},
                    {id: 1, label: '姓名', value: name},
                    {id: 2, label: '年龄', value: age},
                    {id: 3, label: '性别', value: property},
                    {id: 4, label: '学历', value: degrees},
                    {id: 5, label: '婚姻状况', value: marriage},
                    {id: 6, label: '认证号码', value: phone},
                    {id: 7, label: '身份证号', value: idNumber},
                    {id: 8, label: '芝麻信用分', value: zmScore},
                    {id: 9, label: '工作单位', value: workUnit},
                    {id: 10, label: '居住地址', value: permanentAddress},
                    {id: 11, label: '借款地址', value: loanAddress},
                    {id: 12, label: '开户行', value: bankName},
                    {id: 13, label: '开户名', value: accountName},
                    {id: 14, label: '银行卡号', value: cardNo},
                    {id: 15, label: '合同信息', value: [{v: '1', n: '借款协议'}, {v: '3', n: '平台服务协议'}, {v: '4', n: 'APP下载链接'}]},
                ];
                const {
                    orderId,
                    loanDay,
                    loanTime,
                    planFeeTime,
                    principal,
                    overdueDay,
                    lateFee,
                    remainingMoeny,
                    orderSource
                } = lendingInfo;
                this.setState({
                    orderSource
                })
                lendingArr = [
                    {id: 0, label: '借款订单', value: orderId},
                    {id: 1, label: '借款期限', value: `${loanDay}天`},
                    {id: 2, label: '借款日期', value: loanTime},
                    {id: 3, label: '到期日期', value: planFeeTime},
                    {id: 4, label: '借款金额', value: `${principal}元`},
                    {id: 5, label: '逾期天数', value: `${overdueDay}天`},
                    {id: 6, label: '逾期费用', value: `${lateFee}元`},
                    {id: 8, label: '应还时间', value: planFeeTime},
                    {id: 7, label: '剩余未还金额', value: remainingMoeny},

                ];
                repaymentListArr = repaymentList;
            } else {
                console.log('errmsg', errmsg);
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({
                loading: false,
                baseInfo: baseInfoArr,
                lendingInfo: lendingArr,
                repaymentList: repaymentListArr,
            });
        } catch
            (e) {
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    _onImgClick = (userImg) => {
        this.setState({
            userImg,
            visible: true,
        });
    };

    _handleCancel = () => {
        this.setState({visible: false});
    };

    _creditUrl = async (type) => {
        if (type === '4') {
            let orderSource = this.state.orderSource;
            if (orderSource == 'CYJ') {
                window.open('http://cyj.credit.buyem.cn:88/credit-user/download');
            } else if (orderSource == 'CYJPLUS') {
                window.open('http://h5.buyem.cn:88/page/download/index.html');
            } else if (orderSource == 'LY') {
                window.open('http://jm.user.281340.cn:88/credit-user/download');
            } else if (orderSource == 'CNH') {
                window.open('http://cnh.user.281340.cn:88/credit-user/download');
            } else if (orderSource == 'HD') {
                window.open('http://hd.user.281340.cn:88/credit-user/download');
            }
            return;
        }
        try {
            const {caseId} = this.props;
            const params = {
                type,
                caseId,
            };
            this.setState({loading: true});
            const {errcode, errmsg, data} = await Http.creditUrl(params);
            if (errcode === 0) {
                this.setState({loading: false});
                window.open(data);
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                this.setState({loading: false});
                message.error(msg);
            }
        } catch (e) {
            this.setState({loading: false});
        }
    };

    render() {
        const {loading, baseInfo, lendingInfo, repaymentList, pagination, visible, userImg, repaymentList1, loading1} = this.state;
        return (
            <div className='contact-user-info'>
                <Spin size="large" spinning={loading}>
                    <TitleLine
                        title='基础信息'
                        icon='edit-1-copy'
                    />
                    <Row>
                        {
                            baseInfo.map((item, index) => {
                                const {id, label, value} = item;
                                const colConfig = (() => {
                                    if (id === 0) {
                                        return {
                                            ...ColConfig,
                                            xs: 24,
                                            sm: 24,
                                            md: 24,
                                        }
                                    } else {
                                        return ColConfig;
                                    }
                                })();
                                let child = null;
                                if (id === 0) {
                                    if (value && Object.keys(value).length > 0) {
                                        const {IdCardFront, IdCardReverse, faceRecognitionPictures} = value;
                                        let eleArr = [];
                                        const imgComponent = ({item, alt}) => {
                                            return (
                                                <img
                                                    className='user-img'
                                                    key={item.id}
                                                    src={item.url}
                                                    alt={alt}
                                                    onClick={() => this._onImgClick(item.url)}
                                                />
                                            )
                                        };
                                        IdCardFront && eleArr.push(imgComponent({item: IdCardFront, alt: '身份证'}));
                                        IdCardReverse && eleArr.push(imgComponent({
                                            item: IdCardReverse,
                                            alt: '身份证'
                                        }));
                                        faceRecognitionPictures && eleArr.push(
                                            imgComponent({item: faceRecognitionPictures, alt: '身份证'})
                                        );
                                        child = eleArr;
                                    }
                                } else if (id === 15) {
                                    if (value) {
                                        const ele = value.map((i, index) => {
                                            const {v, n} = i;
                                            return (
                                                <a
                                                    href="javascript:;"
                                                    onClick={() => this._creditUrl(v)}
                                                    style={{margin: '0 8px'}}
                                                    key={`c_key_${index}`}
                                                >
                                                    {n}
                                                </a>
                                            )
                                        });
                                        child = (
                                            <div key={id}>
                                                <span className='label'>{label}：</span>
                                                <span>{ele}</span>
                                            </div>
                                        );
                                    }
                                } else {
                                    child = (
                                        <div key={id}>
                                            <span className='label'>{label}：</span>
                                            <span className='value'>{value}</span>
                                        </div>
                                    );
                                }
                                if (value) {
                                    return (
                                        <Col {...colConfig} key={`baseInfo${index}`}>
                                            {child}
                                        </Col>
                                    )
                                }
                            })
                        }
                    </Row>
                    {/* <TitleLine
                        title='借贷信息'
                        icon='edit-1-copy'
                    />
                    <Row style={{marginBottom: '12px'}}>
                        {
                            lendingInfo.map(item => {
                                const {id, label, value} = item;
                                const col = {};
                                if (id === 7) {
                                    Object.assign(col, ColConfig, {md: 12});
                                } else {
                                    Object.assign(col, ColConfig);
                                }
                                return (
                                    <Col {...col} key={id}>
                                        <div>
                                            <span className='label'>{label}：</span>
                                            <span className='value'>{value}</span>
                                        </div>
                                    </Col>
                                )
                            })
                        }
                    </Row> */}
                    <TitleLine
                        title='还款列表'
                        icon='edit-1-copy'
                    />
                    <Table
                        bordered
                        size='small'
                        columns={this.columns1}
                        rowKey='id'
                        dataSource={repaymentList1}
                        pagination={false}
                        loading={loading1}
                        // onChange={this._handleTableChange}
                    />
                    <TitleLine
                        title='还款日志'
                        icon='edit-1-copy'
                    />
                    <Table
                        bordered
                        size='small'
                        columns={this.columns}
                        rowKey='id'
                        dataSource={repaymentList}
                        pagination={false}
                        loading={loading}
                        // onChange={this._handleTableChange}
                    />
                    <Modal
                        footer={null}
                        visible={visible}
                        onCancel={this._handleCancel}
                        width={900}
                    >
                        {userImg && <img style={{width: '850px', height: '850px'}} src={userImg} alt=''/>}
                    </Modal>
                </Spin>
            </div>
        )
    }
}
