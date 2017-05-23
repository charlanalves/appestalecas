
var appConfig = {
    url: 'http://52.67.208.141/cashbackdev/frontend/web/index.php?r=',
    url: 'http://localhost/cashback/frontend/web/index.php?r=',
    urlFoto: 'http://localhost/cashback/frontend/web/',
    localStorageName: 'esUser'
};

var getUserData = function () {
    return (typeof localStorage[appConfig.localStorageName] == "string" ? JSON.parse(localStorage[appConfig.localStorageName]) : false);
}

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
                mainView.router.loadPage('main.html');
                return true;
            }
        });
        
    } else {
        logout();
    }

};

var loginForm = function () {
    mainView.router.loadPage('main.html');
    myApp.loginScreen();
};

var logout = function () {
    localStorage.setItem(appConfig.localStorageName, '');
    loginForm();
};

var ajaxApiUser = function (method, params, callback) {
    var UserData = getUserData(), params = (params || {});
    if (typeof UserData.auth_key == "string"){
        params.auth_key = UserData.auth_key;
        ajaxApi(method, params, callback);
    } else {
        logout();
    }
};

var ajaxApi = function (method, params, callback) {
    
    ajaxParams = {};
    ajaxParams.type = 'POST';
    ajaxParams.dataType = 'json';
    ajaxParams.data = (params || {});
    ajaxParams.url = appConfig.url + 'api-empresa/' + method;

    var ajax = $.ajax(ajaxParams);
    ajax.always(function (data) {
        if ( typeof data.error != "undefined" && data.error) {
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

Template7.registerHelper('real', function (a, options) {
    return String(parseFloat(a).toFixed(2)).replace('.',',');
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
    
    compileAjax (method, params, callback) {
        var templateCompiled = this;
        ajaxApi(method, params, function(a) {
            templateCompiled.compileAndLoadData(a);
            if (typeof callback == "function") {
                callback(a);
            }
        });
    }
    
}

// Template7 - end -------------------------------------------------------------