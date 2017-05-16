
var appConfig = {
    url: 'http://52.67.208.141/cashbackdev/frontend/web/index.php?r=',
    url: 'http://localhost/cashback/frontend/web/index.php?r=',
    urlFoto: 'http://localhost/cashback/frontend/web/',
    localStorageName: 'esUser'
};

var validateLogin = function (data) {

    var attrName = appConfig.localStorageName,
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
                myApp.alert(errorStr, 'Opss');
                logout();
                
            } else {
                localStorage.setItem(attrName, JSON.stringify(data));
                myApp.closeModal();
            }
        });
        
    } else {
        logout();
    }

};

var loginForm = function () {
    myApp.loginScreen();
};

var logout = function () {
    localStorage.setItem(appConfig.localStorageName, '');
    loginForm();
};

var ajaxUser = function () {

};

var ajaxApi = function (method, params, callback) {
    
    ajaxParams = {};
    ajaxParams.type = 'POST';
    ajaxParams.dataType = 'json';
    ajaxParams.data = params;
    ajaxParams.url = appConfig.url + 'api-empresa/' + method;

    var ajax = $.ajax(ajaxParams);
    ajax.always(function (data) {
        if ( typeof data.error != "undefined" ) {
            var errorStr = '';
            for (var i in data.error) {
                errorStr += "* " + data.error[i][0] + "<br />";
            }
            myApp.alert(errorStr, 'Opss');

        } else if ( typeof callback == 'function' ) {
            callback(data);
        }
    });
    
};


// Template7 - begin -----------------------------------------------------------

// funcoes
Template7.registerHelper('count', function (a, options) {
  return a.length;
});

Template7.registerHelper('foto', function (a, options) {
  return appConfig.urlFoto + a;
});

// Class Template --------------------------------------------------------------
class Template {

    constructor (templateId) {
        this.templateId = templateId;
        this.templateCompiled = Template7(document.getElementById(this.templateId).innerHTML).compile();
        this.dataCompiled = '';
    }

    compileData (data) {
        this.dataCompiled = this.templateCompiled({data: data});
    }
    
    loadData () {
        return (typeof this.dataCompiled == 'string' ? document.getElementById('destino-' + this.templateId).innerHTML = this.dataCompiled : false);
    }
    
    compileAndLoadData (data) {
        this.compileData (data);
        this.loadData ();
    }
    
}

// Template7 - end -------------------------------------------------------------



validateLogin();