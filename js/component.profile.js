
function profile() {};

profile.prototype = {
	userName: '',
	firstName: '',
	lastName: '',
	enabled: '',
	job: '',
	org: '',
	location: '',
	tele: '',
	mobile: '',
	email: '',
	caddr: '',
	cpost: '',
	ctele: '',
	cfax: '',
	cemail: '',
	skype: '',
	imsg: '',
	ustat: '',
	google: '',
	quota: '',
	size: '',
	desc: '',
	admin: '',
	
	toString: function() {
		return this.name + "," + this.nodeRef + "," + this.path + "," + this.parent;
	},

	toJSON: function() {
		return JSON.stringify({name:this.name, nodeRef:this.nodeRef, path:this.path, parent:this.parent}); 
	},
	
	fromJSON: function(data) {
		this.userName = data.userName;
		this.firstName = data.firstName;
		this.lastName = data.lastName;
		this.enabled = data.enabled;
		this.job = data.jobtitle ? data.jobtitle : "<i>Not Set</i>";
		this.org = data.organization ? data.organization : "<i>Not Set</i>";
		this.location = data.location ? data.location : "<i>Not Set</i>";
		this.tele = data.telephone ? data.telephone : "<i>Not Set</i>";
		this.mobile = data.mobile ? data.mobile : "<i>Not Set</i>";
		this.email = data.email;
		var caddr = (data.companyaddress1 ? data.companyaddress1 : "") + (data.companyaddress2 ? data.companyaddress2 : "") + (data.companyaddress3 ? data.companyaddress3 : "");
		this.caddr = caddr == "" ? "<i>Not Set</i>" : caddr;
		this.cpost = data.companypostcode ? data.companypostcode : "<i>Not Set</i>";
		this.ctele = data.companytelephone ? data.companytelephone : "<i>Not Set</i>";
		this.cfax = data.companyfax ? data.companyfax : "<i>Not Set</i>";
		this.cemail = data.companyemail ? data.companyemail : "<i>Not Set</i>";
		this.skype = data.skype;
		this.imsg = data.instantmsg ? data.instantmsg : "<i>Not Set</i>";
		this.ustat = data.userStatus;
		this.google = data.googleusername ? data.googleusername : "<i>Not Set</i>";
		this.quota = data.quota;
		this.size = data.sizeCurrent;
		this.desc = data.persondescription ? data.persondescription : "<i>Not Set</i>";
		this.admin = data.capabilities.isAdmin;
	}
};

