import React from 'react';
import './index.less';
import {Modal, Button, Table, message} from "antd";
import PropTypes from 'prop-types';
import {TableWidth, PageSize,} from "../../../../config";
import {Http} from '../../../../components';

export default class Main extends React.Component {

    static propTypes = {
        visible: PropTypes.bool.isRequired,
        receivePhone: PropTypes.string.isRequired,
        handleCancel: PropTypes.func.isRequired,
    };

    static defaultProps = {};

    state = {
        data: [],
        loading: false,
        pagination: {},
        receivePhone: '',
    };

    componentWillReceiveProps(nextProps, nextContext) {
        const {visible, receivePhone} = nextProps;
        if (visible !== this.props.visible && receivePhone !== this.props.receivePhone) {
            if (visible) {
                this.setState({receivePhone}, () => {
                    this._contactMsgDetailList(1);
                });
            }
        }
    }

    columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            width: TableWidth.small,
        },
        {
            title: '手机号',
            dataIndex: 'receivePhone',
            width: TableWidth.large,
        },
        {
            title: '发送/接收',
            dataIndex: 'sendOrReceive',
            width: TableWidth.small,
        },
        {
            title: '发送/接收时间',
            dataIndex: 'sendOrReceiveTime',
            width: TableWidth.large,
        },
        {
            title: '短信内容',
            dataIndex: 'smsContent',
        },
    ];

    _contactMsgDetailList = async (pageIndex) => {
        try {
            this.setState({loading: true});
            const {pagination, receivePhone} = this.state;
            const params = {
                receivePhone,
                pageNo: pageIndex,
                pageSize: PageSize,
            };
            console.log('params', params);
            const {errcode, errmsg, data} = await Http.contactMsgDetailList(params);
            let contactArr = [];
            if (errcode === 0) {
                const {pages, pageNo, pageSize, total, rows} = data;
                pagination.total = total;
                if (Array.isArray(rows)) {
                    contactArr = rows;
                }
            } else {
                const msg = errmsg ? errmsg : '请求服务异常';
                message.error(msg)
            }
            this.setState({
                pageIndex,
                pagination,
                data: contactArr,
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
            this._contactMsgDetailList(pagination.current);
        });
    };

    render() {
        const {visible, handleCancel} = this.props;
        const {data, loading, pagination} = this.state;
        return (
            <div className='msg-detail'>
                <Modal
                    centered
                    destroyOnClose={true}
                    title='短信详情'
                    visible={visible}
                    onCancel={() => handleCancel(false)}
                    width={'60%'}
                    footer={[
                        <Button onClick={() => handleCancel(false)}>关闭</Button>,
                    ]}
                >
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
                </Modal>
            </div>
        )
    }
}