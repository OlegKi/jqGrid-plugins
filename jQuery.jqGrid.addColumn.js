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
/*jslint browser: true, plusplus: true, eqeq: true, todo: true, continue: true */
(function ($) {
    "use strict";
    $.jgrid.extend({
        addColumn: function (options) {
            // currently supported options: cm (REQUIRED), insertWithColumnIndex, data, footerData, formatFooter, adjustGridWidth
            //                              autosearch, searchOnEnter
            // The current code suppose that there are AT LEAST one (probebly hidden) column in the grid. If one use
            // filter toolbar then the column should be searchable.
            var cmNew = options.cm, iCol = options.insertWithColumnIndex, columnData = options.data, colTemplate, soptions;
            if (cmNew == null) {
                return; // error, probably can be changed to throwing of an exception
            }
            colTemplate = cmNew.template === "string" ?
                    ($.jgrid.cmTemplate != null && typeof $.jgrid.cmTemplate[cmNew.template] === "object" ? $.jgrid.cmTemplate[cmNew.template] : {}) :
                    cmNew.template;
            return this.each(function () {
                var $self = $(this), self = this, grid = this.grid, p = this.p, colModel = p.colModel, idPrefix = p.idPrefix, locid = "_id_",
                    i, rows, $row, $th, $td, rowid, id, formattedCellValue, pos, rawObject, rdata, cellProp, thTemplate, searchElem, timeoutHnd,
                    $htable = p.direction === "ltr" ?
                            $(grid.hDiv).find(">.ui-jqgrid-hbox>table.ui-jqgrid-htable") :
                            $(grid.hDiv).find(">.ui-jqgrid-hbox-rtl>table.ui-jqgrid-htable"),
                    $ftableRows = p.direction === "ltr" ?
                            $(grid.sDiv).find(">.ui-jqgrid-hbox>table.ui-jqgrid-ftable tr.footrow") :
                            $(grid.sDiv).find(">.ui-jqgrid-hbox-rtl>table.ui-jqgrid-ftable tr.footrow"),
                    /*$fhtable = p.direction === "ltr" ?
                            $(grid.fhDiv).find(">.ui-jqgrid-hbox>table.ui-jqgrid-htable") :
                            $(grid.fhDiv).find(">.ui-jqgrid-hbox-rtl>table.ui-jqgrid-htable"),*/
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
                    },
                    changeSearch = function () {
                        self.triggerToolbar();
                        return false;
                    },
                    keypressSearch = function (e) {
                        var key = e.charCode || e.keyCode || 0;
                        if (key === 13) {
                            self.triggerToolbar();
                            return false;
                        }
                    },
                    keydownSearch = function (e) {
                        var key = e.which;
                        switch (key) {
                            case 13:
                                return false;
                            case 9:
                            case 16:
                            case 37:
                            case 38:
                            case 39:
                            case 40:
                            case 27:
                                break;
                            default:
                                if (timeoutHnd) {
                                    clearTimeout(timeoutHnd);
                                }
                                timeoutHnd = setTimeout(function (){
                                    self.triggerToolbar();
                                }, 500);
                        }
                    };

                $self.triggerHandler("jqGridBeforeAddColumn", [options]);

                cmNew = $.extend(true, {}, p.cmTemplate, colTemplate || {}, cmNew);
                soptions = $.extend({}, cmNew.searchoptions || {});
                if (cmNew.index === undefined) {
                    cmNew.index = cmNew.name;
                }
                if (typeof cmNew.sortable !== "boolean") {
                    cmNew.sortable = true;
                }
                if (typeof cmNew.title !== "boolean") {
                    cmNew.title = true;
                }
                if (cmNew.resizable === undefined) {
                    cmNew.resizable = true;
                }
                if (cmNew.hidden === undefined) {
                    cmNew.hidden = false;
                }
                cmNew.width = cmNew.width === undefined ? 150 : parseInt(cmNew.width, 10);
                cmNew.widthOrg = cmNew.width;
                cmNew.lso = "";
                // update colModel and colNames
                if (iCol === undefined && p.treeGrid !== true) {
                    iCol = colModel.length - 1 - iOffset;
                    colModel.push(cmNew);
                    p.colNames.push(cmNew.label || cmNew.name);
                } else {
                    if (iCol === undefined) { // p.treeGrid === true
                        iCol = colModel.length - 6 - iOffset;
                    }
                    colModel.splice(iCol + iOffset, 0, cmNew);
                    p.colNames.splice(iCol + iOffset, 0, cmNew.label || cmNew.name);
                }

                rows = $htable[0].rows;
                for (i = 0; i < rows.length; i++) {
                    // TODO: support of frozen columns
                    // TODO: support of grouping headers
                    $row = $(rows[i]);
                    if ($row.hasClass("ui-jqgrid-labels")) {
                        thTemplate = grid.headers[grid.headers.length - 1].el;
                        $th = $(thTemplate).clone(true);
                        $th.attr("id", p.id + "_" + cmNew.name);
                        $th.css("display", cmNew.hidden === true ? "none" : "");
                        $th.html('<span class="ui-jqgrid-resize ui-jqgrid-resize-' + p.direction +
                            '" style="cursor: col-resize;">&nbsp;</span><div class="ui-th-div-ie ui-jqgrid-sortable" id="jqgh_' +
                            p.id + "_" + cmNew.name + '">' +
                            (cmNew.label || cmNew.name) +
                            '<span class="s-ico" style="display: none;"><span class="ui-grid-ico-sort ui-icon-asc ui-state-disabled ui-icon ui-icon-triangle-1-n ui-sort-' +
                            p.direction + '" sort="asc"></span><span class="ui-grid-ico-sort ui-icon-desc ui-state-disabled ui-icon ui-icon-triangle-1-s ui-sort-' +
                            p.direction + '" sort="desc"></span></span></div>');
                        $th.css("width", cmNew.width + "px");
                        if (iCol === colModel.length - 1) {
                            grid.headers.push({ el: $th[0], width: cmNew.width, widthOrg: cmNew.width });
                        } else {
                            grid.headers.splice(iCol + iOffset, 0, { el: $th[0], width: cmNew.width, widthOrg: cmNew.width });
                        }
                    } else if ($row.hasClass("ui-search-toolbar")) {
                        $th = $('<th class="ui-state-default ui-th-column ui-th-' + p.direction + '" role="columnheader"><div style="height: 100%; padding-right: 0.3em; padding-left: 0.3em; position: relative;"><table class="ui-search-table" cellspacing="0"><tbody><tr><td class="ui-search-oper" style="display: none;" colindex="' +
                            iCol + '"></td>' +
                            '<td class="ui-search-input">' +
                            //'<input name="' + (cmNew.label || cmNew.name) + '" id="gs_' + cmNew.name + '" style="padding: 0px; width: 100%;" type="text" value="' +
                            //(soptions.defaultValue !== undefined ? soptions.defaultValue : "") +
                            //'">' +
                            '</td>' +
                            '<td class="ui-search-clear"' +
                            (soptions.clearSearch === undefined || soptions.clearSearch ? "" : ' style="display:none;"') +
                            '><a title="' + ($.jgrid.search.resetTitle || "Clear Search Value") +
                            '" class="clearsearchclass" style="padding-right: 0.3em; padding-left: 0.3em;">' + ($.jgrid.search.resetIcon || "x") + '</a></td>' +
                            '</tr></tbody></table></div></th>');
                        searchElem = $.jgrid.createEl.call(this, cmNew.stype || "text", cmNew.searchoptions || {}, "", true, p.ajaxSelectOptions || {}, true);
                        $(searchElem).attr("id", "gs_" + cmNew.name)
                            .attr("name", cmNew.label || cmNew.name)
                            .attr("value", soptions.defaultValue !== undefined ? soptions.defaultValue : "")
                            .css({padding: 0, width: "100%"})
                            .appendTo($th.find(".ui-search-input"));
                        if (cmNew.hidden === true) {
                            $th.css("display", "none");
                        }

                        if (options.autosearch !== false) {
                            if (cmNew.stype === "select") {
                                $(searchElem).change(changeSearch);
                            } else if (cmNew.stype === "text" || cmNew.stype === undefined) {
                                if (options.searchOnEnter || options.searchOnEnter === undefined) {
                                    $(searchElem).keypress(keypressSearch);
                                } else {
                                    $(searchElem).keydown(keydownSearch);
                                }
                            }
                        }
                        // TODO: update colindex attribute of other elements: rows[i].cells[iCol + iOffset] and later
                        // the current implementation don't support autosearch and searchOnEnter of filterToolbar
                    }
                    if (iCol === colModel.length - 1) {
                        $th.appendTo(rows[i]);
                    } else {
                        if (iCol + iOffset >= 1) {
                            $th.insertAfter(rows[i].cells[iCol + iOffset - 1]);
                        } else {
                            $th.insertBefore(rows[i].cells[iCol + iOffset]);
                        }
                    }
                }

                rows = this.rows;
                // append the column in the body
                for (i = 0; i < rows.length; i++) {
                    // TODO: support of frozen columns
                    $row = $(rows[i]);
                    if ($row.hasClass("jqgrow") || $row.hasClass("jqfoot")) {// $row.hasClass("jqfoot") means grouping summary row
                        rowid = $row.attr("id");
                        id = $.jgrid.stripPref(idPrefix, rowid);
                        pos = iCol + iOffset;
                        rawObject = {}; // TODO later
                        if (p.datatype === "local" || p.datatype === "jsonstring" || p.treeGrid === true) {
                            rawObject = $self.jqGrid("getLocalRow", rowid);
                            if (p.treeGrid === true || (p.loadonce === true && p.datatype === "local")) {
                                // It's unclear how to detect initial datatype value "jsonstring" or datatype !== "local" with loadonce
                                // probably it would be better to introduce datatypeOrg and use it additionally
                                rawObject[locid] = id;
                            }
                            if (rawObject != null && columnData[id] !== undefined && !$row.hasClass("jqfoot")) {
                                rawObject[cmNew.name] = columnData[id];
                            }
                        } else {
                            rawObject = $self.jqGrid("getRowData", rowid);
                        }
                        rdata = rawObject;
                        formattedCellValue = $row.hasClass("jqfoot") ? "" :
                                this.formatter(rowid, columnData[id] === undefined ? "" : columnData[id],
                                    pos, rawObject, "add");
                        cellProp = this.formatCol(pos, i, formattedCellValue, rawObject, rowid, rdata);

                        $td = $('<td role="gridcell" aria-describedby="list_total" ' +
                            cellProp + '>' + formattedCellValue + '</td>');
                    } else if ($row.hasClass("jqgfirstrow")) {
                        $td = $('<td role="gridcell" style="width: ' + cmNew.width + 'px; height: 0px;"></td>');
                    } else if ($row.hasClass("jqgroup") || $row.hasClass("ui-subgrid")) {
                        $td = $row.find(">td[colspan]");
                        $td.attr("colspan", parseInt($td.attr("colspan"), 10) + 1);
                        continue;
                    }
                    if (iCol === colModel.length - 1) {
                        $td.appendTo($row);
                    } else if (iCol + iOffset >= 1) {
                        $td.insertAfter(rows[i].cells[iCol + iOffset - 1]);
                    } else {
                        $td.insertBefore(rows[i].cells[iCol + iOffset]);
                    }
                }

                if ($ftableRows.length > 0) {
                    // append the column in the body
                    pos = iCol + iOffset;
                    rawObject = $self.jqGrid("footerData", "get", options.footerData, options.formatFooter);
                    rawObject[cmNew.name] = options.footerData;
                    formattedCellValue = options.formatFooter ?
                            this.formatter("", options.footerData === undefined ? "" : options.footerData, pos, rawObject, "add") :
                            options.footerData;
                    for (i = 0; i < $ftableRows.length; i++) {
                        pos = iCol + iOffset;
                        $td = $("<td role='gridcell' " + this.formatCol(pos, 0, "", null, "", false) + ">" +
                            (formattedCellValue || "&#160;") +
                            "</td>");
                        if (iCol === colModel.length - 1) {
                            $td.appendTo($ftableRows[i]);
                        } else if (iCol + iOffset >= 1) {
                            $td.insertAfter($ftableRows[i].cells[iCol + iOffset - 1]);
                        } else {
                            $td.insertBefore($ftableRows[i].cells[iCol + iOffset]);
                        }
                    }
                }

                if (options.adjustGridWidth !== false && p.frozenColumns !== true) {
                    $self.jqGrid("setGridWidth", p.width + $td.outerWidth(), false);
                    adjustGridWidth.call(this);
                }

                // destroy search form, edit form, view form, delete form if any exists (probably hidden)
                $("#searchmodfbox_" + $.jgrid.jqID(p.id) + ",#editmod" + $.jgrid.jqID(p.id) + ",#viewmod" + $.jgrid.jqID(p.id) + ",#delmod" + $.jgrid.jqID(p.id)).remove();

                $self.triggerHandler("jqGridAfterAddColumn", [options]);
            });
        }
    });
}(jQuery));
