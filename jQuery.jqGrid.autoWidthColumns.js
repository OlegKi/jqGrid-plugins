/**
 * Copyright (c) 2014, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2014-10-19
 * see http://stackoverflow.com/a/24329916/315935
 * and http://stackoverflow.com/q/26437736/315935
 * and http://stackoverflow.com/a/26753600/315935 for more details
 */
/*global jQuery */
(function ($) {
	"use strict";
	/*jslint eqeq: true, unparam: true, todo: true, plusplus: true */
	$.jgrid.extend({
		autoWidthColumns: function () {
			return this.each(function () {
				var recalculateColumnWidth = function (iCol, adjustGridWidth) {
						// TODO: include support of more sophisticated grid features like frozen columns, grouping and so on.
						var $self = $(this), iRow, rows, row, colWidth,
							p = $self.jqGrid("getGridParam"),
							cm = p.colModel[iCol],
							getOuterWidth = function ($elem) {
								var $wrappingSpan, width;

								$elem.wrapInner("<span class='mywrapping'></span>");
								$wrappingSpan = $elem.find(">.mywrapping");
								width = $wrappingSpan.outerWidth();
								$elem.html($wrappingSpan.html());

								return width;
							};

						if (cm == null || cm.hidden) {
							return; // don't change the width of hidden columns
						}
						colWidth = getOuterWidth($(this.grid.headers[iCol].el).find(">div")) +
							(cm.name === p.sortname || p.viewsortcols[0] ? 20 : 0) +
							(!$.jgrid.cell_width ? p.cellLayout : 0); // 25px for sorting icons
						for (iRow = 0, rows = this.rows; iRow < rows.length; iRow++) {
							row = rows[iRow];
							if ($(row).hasClass("jqgrow")) {
								colWidth = Math.max(colWidth, getOuterWidth($(row.cells[iCol])));
							}
						}
						if (colWidth !== cm.width) {
							colWidth += ($.jgrid.cell_width ? p.cellLayout : 0);
							$self.jqGrid("setColWidth", iCol, colWidth, adjustGridWidth);
						}
					},
					autosizeAllColumns = function (adjustGridWidth) {
						var iCol,
							colModel = $(this).jqGrid("getGridParam", "colModel"),
							n = $.isArray(colModel) ? colModel.length : 0;

						for (iCol = 0; iCol < n; iCol++) {
							recalculateColumnWidth.call(this, iCol, adjustGridWidth);
						}
					};

				$(this).bind("jqGridAfterLoadComplete jqGridInlineAfterSaveRow", autosizeAllColumns);
				$(this).bind("jqGridShowHideCol", function (e, isShow, columnName, iCol) {
					if (isShow) {
						recalculateColumnWidth.call(this, iCol, true);
					}
				});
			});
		}
	});
}(jQuery));
