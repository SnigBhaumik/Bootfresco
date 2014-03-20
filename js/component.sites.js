
		// {"role":"SiteConsumer","person":{"userName":"snig"}}

function membership() {};
function user() {};

user.prototype = {
	userName: ''
};

membership.prototype = {
	role: '',
	person: new user(),
	
	toString: function() {
		return this.person.userName + "," + this.role;
	}
};


(function ($) {

$.fn.mySites = function (config) {
	config = $.extend ({}, $.fn.mySites.defaults, config);
	var e = this, selector = $(this).selector;

	var component = { 
		init: function() {
			$(e).html(config.content);
			if ($.toBoolean(sessionStorage.useShare)) {
				$("#createSiteButton").attr('data-target', '#createSiteDialog');
				$("#createSiteButton").removeClass("disabled");
			}
			else {
				$("#createSiteButton").removeAttr('data-target');
				$("#createSiteButton").addClass("disabled");
			}
			$('#btnCreateSite').on("click", function () {
				$.fn.allSites.methods.createSite("M");
			});
		}
	};
	
	component.init();
	$.fn.mySites.methods.populate();
	return this;
};

$.fn.mySites.defaults = {
	content: ' \
		<div class="panel-heading"><span class="glyphicon glyphicon-globe"></span>&nbsp;My Sites \
			<div class="pull-right"><button id="createSiteButton" class="btn btn-success btn-xs" type="button" data-keyboard="false" data-backdrop="static" data-toggle="modal"><span class="glyphicon glyphicon-plus-sign"></span>&nbsp;Create Site</button></div> \
		</div> \
		<div class="table-responsive"><table class="table table-striped table-hover"><tbody id="mySites"></tbody></table></div> \
		'
};

$.fn.mySites.methods = {
	populate: function() {
		$.getJSON(sessionStorage.alfurl + URL_GETUSER + sessionStorage.user + '/sites', function(data) {
			$("#mySites").html('');

			if (data.length <= 0) {
				$("#mySites").html('<tr><td>No Sites found!</td></tr>');
			}
			else {
				for (var p in data) {
					var st = data[p];
					$("#mySites").append($.fn.mySites.methods.createSiteRow(st));
					$.fn.mySites.methods.getSiteMembers(st.shortName);
				}
			}
		})
	},

	getSiteMembers: function(sitename) {
		$.getJSON(sessionStorage.alfurl + URL_SITES + "/" + sitename + '/memberships', function(data) {
			$("#nomember" + sitename).html(data.length + " Member(s).");
			var m = "<div style='white-space: nowrap'>";
			for (i in data) {
				m += data[i].authority.firstName + " " + data[i].authority.lastName + " (" + data[i].role + ")<br />";
			}
			m += "</div>";
			$("#nomember" + sitename).attr('data-content', m);
			$("#nomember" + sitename).popover();
		});
	},

	createSiteRow: function(st) {
		var txt = "";
		txt = "<tr><td><a href='browser.html?docroot=" + st.node + "'><h5><span class='glyphicon glyphicon-briefcase'></span>&nbsp;" + st.title + "</h5></a>";
		txt += "<div style='margin-top: -5px'>" + st.visibility + " Site.";
		txt += "<br/><div id='nomember" + st.shortName + "' data-container='body' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='right'></div></div></td></tr>";
		return txt;
	},

};


$.fn.allSites = function (config) {
	config = $.extend ({}, $.fn.allSites.defaults, config);
	var e = this, selector = $(this).selector;

	var component = { 
		init: function() {
			$(e).html(config.content);
			if (config.isFullPage) {
				$("#createSiteBtn").removeClass("hidden");
				$('#btnCreateSite').on("click", function () {
					$.fn.allSites.methods.createSite("A");
				});
			}
			else {
				$("#createSiteBtn").addClass("hidden");
			}
			if ($.toBoolean(sessionStorage.useShare)) {
				$("#createSiteBtn").attr('data-target', '#createSiteDialog');
				$("#createSiteBtn").removeClass("disabled");
			}
			else {
				$("#createSiteBtn").removeAttr('data-target');
				$("#createSiteBtn").addClass("disabled");
			}
			$("#txtSearchSite").keypress(function(event) {
				if (event.which == 13) {
					$.fn.allSites.methods.searchSites();
				}
			});
		}
	};
	
	component.init();
	$.fn.allSites.methods.getFavouriteSites();
	return this;
};

$.fn.allSites.defaults = {
	content: ' \
		<div class="panel-heading"><span class="glyphicon glyphicon-globe"></span>&nbsp;All Sites \
			<div class="pull-right"><button id="createSiteBtn" class="btn btn-success btn-xs hidden" type="button" data-keyboard="false" data-backdrop="static" data-toggle="modal"><span class="glyphicon glyphicon-plus-sign"></span>&nbsp;Create Site</button></div> \
		</div> \
		<div class="panel-body"> \
		<div class="well"> \
			<div class="input-group"> \
				<input type="text" class="form-control" placeholder="Enter site name to search, leave blank to search all Sites" id="txtSearchSite" /> \
				<span class="input-group-addon glyphicon glyphicon-search"></span> \
			</div> \
		</div> \
		<div class="container-fluid" id="allSites"></div> \
		</div> \
		',
	isFullPage: true
};

$.fn.allSites.methods = {
	createSite: function(mode) {
		$.ajax({
			url: sessionStorage.shareurl + URL_SHARE_SITES,
			data: JSON.stringify({shortName:$('#urlName').val(), sitePreset:'site-dashboard', description:$('#desc').val(), visibility:$('#siteVisibility').val(), title:$('#siteName').val()}),
			contentType: 'application/json; charset=UTF-8',
			type: 'POST',
			dataType: 'json',
			processData: false,

			success: function(data) {
				$('#createSiteDialog').modal('hide');
				showAlert('Okay!', 'Site successfully created', 'alert-success');

				if (data == "A") {
					$.fn.allSites.methods.searchSites();
				}
				else if (data == "M") {
					$.fn.mySites.methods.populate();
				}
			},

			error: function(jqXHR, textStatus, errorThrown) {
				$('#createSiteDialog').modal('hide');
				showAlert('Sorry!', 'Unable to Create Site', 'alert-danger');
			},

			statusCode: {
				403: function() {
					$('#createSiteDialog').modal('hide');
					showAlert('Sorry!', 'Unable to Create Site', 'alert-danger');
				}
			}
		});
	},

	populate: function(sname) {
		var url = "";
		if (sname == undefined || sname == "") {
			url = sessionStorage.alfurl + URL_SITES;
		}
		else {
			url = sessionStorage.alfurl + URL_SITES + "?nf=" + sname;
		}
		$.getJSON(url, function(data) {
			$("#allSites").html('');

			if (data.length <= 0) {
				$("#allSites").html('No Sites found!');
			}
			else {
				$.fn.allSites.methods.createSiteGrid(data);
			}
		})
	},

	getSiteMembers: function(sitename, vis) {
		var isMember = false;
		$.getJSON(sessionStorage.alfurl + URL_SITES + "/" + sitename + '/memberships', function(data) {
			$("#members" + sitename).html(data.length + " Member(s).");
			var m = "<div style='white-space: nowrap'>";
			for (i in data) {
				m += data[i].authority.firstName + " " + data[i].authority.lastName + " (" + data[i].role + ")<br />";
				if (data[i].authority.userName == sessionStorage.user) {
					isMember = true;
				}
			}
			m += "</div>";
			$("#members" + sitename).attr('data-content', m);
			$("#members" + sitename).popover();

			var actions = "";

			if (isMember) {
				actions += "<button class='btn btn-warning btn-sm' type='button' onclick='$.fn.allSites.methods.removeMembership(\"" + sitename + "\", \"" + sessionStorage.user + "\")'><span class='glyphicon glyphicon-log-out'></span>&nbsp;Leave Site</button>";
			}
			else {
				switch (vis) {
					case "PUBLIC":
						actions += "<button class='btn btn-info btn-sm' type='button' onclick='$.fn.allSites.methods.addMembership(\"" + sitename + "\", \"" + sessionStorage.user + "\")'><span class='glyphicon glyphicon-log-in'></span>&nbsp;Join Site</button>";
						break;
					case "PRIVATE":
						break;
					case "MODERATED":
						actions += "<button class='btn btn-success btn-sm' type='button' onclick='$.fn.allSites.methods.requestMembership(\"" + sitename + "\", \"" + sessionStorage.user + "\")'><span class='glyphicon glyphicon-log-in'></span>&nbsp;Request to Join</button>";
						break;
				}
			}

			if ($.fn.allSites.methods.isSiteFavourite(sitename)) {
				actions += "<button class='btn btn-warning btn-sm' type='button' onclick='$.fn.allSites.methods.removeFab(\"" + sitename + "\", \"" + sessionStorage.user + "\")'><span class='glyphicon glyphicon-remove-sign'></span>&nbsp;Not my Favourite</button>";
			}
			else {
				actions += "<button class='btn btn-primary btn-sm' type='button' onclick='$.fn.allSites.methods.addFab(\"" + sitename + "\", \"" + sessionStorage.user + "\")'><span class='glyphicon glyphicon-plus-sign'></span>&nbsp;Mark Favourite</button>";
			}

			actions += "<button class='btn btn-danger btn-sm' type='button' onclick='$.fn.allSites.methods.deleteSite(\"" + sitename + "\")'><span class='glyphicon glyphicon-remove'></span>&nbsp;Delete Site</button>";

			$('#divActions' + sitename).html(actions);
		});
	},

	createSiteGrid: function(sites) {
		var cols = 3;
		var c = 0;
		var txt = "";
		for (var s in sites) {
			var st = sites[s];
			/////////////////if (st.visibility == "PRIVATE")		continue;	// TODO. Need to handle PRIVATE sites here.
			if (c == 0) txt += "<div class='row'>";
			txt += "<div class='col-xs-4 col-sm-4 col-md-4'>";
			txt += "<div class='well well-lg' style='min-height: 260px'><a href='browser.html?docroot=" + st.node + "'><h4><span class='glyphicon glyphicon-briefcase'></span>&nbsp;" + st.title + "</h4></a>";
			txt += "<p>" + st.visibility + " Site.";
			txt += "<p id='members" + st.shortName + "' data-container='body' data-toggle='popover' data-trigger='hover' data-html='true' data-placement='top'></p>";
			txt += "<p id='divActions" + st.shortName + "'></p></p></div></div>";
			if (c == cols-1) {
				txt += "</div>";
				c = 0;
			}
			else
				c++;
			$.fn.allSites.methods.getSiteMembers(st.shortName, st.visibility);
		}
		$("#allSites").html(txt);
	},

	searchSites: function() {
		$.fn.allSites.methods.populate($('#txtSearchSite').val());
	},

	getFavouriteSites: function() {
		favSites.splice(0, favSites.length);
		$.getJSON(sessionStorage.alfurl + URL_GETUSER + sessionStorage.user + '/preferences', function(data) {
			if (!data.org.alfresco.share.sites) {
				return;
			}
			if (!data.org.alfresco.share.sites.favourites) {
				return;
			}
			for (var f in data.org.alfresco.share.sites.favourites) {
				favSites.push(f);
			}
		});
	},

	isSiteFavourite: function(sname) {
		return favSites.indexOf(sname) >= 0;
	},

	addMembership: function(sname, usr) {
		var u = new user();
		u.userName = usr;
		var m = new membership();
		m.role = "SiteConsumer";
		m.person = u;

		// {"role":"SiteConsumer","person":{"userName":"snig"}}
		$.ajax({
			url: sessionStorage.alfurl + URL_SITES + "/" + sname + '/memberships',
			data: JSON.stringify(m),
			contentType: 'application/json; charset=UTF-8',
			type: 'POST',
			dataType: 'json',
			processData: false,

			success: function(data) {
				$('#divActions' + sname).html("<button class='btn btn-danger btn-xs' type='button' onclick='$.fn.allSites.methods.removeMembership(\"" + sname + "\", \"" + usr + "\")'><span class='glyphicon glyphicon-log-out'></span>&nbsp;Leave</button>");
				$('#mySiteList').mySites({
				});
				showAlert('Ok!', usr + ' is now a member of site ' + sname, 'alert-success');
			},

			error: function(jqXHR, textStatus, errorThrown) {
				showAlert('Sorry!', 'Unable to set Membership.', 'alert-danger');
			},

			statusCode: {
				403: function() {
					showAlert('Sorry!', 'Unable to set Membership.', 'alert-danger');
				}
			}
		});
	},

	requestMembership: function(sname, usr) {
		alert("TODO");
	},

	removeMembership: function(sname, usr) {
		if (!confirm("Sure to remove membership of user " + usr + " from the Site " + sname + "?")) {
			return;
		}
		$.ajax({
			url: sessionStorage.alfurl + URL_SITES + "/" + sname + '/memberships/' + usr,
			contentType: 'application/json; charset=UTF-8',
			type: 'DELETE',
			dataType: 'json',
			processData: false,

			success: function(data) {
				////$('#divActions' + sname).html("<button class='btn btn-warning btn-xs' type='button' onclick='$.fn.allSites.methods.addMembership(\"" + sname + "\", \"" + usr + "\")'><span class='glyphicon glyphicon-log-in'></span>&nbsp;Join</button>");
				$('#mySiteList').mySites({
				});
				showAlert('Ok!', usr + ' membership is cancelled from site ' + sname, 'alert-success');
			},

			error: function(jqXHR, textStatus, errorThrown) {
				showAlert('Sorry!', 'Unable to remove Membership.', 'alert-danger');
			},

			statusCode: {
				403: function() {
					showAlert('Sorry!', 'Unable to remove Membership.', 'alert-danger');
				},
				500: function() {
					showAlert('Sorry!', 'Unable to remove Membership.', 'alert-danger');
				}
			}
		});
	},

	removeFab: function(sname, usr) {
	},

	addFab: function(sname, usr) {
	},

	deleteSite: function(sname) {
		if (!confirm("Sure to the Site " + sname + "?\nThis action is not reversible.\nAll the contents and documents of this Site will be permanently deleted from the repository.")) {
			return;
		}
		$.ajax({
			url: sessionStorage.alfurl + URL_SITES + "/" + sname,
			contentType: 'application/json; charset=UTF-8',
			type: 'DELETE',
			dataType: 'json',
			processData: false,

			success: function(data) {
				$('#mySiteList').mySites({});
				$.fn.allSites.methods.searchSites();
				showAlert('Ok!', 'The Site has been deleted.', 'alert-success');
			},

			error: function(jqXHR, textStatus, errorThrown) {
				showAlert('Sorry!', 'Unable to delete the Site.', 'alert-danger');
			},

			statusCode: {
				403: function() {
					showAlert('Sorry!', 'Unable to delete the Site.', 'alert-danger');
				},
				500: function() {
					showAlert('Sorry!', 'Unable to remove Membership.', 'alert-danger');
				}
			}
		});
	}
};

} (jQuery));



