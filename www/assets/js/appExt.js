
var appConfig = {
    url: 'http://localhost/cashback/frontend/web/index.php?r='
};

var validateLogin = function (data) {

    var attrName = 'esUser',
        errorStr = '',
        ajaxParams = {};
        ajaxParams.type = 'POST';
        ajaxParams.dataType = 'json';
        ajaxParams.data = '';
        ajaxParams.url = '';

    // novo login
    if (typeof data == 'object') {
        ajaxParams.url = appConfig.url + 'api-empresa/login';
        ajaxParams.data = data;

    // valida usuario logado
    } else {
        var localStorageObj = (localStorage.getItem(attrName) ? JSON.parse(localStorage.getItem(attrName)) : false);
        if (typeof localStorageObj.auth_key != 'undefined') {
            ajaxParams.url = appConfig.url + 'api-empresa/login-active';
            ajaxParams.data = {auth_key: localStorageObj.auth_key};
        }
    }
    
    // Ajax para validar o usuario
    if (ajaxParams.data) {
        var ajax = $.ajax(ajaxParams);
        ajax.always(function (data) {
            if (typeof data.error != "undefined") {
                for (var i in data.error) {
                    errorStr += data.error[i][0] + "\n";
                }
                alert(errorStr);
                localStorage.setItem(attrName, '');
                myApp.loginScreen();
                
            } else {
                localStorage.setItem(attrName, JSON.stringify(data));
                myApp.closeModal();
            }
        });
        
    } else {
        localStorage.setItem(attrName, '');
        myApp.loginScreen();
    }

};
validateLogin();


var ajaxUser = function () {

};