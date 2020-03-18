/**
 * @Desc 添加催记记录
 * */
import React from 'react';
import './index.less';
import PropTypes from 'prop-types';
import {Http} from '../../components';
import {message, Table} from 'antd';
import {PageSize, TableWidth} from '../../config';
import moment from 'moment';

const DateFormat = 'YYYY-MM-DD HH:mm';

export default class Main extends React.PureComponent {

    static propTypes = {
        caseId: PropTypes.string,
        phoneNumber: PropTypes.string,
        phoneSource: PropTypes.string,
        ifRefresh: PropTypes.bool,
    };

    static defaultProps = {
        ifRefresh: false,
        caseId: '',
        phoneNumber: '',
        phoneSource: ''
    };

    state = {
        caseId: '',
        phoneNumber: '',
        phoneSource: '',
        pageIndex: 1,
        loading: false,
        pagination: {pageSize: PageSize, showTotal: total => `共${total}条`},
    };

    columns = [
        {
            title: '借款人',
            dataIndex: 'name',
            width: TableWidth.small,
        },
        {
            title: '催收人',
            dataIndex: 'userOverdue',
            width: TableWidth.small,
        },
        {
            title: '催收时间',
            dataIndex: 'operatorTime',
            width: TableWidth.small,
            render: (text) => {
                if (text) {
                    return moment(text).format(DateFormat);
                } else {
                    return '';
                }
            }
        },
        {
            title: '联系人姓名',
            dataIndex: 'relationName',
            width: TableWidth.small,
        },
        {
            title: '拨打号码',
            dataIndex: 'phoneNumber',
            width: TableWidth.small,
        },
        {
            title: '问题代码',
            dataIndex: 'problemCode',
            width: TableWidth.small,
        },
        {
            title: '号码来源',
            dataIndex: 'phoneSource',
            width: TableWidth.small,
        },
        {
            title: '关系备注2',
            dataIndex: 'relation',
            width: TableWidth.small,
        },
        {
            title: '问题备注',
            dataIndex: 'problemDescription',
            width: TableWidth.small,
        },
        {
            title: '还款状态',
            dataIndex: 'states',
            width: TableWidth.small,
        },
    ];

    componentDidMount() {
        console.log('_addCollectionRecordLog prosp', this.props);
        const {caseId,ifRefresh,phoneNumber,phoneSource} = this.props;
        const { loading } = this.state;
        this.setState({caseId,phoneNumber,phoneSource}, () => {
            if (ifRefresh&&!loading) {
                this._addCollectionRecordLog(1);
            }
        });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        console.log('_addCollectionRecordLog prosp1', nextProps);
        const {phoneNumber,ifRefresh,caseId,phoneSource} = nextProps;
        const { loading } = this.state;
        this.setState({phoneNumber,caseId,phoneSource}, () => {
            if (ifRefresh&&!loading) {
                this._addCollectionRecordLog(1);
            }
        });
    }

    _addCollectionRecordLog = async (pageIndex) => {
        this.setState({
            loading: true
        })
        try {
            const {caseId, phoneNumber, pagination,phoneSource} = this.state;
            const newParams = {
                caseId,
                phoneNumber,
                phoneSource,
                pageNo: pageIndex,
                pageSize: PageSize,
            };
            const {errcode, errmsg, data} = await Http.addCollectionRecordLog(newParams);
            let dataArr = [];
            if (errcode === 0) {
                const {total, rows} = data;
                pagination.total = total;
                pagination.current = pageIndex;
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
            this._addCollectionRecordLog(pagination.current);
        });
    };

    render() {
        const {data, pagination, loading} = this.state;
        const {clientHeight} = document.body;
        const tableScrollY = clientHeight * 0.65;
        return (
            <Table
                bordered
                size='small'
                columns={this.columns}
                rowKey='id'
                dataSource={data}
                pagination={pagination}
                loading={loading}
                onChange={this._handleTableChange}
                scroll={{x: 1300}}
            />
        )
    }
}