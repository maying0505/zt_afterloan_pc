import React from 'react';
import './index.less';
import {SendMsgComponent} from './components';
import {TitleLine} from "../../components";

export default class Main extends React.Component {
    render() {
        return (
            <div>
                <TitleLine
                    title='发送短信'
                    icon='edit-1-copy'
                />
                <SendMsgComponent
                    type={'sendMsg'}
                />
            </div>
        )
    }
}