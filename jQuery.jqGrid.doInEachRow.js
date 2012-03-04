/**
 * Copyright (c) 2012, Dr. Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2012-03-04
 */

/*global jQuery */
(function ($) {
    'use strict';
    /*jslint unparam: true, nomen: true, plusplus: true */
    $.jgrid.extend({
        doInEachRow: function (type, myFunc) {
            if ($.isFunction (type)) {
                myFunc = type;
                type = "row-data";
            } else if (!$.isFunction(myFunc)) {
                return;
            }
            this.each(function () {
                var rows = this.rows, cRows, iRow, row, trClasses, rowType, localRowData,
                    p = this.p, index, data, dataIndex, rowId;
                if (typeof rows === "undefined" || !this.grid || typeof p === "undefined") {
                    return;
                }
                index = p._index;
                data = p.data;
                cRows = rows.length;
                for (iRow = 0; iRow < cRows; iRow++) {
                    row = rows[iRow];
                    trClasses = row.className.split(' ');
                    rowType = "unknown";
                    if ($.inArray('jqgrow', trClasses) > 0) {
                        // the row is a standard row
                        rowType = "row-data";
                    } else if ($.inArray('ui-subgrid', trClasses) > 0) {
                        // the row contains subgrid (only if subGrid:true are used)
                        rowType = "subgrid";
                    } else if ($.inArray('jqgroup', trClasses) > 0) {
                        // the row is grouping header (only if grouping:true are used)
                        rowType = "grouping-header";
                    } else if ($.inArray('jqfoot', trClasses) > 0) {
                        // the row is grouping summary (only if grouping:true are used)
                        // and groupSummary: [true] inside of groupingView setting
                        rowType = "grouping-summary";
                    } else if ($.inArray('jqgfirstrow', trClasses) > 0) {
                        // the row is first dummy row of the grid. we skip it
                        rowType = "row-first";
                    }
                    rowId = row.id;
                    if (typeof index !== "undefined") {
                        dataIndex = index[rowId];
                        localRowData = dataIndex >= 0 ? data[dataIndex] : undefined;
                    } else {
                        localRowData = undefined;
                    }
                    if (type === "all" || type === rowType) {
                        myFunc.call(this, row, row.id, localRowData, rowType);
                    }
                }
            });
        }
    });
}(jQuery));
