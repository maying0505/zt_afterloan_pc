import React from 'react';
import './index.less';
import {Tabs, Icon, Button} from 'antd';
import {findDOMNode} from 'react-dom';
import {DivisionUserInfo, DivisionContact,AuditInformation} from './components';
import AddCollectionRecord from '../AddCollectionRecord';

import {inject} from 'mobx-react';

const TabPane = Tabs.TabPane;

class Main extends React.PureComponent {

    state = {
        visible: false,
        needX: 0,
        needY: 30,
        paramsObj: {},
    };

    componentDidMount() {
        const {clientWidth} = document.body;
        const needX = (clientWidth / 2) - 145;
        this.setState({needX});
    }

    _handleBack = () => {
        sessionStorage.setItem('_ifBack','0');
        this.props.history.goBack();
    };

    _handleVisible = (visible,e) => {
        this.setState({visible});
        if (e) {
            console.log('this._contactRef._divisionContact',this.child)
            this.child && this.child._divisionContact && this.child._divisionContact(undefined,true);
        }
    };

    _handelAddCollectionVisible = (visible, paramsObj) => {
        const {screenY} = paramsObj.ele;
        this.setState({
            visible,
            paramsObj,
            needY: 30,
        });
    };

    _onDragStart = (e) => {
        e.dataTransfer.effectAllowed = 'move';
        return true;
    };

    _onDrag = (e) => {
        return true;
    };

    _onDragOver = (e) => {
        e.preventDefault();
        return true;
    };

    _onDragEnter = (e) => {
        return true;
    };

    _onDrop = (e) => {
        return false;
    };

    _onDragEnd = (e) => {
        const {clientX, screenY} = e;
        this.setState({
            needX: clientX,
            needY: screenY,
        });
    };

    onRef = (ref) => {
        this.child = ref
    }

    render() {
        // const {match: {params: {caseId}}} = this.props;
        let ifModal = false;
        if (this.props.ifModal) {
            ifModal = true;
        }
        console.log('this.props.caseId',this.props)
        let caseId = '';
        if (this.props.caseId) {
            caseId = this.props.caseId;
        } else if (this.props.match && this.props.match.params && this.props.match.params['caseId']) {
            caseId = this.props.match.params['caseId'];
        }
        const {visible, needX, needY, paramsObj} = this.state;
        const props = {
            caseId,
        };
        const maskStyle = {
            width: '0',
            height: '0',
        };
        const {clientWidth} = document.body;
        const sideWidth = 0; //SideModel.collapsed ? 80 : 200;
        const maxLeft = clientWidth - 290;
        const minLeft = 0;
        const left = (() => {
            if (needX - sideWidth < 0) {
                return minLeft;
            } else if (needX - sideWidth > maxLeft) {
                return maxLeft;
            } else {
                return (needX - sideWidth);
            }
        })();
        return (
            <div
                className='division-detail'
                onDragEnter={this._onDragEnter}
                onDragOver={this._onDragOver}
                onDrop={this._onDrop}
            >
                {!ifModal && <div className='back'>
                    <Button
                        htmlType="button"
                        onClick={this._handleBack}
                    >
                        返回
                    </Button>
                </div>}
                <Tabs
                    defaultActiveKey="0"
                    tabPosition={"top"}
                    style={{height: "100%"}}
                >
                    <TabPane tab={<span><Icon type="user"/>用户信息</span>} key='0'>
                        <DivisionUserInfo {...props}/>
                    </TabPane>
                    <TabPane tab={<span><Icon type="contacts"/>联系人</span>} key='1'>
                        <DivisionContact
                            {...props}
                            onRef={this.onRef}
                            handleVisible={(v, paramsObj) => this._handelAddCollectionVisible(v, paramsObj)}
                        />
                    </TabPane>
                    <TabPane tab={<span>审核信息</span>} key='3'>
                        <AuditInformation {...props}/>
                    </TabPane>
                </Tabs>
                <div
                    className='my-modal'
                    draggable={true}
                    onDragStart={this._onDragStart}
                    onDrag={this._onDrag}
                    onDragEnd={this._onDragEnd}
                    style={{
                        cursor: 'pointer',
                        left: left,
                        top: needY,
                        display: visible ? 'inline' : 'none',
                    }}
                >
                    <div className='header'>
                        <span className='title'>添加催记</span>
                        <span className='icon' onClick={() => this._handleVisible(false,false)}><Icon type='close' style={{
                            fontSize: '18px',
                            color: '#E0B788'
                        }}/></span>
                    </div>
                    <div className='content'>
                        <AddCollectionRecord
                            mask={false}
                            visible={visible}
                            type={'DivisionDetail'}
                            maskStyle={maskStyle}
                            handleCancel={(v) => this._handleVisible(false,v)}
                            caseId={caseId}
                            phone={paramsObj.phone}
                            id={paramsObj.id}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

const InjectComponent = inject('SideModel')(Main);
export default InjectComponent;