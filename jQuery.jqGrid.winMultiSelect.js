/**
 * Copyright (c) 2014, Dr. Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2014-11-07
 */

/*global jQuery */
(function ($) {
	"use strict";
	/*jslint eqeq: true, unparam: true, plusplus: true */
	$.jgrid.extend({
		winMultiSelect: function () {
			return this.each(function () {
				$(this).bind("jqGridBeforeSelectRow", function (ev, rowid, e) {
					var $self = $(this),
						selectedRowIds = $self.jqGrid("getGridParam", "selarrrow"),
						selectRow = function (tr) {
							var id = tr.id, $tr = $(tr);
							$tr.addClass("ui-state-highlight").attr("aria-selected", "true");
							if ($.inArray(id, selectedRowIds) < 0) {
								selectedRowIds.push(id);
								$self.jqGrid("setGridParam", {selrow: id});
							}
							$tr.find(">td[aria-describedby=" + $.jgrid.jqID(this.p.id) + "_cb]>input[type=checkbox]")
								.prop("checked", true);
						},
						selectRowById = function (rowId) {
							selectRow.call(this, $self.jqGrid("getGridRowById", rowId));
						},
						unselectRows = function (rowIdsToUnselect) {
							var i, n = rowIdsToUnselect.length, tr, iSel, rowId;

							for (i = 0; i < n; i++) {
								rowId = rowIdsToUnselect[i];
								tr = $self.jqGrid("getGridRowById", rowId);
								$(tr).removeClass("ui-state-highlight").removeAttr("attribute aria-selected");
								iSel = $.inArray(rowId, selectedRowIds);
								if (iSel >= 0) {
									selectedRowIds.splice(iSel, 1); // remove from array
								}
								$(tr).find(">td[aria-describedby=" + $.jgrid.jqID(this.p.id) + "_cb]>input[type=checkbox]")
									.prop("checked", false);
							}
							$self.jqGrid("setGridParam", {
								selrow: (selectedRowIds.length === 0 ? null : selectedRowIds[selectedRowIds.length - 1]) // or selectedRowIds[0]
							});
						},
						shiftSelect = function (rowId) {
							var i, rowIndexMin, rowIndexMax, iSel,
								tr = $self.jqGrid("getGridRowById", rowId),
								rowidsToUnselect = selectedRowIds.slice(0); // copy array
							// we want simulate the same selection like in Windows
							// the rows between previously selected line and the current selected line
							// need be selected. Other rows from selectedRowIds array need be unselected.
							// special case: if the row will be selected with shift key pressed
							// and NO other rows was previously selected then all rows between
							// the first one and the currently selected line will be selected

							// one need to find id in selectedRowIds with max and min rowIndex property
							rowIndexMin = tr.rowIndex;
							tr = $self.jqGrid("getGridRowById", selectedRowIds[0]);
							rowIndexMax = selectedRowIds.length === 0 ? 1 : (tr != null ? tr.rowIndex : 1);
							if (rowIndexMin > rowIndexMax) {
								// swap rowIndexMin and rowIndexMax
								i = rowIndexMax;
								rowIndexMax = rowIndexMin;
								rowIndexMin = i;
							}

							// all rows between rowIndexMin and rowIndexMax need be selected
							for (i = rowIndexMin; i <= rowIndexMax; i++) {
								tr = this.rows[i];
								iSel = $.inArray(tr.id, rowidsToUnselect);
								if (iSel >= 0) {
									// row is already selected
									rowidsToUnselect.splice(iSel, 1); // remove from array
								} else {
									selectRow.call(this, tr);
								}
							}
							unselectRows.call(this, rowidsToUnselect);
						};

					if (e.ctrlKey) {
						// select the row if it's not in selectedRowIds array
						// und unselect if it's in the array
						if ($.inArray(rowid, selectedRowIds) >= 0) {
							unselectRows.call(this, [rowid]);
						} else {
							selectRowById.call(this, rowid);
						}
					} else if (e.shiftKey) {
						shiftSelect.call(this, rowid);
					} else {
						unselectRows.call(this, selectedRowIds.slice(0)); // copy array selectedRowIds
						selectRowById.call(this, rowid);
					}

					return false; // don't make standard selection process
				});
			});
		}
	});
}(jQuery));
