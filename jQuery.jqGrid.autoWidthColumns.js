/**
 * Copyright (c) 2013, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2014-10-19
 * see http://stackoverflow.com/a/24329916/315935 and http://stackoverflow.com/q/26437736/315935 for more details
 */
/*global jQuery */
(function ($) {
	"use strict";
	/*jslint continue: true, plusplus: true */
	$.jgrid.extend({
		autoWidthColumns: function () {
			return this.each(function () {
				$(this).bind("jqGridAfterLoadComplete jqGridRemapColumns", function () {
					var $this = $(this),
						$cells = $this.find(">tbody>tr.jqgrow>td"),
						$colHeaders = $($.map(this.grid.headers, function (item) { return item.el; })).find(">div"),
						colModel = $this.jqGrid("getGridParam", "colModel"),
						cellLayout = $this.jqGrid("getGridParam", "cellLayout"),
						iCol,
						iRow,
						rows,
						row,
						n = $.isArray(colModel) ? colModel.length : 0,
						cm,
						colWidth,
						idColHeadPrexif = "jqgh_" + this.id + "_";

					$cells.wrapInner("<span class='mywrapping'></span>");
					$colHeaders.wrapInner("<span class='mywrapping'></span>");

					for (iCol = 0; iCol < n; iCol++) {
						cm = colModel[iCol];
						if (cm.hidden) {
							continue;
						}
						colWidth = $("#" + idColHeadPrexif + $.jgrid.jqID(cm.name) + ">.mywrapping").outerWidth(true) + 25; // 25px for sorting icons
						for (iRow = 0, rows = this.rows; iRow < rows.length; iRow++) {
							row = rows[iRow];
							if ($(row).hasClass("jqgrow")) {
								colWidth = Math.max(colWidth, $(row.cells[iCol]).find(".mywrapping").outerWidth(true));
							}
						}
						$this.jqGrid("setColWidth", iCol, colWidth + ($.jgrid.cell_width ? cellLayout : 0));
					}
				});
			});
		}
	});
}(jQuery));
