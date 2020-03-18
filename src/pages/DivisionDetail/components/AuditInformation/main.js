import React from 'react';
import './index.less';
import PropTypes from 'prop-types';
import {Http} from '../../../../components';
import {message,Table,} from 'antd';
import {TableWidth} from '../../../../config';

export default class Main extends React.PureComponent {

    static propTypes = {
        caseId: PropTypes.string.isRequired,
    };

    static defaultProps = {};

    state = {
        loading: true,
        dataSource: []
    };

    componentDidMount() {
        const {caseId} = this.props;
        this._listGet(caseId);
    }

    columns = [
        {
            title: '审核人',
            dataIndex: 'operatorName',
            width: TableWidth.large,
        },
        {
            title: '审核时间',
            dataIndex: 'createTime',
            width: TableWidth.middle,
        },
        {
            title: '审核内容',
            dataIndex: 'remark',
            width: TableWidth.middle,
        },
    ];

    _listGet = async (caseId) => {
        try {
            const {errcode, errmsg, data} = await Http.checkLogList({caseId});
            if (errcode === 0) {
                this.setState({
                    dataSource: data ? data : [],
                });
            } else {
                console.log('errmsg', errmsg);
                const msg = errmsg ? errmsg : '请求服务失败';
                message.error(msg);
            }
            this.setState({
                loading: false
            });
        } catch
            (e) {
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    }

    

    render() {
        const {loading,dataSource} = this.state;
        return (
            <div className='contact-user-info'>
                    
                    <Table
                        bordered
                        size='small'
                        columns={this.columns}
                        rowKey='id'
                        dataSource={dataSource}
                        pagination={false}
                        loading={loading}
                    />
            </div>
        )
    }
}
