import React from 'react';
import {HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

import './App.css';

import {SessionStorage} from './utils';
import {StorageKeys} from './config';

import {AsyncErrorBoundary, mainRoute, LoginComponentProps} from './route';

import {Provider} from 'mobx-react';
import stores from './stores';

import {LocaleProvider} from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const PrivateRoute = ({component: Component, ...rest}) => {
    const token = SessionStorage.get(StorageKeys.token);
    return (
        <Route
            {...rest}
            render={props => token ? <Component {...props}/> :
                <Redirect
                    to={{
                        pathname: '/',
                        state: {from: props.location}
                    }}
                />
            }
        />
    )
};

export default class App extends React.Component {

    render() {
        return (
            <AsyncErrorBoundary>
                <Provider {...stores}>
                    <LocaleProvider locale={zh_CN}>
                        <Router>
                            <Switch>
                                <Route {...LoginComponentProps}/>
                                {mainRoute.map((item, index) => <PrivateRoute key={index} {...item}/>)}
                            </Switch>
                        </Router>
                    </LocaleProvider>
                </Provider>
            </AsyncErrorBoundary>
        )
    }
}