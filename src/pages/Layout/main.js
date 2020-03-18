import React from 'react';
import {Layout, Menu, Icon, Divider, Modal, Tooltip, Input, message} from 'antd';
import {Route, Switch} from "react-router-dom";
import {Http, Iconfont} from '../../components';
import './index.less';
import {LALogo, LALogoName} from '../../assets';
import {SessionStorage} from '../../utils';
import {StorageKeys} from '../../config';
import {LayoutRoute} from '../../route';
import {inject} from 'mobx-react';

const {Content, Sider} = Layout;
const SubMenu = Menu.SubMenu;
const SiderArr = [
    {
        id: 0,
        label: '逾期时段',
        path: null,
        icon: 'yiyuqi',
        children: [
            {id: 0.1, label: '逾期时段配置', path: null},
            {id: 0.2, label: '逾期时段修改记录', path: null},
        ]
    },
    {
        id: 1,
        label: '分案管理',
        path: null,
        icon: 'fenlei',
        children: [
            {id: 1.1, label: '分案日志', path: null},
        ]
    },
    {
        id: 2,
        label: '催收人员管理',
        path: null,
        icon: 'renyuanguanli',
        children: [
            {id: 2.1, label: '人员时段、排班修改', path: null},
            {id: 2.2, label: '委外公司管理', path: null},
        ]
    },
    {
        id: 3,
        label: '催收管理',
        path: null,
        icon: 'cuishou',
        children: [
            {id: 3.1, label: '还款列表', path: null},
            {id: 3.2, label: '逾期列表', path: null},
            {id: 3.3, label: '所有分案', path: null},
            {id: 3.4, label: '我的分案', path: null},
            {id: 3.5, label: '催收短信发送', path: null},
            {id: 3.6, label: '短信发送记录', path: null},
        ]
    },
    {
        id: 4,
        label: '委外分案',
        path: null,
        icon: 'weiwaishengchan',
    },
];

class SiderDemo extends React.Component {

    state = {
        collapsed: false,
        defaultSelectedKeys: [],
        defaultOpenKeys: [],
        oldPassword: null,
        newPassword: null,
    };

    componentWillMount() {
        const {menu} = SessionStorage.get(StorageKeys.userInfo);
        console.log('menu:',menu)
        let item = {};
        if (menu[0].children) {
            item = menu[0].children[0];
        } else {
            item = menu[0];
        }
        let key = null;
        const openKey = `${menu[0].id}_${menu[0].target}`;
        if (Object.keys(item).length > 0) {
            const {id, target} = item;
            if (target === 'outerCase') {
                key = `${item.href}_${target}`;
            } else {
                key = `${id}_${target}`;
            }
        }
        if (!key && !openKey) {
            return;
        }
        this._onClick({key});
        this.setState({
            defaultSelectedKeys: [key],
            defaultOpenKeys: [openKey],
        });
    }

    onCollapse = (collapsed) => {
        this.setState({collapsed});
        const {SideModel} = this.props;
        SideModel.updateCollapsed(collapsed);
    };

    _onClick = ({item, key, keyPath}) => {
        SessionStorage.remove(StorageKeys.allDivisionQuery);
        SessionStorage.remove(StorageKeys.myDivisionPageIndex);
        SessionStorage.set(StorageKeys.currentMenuKey, key);
        const target = key.split('_')[1];
        const id = key.split('_')[0];
        const path = this._pathWithTarget(target);
        let newPath = '';
        if (path === LayoutRoute[12].path) {
            newPath = `${path.split(':')[0]}${id}`;
        } else {
            newPath = path;
        }
        if (path && newPath) {
            this.props.history.push(newPath);
        }
    };

    _pathWithTarget = (target) => {
        const str = `
贷后管理	afterLoanM
催收人员管理	caseUserMa
催收管理	urgeCase
分案管理	caseManage
逾期时段	pastDue
催收人员管理	caseUser2
委外公司管理	outerComp
逾期账户	OverdueAcc
催收短信发送	urgeSmsSen
短信发送记录	smsSendLog
还款列表	paymentLis
所有分案	allCase
我的分案	MyCase
分案日志	caseLogLis
逾期时段配置	overdueTim
逾期时段修改记录	pastDueUpd
机构分案管理  companyCas
数据总览 dataShow
催收数据 urgeData
公司统计 companyRep
统计首页 homeReport
催收记录 recordList
`;
        switch (target) {
            case 'MyCase': {
                return LayoutRoute[0].path;
            }
            case 'allCase': {
                return `/main/allDivision/1`;
            }
            case 'overdueTim': {
                return LayoutRoute[2].path;
            }
            case 'pastDueUpd': {
                return LayoutRoute[3].path;
            }
            case 'caseUser2': {
                return LayoutRoute[4].path;
            }
            case 'urgeSmsSen': {
                return LayoutRoute[6].path;
            }
            case 'smsSendLog': {
                return LayoutRoute[7].path;
            }
            case 'paymentLis': {
                return LayoutRoute[8].path;
            }
            case 'OverdueAcc': {
                return LayoutRoute[9].path;
            }
            case 'outerComp': {
                return LayoutRoute[10].path;
            }
            case 'caseLogLis': {
                return LayoutRoute[11].path;
            }
            case 'outerCase': {
                return LayoutRoute[12].path;
            }
            case 'companyCas': {
                return LayoutRoute[13].path;
            }
            case 'dataShow': {
                return LayoutRoute[14].path;
            }
            case 'urgeData': {
                return LayoutRoute[15].path;
            }
            case 'companyRep': {
                return LayoutRoute[16].path;
            }
            case 'homeReport': {
                return LayoutRoute[17].path;
            }
            case 'recordList': {
                return LayoutRoute[18].path;
            }
        }
    };

