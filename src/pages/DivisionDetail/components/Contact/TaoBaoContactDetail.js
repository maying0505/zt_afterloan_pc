/*
* @desc 淘宝联系人详情
* */
import React from 'react';
import './TaoBaoContactDetail.less';
import PropTypes from 'prop-types';
import {Modal, message, Table} from "antd";
import {Http} from "../../../../components";
import {TableWidth} from "../../../../config";

export default class TaoBaoContactDetail extends React.PureComponent {

    static propTypes = {
        id: PropTypes.number.isRequired,
        handleCancel: PropTypes.func.isRequired,
    };
    static defaultProps = {};

    state = {
        data: [],
        visible: false,
        loading: false,
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.visible !== prevState.visible) {
            return {visible: nextProps.visible};
        }
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.visible !== this.props.visible) {
            const {id} = nextProps;
            if (id && nextProps.visible) {
                this._fetData(id);
            }
            return true;
        } else if (this.state.visible) {
            return true;
        }
    }

    columns = [
        {
            title: '收货人姓名',
            dataIndex: 'name',
            width: 220,
        },
        {
            title: '手机号码',
            dataIndex: 'phone',
            width: TableWidth.middle,
        },
        {
            title: '收货次数',
            dataIndex: 'collectCount',
            width: 80,
        },
        {
            title: '常用收货地址',
            dataIndex: 'commonCollectAddress',
        },
        {
            title: '最新收货地址',
            dataIndex: 'newCollectAddress',
        },
    ];

    _fetData = async (relationId) => {
        try {
            this.setState({loading: true});
            const {errcode, errmsg, data} = await Http.contactTaobao({relationId});
            let newData = [];
            if (errcode === 0) {
                newData = [{...data}];
            } else {
                const msg = errmsg ? errmsg : '请求失败！';
                message.warn(msg);
            }
            this.setState({
                data: newData,
                loading: false,
            });
        } catch (e) {
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    handleCancel = () => {
        const {handleCancel} = this.props;
        handleCancel && handleCancel();
    };

    render() {
        const {visible, loading, data} = this.state;
        return (
            <Modal
                onCancel={this.handleCancel}
                title={'淘宝联系人详情'}
                visible={visible}
                closable={true}
                cancelText={'关闭'}
                centered={true}
                onOk={null}
                okText={null}
                footer={null}
                width={1000}
                destroyOnClose={true}
            >
                <div className='taobao-contact-detail'>
                    <Table
                        bordered
                        size='small'
                        columns={this.columns}
                        rowKey={'id'}
                        dataSource={data}
                        //pagination={pagination}
                        loading={loading}
                        //onChange={this._handleTableChange}
                    />
                </div>
            </Modal>
        )

    }
}