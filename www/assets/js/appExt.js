
var appConfig = {

   // url: 'http://52.67.208.141/cashbackdev/frontend/web/index.php?r=',	
    url: 'http://localhost/apiestalecas/frontend/web/index.php?r=',
    
  //  urlFoto: 'http://52.67.208.141/cashbackdev/frontend/web/',	
	urlFoto: 'http://localhost/apiestalecas/frontend/web/',
    //urlFoto: 'http://localhost/cashback/frontend/web/',

    //url: 'http://52.67.208.141/cashbackdev/frontend/web/index.php?r=',
    //url: 'http://localhost/apiestalecas/frontend/web/index.php?r=',
    //urlFoto: 'http://localhost/apiestalecas/frontend/web/',
	
    // Eduardo
    //url: 'http://localhost/cashback/frontend/web/index.php?r=',
    //urlFoto: 'http://localhost/cashback/frontend/web/',

    localStorageName: 'esUser',
    back: false
};

var getUserData = function () {
    return (typeof [appConfig.localStorageName] == "object" ? JSON.parse((localStorage[appConfig.localStorageName] || '{}')) : false);
}
var saveUserLSAndRedirectToIndex = function(attrName,data){
    localStorage.setItem(attrName, JSON.stringify(data));
    mainView.router.loadPage('main.html');
    return true;
}
var validateLogin = function (data) {
    var attrName = appConfig.localStorageName;

    // novo login
    if (typeof data == 'object') {
        var errorStr = '';

        // Ajax para validar o usuario
        var ajax = ajaxApi('login', data, function (data) {
            if (typeof data.error != "undefined") {
                for (var i in data.error) {
                    errorStr += data.error[i][0] + "\n";
                }
                myApp.alert(errorStr, 'Opss');
                return false;
                
            } else {
               return saveUserLSAndRedirectToIndex(attrName, data);
            }
        });

    // valida usuario logado
    } else {
        if (localStorage.getItem(attrName) == 'undefined') {
            return false;
        }
        var localStorageObj = (localStorage.getItem(attrName) ? JSON.parse(localStorage.getItem(attrName)) : false);
        if (typeof localStorageObj.auth_key == 'undefined') {
            return false;
        } else {
             return true
        }    
        
    }
};

var loginForm = function () {
    myApp.closeModal();
    mainView.router.loadPage('login.html');
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

    $.blockUI();
    var ajax = $.ajax(ajaxParams);
    ajax.always(function (data) {
        $.unblockUI();
        if ( typeof data.error != "undefined" && data.error && typeof data.status == "undefined") {
            var errorStr = '';
            for (var i in data.error) {
                errorStr += "* " + data.error[i][0] + "<br />";
            }
            myApp.alert(errorStr, 'Opss');

        } else if ( data.status == false ) {
            myApp.alert(data.retorno, 'Opss');
            console.error(data.dev);
            console.info(data.lastResponse);
        } 
        else if ( typeof callback == 'function' ) {
            callback(data);
        }
    });
    
};

var securePage = function (page, callback) {
    var page;
    var callback = (typeof callback == 'function') ? callback : function(){};
    
    myApp.onPageBack(page, function (pg) {
        appConfig.back = true;
    });
    
    myApp.onPageAfterAnimation(page, function (pg) {
        if(!appConfig.back) {
            (validateLogin()) ? callback(pg) : logout();
            
        } else {
            appConfig.back = false;
        }
    });
};

var enablePanelLeft = function () {
    $('div#panel-left').addClass('panel-left');
}

var disablePanelLeft = function () {
    $('div#panel-left').removeClass('panel-left');
}

// Template7 - begin -----------------------------------------------------------

// funcoes
Template7.registerHelper('count', function (a, options) {
  return a.length;
});

Template7.registerHelper('foto', function (a, options) {
  return appConfig.urlFoto + a;
});

Template7.registerHelper('real', function (a, options) {
    var aParse = String(parseFloat(a).toFixed(2)).replace('.',',');
    return (aParse === 'NaN') ? '0,00' : aParse;
});

// Class Template --------------------------------------------------------------
class Template {

    constructor (templateId, i) {
        this.templateId = templateId;
        this.templateCompiled = Template7(document.getElementById(this.templateId).innerHTML).compile();
        this.dataCompiled = '';
        this.i = (i || ''); // controle de destino - para destinos dinamicos
    }

    compileData (data) {
        this.dataCompiled = this.templateCompiled({data: data});
    }
    
    loadData () {
        return (typeof this.dataCompiled == 'string' ? document.getElementById('destino-' + this.templateId + this.i).innerHTML = this.dataCompiled : false);
    }
    
    compileAndLoadData (data) {
        var data = (data || {});
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