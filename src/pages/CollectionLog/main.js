import React from 'react';
import './index.less';
import PropTypes from 'prop-types';
import {message, Table} from 'antd';
import {Http} from '../../components';
import {PageSize, TableWidth} from '../../config';

export default class Main extends React.Component {

    static propTypes = {
        stageName: PropTypes.string,
        operator: PropTypes.string,
        id: PropTypes.string,
        type: PropTypes.oneOf(['modal', 'page']).isRequired,
    };

    static defaultProps = {
        stageName: '',
        operator: '',
        id: '',
    };

    state = {
        data: [],
        pagination: {pageSize: PageSize, showTotal: total => `共${total}条`},
        loading: false,
        pageIndex: 1,
        id: '',
        stageName: '',
        operator: '',
    };

    componentDidMount() {
        this._logList(1);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const {stageName, operator} = nextProps;
        if (stageName !== this.props.stageName || operator !== this.props.operator) {
            this.setState({
                stageName,
                operator,
            }, () => {
                this._logList(1);
            });
        }
    }

    columns = [
        {
            title: '逾期名称',
            dataIndex: 'stageName',
            width: 70,
        },
        {
            title: '起始日',
            dataIndex: 'startTime',
            width: 55,
        },
        {
            title: '截止日',
            dataIndex: 'endTime',
            width: 55,
        },
        {
            title: '添加时间',
            dataIndex: 'operatorTime',
            width: 150,
        },
        {
            title: '操作人',
            dataIndex: 'operatorName',
        },
    ];

    _logList = async (pageIndex) => {
        try {
            this.setState({loading: true});
            const {id} = this.props;
            const {stageName, operator, pagination} = this.state;
            const params = {
                id,
                stageName,
                operator,
                pageNo: pageIndex,
                pageSize: PageSize,
            };
            const result = await Http.collectionLogList(params);
            if (!result) {
                return;
            }
            const {errcode, errmsg, data} = result;
            let dataArr = [];
            if (errcode === 0) {
                const {total, rows} = data;
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
            this._logList(pagination.current);
        });
    };

    render() {
        const {data, pagination, loading} = this.state;
        return (
            <div>
                <Table
                    bordered
                    size='small'
                    columns={this.columns}
                    rowKey='id'
                    dataSource={data}
                    pagination={pagination}
                    loading={loading}
                    onChange={this._handleTableChange}
                />
            </div>
        )
    }
}