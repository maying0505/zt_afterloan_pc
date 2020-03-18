import React from 'react';
import './index.less';
import {Form, Input, Icon, Button, message, Spin} from 'antd';
import {Http} from '../../components';
import {SessionStorage} from '../../utils';
import {StorageKeys} from '../../config';

const TimeOut = 60;

class Main extends React.Component {

    state = {
        loading: false,
        userInput: null,
        hasSendCode: false,
        timeOut: TimeOut,
    };

    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this._login(values);
            }
        });
    };

    _login = async (params) => {
        try {
            SessionStorage.removeAll();
            this.setState({loading: true});
            const result = await Http.login(params);
            console.log('login result', result);
            if (result.errcode === 0) {
                message.info('登录成功');
                const {token, menuList, name, buttonList} = result.data;
                if (token && menuList && name) {
                    const userInfo = {menu: menuList, user: {name}};
                    SessionStorage.set(StorageKeys.token, token);
                    SessionStorage.set(StorageKeys.userInfo, userInfo);
                    SessionStorage.set(StorageKeys.buttonList, buttonList);
                    this.props.history.replace('/main');
                } else {
                    const msg = result.errmsg ? result.errmsg : '登录失败，请联系管理员';
                    message.error(msg);
                }
            } else {
                const msg = result.errmsg ? result.errmsg : '登录失败，请联系管理员';
                message.error(msg);
            }
            this.setState({loading: false});
        } catch (e) {
            console.log('login e', e);
            this.setState({loading: false});
            message.error('请求服务异常');
        }
    };

    _onUserInputChange = (v) => {
        console.log('v', v);
        this.setState({userInput: v.target.value});
    };

    _onBtnClick = () => {
        this._onSendValidateCode();
    };

    _onSendValidateCode = async () => {
        try {
            const {userInput} = this.state;
            const params = {username: userInput};
            const {errcode, errmsg} = await Http.sendValidateCode(params);
            if (errcode === 0) {
                message.info(errmsg);
                this.setState({hasSendCode: true, timeOut: TimeOut});
                let timeOut = TimeOut - 1;
                this.timer = setInterval(() => {
                    this.setState({timeOut: timeOut--});
                }, 1000);
            } else {
                const msg = errmsg ? errmsg : '发送失败';
                message.warn(msg);
            }
        } catch (e) {
            message.error('请求服务异常');
        }
    };


    render() {
        const {getFieldDecorator} = this.props.form;
        const {loading, userInput, hasSendCode, timeOut} = this.state;

        const btnTxt = (() => {
            if (hasSendCode && timeOut !== 0) {
                return `${timeOut}秒后重新发送`;
            } else if (timeOut === 0 || hasSendCode === false) {
                return '点击发送验证码';
            }
        })();
        const buttonDisabled = (() => {
            if (/\d{11}/.test(userInput)) {
                if (hasSendCode && timeOut !== 0) {
                    return true;
                } else if (timeOut === 0 || hasSendCode === false) {
                    return false;
                }
            } else {
                return true;
            }
        })();
        if (timeOut === 0) {
            console.log('clearInterval');
            this.timer && clearInterval(this.timer);
        }
        return (
            <div className='login-cls'>
                <div className='login-box'>
                    <Spin size='large' spinning={loading}>
                        <h2>诚要金</h2>
                        <Form onSubmit={this.handleSubmit} className="login-form">
                            <Form.Item>
                                {getFieldDecorator('username', {
                                    rules: [{required: true, message: '请输入电话号码！'},
                                    ],
                                })(
                                    <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                           placeholder="电话号码"
                                           onChange={this._onUserInputChange}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item>
                                {getFieldDecorator('password', {
                                    rules: [{required: true, message: '请输入密码！'}],
                                })(
                                    <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                           type="password"
                                           placeholder="密码"/>
                                )}
                            </Form.Item>
                            <Form.Item>
                                {getFieldDecorator('validateCode', {
                                    rules: [{required: true, message: '请输入验证码！'}],
                                })(
                                    <Input prefix={<Icon type="block" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                           placeholder="验证码"
                                           suffix={
                                               <Button
                                                   onClick={this._onBtnClick}
                                                   disabled={buttonDisabled}
                                                   style={{width: '120px'}}
                                               >
                                                   {btnTxt}
                                               </Button>
                                           }
                                    />
                                )}
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="login-form-button">
                                    登录
                                </Button>
                            </Form.Item>
                        </Form>
                    </Spin>
                </div>
            </div>
        )
    }
}

const WrappedNormalLoginForm = Form.create({name: 'normal_login'})(Main);
export default WrappedNormalLoginForm;