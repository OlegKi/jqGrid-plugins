/**
 * Copyright (c) 2014, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2014-11-13, 2015-03-18
 * see https://github.com/tonytomov/jqGrid/issues/650 for more details
 */
/*global jQuery */
(function ($) {
	"use strict";
	$.jgrid = $.jgrid || {};
	$.extend($.jgrid, {
		showHideColumnMenu: {
			adjustGridWidth: true,
			viewHideDlgColumnsAsDisabled: false,
			shrink: false,
			menuStyle: { "float": "left" },
			checkboxChecked: "<input disabled=\"disabled\" checked=\"checked\" type=\"checkbox\"/>",
			checkboxUnChecked: "<input disabled=\"disabled\" type=\"checkbox\"/>",
			checkboxSelector: "input[type=checkbox]",
			modifyMenuItem: function ($li, cm, options) {
				if ($.inArray(cm.name, ["rn", "subgrid", "cb"]) >= 0) { // skip predefined columns
					$li.hide();
					return;
				}
				if (!cm.hidedlg) {
					return;
				}
				if (options.viewHideDlgColumnsAsDisabled) {
					$li.addClass("ui-state-disabled");
				} else {
					$li.hide();
				}
			},
			isChecked: function ($checkbox) { return $checkbox.is(":checked"); },
			toCheck: function ($checkbox) { $checkbox.prop("checked", true); },
			toUnCheck: function ($checkbox) { $checkbox.prop("checked", false); }
		}
	});
	/*jslint continue: true, eqeq: true, unparam: true, plusplus: true */
	$.jgrid.extend({
		showHideColumnMenu: function (opt) {
			var options = $.extend(true, {}, $.jgrid.showHideColumnMenu, opt),
				versionParts = $.ui != null && typeof $.ui.version === "string" ? /^([0-9]+)\.([0-9]+)\.([0-9]+)$/.exec($.ui.version) : [],
				isAncorRequired = versionParts != null && versionParts.length === 4 && versionParts[1] === "1" && versionParts[2] < 11;
			return this.each(function () {
				var $self = $(this);
				$(this.grid.hDiv).find(".ui-jqgrid-labels").contextmenu(function (e) {
					var p = $self.jqGrid("getGridParam"), colModel = p.colModel, colNames = p.colNames, iCol, nCol = colModel.length, cm, $li,
						$menu = $("<ul class=\"ui-jqgrid-showHideColumnMenu\"></ul>");
					for (iCol = 0; iCol < nCol; iCol++) {
						cm = colModel[iCol];
						$li = $("<li></li>")
								.data("iCol", iCol)
								.text(colNames[iCol] === "" ? cm.name : colNames[iCol]);
						options.modifyMenuItem.call($self[0], $li, cm, options);
						$li.prepend(cm.hidden ? options.checkboxUnChecked : options.checkboxChecked);
						if (isAncorRequired) {
							$li.wrapInner("<a></a>");
						}
						$li.appendTo($menu);
					}
					$menu.css(options.menuStyle);
					$("ul.ui-jqgrid-showHideColumnMenu").menu("destroy").remove(); // remove menu if any exist
					$menu.appendTo("body")
						.menu({
							select: function (event, ui) {
								var i = parseInt(ui.item.data("iCol"), 10), $cb = ui.item.find(options.checkboxSelector),
									colWidth,
									cmi = colModel[i],
									toHide = options.isChecked.call($self[0], $cb, event, cmi);
								if (!isNaN(i) && i >= 0 && cmi != null && $cb.length > 0) {
									if (toHide) {
										options.toUnCheck.call($self[0], $cb, event, cmi);
										colWidth = $($self[0].grid.headers[i].el).outerWidth();
										$self.jqGrid("hideCol", cmi.name);
									} else {
										options.toCheck.call($self[0], $cb, event, cmi);
										$self.jqGrid("showCol", cmi.name);
										colWidth = $($self[0].grid.headers[i].el).outerWidth();
									}
									if (colWidth === 0) {
										colWidth = $self[0].grid.headers[i].width + (!$.jgrid.cell_width ? p.cellLayout : 0);
									}
									$(this).parent().css("zoom", 1); // fix visibility in IE
									if (options.adjustGridWidth) {
										$self.jqGrid("setGridWidth",
											p.width + (toHide ? -colWidth : colWidth),
											options.shrink);
									}
								}
							}
						})
						.mouseleave(function () {
							$(this).menu("destroy").remove();
						})
						.position({
							of: $(e.target),
							my: "left top",
							at: "right center",
							collision: "none none"
						});

					return false; // prevent creating of the standard context menu of web browser
				});
			});
		}
	});
}(jQuery));
