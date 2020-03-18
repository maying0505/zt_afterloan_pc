import {observable, action} from 'mobx';

class SideModel {
    @observable
    collapsed = false;

    @action
    updateCollapsed = (v = false) => {
        this.collapsed = v;
    };
}

export default new SideModel();