import React from 'react';
import './index.less';
import '../../libs/iconfont/iconfont';
import PropTypes from 'prop-types';

export default class Iconfont extends React.Component {

    static propTypes = {
        icon: PropTypes.string.isRequired,
        size: PropTypes.number,
    };

    static defaultProps = {
        size: 16,
    };

    render() {
        const {icon, size} = this.props;
        const style = {};
        if (size) {
            Object.assign(style, {height: size, width: size});
        }
        return (
            <svg className='icon' aria-hidden="true" style={style}>
                <use xlinkHref={`#icon-${icon}`}/>
            </svg>
        )
    }
}