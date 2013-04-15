/**
 * Copyright (c) 2012, Dr. Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2012-01-19
 */

/*global jQuery */
(function ($) {
    'use strict';
    /*jslint unparam: true */
    $.extend($.fn.fmatter, {
        clickableCheckbox: function (cellValue, options) {
            var op = $.extend({}, $.jgrid.formatter.checkbox, options.colModel.formatoptions);
            if ($.fmatter.isEmpty(cellValue) || cellValue === undefined) {
                cellValue = $.fn.fmatter.defaultFormat(cellValue, op);
            }
            cellValue = String(cellValue).toLowerCase();
            if (op.disabled === true) {
                return '<div style="position:relative"><input type="checkbox"' +
                    (cellValue.search(/(false|0|no|off)/i) < 0 ? " checked='checked' " : "") +
                    ' value="' + cellValue + '" offval="no" disabled="disabled"' +
                //    '/><div style="position:absolute;top:0px;left:0px;right:100%;bottom:100%;background:white;width:100%;height:100%;zoom:1;filter:alpha(opacity=0);-ms-filter:\"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)\";-khtml-opacity:0;-moz-opacity:0;opacity:0;"></div></div>';
                    '/><div title="' + (options.colName || options.colModel.label || options.colModel.name) +
                    '" style="position:absolute;top:0px;left:0px;right:100%;bottom:100%;background:white;width:100%;height:100%;zoom:1;filter:alpha(opacity=0);opacity:0;"></div></div>';
            } else {
                return '<input type="checkbox"' +
                    (cellValue.search(/(false|0|no|off)/i) < 0 ? " checked='checked' " : "") +
                    'title="' + (options.colName || options.colModel.label || options.colModel.name) + '/>';
            }
        }
    });
    $.extend($.fn.fmatter.clickableCheckbox, {
        unformat: function (cellValue, options, elem) {
            var cbv = (options.colModel.editoptions) ? options.colModel.editoptions.value.split(":") : ["Yes", "No"];
            return $('input', elem).is(":checked") ? cbv[0] : cbv[1];
        }
    });
}(jQuery));
