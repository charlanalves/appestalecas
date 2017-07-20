
var appConfig = {

    url: 'http://52.67.208.141/cashbackdev/frontend/web/index.php?r=',	
  //  url: 'http://localhost/apiestalecas/frontend/web/index.php?r=',
    
    urlFoto: 'http://52.67.208.141/cashbackdev/frontend/web/',	
//	urlFoto: 'http://localhost/apiestalecas/frontend/web/',
    //urlFoto: 'http://localhost/cashback/frontend/web/',
    
    //url: 'http://52.67.208.141/cashbackdev/frontend/web/index.php?r=',
    //url: 'http://localhost/apiestalecas/frontend/web/index.php?r=',
    //urlFoto: 'http://localhost/apiestalecas/frontend/web/',
    
    // Eduardo
    url: 'http://localhost/cashback/frontend/web/index.php?r=',
    urlFoto: 'http://localhost/cashback/frontend/web/',

    localStorageName: 'esUser',
    back: false,
    backRecarregou: true,
    topTransparent: ['company', 'main'],
    tabbarBottomShow: ['category', 'main', 'invite-friend', 'cash-out', 'change-password']
};

var getUserData = function () {
    return (typeof [appConfig.localStorageName] == "object" ? JSON.parse((localStorage[appConfig.localStorageName] || '{}')) : false);
}
var validaEmail = function() {
    var dados = getUserData();
    localStorage.setItem(appConfig.localStorageName, JSON.stringify($.extend(dados,{email_valid: 1})));
}
var saveUserLSAndRedirectToIndex = function(attrName,data){
    localStorage.setItem(attrName, JSON.stringify(data));
    // verifica email valido
    if(data.email_valid != 1) {
        mainView.router.loadPage('valid-email.html');
    } else {
        goMain();
    }
    return true;
}
var goMain = function() {mainView.router.loadPage('category.html');};
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
        } else if (localStorageObj.email_valid != 1) {
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
    
    // evento antes da animacao da page
    myApp.onPageBeforeAnimation(page, function (pg) {
        
        // controla menu inferior div#tabbar-bottom
        var tabbarBottom = $('div#tabbar-bottom');
        if($.inArray(pg.name, appConfig.tabbarBottomShow) >= 0) {
            tabbarBottom.find('.link-tabbar-bottom').removeClass('active');
            tabbarBottom.find('.link-tabbar-bottom.active-' + pg.name).addClass('active');
            tabbarBottom.show();
        } else {
            tabbarBottom.hide();
        }
        
        // controla barra top
        if($.inArray(pg.name, appConfig.topTransparent) >= 0) {
            $('.navbar').css('background', 'transparent');
        } else {
            $('.navbar').css('background', '#be0000');
        }
        
    });
    
    // evento voltar (class BACK)
    myApp.onPageBack(page, function (pg) {
        appConfig.back = true;
    });
    
    // evento apos a animacao da page
    myApp.onPageAfterAnimation(page, function (pg) {
        
        if(!appConfig.back || appConfig.backRecarregou) {
            (validateLogin()) ? callback(pg) : logout();
            appConfig.backRecarregou = false;
        } else {
            appConfig.backRecarregou = true;
        }
        appConfig.back = false;
        
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

Template7.registerHelper('checked_html', function (a, b) {
  return (a == b ? 'checked="true"' : '');
});

Template7.registerHelper('percent', function (a, b) {
    a = parseFloat(a.replace(',','.'));
    b = parseFloat(b.replace(',','.'));
  return String(parseFloat(a * (b / 100)).toFixed(2)).replace('.',',');
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

    clear () {
        document.getElementById('destino-' + this.templateId + this.i).innerHTML = '';
    }
    
    compileData (data) {
        this.dataCompiled = this.templateCompiled({data: data});
    }
    
    loadData () {
        return (typeof this.dataCompiled == 'string' ? document.getElementById('destino-' + this.templateId + this.i).innerHTML = this.dataCompiled : false);
    }
    
    appendData () {
        return (typeof this.dataCompiled == 'string' ? $('#destino-' + this.templateId + this.i).append(this.dataCompiled) : false);
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