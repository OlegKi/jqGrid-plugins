/**
 * Copyright (c) 2014, Dr. Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2014-10-03
 * see the answers http://stackoverflow.com/a/20030652/315935
 *             and http://stackoverflow.com/a/14265456/315935
 */

/*global jQuery */
/*jslint plusplus: true, eqeq: true, todo: true */
(function ($) {
    "use strict";
    $.jgrid.extend({
        addColumn: function (options) {
            var cmNew = options.cm, iCol = options.insertWithColumnIndex, columnData = options.data;
            return this.each(function () {
                var $self = $(this), grid = this.grid, p = this.p, colModel = p.colModel, idPrefix = p.idPrefix,
                    i, rows, $row, $th, $td, rowid, id, formattedCellValue, pos, rawObject, rdata, cellProp, lastTh,
                    $htable = p.direction === "ltr" ?
                            $(grid.hDiv).find(">.ui-jqgrid-hbox>table.ui-jqgrid-htable") :
                            $(grid.hDiv).find(">.ui-jqgrid-hbox-rtl>table.ui-jqgrid-htable"),
                    iOffset = (p.multiselect === true ? 1 : 0) + (p.subGrid === true ? 1 : 0) + (p.rownumbers === true ? 1 : 0),
                    adjustGridWidth = function () {
                        var $this = $(this),
                            w = $this.outerWidth(false),
                            $parent,
                            maxCount = 3;
                        $this = $this.closest("div");
                        $this.width(w);
                        w = $this.outerWidth(false);
                        $this = $this.closest("div.ui-jqgrid-bdiv");
                        $this.width(w);
                        if ($this.height() > $this.find(">div").height() && $this.find(">div").height() > 0) {
                            do {
                                w += 1;
                                maxCount -= 1;
                                $this.width(w);
                            } while ($this.height() > $this.find(">div").height() && maxCount > 0);
                        }
                        $parent = $this.closest("div.ui-jqgrid-view");
                        $parent.find(">.ui-jqgrid-hdiv").width(w);
                        $parent.find(">.ui-jqgrid-toppager").width(w);
                        w = $this.outerWidth(false);
                        $this = $parent;
                        $this.width(w);
                        $parent = $this.closest("div.ui-jqgrid");
                        $parent.find(">.ui-jqgrid-pager").width(w);
                        $parent.width($this.outerWidth(false));
                    };

                // update colModel
                if (cmNew.index === undefined) {
                    cmNew.index = cmNew.name;
                }
                if (cmNew.sortable === undefined) {
                    cmNew.sortable = true;
                }
                // update colModel and colNames
                if (iCol === undefined) {
                    colModel.push(cmNew);
                    p.colNames.push(cmNew.label || cmNew.name);
                } else {
                    colModel.splice(iCol + iOffset, 0, cmNew);
                    p.colNames.splice(iCol + iOffset, 0, cmNew.label || cmNew.name);
                }

                rows = $htable[0].rows;
                for (i = 0; i < rows.length; i++) {
                    // TODO: support of frozen columns
                    // TODO: support of grouping headers
                    lastTh = grid.headers[grid.headers.length - 1].el;
                    $th = $(lastTh).clone(true);
                    $th.attr("id", this.id + "_" + cmNew.name);
                    $th.html('<span class="ui-jqgrid-resize ui-jqgrid-resize-' + p.direction +
                        '" style="cursor: col-resize;">&nbsp;</span><div class="ui-th-div-ie ui-jqgrid-sortable" id="jqgh_' +
                        this.id + "_" + cmNew.name + '">' +
                        (cmNew.label || cmNew.name) +
                        '<span class="s-ico" style="display: none;"><span class="ui-grid-ico-sort ui-icon-asc ui-state-disabled ui-icon ui-icon-triangle-1-n ui-sort-' +
                        p.direction + '" sort="asc"></span><span class="ui-grid-ico-sort ui-icon-desc ui-state-disabled ui-icon ui-icon-triangle-1-s ui-sort-' +
                        p.direction + '" sort="desc"></span></span></div>');
                    $th.css("width", cmNew.width + "px");
                    if (iCol === undefined) {
                        $th.appendTo(rows[i]);
                        grid.headers.push({ el: $th[0], width: cmNew.width, widthOrg: cmNew.width });
                    } else {
                        if (iCol + iOffset >= 1) {
                            $th.insertAfter(rows[i].cells[iCol + iOffset - 1]);
                        } else {
                            $th.insertBefore(rows[i].cells[iCol + iOffset]);
                        }
                        grid.headers.splice(iCol + iOffset, 0, { el: $th[0], width: cmNew.width, widthOrg: cmNew.width });
                    }
                }

                rows = this.rows;
                // append the column in the body
                for (i = 0; i < rows.length; i++) {
                    // TODO: support subgrids, grouping,
                    // TODO: insert not at the end of row in case of TreeGrid
                    // TODO: support of frozen columns
                    $row = $(rows[i]);
                    //row.insertCell(-1);
                    if ($row.hasClass("jqgrow")) {
                        rowid = $row.attr("id");
                        id = $.jgrid.stripPref(idPrefix, rowid);
                        pos = iCol === undefined ? rows[i].cells.length : iCol + iOffset;
                        rawObject = {}; // TODO later
                        if (p.datatype === "local" || p.datatype === "jsonstring") {
                            rawObject = $self.jqGrid("getLocalRow", rowid);
                            if (rawObject != null && columnData[id] !== undefined) {
                                rawObject[cmNew.name] = columnData[id];
                            }
                        } else {
                            rawObject = $self.jqGrid("getRowData", rowid);
                        }
                        rdata = rawObject;
                        formattedCellValue = this.formatter(rowid, columnData[id] === undefined ? "" : columnData[id], pos, rawObject, "add");
                        cellProp = this.formatCol(pos, i, formattedCellValue, rawObject, rowid, rdata);

                        $td = $('<td role="gridcell" aria-describedby="list_total" ' +
                            cellProp + '>' + formattedCellValue + '</td>');
                    /*} else if ($row.hasClass("ui-subgrid")) {
                    } else if ($row.hasClass("jqgroup")) {
                    } else if ($row.hasClass("jqfoot")) {*/
                    } else if ($row.hasClass("jqgfirstrow")) {
                        $td = $('<td role="gridcell" style="width: ' + cmNew.width + 'px; height: 0px;"></td>');
                    }
                    if (iCol === undefined) {
                        $td.appendTo($row);
                    } else if (iCol + iOffset >= 1) {
                        $td.insertAfter(rows[i].cells[iCol + iOffset - 1]);
                    } else {
                        $td.insertBefore(rows[i].cells[iCol + iOffset]);
                    }
                }
                if (adjustGridWidth !== false) {
                    $self.jqGrid("setGridWidth", p.width + $td.outerWidth(), false);
                    adjustGridWidth.call(this);
                }
                // todo destroy hidden editform if any exists
            });
        }
    });
}(jQuery));
