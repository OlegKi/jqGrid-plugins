/**
 * Copyright (c) 2013-2014, Dr. Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2013-11-17, 2014-10-18, 2015-02-24
 * see the answers http://stackoverflow.com/a/20030652/315935
 *             and http://stackoverflow.com/a/14265456/315935
 */

/*global jQuery */
(function ($) {
	"use strict";
	/*global $ */
	/*jslint plusplus: true */
	$.jgrid.extend({
		setColWidth: function (iCol, newWidth, adjustGridWidth) {
			return this.each(function () {
				var $self = $(this), grid = this.grid, p = this.p, colName, colModel = p.colModel, i, nCol;
				if (typeof iCol === "string") {
					// the first parametrer is column name instead of index
					colName = iCol;
					for (i = 0, nCol = colModel.length; i < nCol; i++) {
						if (colModel[i].name === colName) {
							iCol = i;
							break;
						}
					}
					if (i >= nCol) {
						return; // error: non-existing column name specified as the first parameter
					}
				} else if (typeof iCol !== "number") {
					return; // error: wrong parameters
				}
				grid.resizing = { idx: iCol };
				grid.headers[iCol].newWidth = newWidth;
				grid.newWidth = p.tblwidth + newWidth - grid.headers[iCol].width;
				grid.dragEnd();   // adjust column width
				if (adjustGridWidth !== false) {
					$self.jqGrid("setGridWidth", grid.newWidth, false); // adjust grid width too
				}
			});
		}
	});
}(jQuery));
