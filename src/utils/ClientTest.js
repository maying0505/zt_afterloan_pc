const ClientTest = function (window) {
    console.log('navigator', window);
    const {userAgent} = window.navigator;
    let sys = null;
    if (/(iPhone|iPad|iPod|iOS)/i.test(userAgent)) {
        //判断是ios用户的时候执行某种操作
        sys = 'iOS';
    } else if (/(Android)/i.test(userAgent)) {
        sys = 'Android';
    } else {

        sys = 'unKnow';
    }
    return sys;

};

export default ClientTest;