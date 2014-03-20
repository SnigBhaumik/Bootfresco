
var URL_LOGIN = '/service/api/login';
var URL_SHARE_LOGIN = '/page/dologin';
var URL_GETUSER = '/service/api/people/';
var URL_GETUSER_AVATAR = '/service/slingshot/profile/avatar/';
var URL_SITES = '/service/api/sites';
var URL_SHARE_SITES = '/service/modules/create-site';
var URL_GETTASKS = '/service/slingshot/dashlets/my-tasks';
var URL_GETROOT = '/service/api/nodelocator/companyhome';
var URL_CREATEFOLDER = '/service/api/node/folder/workspace/SpacesStore/';
var URL_NODE = '/service/api/node/workspace/SpacesStore/';
var URL_UPLOAD_FILE = '/alfresco/service/api/upload';
var URL_GET_CATS = '/service/slingshot/doclib/categorynode/node///';
var URL_MANAGE_CATS = '/service/api/category';
var URL_SHARE_SEARCH_BY_CAT = '/service/components/documentlibrary/data/doclist/all/node/alfresco/company/home?filter=category&filterData=/';
var URL_SEARCH_BY_CAT = '/service/slingshot/doclib2/doclist/all/node/alfresco/company/home?filter=category&filterData=/';

var DEF_LANDING_PAGE = 'landing.html';

var favSites = new Array();

if (sessionStorage.pageSize == undefined) {
	sessionStorage.pageSize = 10;
}

if (sessionStorage.recentTerms == undefined) {
	sessionStorage.recentTerms = "";
}

if (sessionStorage.useShare == undefined) {
	sessionStorage.useShare = false;
}


(function ($) {
	$.isNumber = (function (n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	});
	$.uniqueArray = (function (list) {
		var result = [];
		$.each(list, function(i, e) {
			if ($.inArray(e, result) == -1) result.push(e);
		});
		return result;
	});
	$.toReadableDate = (function (str) {
		var dt = new Date(str.substring(0, str.length - 6));
		return dt.toLocaleString();
	});
	$.toBoolean = (function (str) {
		switch(str.toLowerCase()) {
			case "true": case "yes": case "1": return true;
			case "false": case "no": case "0": case null: return false;
			default: return false;
	}});
	$.bytesToSize = (function (bytes) {
		var sizes = ['Bytes', 'KB', 'MB'];
		if (bytes == 0) return 'n/a';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	});
})(jQuery);


function showAlert(hdr, message, alerttype, continer, autoclose) {
	var txt = '<div id="alertdiv" class="alert ' +  alerttype + ' alert-dismissable"><button class="close" data-dismiss="alert" class="close" aria-hidden="true">&times;</button><h4>' + hdr + '</h4><p id="msgText">' + message + '</p></div>';
	if (continer == undefined || continer == '') {
		$('#msg').html('');
		$('#msg').append(txt);
	}
	else {
		$('#' + continer).html('');
		$('#' + continer).append(txt);
	}

	if (autoclose == undefined || autoclose == '') {
		setTimeout(function() { 
			$("#alertdiv").remove();
		}, 3000);
	}
	else {
		if (autoclose != "0") {
			setTimeout(function() { 
				$("#alertdiv").remove();
			}, 3000);
		}
	}
}


function extractNodeRef(noderef) {
	var ar = noderef.split("/");
	return ar[ar.length-1];
}

String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
}

function joinAll(arr, pre, post) {
	var str = "";
	for (a in arr) {
		str += pre + arr[a] + post;
	}
    return str;
}

$(document).ready(function () {
	$('#footer').html(' \
		<div class="container"> \
			<div class="text-muted pull-left"><a href="https://github.com/SnigBhaumik/Bootfresco" target="_blank">Bootfresco</a> - the Alfresco&reg; Bootstrap&reg; Client.</div> \
			<div class="text-muted pull-right">&copy; <a href="http://about.me/snig" target="_blank">Snig Bhaumik</a> 2014</div> \
		</div> \
	');
});

