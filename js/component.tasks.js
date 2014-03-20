
(function ($) {

$.fn.taskList = function (config) {
	config = $.extend ({}, $.fn.taskList.defaults, config);
	var e = this, selector = $(this).selector;

	var component = { 
		init: function() {
			$(e).html(config.content);
		},

		populate: function() {
			$.getJSON(sessionStorage.alfurl + URL_GETTASKS, function(data) {
				$("#taskList").html('');

				for (var p in data.tasks) {
					var tk = data.tasks[p];
					$("#taskList").append(component.createTaskPanel(tk, p));
				}
			})
		},

		createTaskPanel: function(tk, p) {
			var t = tk.description != "" ? tk.description : tk.type;
			var dt = new Date(tk.dueDate.substring(0, 10));
			var txt = "";
			txt += "<div class='panel panel-primary'><div class='panel-heading'><h4 class='panel-title'><a data-toggle='collapse' data-parent='#taskList' href='#task" + p + "'><span class='glyphicon glyphicon-stop'></span>&nbsp;" + t + "</a></h4></div>";
			txt += "<div id='task" + p + "' class='panel-collapse collapse'><div class='panel-body'>";
			txt += "<p class='lead'>Should be completed by " + dt.toDateString() + ".";
			if ($.toBoolean(sessionStorage.useShare)) {
				txt += "<br/><a href='" + sessionStorage.shareurl + "/page/task-edit?taskId=" + tk.id + "&referrer=tasks' target='_blank'>Task " + tk.status + "</a>";
			}
			else {
				txt += "<br/>Task " + tk.status + ".</p>";
			}
			if (tk.resources.length <= 0) {
			}
			else {
				txt += "<p style='margin-left: 20px; margin-top: -15px'><strong>Associated Documents</strong>";
				for (var d in tk.resources)
				{
					var dc = tk.resources[d];
					txt += "<br/><a href='doc.html?docid=" + dc.nodeRef + "&docname=" + dc.displayName + "'><img src='" + sessionStorage.alfurl + dc.icon + "' class='img'>" + dc.displayName + "</a>";
				}
			}
			txt += "</p></div></div></div>";
			return txt;
		}
	};
	
	component.init();
	component.populate();
	return this;
};

$.fn.taskList.defaults = {
	content: ' \
		<div class="panel-heading"><span class="glyphicon glyphicon-tasks"></span>&nbsp;My Tasks</div> \
		<div class="panel-body"> \
			<div class="panel-group" id="taskList"></div> \
		</div> \
		',

};

} (jQuery));

