import React from 'react';
import './index.less';
import PropTypes from 'prop-types';
import Iconfont from '../Iconfont';
import {Row, Col} from 'antd';

export default class TitleLine extends React.Component {

    static propTypes = {
        icon: PropTypes.string,
        iconColor: PropTypes.string,
        iconSize: PropTypes.string,
        title: PropTypes.string.isRequired,
        rightContent: PropTypes.any,
    };

    static defaultProps = {
        icon: '',
        iconColor: '#ed653f',
        iconSize: '16px',
    };

    render() {
        const {icon, title, iconSize, iconColor, rightContent} = this.props;
        const iconProps = {};
        if (iconSize) {
            Object.assign(iconSize, {size: iconSize});
        }
        return (
            <Row>
                <Col>
                    <div className='title-line'>
                        <div className='left'>
                            {
                                icon &&
                                <span style={{backgroundColor: iconColor}}><Iconfont icon={icon} {...iconProps}/></span>
                            }
                            {title}
                        </div>
                        {
                            rightContent &&
                            <div className='right'>{rightContent()}</div>
                        }
                    </div>
                </Col>
            </Row>
        )
    }
}