(function ($) {

$.fn.profile = function (config) {
	config = $.extend ({}, $.fn.profile.defaults, config);
	var e = this, selector = $(this).selector;

	var component = { 
		init: function() {
			$(e).html(config.content);
		}
	};
	
	component.init();
	$.fn.profile.methods.populate();
	return this;
};

$.fn.profile.defaults = {
	content: ' \
			<div class="col-xs-4 col-sm-4 col-md-4"> \
				<div class="panel panel-primary"> \
					<div class="panel-heading">General</div> \
					<div class="panel-body" id="genInfo"></div> \
				</div> \
			</div> \
			<div class="col-xs-4 col-sm-4 col-md-4"> \
				<div class="panel panel-success"> \
					<div class="panel-heading">Company</div> \
					<div class="panel-body" id="comInfo"></div> \
				</div> \
			</div> \
			<div class="col-xs-4 col-sm-4 col-md-4"> \
				<div class="panel panel-info"> \
					<div class="panel-heading">Others</div> \
					<div class="panel-body" id="othInfo"></div> \
				</div> \
			</div> \
		'
};

$.fn.profile.methods = {

	populate: function() {
		var txt = "";

		$.getJSON(sessionStorage.alfurl + URL_GETUSER + sessionStorage.user, function(data) {
			var usr = new profile();
			usr.fromJSON(data);

			txt = "";
			txt += "<div class='media'><img class='media-object pull-left' src='" + sessionStorage.alfurl + URL_GETUSER_AVATAR + sessionStorage.user + "'>";
			txt += "<div class='media-body'>";
			txt += "<h3 class='media-heading' style='text-transform: capitalize'>" + usr.firstName + " " + usr.lastName + "</h3>";
			txt += "<p><a href='mailto:" + usr.email + "'>" + usr.email + "</a></p>";
			txt += "<p>Location: " + usr.location + "</p>";
			txt += "<p>Telephone: " + usr.tele + "</p>";
			txt += "<p>Mobile: " + usr.mobile + "</p>";
			txt += usr.skype ? "<p>Skype: <a href='skype:" + usr.skype + "?call'>" + usr.skype + "</a></p>" : "<p>Skype: <i>Not Set</i></p>";
			txt += "<p>Instant Messanger: " + usr.imsg + "</p>";
			txt += "<p>Google user Name: " + usr.google + "</p>";
			txt += "</div></div>";
			$('#genInfo').html(txt);

			txt = "";
			txt += "<p>Organization: " + usr.org + "</p>";
			txt += "<p>Job Title: " + usr.job + "</p>";
			txt += "<p>Address: " + usr.caddr + "</p>";
			txt += "<p>Postcode: " + usr.cpost + "</p>";
			txt += "<p>Telephone: " + usr.ctele + "</p>";
			txt += "<p>Fax: " + usr.caddr + "</p>";
			txt += "<p>Email: " + usr.cemail + "</p>";
			$('#comInfo').html(txt);

			txt = "";
			txt += "<p>Storage Quota: " + usr.quota + "</p>";
			txt += "<p>Current Consumption: " + usr.size + "</p>";
			txt += usr.enabled ? "<p>User Enabled</p>" : "<p>User Disabled</p>";
			txt += usr.admin ? "<p>User is Administrator</p>" : "<p>User is not an Administrator</p>";
			$('#othInfo').html(txt);
		})
	},

	createCatRow: function(pnm, nm, nd) {
		if (pnm == undefined)
			var cpath = nm;
		else
			var cpath = pnm + "/" + nm;
		txt = "<a class='list-group-item' href='javascript:void(0)' onclick='$.fn.categories.methods.populate(\"" + cpath + "\", \"" + nm + "\", \"" + nd + "\")'>" + nm + "</a>";
		$('#catList').append(txt);
	},

	createNoCatsRow: function() {
		$('#catList').append("<li class='list-group-item'>No further sub-categories found.</li>");
	},

	buildBreadcrumb: function(cpath, nm, nd) {
		var brd = cpath.split("/");
		var brdpath = new Array();
		for (var c=0; c<brd.length; c++) {
			var p = c == 0 ? 1 : c+1;
			var cp = brd.slice(0, p).join("/");
			var tt = "<a href='javascript:void(0)' onclick='$.fn.categories.methods.populate(\"" + cp + "\", \"" + nm + "\", \"" + nd + "\")'><span class='glyphicon glyphicon-tag'></span>&nbsp;&nbsp;" + brd[c] + "</a>";
			brdpath.push(tt);
		}
		$(".breadcrumb").html(joinAll(brdpath, "<li>", "</li>"));
	},

	manageCategory: function(currC, mode) {
		var o = new category();
		o.fromJSON(currC);

		if (o.name == "Root")
			var url = sessionStorage.alfurl + URL_MANAGE_CATS;
		else
			var url = sessionStorage.alfurl + URL_MANAGE_CATS + '/workspace/SpacesStore/' + extractNodeRef(o.nodeRef);

		var req = "", data = "", dlg = "";
		switch (mode)
		{
			case "C":
				req = "POST";
				data = JSON.stringify({name:$('#catName').val()});
				dlg = "createCategoryDialog";
				break;
			case "E":
				req = "PUT";
				data = JSON.stringify({name:$('#catNewName').val()});
				dlg = "editCategoryDialog";
				break;
			case "D":
				req = "DELETE";
				data = "";
				break;
			default:
				req = "";
				data = "";
				break;
		}

		$.ajax({
			url: url,
			data: data,
			contentType: 'application/json; charset=UTF-8',
			type: req,
			dataType: 'json',
			processData: false,

			success: function(data) {
				$.fn.categories.methods.populate(o.path, o.name, o.nodeRef);
				$('#' + dlg).modal('hide');
			},

			error: function(jqXHR, textStatus, errorThrown) {
				$('#msg').removeClass('fade');
			},

			statusCode: {
				403: function() {

				}
			}
		});
	},

	showFiles: function(cpath, nm, nd) {
		$('#fileList').html('');
		var txt = "";
		$.getJSON(sessionStorage.alfurl + URL_SEARCH_BY_CAT + cpath, function(data) {
			var d=data;
			if (data.totalRecords <= 0) {
				txt += "<tr><td>No files found in this Category.</td></tr>";
			}
			else {
				for (d in data.items) {
					var item = data.items[d];

				txt = "<tr><td><span class='glyphicon glyphicon-file'></span>&nbsp;<a onclick='setHistory(\"R\")' href='doc.html?docid=" + item.node.nodeRef + "&docname=" + item.node.properties["cm:name"] + "'>" + item.node.properties["cm:name"] + " (" + item.node.properties["cm:title"] + ")</a>";
				txt += "<br/>At <a href='browser.html?docroot=" + item.parent.nodeRef + "'>" + item.parent.properties["cm:name"] + "</a>";
				txt += "<br/>" + $.bytesToSize(item.node.size) + ".";
				txt += "<br/>Last modified by " + item.node.properties["cm:modifier"].displayName + " on " + item.node.properties["cm:modified"].value;
				txt += "</td></tr>";

					/*txt += "<tr><td>";
					txt += "<a href='doc.html?docid=" + item.node.nodeRef + "&docname=" + item.node.properties["cm:name"] + "'><span class='glyphicon glyphicon-file'></span>&nbsp;" + item.node.properties["cm:name"] + "</a> at <a href='browser.html?docroot=" + item.parent.nodeRef + "'>" + item.parent.properties["cm:name"] + "</a></td></tr>";
					txt += "<tr><td><a href='doc.html?docid=" + item.node.nodeRef + "&docname=" + item.node.properties["cm:name"] + "'><span class='glyphicon glyphicon-file'></span>&nbsp;" + item.node.properties["cm:name"] + "</a> at <a href='browser.html?docroot=" + item.parent.nodeRef + "'>" + item.parent.properties["cm:name"] + "</a></td></tr>";*/
				}
			}
			$('#fileList').html(txt);
		});

		/*$.getJSON ({
			url: sessionStorage.shareurl + URL_SHARE_SEARCH_BY_CAT + cpath,
			success : function (data) {
				if (feed.items.length <= 0) {
					txt += "<tr><td>No files found in this Category.</td></tr>";
				}
				else {
					for (var i = 0; i < feed.items.length; i++) {
						var item = feed.items[i];
						txt += "<tr><td><a href='javascript:void(0)'><span class='glyphicon glyphicon-file'></span>&nbsp;" + item.title + "</a></td></tr>";
					}
				}

				$('#fileList').html(txt);
				var d=data;
			}})*/
	}
};

} (jQuery));
