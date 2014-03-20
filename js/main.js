
function loginToServer() {
	sessionStorage.alfurl = $('#serverUrl').val();
	sessionStorage.useShare = $('#enableShare').is(':checked');
	$.ajax({
		url: sessionStorage.alfurl + URL_LOGIN,
		data: JSON.stringify({username:$('#userName').val(), password:$('#password').val()}),
		contentType: 'application/json; charset=UTF-8',
		type: 'POST',
		dataType: 'json',
		processData: false,

		success: function(data) {
			sessionStorage.ticket = data.data.ticket;
			sessionStorage.user = $('#userName').val();
			setAuthenticationTicket();
			if ($.toBoolean(sessionStorage.useShare)) {
				showAlert("Please wait, logging in...", "Alfresco login successful.<br/>Now logging in into Share...", "alert-info", "msg", "0");
				loginToShare();
			}
			else
				window.location = DEF_LANDING_PAGE;
		},

		error: function(jqXHR, textStatus, errorThrown) {
			showAlert("Sorry!", "Unable to Sign In to Alfresco using given credentials.", "alert-danger", "msg");
		},

		statusCode: {
			403: function() {
				abandonConnection('E');
			}
		}
	});
}

function loginToShare() {
	$.ajax({
		url: sessionStorage.shareurl + URL_SHARE_LOGIN,
		data: 'username=' + $('#userName').val() + '&password=' + $('#password').val(),
		contentType: 'application/x-www-form-urlencoded',
		type: 'POST',
		dataType: 'text',
		processData: false,

		success: function(data, textStatus, jqXHR) {
			var d = data;
			window.location = DEF_LANDING_PAGE;
		},

		error: function(jqXHR, textStatus, errorThrown) {
			//$('#msg').removeClass('fade');
		},

		statusCode: {
			403: function() {
				abandonConnection('E');
			}
		}
	});
}


function showRootFolders() {
	var docroot = $.url().param("docroot");
	if (docroot && docroot != "") {
		if (docroot != "root") {
			showContent(docroot);
			return;
		}
	}

	$.getJSON(sessionStorage.alfurl + URL_GETROOT, function(data) {
		showContent(data.data.nodeRef);
	});
	
}

function showContent(objid) {
	showFolders(objid);
	showFiles(objid);
}

function showFolders(objid) {
	$.getFeed ({
		url: sessionStorage.alfurl + '/service/cmis/i/' + extractNodeRef(objid) + '/children?type=cmis:folder',
		success : function (feed) {
			var folders = "", foldercount = 0;
			for (var i = 0; i < feed.items.length; i++)
			{
				var item = feed.items[i];
				if (item.cmisobject.baseTypeId == "cmis:folder") {
					folders += "<tr><td><a href='javascript:void(0)' onclick='showContent(\"" + item.cmisobject.objectId + "\")'><span class='glyphicon glyphicon-folder-open'></span>&nbsp;&nbsp;" + item.cmisobject.name + "</a></td></tr>";
					foldercount++;
				}
				else {
				}
			}
			if (foldercount > 0) {
				$("#folderlist").html(folders);
			}
			else {
				$("#folderlist").html("<tr><td>No sub-folders are there.<br/><br/>Use the Breadcrumb to navigate to the parent folders.</td></tr>");
			}

			brdpath = new Array();
			showBreadcrumb(objid);
			applyFolderAllowableActions(objid);
			sessionStorage.currfolder = objid;
		}})
}

function showFiles(objid) {
	$.getFeed ({
		url: sessionStorage.alfurl + '/service/cmis/i/' + extractNodeRef(objid) + '/children?type=cmis:document&maxItems=' + sessionStorage.pageSize + '&skipCount=0',
		success : function (feed) {
			var files = "", filecount = 0;
			var filelist = new Array();
			for (var i = 0; i < feed.items.length; i++)
			{
				var item = feed.items[i];
				if (item.cmisobject.baseTypeId == "cmis:folder") {
				}
				else {
					filelist.push(item.cmisobject.objectId);
					filecount++;
				}
			}
			if (filecount > 0) {
				buildDocTable(filelist);
			}
			else {
				$("#docslist").html("<tr><td>No files are there in this folder.</td></tr>");
			}
		}})
}

