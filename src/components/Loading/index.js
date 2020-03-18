import React from 'react';
import {Icon} from 'antd';
import './index.less';

export default class Loading extends React.Component {
    render() {
        const props = {
            type: 'loading',
            style: {
                fontSize: '40px',
                color: '#E0B788',
            },
            theme: 'outlined',
        };
        return (
            <div className='my-loading'>
                <Icon {...props}/>
                <div>
                    <em>加载中......</em>
                </div>
            </div>
        )
    }
}