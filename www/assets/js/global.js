var Form = function (formId) {
    this.form = $('#' + formId),
    this.getMoney = [],
    this.setMoney = function (input) { 
        if(typeof input != 'undefined' && Array.isArray(input)) {
            for (var i in input) {
                $(this[input[i]]).maskMoney({thousands:'.', decimal:',', allowZero: true});
                this.getMoney.push(input[i]);
            }
        }
    },
    this.inputs = function () {
        var $inputs = this.form.find(':input'), data = {};
        $inputs.each(function (k, v) {
            if (v.name) {
                data[v.name] = this;
            }
        });
        return data;
    },
    this.send = function (url, callback)
    {
        var ajaxParams = {},
            data = this.getFormData(),
            inputFiles = this.form.find(':input[type="file"]');

            ajaxParams.url = url;
            ajaxParams.type = 'POST';
            ajaxParams.data = data;
            ajaxParams.dataType = 'json';

            if (inputFiles.length > 0) {
                var newAjaxParams = Util.getInputFilesData(inputFiles, ajaxParams);
                $.extend(ajaxParams, newAjaxParams);
            }

            var ajax = $.ajax(ajaxParams);
            ajax.always(function (data) {
                if (typeof callback == 'function')
                    callback(data);
            });
//
//        
//        var ajax = $.ajax({
//            url: url,
//            type: 'POST',
//            data: this.getFormData(),
//            dataType: "json"
//        });
//        ajax.always(function (data) {
//            if (typeof callback == 'function')
//                callback(data);
//        });
    },
    this.getFormData = function ()
    {
        var form = this, $inputs = form.form.find(':input'), data = {};
        $inputs.each(function (k, v) {
            if (v.name) {
                if (v.type == 'checkbox' || v.type == 'radio') {
                    if(typeof data[v.name] == 'undefined'){
                        data[v.name] = [];
                    }
                    if ($(this).is(':checked')) {
                        data[v.name].push(v.value);
                    }
                } else {
                    // teste se é valor monetario
                    if (form.getMoney.indexOf(v.name) !== -1) {
                        data[v.name] = $(form[v.name]).maskMoney('unmasked')[0];
                    } else {
                        data[v.name] = v.value;
                    }
                }
            }
        });
        return data;
    },
    this.setFormData = function (data)
    {
        var $inputs = this.form.find(':input');
        $inputs.each(function (k, v) {
            nameCompare = v.name.replace('[', '').replace(']', '');
            // input
            if (typeof data[nameCompare] != "undefined") {
                if (v.type != 'file') {
                    if (v.type == 'checkbox' || v.type == 'radio') {
                        if (Object.prototype.toString.call(data[nameCompare]) == "[object Array]") {
                            for (var i in data[nameCompare]) {
                                if ($(this).val() == data[nameCompare][i]) {
                                    $(this).prop('checked', true);
                                }
                            }
                        } else {
                            if ($(this).val() == data[nameCompare]) {
                                $(this).prop('checked', true);
                            }
                        }

                    } else {
                        $(this).val(data[nameCompare]);
                        
                    }
                }
            }
        });
    },
    this.addOptionsSelect = function (selectName, data)
    {
        var select = this.form.find('select[name=' + selectName + ']');
        $.each(data, function (key, value) {
            if (typeof value == "object") {
                key = value.ID;
                value = value.TEXTO;
            }
            select.append($("<option></option>").attr("value", key).text(value));
        });
    },
    this.addCheckboxInLine = function (destinyId, checkboxName, data)
    {
        var destiny = this.form.find('#' + destinyId), checkbox = '';
        $.each(data, function (key, value) {
            if (typeof value == "object") {
                key = value.ID;
                value = value.TEXTO;
            }
            checkbox += '<label class="checkbox"><input type="checkbox" name="' + checkboxName + '[]" value="' + key + '"><i></i>' + value + '</label>' + "\n";
        });
        destiny.append($("<div></div>").attr("class", "inline-group").html(checkbox));
    };
    
    var $inputs = this.form.find(':input'), data = this;
    $inputs.each(function (k, v) {
        if (v.name) {
            data[v.name] = this;
        }
    });
    
};

