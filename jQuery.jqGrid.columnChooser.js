/*global jQuery */
/*jslint devel: true, nomen: true, white: true */
(function($){
"use strict";
$.jgrid.extend({
	columnChooser : function(opts) {
		var self = this, selector, select, colMap = {}, fixedCols = [], dopts, mopts, $dialogContent, dividerLocation,
			resizeSel = "#colchooser_" + $.jgrid.jqID(self[0].p.id),
			colModel = self.jqGrid("getGridParam", "colModel"),
			colNames = self.jqGrid("getGridParam", "colNames");

		if ($("#colchooser_" + $.jgrid.jqID(self[0].p.id)).length) { return; }
		selector = $('<div id="colchooser_'+self[0].p.id+'" style="position:relative;overflow:hidden"><div><select multiple="multiple"></select></div></div>');
		select = $('select', selector);

		function insert(perm,i,v) {
			var a, b;
			if(i>=0){
				a = perm.slice();
				b = a.splice(i,Math.max(perm.length-i,i));
				if(i>perm.length) { i = perm.length; }
				a[i] = v;
				return a.concat(b);
			}
			return perm;
		}
		function call(fn, obj) {
			if (!fn) { return; }
			if (typeof fn === 'string') {
				if ($.fn[fn]) {
					$.fn[fn].apply(obj, $.makeArray(arguments).slice(2));
				}
			} else if ($.isFunction(fn)) {
				fn.apply(obj, $.makeArray(arguments).slice(2));
			}
		}

		opts = $.extend({
			width : 400,
			height : 240,
			classname : null,
			done : function(perm) { if (perm) { self.jqGrid("remapColumns", perm, true); } },
			/* msel is either the name of a ui widget class that
			   extends a multiselect, or a function that supports
			   creating a multiselect object (with no argument,
			   or when passed an object), and destroying it (when
			   passed the string "destroy"). */
			msel : "multiselect",
			/* "msel_opts" : {}, */

			/* dlog is either the name of a ui widget class that 
			   behaves in a dialog-like way, or a function, that
			   supports creating a dialog (when passed dlog_opts)
			   or destroying a dialog (when passed the string
			   "destroy")
			   */
			dlog : "dialog",
			dialog_opts : {
				minWidth: 470,
				dialogClass: "ui-jqdialog"
			},
			/* dlog_opts is either an option object to be passed 
			   to "dlog", or (more likely) a function that creates
			   the options object.
			   The default produces a suitable options object for
			   ui.dialog */
			dlog_opts : function(options) {
				var buttons = {};
				buttons[options.bSubmit] = function() {
					options.apply_perm();
					options.cleanup(false);
				};
				buttons[options.bCancel] = function() {
					options.cleanup(true);
				};
				return $.extend(true, {
					buttons: buttons,
					close: function() {
						options.cleanup(true);
					},
					modal: options.modal || false,
					resizable: options.resizable || true,
					width: options.width + 70,
					resize: function () {
						var $container = $(this).find(">div>div.ui-multiselect"),
							$thisDialogContent = $container.closest(".ui-dialog-content"),
							$selectedContainer = $container.find(">div.selected"),
							$availableContainer = $container.find(">div.available"),
							$selectedActions = $selectedContainer.find(">div.actions"),
							$availableActions = $availableContainer.find(">div.actions"),
							$selectedList = $selectedContainer.find(">ul.connected-list"),
							$availableList = $availableContainer.find(">ul.connected-list");

						if ($thisDialogContent.length > 0 && typeof $thisDialogContent[0].style === "object") {
							$thisDialogContent[0].style.width = "";
						} else {
							$thisDialogContent.css("width", ""); // or just remove width style
						}

						$selectedList.height(Math.max($selectedContainer.height() - $selectedActions.outerHeight() - 1, 1));
						$availableList.height(Math.max($availableContainer.height() - $availableActions.outerHeight() - 1, 1));
					}
				}, options.dialog_opts || {});
			},
			/* Function to get the permutation array, and pass it to the
			   "done" function */
			apply_perm : function() {
				var perm = [];
				$('option',select).each(function() {
					if ($(this).is("[selected]")) {
						self.jqGrid("showCol", colModel[this.value].name);
					} else {
						self.jqGrid("hideCol", colModel[this.value].name);
					}
				});
				
				//fixedCols.slice(0);
				$('option[selected]',select).each(function() { perm.push(parseInt(this.value,10)); });
				$.each(perm, function() { delete colMap[colModel[parseInt(this,10)].name]; });
				$.each(colMap, function() {
					var ti = parseInt(this,10);
					perm = insert(perm,ti,ti);
				});
				if (opts.done) {
					opts.done.call(self, perm);
				}
				self.jqGrid("setGridWidth", self[0].p.tblwidth, self[0].p.shrinkToFit);
			},
			/* Function to cleanup the dialog, and select. Also calls the
			   done function with no permutation (to indicate that the
			   columnChooser was aborted */
			cleanup : function(calldone) {
				call(opts.dlog, selector, 'destroy');
				call(opts.msel, select, 'destroy');
				selector.remove();
				if (calldone && opts.done) {
					opts.done.call(self);
				}
			},
			msel_opts : {}
		}, $.jgrid.col, opts || {});
		if($.ui) {
			if ($.ui.multiselect && $.ui.multiselect.defaults) {
				if (!$.jgrid._multiselect) {
					// should be in language file
					alert("Multiselect plugin loaded after jqGrid. Please load the plugin before the jqGrid!");
					return;
				}
				// ??? the next line uses $.ui.multiselect.defaults which will be typically undefined
				opts.msel_opts = $.extend($.ui.multiselect.defaults, opts.msel_opts);
			}
		}
		if (opts.caption) {
			selector.attr("title", opts.caption);
		}
		if (opts.classname) {
			selector.addClass(opts.classname);
			select.addClass(opts.classname);
		}
		if (opts.width) {
			$(">div",selector).css({width: opts.width,margin:"0 auto"});
			select.css("width", opts.width);
		}
		if (opts.height) {
			$(">div",selector).css("height", opts.height);
			select.css("height", opts.height - 10);
		}

		select.empty();
		$.each(colModel, function(i) {
			colMap[this.name] = i;
			if (this.hidedlg) {
				if (!this.hidden) {
					fixedCols.push(i);
				}
				return;
			}

			select.append("<option value='"+i+"' "+
						  (this.hidden?"":"selected='selected'")+">"+$.jgrid.stripHtml(colNames[i])+"</option>");
		});

		dopts = $.isFunction(opts.dlog_opts) ? opts.dlog_opts.call(self, opts) : opts.dlog_opts;
		call(opts.dlog, selector, dopts);
		mopts = $.isFunction(opts.msel_opts) ? opts.msel_opts.call(self, opts) : opts.msel_opts;
		call(opts.msel, select, mopts);

		// fix height of elements of the multiselect widget
		$dialogContent = $(resizeSel);

		$dialogContent.css({ margin: "auto" });
		$dialogContent.find(">div").css({ width: "100%", height: "100%", margin: "auto" });
		$dialogContent.find(">div>.ui-multiselect").css({ width: "100%", height: "100%", margin: "auto" });

		dividerLocation = opts.msel_opts.dividerLocation || ($.ui.multiselect.defaults != null && $.ui.multiselect.defaults.dividerLocation || $.ui.multiselect.prototype != null && $.ui.multiselect.prototype.options.dividerLocation);
		$dialogContent.find(">div>.ui-multiselect>.selected").css({ width: dividerLocation * 100 + "%", height: "100%", margin: "auto", boxSizing: "border-box" });
		$dialogContent.find(">div>.ui-multiselect>.available").css({ width: (100 - dividerLocation * 100) + "%", height: "100%", margin: "auto", boxSizing: "border-box" });
	}
});
}(jQuery));
