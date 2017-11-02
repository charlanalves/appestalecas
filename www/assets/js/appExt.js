

var appConfig = {};
var init = function () {
    params = {};
    params.type = 'POST';
    params.dataType = 'json';
    params.async = false;
    params.url = 'http://52.67.208.141/cashbackdev/frontend/web/index.php?r=api-empresa/param';
    params.url = 'http://localhost/cashback/frontend/web/index.php?r=api-empresa/param';
    var ajaxParam = $.ajax(params);
    ajaxParam.always(function (data) {
        appConfig = data;
        app();
    });
};

var blockPanelLeft = function (pgName) {    
    myApp.params.swipePanel = ($.inArray(pgName, appConfig.panelLeftHide) >= 0) ? false : 'left';
}
var getUserData = function () {
    return (typeof [appConfig.localStorageName] == "object" ? JSON.parse((localStorage[appConfig.localStorageName] || '{}')) : false);
}
var validaEmail = function() {
    var dados = getUserData();
    localStorage.setItem(appConfig.localStorageName, JSON.stringify($.extend(dados,{email_valid: 1})));
}
var validaAlteracaoSenha = function() {
    var dados = getUserData();
    localStorage.setItem(appConfig.localStorageName, JSON.stringify($.extend(dados,{password_reset_token: ""})));
    goMain();
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
                alert(errorStr, 'Opss');
				
                return false;
                
            } else {
                return saveUserLSAndRedirectToIndex(attrName, data);
            }
        });
		myApp.closeModal('')

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
            alert(errorStr, 'Opss');

        } else if ( data.status == false ) {
            alert(data.retorno, 'Opss');
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
        
        // controla exibicao do meu
        blockPanelLeft(pg.name);
        
    });
    
    // evento voltar (class BACK)
    myApp.onPageBack(page, function (pg) {
        appConfig.back = true;
    });
    
    // evento apos a animacao da page
    myApp.onPageAfterAnimation(page, function (pg) {
        
        // verifica se ja rodou a action inicial
        if(!appConfig.actionInit) {
            actionInit();
            appConfig.actionInit = true;
        }
        
        // obriga alterar a senha se utilizou o recurso de recuperar
        var dadosUser = getUserData();
        if(dadosUser.password_hash == dadosUser.password_reset_token && pg.name != 'change-password') {
            mainView.router.loadPage('change-password.html?r=true');
            return false;
        }
        
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

var geolocation = function() {
    var onSuccess = function(position) {
        var newData = {latitude: position.coords.latitude, longitude: position.coords.longitude}
        var dados = getUserData();
        localStorage.setItem(appConfig.localStorageName, JSON.stringify($.extend(dados, newData)));
    };
    function onError(error) {}
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

var distanteDeMin = function (lat_destino, long_destino){
    var dados = getUserData();
    return calcDistancia(dados.latitude, dados.longitude, lat_destino, long_destino)
}

var calcDistancia = function (lat_inicial, long_inicial, lat_final, long_final) {
    d2r = 0.017453292519943295769236;

    dlong = (long_final - long_inicial) * d2r;
    dlat = (lat_final - lat_inicial) * d2r;

    temp_sin = Math.sin(dlat/2.0);
    temp_cos = Math.cos(lat_inicial * d2r);
    temp_sin2 = Math.sin(dlong/2.0);

    a = (temp_sin * temp_sin) + (temp_cos * temp_cos) * (temp_sin2 * temp_sin2);
    c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));

    return 6368.1 * c;
}

var getMyAddress = function () {
    param = getUserData();
    var j = $.ajax('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + param.latitude + ',' + param.longitude);
    j.always(function(a) {
        var address = a.results[0].address_components;
        console.log('Logradouro:' + address[1].short_name);
        console.log('Bairro:' + address[2].short_name);
        console.log('Cidade:' + address[3].short_name);
        console.log('Estado:' + address[5].long_name);
        console.log('UF:' + address[5].short_name);
        console.log('Pais:' + address[6].short_name);
    });
}

var orderEvaluation = function () {
    ajaxApiUser('get-avaliacao', {}, showOrderEvaluation);
};

var showOrderEvaluation = function (r) {
    var r;
    if (r.length) {
        
        var pedidos = [];
        var avaliacoes = [];
        var ii = 0;    
        var msgEstrela = '<i class="font-xs">Marque a quantidade de estrelas que indicam seu grau de satisfação.</i>';

        for(var j in r) {
            avaliacao = r[j].avaliacao;
            avaliacoes[j] = avaliacao;
            pedidos[j] = r[j].pedido;

            // itens da avaliacao
            itensAvaliacao = '<div class="avaliacao">\n';
            for(var i in avaliacao) {
                itensAvaliacao += '<div class="estrela-avaliacao"><span><i class="fa fa-'+avaliacao[i].CB23_ICONE+' fa-fw"></i> &nbsp;'+avaliacao[i].CB23_DESCRICAO+'</span><div class="select-star"><select id="css-star-'+j+'-'+i+'" name="rating" autocomplete="off"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div></div>\n';
            }
            itensAvaliacao += '</div>\n';

            // nome da empresa + produto
            empresaProduto = '<div class="negrito">'+pedidos[j].empresa+' - '+pedidos[j].produto+'</div>';

            // campo para comentario
            campoComentario = '<div class="avaliacao-comentario">Deixe seu comentário:<textarea id="comentario-avaliacao-'+j+'"></textarea></div>';

            myApp.modal({
                title: 'Avaliação',
                text: empresaProduto + itensAvaliacao + (avaliacao.length ? msgEstrela : '') + campoComentario,
                buttons: [{text: 'Enviar Avaliação', onClick: function () {

                    // dados do comentario
                    resultadoComentario = {
                        CB22_COMENTARIO: $('textarea#comentario-avaliacao-'+ii).val(),
                        CB22_AVALIACAO_ID: pedidos[ii].avaliacao_id,
                        CB22_PRODUTO_PEDIDO_ID: pedidos[ii].produto_pedido
                    };

                    // dados da avaliacao
                    resultadoAvaliacao = [];
                    for(var i in avaliacoes[ii]) {
                        valorSelect = $('select#css-star-'+ii+'-'+i).val();
                        resultadoAvaliacao.push({
                            CB21_ITEM_AVALIACAO_ID: avaliacoes[ii][i].CB20_ID,
                            CB21_PRODUTO_PEDIDO_ID: pedidos[ii].produto_pedido,
                            CB21_NOTA: valorSelect,
                        });
                    }

                    // salva a avaliacao
                    ajaxApiUser('save-avaliacao', {produto_pedido: pedidos[ii].produto_pedido, avaliacao: resultadoAvaliacao, comentario: resultadoComentario});

                    ii++;
                }}]
            });

            $(function() {
                for(var i in avaliacao) {
                    $('#css-star-'+j+'-'+i).barrating({theme: 'css-stars'});
                }
            });

        }
    }
    
};

var actionInit = function() {
    
    // geolocalizacao
    geolocation();
    
    // avaliação de pedido
    orderEvaluation();
    
};

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

Template7.registerHelper('percent2', function (a, b) {
    a = parseFloat(a.replace(',','.'));
    b = parseFloat(b.replace(',','.'));
  return String(parseFloat((a / b) * 100).toFixed(2)).replace('.',',');
});

Template7.registerHelper('foto', function (a, options) {
  return appConfig.urlFoto + (a || appConfig.urlFotoDefault);
});

Template7.registerHelper('data', function (a) {
    d = new Date(a);
    month = String(d.getMonth() + 1);
    day = String(d.getDate());
    year = String(d.getFullYear());
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return day + '/' + month + '/' + year;
});

Template7.registerHelper('real', function (a, options) {
    var aParse = String(parseFloat(a).toFixed(2)).replace('.',',');
    return (aParse === 'NaN') ? '0,00' : aParse;
});

Template7.registerHelper('distancia', function (a, options) {
    if (a < 1) {
        a = a * 1000;
        unidadeMedida = "metros"
        aParse = String(parseFloat(a)).replace('.',',');
    } else {
        unidadeMedida = "Km"
        aParse = String(parseFloat(a).toFixed(2)).replace('.',',');
    }
    return (aParse === 'NaN') ? '' : aParse + ' ' + unidadeMedida;
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