var Util = {
    copyElement: function ($element) {
        $element.select();
        this.copyText($element.text());
    },
    copyText: function (text) {
        var $tempInput = $("<textarea>");
        $("body").append($tempInput);
        $tempInput.val(text).select();
        document.execCommand("copy");
        $tempInput.remove();

        $.smallBox({
            title: "Copiado...",
            color: "#739E73",
            iconSmall: "fa fa-copy",
            timeout: 1000
        });
    },
    formatNumber: function (n, c, d, t) {
        var n,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "," : d,
            t = t == undefined ? "." : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    },
    getEnderecoByCEP: function (cep, callback) {
        cep = cep.replace('-', '');
        var ajax = $.ajax({
            url: 'http://viacep.com.br/ws/' + cep + '/json/',
            //type: 'GET',
            dataType: "json"
        });
        ajax.always(function (data) {
            callback(data);
        });
    },
    smallBox: function (title, message, type, ico, time) {
        var title = (title || ''), message = (message || ''), type = (type || 'success'), ico = (ico || ''), time = (time || 4000);
        switch (type){
            case 'success': color = "#739E73"; break; // verde
            case 'default': color = "#999"; break; // cinza
            case 'primary': color = "#3276B1"; break; // azul
            case 'info': color = "#57889C"; break; // azul claro
            case 'danger': color = "#A90329"; break; // vermelho
            case 'warning': color = "#C79121"; break; // laranja
            default: color = "#FFF";
        };
        $.smallBox({
            title: title,
            content: message,
            color: color,
            iconSmall: "fa fa-" + ico + " fadeInRight animated",
            timeout: time
        });
    },
    dropZone: function (destinyId, settings, callback) {
        var myDropzone = {}, settings = (settings || {}), callback = (typeof callback == 'function' ? callback : function(){});
        settings.urlSave = (settings.urlSave || '#');
        settings.urlRemove = (settings.urlRemove || false);
        settings.typeFile = (settings.typeFile || 'image/*');
        settings.maxFiles = (settings.maxFiles || 100);
        settings.message = (settings.message || 'Enviar arquivos');
        
        form = '<form action="' + settings.url + '" class="dropzone">' + 
                '<div class="fallback">' + 
                  '<input name="file" type="file" multiple />' + 
                '</div>' + 
              '</form>';
        
        $("#" + destinyId).append($("<div></div>").attr("class", "").html(form));
        
        pageSetUp();
        
	var dropzonefunction = function() {
            Dropzone.autoDiscover = false;
            myDropzone = $("#" + destinyId + ' div form').dropzone({
                url: settings.urlSave,
                addRemoveLinks : true,
                maxFilesize: 0.5,
                acceptedFiles: settings.typeFile,
                maxFiles: settings.maxFiles,
                dictDefaultMessage: '<span class="text-center"><span class="font-lg visible-xs-block visible-sm-block visible-lg-block"><span class="font-lg"><i class="fa fa-cloud-upload text-danger"></i> ' + settings.message + ' </span><span>&nbsp;&nbsp;<h4 class="display-inline"> (clique aqui)</h4></span>',
                dictResponseError: 'Error ao tentar enviar!',
                dictRemoveFile: '',
                init: function() {
                    
                    this.on("complete", function(file) {
                        var retorno = JSON.parse(file.xhr.response);
                        
                        //  ok
                        if(retorno.status) {
                            Util.smallBox('Enviado com sucesso!', '', 'success', 'check-circle', 5000);
                            callback(file);
                        // error
                        } else {
                            msg = (retorno.message || "Não foi possível enviar o arquivo: " + file.name);
                            Util.smallBox("Ocorreu um erro...", msg, 'danger', 'close', 5000);
                        }
                        this.removeFile(file);
                    });
                    
                    this.on("maxfilesexceeded", function(file) { 
                        this.removeFile(file); 
                    });
                    
                    if (settings.urlRemove) {
                        this.on("addedfile", function(file) {

                            var file = (file || {});

                            // Create the remove button
                            var removeButton = Dropzone.createElement("<button class='btn btn-danger btn-xs center'>Excluir</button>");

                            // Capture the Dropzone instance as closure.
                            var _this = this;

                            // Listen to the click event
                            removeButton.addEventListener("click", function(e) {

                                // Make sure the button click doesn't submit the form:
                                e.preventDefault();
                                e.stopPropagation();

                                var ajax = $.ajax({
                                    url: settings.urlRemove,
                                    type: 'POST',
                                    data: {'fileName': file.name},
                                    dataType: "json"
                                });
                                ajax.always(function (data) {
                                    data = data.responseText;
                                    if(data.status){
                                        _this.removeFile(file);
                                    } else {
                                        Util.smallBox((data.message || 'O arquivo não foi excluido'), '', 'danger');
                                    }
                                });
                            });
                            file.previewElement.appendChild(removeButton);
                        });
                    }
                }
            });  
	};
	loadScript("js/plugin/dropzone/dropzone.min.js", dropzonefunction);
        
    },
    galeria: function (destinyId, data) {
        var estrutura = '', imgUrl = '', imgTitle = '', imgDelete = '';
        for (var i in data){
            if ((imgUrl = data[i].imgUrl)) {
                imgTitle = (data[i].imgTitle || '');
                imgDelete = (data[i].imgDelete || false);

                estrutura += '<div class="superbox-list">';
                estrutura += (imgDelete === false ? '' : '<div class="air air-top-right padding-5"><a href="#" onclick="' + imgDelete + '; return false;" class="btn btn-danger btn-excluir btn-xs" title="excluir"><i class="fa fa-close"></i></a></div>');
                estrutura += '<img src="' + imgUrl + '" title="' + imgTitle + '" class="superbox-img"></div>';
            }
        }
        $("#" + destinyId).html($("<div></div>").attr("class", "superbox col-sm-12").html(estrutura));
    },
    ajaxPost: function (url, param, callback, dataType) {
        this.ajax('POST', url, param, callback, dataType);
    },
    ajaxGet: function (url, param, callback, dataType) {
        this.ajax('GET', url, param, callback, dataType);
    },
    ajax: function (method, url, param, callback, dataType) {
        var callback = (callback || null), 
            ajax = $.ajax({
                url: url,
                type: method,
                data: (param || ''),
                dataType: (dataType || "json")
            });
        ajax.always(function (data) {
            if(typeof callback == 'function') {
                callback(data);
            }
        });
    },
    reloadPage: function () {
        window.location.reload(false);
    },
    getInputFilesData: function(inputFiles, ajaxParams) {

        var formData = new FormData(),
        extraData = ajaxParams.data;

        // Seta parametros necessários para a request funcionar com input file
        ajaxParams.cache = false;
        ajaxParams.contentType = false;
        ajaxParams.processData = false;

        for (var i in inputFiles) {
            if (typeof inputFiles[i].files != 'undefined') {
                if (inputFiles[i].files.length > 0) {
                    formData.append(inputFiles[i].name, inputFiles[i].files[0]);
                }
            }
        }

        // Inserindo os dados extras do form no obj formdata (requisito para funcionar com input file)
        if (typeof extraData != 'undefined' && Object.keys(extraData).length > 0) {
        $.each(extraData, function(k,v) {

                // tipo de valor
                var vType = Object.prototype.toString.call(v);

                // verifica se o valor é um ARRAY
                if (vType == '[object Array]') {
                        for (var i in v) { formData.append(k, v[i]); }

                // verifica se o valor é um OBJECT
                        } else if (vType == '[object Object]') {
                        for (var i in v) { formData.append(k + '[' + i + ']', v[i]); }

                } else {
                formData.append(k, v);

                }

        });
        }

        ajaxParams.data = formData;

        return ajaxParams;
    }
};