function applyFolderAllowableActions(objid) {
	$.getFeed ({
		url: sessionStorage.alfurl + URL_NODE + extractNodeRef(objid) + '?includeAllowableActions=true',
		success : function (feed) {
			var item = feed.item;
			var cobj = item.cmisobject;

			var finfo = "";
			finfo += "<b>Name:</b> " + cobj.name + "<br/>";
			finfo += "<b>Title:</b> " + item.title + "<br/>";
			finfo += "<b>Description:</b> " + item.description + "</br/>";
			finfo += "<b>Created by</b> " + cobj.createdBy + " on " + $.toReadableDate(cobj.creationDate) + "<br/>";
			finfo += "<b>Last Updated by</b> " + cobj.lastModifiedBy + " on " + $.toReadableDate(cobj.lastModificationDate) + "<br/>";
			finfo += "<b>Repository Node Ref:</b> " + cobj.objectId + "<br/>";
			finfo += "<b>Folder Path:</b> " + cobj.path + "<br/><hr/>";

			finfo += "You " + (cobj.canCreateFolder ? "can" : "cannot") + " create sub-folders.<br/>";
			finfo += "You " + (cobj.canCreateDocument ? "can" : "cannot") + " create documents here.<br/>";
			finfo += "You " + (cobj.canUpdateProperties ? "can" : "cannot") + " update properties of this folder.<br/>";
			finfo += "You " + (cobj.canMoveObject ? "can" : "cannot") + " move this folder.<br/>";
			finfo += "You " + (cobj.canDeleteObject ? "can" : "cannot") + " delete this folder.<br/><hr/>";

			finfo += "<b>Tags:</b> <br/>";
			finfo += "<b>Categories:</b> <br/>";

			$('.finfo').html(finfo);
			$('#fname').val(cobj.name);
			$('#ftitle').val(item.title);
			$('#fdesc').val(item.description);
			sessionStorage.parentFolder = cobj.parentId;

			if (cobj.canCreateFolder) {
				$("#createFolder").attr('data-target', '#createFolderDialog');
				$("#createFolderLI").removeClass("disabled");
				canCreateFolder = true;
			}
			else {
				$("#createFolder").removeAttr('data-target');
				$("#createFolderLI").addClass("disabled");
				canCreateFolder = false;
			}

			if (cobj.canCreateDocument) {	
				$(".newdocument").fadeTo('fast', 1).attr('href', '#newdocdialog');
				$(".newtxtdoc").fadeTo('fast', 1).attr('href', '#newtextdialog');
				$(".newhtmldoc").fadeTo('fast', 1).attr('href', '#newhtmldialog');
				canCreateDocument = true;
			}
			else {
				$(".newdocument").fadeTo('fast', 0.3).removeAttr('href');
				$(".newtxtdoc").fadeTo('fast', 0.3).removeAttr('href');
				$(".newhtmldoc").fadeTo('fast', 0.3).removeAttr('href');
				canCreateDocument = false;
			}

			if (cobj.canUpdateProperties) {
				$("#editFolderLI").addClass("disabled");
				$("#editFolder").click (function() {
					$('#editFolder').css('display', $('.folderproperties').css('display') == "none" ? "block" : "none");
					$('#fname').focus();
				});
			}
			else {
				$("#editFolderLI").addClass("disabled");
				$("#editFolder").click (function() {
					return false;
				});
			}

			if (cobj.canDeleteObject) {
				$("#deleteFolderLI").removeClass("disabled");
				$("#deleteFolder").click (function() {
					deleteObject(sessionStorage.currfolder, "F");
				});
			}
			else {
				$("#deleteFolderLI").addClass("disabled");
				$("#deleteFolder").click (function() {
					return false;
				});
			}
		}})
}