    _renderMenuItem = (item) => {
        const {id, name, target, children} = item;
        if (children) {
            const icon = this._menuIcon(target);
            return (
                <SubMenu
                    key={`${id}_${target}`}
                    title={
                        <span>
                            <i className='anticon'><Iconfont icon={icon}/></i>
                            <span>{name}</span>
                        </span>
                    }
                >
                    {children.map(i => this._renderMenuItem(i))}
                </SubMenu>
            )
        } else {
            const key = (() => {
                if (target === 'outerCase') {
                    return `${item.href}_${target}`;
                } else {
                    return `${id}_${target}`
                }
            })();
            return (
                <Menu.Item key={key} style={{paddingLeft: '20px'}}>
                    <span>{name}</span>
                </Menu.Item>
            )
        }
    };

    _menuIcon = (code) => {
        switch (code) {
            case 'pastDue': {
                return 'yiyuqi';
            }
            case 'caseManage': {
                return 'fenlei';
            }
            case 'caseUserMa': {
                return 'renyuanguanli';
            }
            case 'urgeCase': {
                return 'cuishou';
            }
            case 'outerCase': {
                return 'weiwaishengchan';
            }
            default: {
                return 'yiyuqi';
            }

        }
    };

    _showConfirm = () => {
        Modal.confirm({
            title: '提示',
            content: '退出登录？',
            onOk: this._loginOut,
            onCancel: () => null,
        });
    };

    _loginOut = () => {
        SessionStorage.removeAll();
        this.props.history.replace('/login');
        this._destroyAll();
    };

    _destroyAll = () => {
        Modal.destroyAll();
    };

    _handleLayOut = () => {
        this._showConfirm();
    };

    _handleChangePassword = () => {
        const ele = (
            <div>
                <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                       type="password"
                       placeholder="旧密码"
                       onChange={e => this.setState({oldPassword: e.target.value})}
                />
                <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                       type="password"
                       style={{marginTop: '5px'}}
                       placeholder="新密码"
                       onChange={e => this.setState({newPassword: e.target.value})}
                />
            </div>
        );
        Modal.confirm({
            title: '修改密码',
            content: ele,
            onOk: () => {
                const {oldPassword, newPassword} = this.state;
                if (!oldPassword || !newPassword) {
                    message.info('输入旧密码或新密码');
                    return;
                }
                const params = {
                    oldPassword,
                    newPassword,
                };
                this._onChangePassword(params);
            },
            onCancel: () => null,
        });
    };

    _onChangePassword = async (params) => {
        try {
            const {errcode, errmsg} = await Http.changePassword(params);
            if (errcode === 0) {
                this._loginOut();
            } else {
                const msg = errmsg ? errmsg : '请求失败';
                message.error(msg);
            }
            this.setState({
                oldPassword: null,
                newPassword: null,
            });
        } catch (e) {
            this.setState({
                oldPassword: null,
                newPassword: null,
            });
            message.error('请求服务异常');
        }
    };

    render() {
        const {collapsed, defaultSelectedKeys, defaultOpenKeys} = this.state;
        const {user: {name}, menu} = SessionStorage.get(StorageKeys.userInfo);
        const ele = () => {
            if (collapsed) {
                return <Tooltip title='退出'><Icon onClick={this._handleLayOut} type="logout"/></Tooltip>
            }
            return (
                <div>
                    <Tooltip title='修改密码'>
                        <span onClick={this._handleChangePassword}><Iconfont icon="yonghu"/>&nbsp;{name}</span>
                    </Tooltip>
                    <Divider type="vertical"/>
                    <Tooltip title='退出'>
                        <span onClick={this._handleLayOut}><Icon type="logout"/>&nbsp;退出</span>
                    </Tooltip>
                </div>
            );
        };
        return (
            <Layout className='my-layout' style={{minHeight: '100vh'}}>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={this.onCollapse}
                    style={{
                        backgroundColor: '#222632',
                    }}
                    className='sider'
                >
                    <div className="logo">
                        <img src={collapsed ? LALogo : LALogoName} alt='诚要金'/>
                    </div>
                    <div className='menu-box'>
                        <div className='menu-view'>
                            <Menu
                                theme="dark"
                                defaultOpenKeys={defaultOpenKeys}
                                defaultSelectedKeys={defaultSelectedKeys}
                                mode="inline"
                                onClick={this._onClick}
                            >
                                {menu.map(i => this._renderMenuItem(i))}
                            </Menu>
                        </div>
                    </div>
                    <div className='layout-button'>
                        {ele()}
                    </div>
                </Sider>
                <Layout>
                    <Content style={{padding: '8px', backgroundColor: '#f0f3f6'}}>
                        <div className='outer-content'>
                            <div className='inner-content'>
                                <Switch>
                                    {LayoutRoute.map((item, index) => <Route key={index} {...item}/>)}
                                </Switch>
                            </div>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

const InjectSiderDemo = inject('SideModel')(SiderDemo);
export default InjectSiderDemo;