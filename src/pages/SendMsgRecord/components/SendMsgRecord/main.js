import React from 'react';
import './index.less';
import PropTypes from 'prop-types';
import {message, Table} from "antd";
import {PageSize, TableWidth} from "../../../../config";
import {Http} from "../../../../components";

export default class Main extends React.PureComponent {

    static propTypes = {
        type: PropTypes.oneOf(['sendMsg', 'contact']).isRequired,
        queryObj: PropTypes.object,
    };

    static defaultProps = {
        queryObj: {},
    };

    state = {
        pageIndex: 1,
        loading: false,
        pagination: {pageSize: PageSize},
        queryObj: {},
        data: [],
    };

    columns = [
        {
            title: '案件ID',
            dataIndex: 'caseId',
            width: TableWidth.xLarge,
        },
        {
            title: '案件来源',
            dataIndex: 'orderSource',
            width: TableWidth.xLarge,
        },
        {
            title: '借款人姓名',
            dataIndex: 'name',
            width: TableWidth.large,
        },
        {
            title: '借款人号码',
            dataIndex: 'phoneNumber',
            width: TableWidth.large,
        },
        {
            title: '接收号码',
            dataIndex: 'receivePhone',
            width: TableWidth.large,
        },
        {
            title: '号码来源',
            dataIndex: 'phoneSource',
            width: TableWidth.large,
        },
        {
            title: '关系备注2',
            dataIndex: 'relation',
            width: TableWidth.large,
        },
        {
            title: '短信内容',
            dataIndex: 'smsContent',
            width: TableWidth.large,
        },
        {
            title: '发送时间',
            dataIndex: 'deliveryTime',
            width: TableWidth.large,
        },
        {
            title: '操作人',
            dataIndex: 'operator',
            width: TableWidth.middle,
        },
        {
            title: '提交日期',
            dataIndex: 'operatorTime',
            width: TableWidth.large,
        },
        {
            title: '还款状态',
            dataIndex: 'stateName',
        },
    ];

    componentDidMount() {
        const {type} = this.props;
        if (type === 'sendMsg') {
            this._msgSendRecord(1);
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const {
            queryObj: {orderId, name, phoneNumber, receivePhone, phoneSource, relation, operator, caseId, orderSource},
            type,
        } = nextProps;
        if (orderId || name || phoneNumber || receivePhone || phoneSource || relation || operator || caseId || orderSource) {
            const queryObj = {
                orderId,
                name,
                phoneNumber,
                receivePhone,
                phoneSource,
                relation,
                operator,
                caseId,
                orderSource,
            };
            this.setState({queryObj}, () => {
                this._msgSendRecord(1);
            });
        } else {
            if (type === 'sendMsg') {
                this.setState({queryObj: {}}, () => {
                    this._msgSendRecord(1);
                });
            }
        }
    }

    _msgSendRecord = async (pageIndex) => {
        try {
            this.setState({loading: true});
            const {pagination, queryObj} = this.state;
            console.log('this.state', this.state);
            const newParams = {
                ...queryObj,
                pageNo: pageIndex,
                pageSize: PageSize,
            };
            console.log('newParams', newParams);
            const {errcode, errmsg, data} = await Http.msgSendRecord(newParams);
            let dataArr = [];
            if (errcode === 0) {
                const {pages, pageNo, pageSize, total, rows} = data;
                pagination.total = total;
                if (Array.isArray(rows)) {
                    dataArr = rows;
                }
            } else {
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({
                pageIndex,
                pagination,
                data: dataArr,
                loading: false,
            });
        } catch (e) {
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    _handleTableChange = (pagination, filters, sorter) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        }, () => {
            this._msgSendRecord(pagination.current);
        });
    };

    render() {
        const {data, pagination, loading} = this.state;
        const {clientHeight} = document.body;
        const tableScrollY = clientHeight * 0.8;
        const tableScrollX = 1850;
        return (
            <Table
                bordered
                size='small'
                columns={this.columns}
                rowKey={record => record.id}
                dataSource={data}
                pagination={pagination}
                loading={loading}
                onChange={this._handleTableChange}
                scroll={{x: tableScrollX, y: tableScrollY}}
            />
        )
    }
}