function buildDocTable(filelist) {
	$("#docslist").empty();
	for (var f in filelist) {
		$.getFeed ({
			url: sessionStorage.alfurl + '/service/cmis/i/' + extractNodeRef(filelist[f]),
			success : function (feed) {
				var item = feed.item;
				
				var tt = "<tr><td align='center'><img class='folder-icon-big' src='" + item.icon + "' /></td>";
				tt += "<td><a onclick='setHistory(\"R\")' href='doc.html?docid=" + item.cmisobject.objectId + "&docname=" + item.cmisobject.name + "'>" + item.cmisobject.name + " (" + item.title + ")</a>";
				tt += "<br/>" + $.bytesToSize(item.cmisobject.contentStreamLength) + ".";
				tt += "<br/>Last modified by " + item.cmisobject.lastModifiedBy + " on " + $.toReadableDate(item.cmisobject.lastModificationDate);
				if (item.cmisobject.path != "")		tt += "<br/>Location " + item.cmisobject.path + ".";
				tt += "</td></tr>";

				$("#docslist").append(tt);
		}})}
}

function showBreadcrumb(objid) {
	$.getFeed ({
		url: sessionStorage.alfurl + '/service/cmis/i/' + extractNodeRef(objid),
		success : function (feed) {
			var item = feed.item;
			var tt = "<a href='javascript:void(0)' onclick='showContent(\"" + objid + "\")'><span class='glyphicon glyphicon-folder-open'></span>&nbsp;&nbsp;" + feed.item.cmisobject.name + "</a>";
			brdpath.push(tt);

			if (feed.item.cmisobject.parentId)
			{
				showBreadcrumb(feed.item.cmisobject.parentId);
			}
			else
			{
				brdpath.reverse();
				$(".breadcrumb").html(joinAll(brdpath, "<li>", "</li>"));
			}
			return tt;
		}})
}


function createFolder(objid) {
	$.ajax({
		url: sessionStorage.alfurl + URL_CREATEFOLDER + extractNodeRef(objid),
		data: JSON.stringify({name:$('#folderName').val(), title:$('#folderName').val(), description:$('#folderDesc').val()}),
		contentType: 'application/json; charset=UTF-8',
		type: 'POST',
		dataType: 'json',
		processData: false,

		success: function(data) {
			showFolders(objid);
			$('#createFolderDialog').modal('hide');
		},

		error: function(jqXHR, textStatus, errorThrown) {
			// alert(errorThrown);
			$('#createFolderDialog').modal('hide');
			showAlert('Sorry!', 'Unable to Create Folder', 'alert-danger');
		},

		statusCode: {
			403: function() {
				showAlert('Sorry!', 'Unable to Create Folder', 'alert-danger');
			}
		}
	});
	$('#formCreateFolder')[0].reset();
}

function deleteObject(objid, typ) {
	var surl = "";
	if (typ == "F") {		// Means, it is a folder being Deleted.
		if (confirm("Are you sure to delete this folder?\nAll the sub-folders and subsequent contents will be deleted.\nThis action is not reversible!!!"))
			surl = sessionStorage.alfurl + URL_NODE + extractNodeRef(objid);
		else
			return;
	}
	else {					// Means, it is a document being Deleted.
		var did = $.url().param("docid");
		if (confirm("Are you sure to delete this document?\nThis action is not reversible!!!"))
			surl = sessionStorage.alfurl + '/service/cmis/i/' + extractNodeRef(did);
		else
			return;
	}

	$.ajax({
		url: surl,
		contentType: 'application/atom+xml;type=entry',
		type: 'DELETE',
		dataType: 'xml',
		processData: false,

		success: function(data) {
			if (typ == "F") {		// Means, it is a folder being Deleted.
				showFolders(sessionStorage.parentFolder);
			}
			else {					// Means, it is a document being Deleted.
				window.location = $("#goback").attr("href");
			}
		},

		error: function(jqXHR, textStatus, errorThrown) {
			alert(errorThrown);
		}
	});	
}

function editProfile() {
	$('.tab-content').addClass('hidden');
	$('#tabs').addClass('hidden');
	$('.jumbotron').removeClass('hidden');
}

function saveProfile() {
	$('.tab-content').removeClass('hidden');
	$('#tabs').removeClass('hidden');
	$('.jumbotron').addClass('hidden');
}

