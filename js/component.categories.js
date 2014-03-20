
function category() {};

category.prototype = {
	name: '',
	nodeRef: '',
	path: '',
	parent: '',
	
	toString: function() {
		return this.name + "," + this.nodeRef + "," + this.path + "," + this.parent;
	},

	toJSON: function() {
		return JSON.stringify({name:this.name, nodeRef:this.nodeRef, path:this.path, parent:this.parent}); 
	},
	
	fromJSON: function(str) {
		var o = JSON.parse(str);
		this.name = o.name;
		this.nodeRef = o.nodeRef;
		this.path = o.path;
		this.parent = o.parent;
	}
};

(function ($) {

$.fn.categories = function (config) {
	config = $.extend ({}, $.fn.categories.defaults, config);
	var e = this, selector = $(this).selector;

	var component = { 
		init: function() {
			$(e).html(config.content);
		}
	};
	
	component.init();
	$.fn.categories.methods.populate();
	return this;
};

$.fn.categories.defaults = {
	content: ' \
			<div class="panel-heading"><span class="glyphicon glyphicon-tags"></span>&nbsp;&nbsp;Categories</div> \
			<div class="panel-body"> \
				<div class="list-group" id="catList"></div> \
			</div> \
		',
	filesDOMControl: 'catFiles'

};

$.fn.categories.methods = {

	populate: function(cpath, nm, nd) {
		$("#catList").html('');
		var cp = "", url = "";
		var currC = new category();

		if (cpath == undefined)
			cpath = "Root";
		
		if (cpath == "Root")
		{
			url = sessionStorage.alfurl + URL_GET_CATS;
			currC.name = "Root";
			currC.path = "Root";

			$('#btnEditCat').addClass("disabled");
			$('#btnDeleteCat').addClass("disabled");
		}
		else
		{
			cp = cpath.split("/").slice(1).join("/");
			url = sessionStorage.alfurl + URL_GET_CATS + "/" + cp;
			currC.name = nm;
			currC.path = cpath;

			$('#btnEditCat').removeClass("disabled");
			$('#btnDeleteCat').removeClass("disabled");
		}
		currC.nodeRef = nd;
		sessionStorage.currCategory = currC.toJSON();
		$('#catNewName').val(nm);

		$.getJSON(url, function(data) {
			if (data.items.length <= 0) {
				$.fn.categories.methods.createNoCatsRow();
			}
			else {
				for (var p in data.items) {
					var cat = data.items[p];
					$.fn.categories.methods.createCatRow(cpath, cat.name, cat.nodeRef);
				}
			}
			$.fn.categories.methods.buildBreadcrumb(cpath, nm, nd);
			$.fn.categories.methods.showFiles(cp, nm, nd);
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