function initialize() {
	abandonConnection($.url().param("m"));
	$("#userName").keypress(function(event) {
		if (event.which == 13) {
			loginToServer();
		}
	});
	$("#password").keypress(function(event) {
		if (event.which == 13) {
			loginToServer();
		}
	});
	$('#loginbutton').bind('click', function(){
		loginToServer();
	});
	$('.close').click(function () {
		$('#msg').addClass('fade');
	});
	setAppUrl();
	$('.checkbox').attr('data-content', ' \
		The Following Share Services will be disabled in Bootfresco. \
		<ol><li>Create Site</li><li>Delete Site</li><li>Edit Task page invocation</li></ol> \
		<br/> \
		Detected Share application Url is \
		<pre>' + sessionStorage.shareurl + '</pre> \
		<p class="lead text-danger">Share Services will not work if this Url is not correct.</p> \
		');
	$('.checkbox').popover();
}

function setAppUrl() {
	var url = $.url();
	var port = '';
	if (url.attr('port')) {
		port = ':' + url.attr('port');
	}
	var aurl = url.attr('protocol') + '://' + url.attr('host') + port;
	$('#serverUrl').val(aurl + '/alfresco');
	sessionStorage.shareurl = aurl + '/share';
}

function checkUser() {
	setAuthenticationTicket();
	if (sessionStorage.ticket == undefined) {
		window.location = "index.html?m=S";
		return;
	}
}

function setAuthenticationTicket() {
	var encode = window.btoa || Base64.encode;
	$.ajaxSetup({
		beforeSend: function (jqXHR, settings) {
			var auth = "Basic " + encode('ROLE_TICKET:' + sessionStorage.ticket);
			jqXHR.setRequestHeader("Authorization", auth);
		},

		statusCode: {
			401: function() {
				window.location = "index.html?m=S";
			},
			403: function() {
				window.location = "index.html?m=S";
			}
		}
	});
}

function abandonConnection(mode) {
	sessionStorage.ticket = null;
	sessionStorage.user = null;
	$.ajaxSetup({
		beforeSend: null
	});

	switch (mode)
	{
		case 'E':
			var resinfo = "";
			resinfo = "<br/><strong>Unable to connect to the specified Respository.</strong>";
			resinfo += "<br/><strong>Here are some of the things you can check.</strong>";
			resinfo += "<ul style='list-style-type: square;'><li>The server url is correct.</li>";
			resinfo += "<li>The user credential is correct.</li>";
			resinfo += "<li>Your Alfresco server is up and running.</li></ul>";
			$('#msg').removeClass('fade');
			break;
		
		case 'S':
			var resinfo = "";
			resinfo = "<br/><strong>Your Session is expired.</strong>";
			resinfo += "<br/><strong>Please Connect again.</strong><br/>&nbsp;";
			$("#resinfo").css("color", "#F90925");
			$("#resinfo").html(resinfo);
			$("#resinfo").css("display", "block");
			$("#getmein").css("display", "none");
			break;

		default:
			$("#resinfo").html("");
			$("#resinfo").css("display", "none");
			$("#getmein").css("display", "none");
			break;
	}
}

function loadStyle() {
	if (sessionStorage.css == '' || sessionStorage.css == undefined) {
		return;
	}
	var url = $.url(sessionStorage.css);
	var href = "";

	if (url.data.attr.file == "") {
		href = "css/theme-" + sessionStorage.css + ".css";
		$('#themes').val(sessionStorage.css);
		$('#onlinetheme').val();
	}
	else {
		href = sessionStorage.css;
		$('#onlinetheme').val(sessionStorage.css);
	}
	var cssLink = "<link rel='stylesheet' title='customTheme' type='text/css' href='" + href + "'>";

	$('link[title="customTheme"]').remove();
    $("head").append(cssLink); 
}

function applyStyle() {
	if ($.trim($('#onlinetheme').val()) == "") {
		sessionStorage.css = $('#themes').val();
	}
	else {
		sessionStorage.css = $.trim($('#onlinetheme').val());
	}
	$('#themeDialog').modal('hide');
	loadStyle();
}

function removeFromQueue(id) {
	uploader.removeFile(id);
}

function clearQueue() {
	uploader.splice();
	uploader.disableBrowse(false);
}


