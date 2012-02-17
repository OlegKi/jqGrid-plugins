/**
 * Copyright (c) 2012, Dr. Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2012-02-17
 */

/*global jQuery */
(function ($) {
    'use strict';
    /*jslint unparam: true */
    $.extend($.fn.fmatter, {
        /* supported formatoptions:
         *     url:       as string or function. Default value: '#'
         *     target:    as string or function
         *     cellValue: as string or function. Dafault value is the cell contain
         *     attr:      string. The value of the attr property must be a plain object which properties
         *                defines additional attributes like "class" or "title" which can be set
         *                on the "<a>" element.
         *     unformat:  as function. Defines the value returned by the unformatter. The unformatter
         *                are called by different standard method like getRowData, getCell, getCol.
         */
        dynamicLink: function (cellValue, options, rowData) {
            // href, target, rel, title, onclick
            // other attributes like media, hreflang, type are not supported currently
            var op = {url: '#'}, attr, attrName, attrValue, attrStr = '';

            if (typeof options.colModel.formatoptions !== 'undefined') {
                op = $.extend({}, op, options.colModel.formatoptions);
            }
            if ($.isFunction(op.target)) {
                op.target = op.target.call(this, cellValue, options.rowId, rowData, op);
            }
            if ($.isFunction(op.url)) {
                op.url = op.url.call(this, cellValue, options.rowId, rowData, op);
            }
            if ($.isFunction(op.cellValue)) {
                cellValue = op.cellValue.call(this, cellValue, options.rowId, rowData, op);
            }
            attr = op.attr;
            if ($.isPlainObject(attr)) {
                // enumerate properties of
                for (attrName in attr) {
                    if (attr.hasOwnProperty(attrName)) {
                        if ($.isFunction(attr[attrName])) {
                            attrStr += ' ' + attrName + '="' + attr[attrName].call(this, cellValue, options.rowId, rowData, op) + '"';
                        } else {
                            attrStr += ' ' + attrName + '="' + attr[attrName] + '"';
                        }
                    }
                }
            }
            if ($.fmatter.isString(cellValue) || $.fmatter.isNumber(cellValue)) {
                return '<a' +
                    (op.target ? ' target=' + op.target : '') +
                    (op.onClick ? ' onclick="return $.fn.fmatter.dynamicLink.onClick.call(this, arguments[0]);"' : '') +
                    ' href="' + op.url + '"' + attrStr + '>' +
                    (cellValue || '&nbsp;') + '</a>';
            } else {
                return '&nbsp;';
            }
        }
    });
    $.extend($.fn.fmatter.dynamicLink, {
        unformat: function (cellValue, options, elem) {
            var op = {}, text;

            if (typeof options.colModel.formatoptions !== 'undefined') {
                op = $.extend({}, op, options.colModel.formatoptions);
            }

            if ($.isFunction(op.unformat)) {
                return op.unformat.call(this, cellValue, elem, op);
            }
            
            text = $(elem).text();
            return text === '&nbsp;' ? '' : text;
        },
        onClick: function (e) {
            var $cell = $(this).closest('td'),
                $row = $cell.closest('tr.jqgrow'),
                $grid = $row.closest('table.ui-jqgrid-btable'),
                p,
                colModel,
                iCol;

            if ($grid.length === 1) {
                p = $grid[0].p;
                if (p) {
                    iCol = $.jgrid.getCellIndex($cell[0]);
                    colModel = p.colModel;
                    colModel[iCol].formatoptions.onClick.call($grid[0],
                        $row.attr('id'), $row[0].rowIndex, iCol, $cell.text(), e);
                }
            }
            return false;
        }
    });
}(jQuery));
