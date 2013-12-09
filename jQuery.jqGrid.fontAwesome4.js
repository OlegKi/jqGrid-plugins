/**
 * Copyright (c) 2013, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2013-11-23
 * see http://stackoverflow.com/a/20165553/315935 for more details
 */
/*global $ */
(function ($) {
    "use strict";
    /*jslint unparam: true */
    $.extend($.jgrid, {
        icons: {
            common: "fa", // "fa fa-lg"
            titleVisibleGrid: "fa-chevron-circle-up",
            titleHiddenGrid: "fa-chevron-circle-down",
            titleIcon: "ui-corner-all fa-title",
            close: "fa-times",
            sortAsc: "fa-sort-asc fa-lg",
            sortDesc: "fa-sort-desc fa-lg",
            navEdit: "fa-pencil fa-fw",
            navAdd: "fa-plus fa-fw",
            navDel: "fa-trash-o fa-fw",
            navSearch: "fa-search fa-fw",
            navRefresh: "fa-refresh fa-fw",
            navView: "fa-file-o fa-fw",
            pagerFirst: "fa-step-backward fa-fw",
            pagerPrev: "fa-backward fa-fw",
            pagerNext: "fa-forward fa-fw",
            pagerLast: "fa-step-forward fa-fw",
            formPrev: "fa-caret-left",
            formNext: "fa-caret-right",
            formSave: "fa-floppy-o",
            formUndo: "fa-undo",
            formDel: "fa-trash-o",
            searchReset: "fa-undo",
            searchQuery: "fa-comments-o",
            searchSearch: "fa-search",
            getClass: function (prop) {
                return this.common !== "" ? this.common + " " + this[prop] : this[prop];
            }
        }
    });

    $.extend($.jgrid.nav, {
        editicon: $.jgrid.icons.getClass("navEdit"),
        addicon: $.jgrid.icons.getClass("navAdd"),
        delicon: $.jgrid.icons.getClass("navDel"),
        searchicon: $.jgrid.icons.getClass("navSearch"),
        refreshicon: $.jgrid.icons.getClass("navRefresh"),
        viewicon: $.jgrid.icons.getClass("navView")
    });

    $.extend($.jgrid.defaults, {
        fontAwesomeIcons: true // the new option will be used in callbacks
    });

    $.extend($.jgrid, {
        originalCreateModal: $.jgrid.originalCreateModal || $.jgrid.createModal,
        createModal: function (aIDs, content, p, insertSelector, posSelector, appendsel, css) {
            $.jgrid.originalCreateModal.call(this, aIDs, content, p, insertSelector, posSelector, appendsel, css);
            if ($(insertSelector).find(">.ui-jqgrid-bdiv>div>.ui-jqgrid-btable").jqGrid("getGridParam", "fontAwesomeIcons")) {
                $("#" + $.jgrid.jqID(aIDs.modalhead) + ">a.ui-jqdialog-titlebar-close>span.ui-icon")
                    .removeClass("ui-icon ui-icon-closethick")
                    .addClass($.jgrid.icons.getClass("close"));
                $("#" + $.jgrid.jqID(aIDs.themodal) + ">div.jqResize").removeClass("ui-icon-grip-diagonal-se");
            }
        }
    });

    $.extend($.jgrid.view, {
        beforeShowForm: function ($form) {
            var $dialog = $form.closest(".ui-jqdialog"),
                $iconSpans = $dialog.find("a.fm-button>span.ui-icon");
            $iconSpans.each(function () {
                var $this = $(this), $fmButton = $this.parent();
                if ($this.hasClass("ui-icon-triangle-1-w")) {
                    $this.removeClass("ui-icon ui-icon-triangle-1-w")
                        .addClass($.jgrid.icons.getClass("formPrev"));
                } else if ($this.hasClass("ui-icon-triangle-1-e")) {
                    $this.removeClass("ui-icon ui-icon-triangle-1-e")
                        .addClass($.jgrid.icons.getClass("formNext"));
                } else if ($this.hasClass("ui-icon-close")) {
                    $fmButton.removeClass("fm-button-icon-left")
                        .addClass("fm-button fm-button-icon-right")
                        .html("<span class=\"" + $.jgrid.icons.getClass("close") + "\"></span><span>" + $fmButton.text() + "</span>");
                }

            });
        }
    });

    $.extend($.jgrid.del, {
        afterShowForm: function ($form) {
            var $dialog = $form.closest(".ui-jqdialog"),
                $tdButtons = $dialog.find(".EditTable .DelButton"),
                $fmButtonNew = $("<td class=\"DelButton EditButton\" style=\"float: right;\">"),
                $iconSpans = $tdButtons.find(">a.fm-button>span.ui-icon");

            $tdButtons.css("float", "right");
            $iconSpans.each(function () {
                var $this = $(this), $fmButton = $this.parent();
                if ($this.hasClass("ui-icon-scissors")) {
                    $fmButton.html("<span class=\"" + $.jgrid.icons.getClass("formDel") + "\"></span><span>" + $fmButton.text() + "</span>");
                    $fmButtonNew.append($fmButton);
                } else if ($this.hasClass("ui-icon-cancel")) {
                    $fmButton.html("<span class=\"" + $.jgrid.icons.getClass("formUndo") + "\"></span><span>" + $fmButton.text() + "</span>");
                    $fmButtonNew.append($fmButton);
                }
            });
            if ($fmButtonNew.children().length > 0) {
                // remove &nbsp; between buttons
                $tdButtons.replaceWith($fmButtonNew);
            }
        }
    });

    $.jgrid.extend({
        initFontAwesome: function () {
            return this.each(function () {
                var $grid = $(this);
                $grid.bind("jqGridFilterAfterShow", function (e, $form) {
                    // an alternative to afterShowSearch
                    var $dialog = $form.closest(".ui-jqdialog"),
                        $iconSpans = $dialog.find("a.fm-button>span.ui-icon");
                    $iconSpans.each(function () {
                        var $this = $(this), $fmButton = $this.parent();
                        $this.removeClass("ui-icon");
                        if ($this.hasClass("ui-icon-search")) {
                            $this.closest(".EditButton").css("float", "right");
                            $fmButton.addClass("fm-button fm-button-icon-right")
                                .html("<span class=\"" + $.jgrid.icons.getClass("searchSearch") + "\"></span><span>" + $fmButton.text() + "</span>");
                        } else if ($this.hasClass("ui-icon-arrowreturnthick-1-w")) {
                            $this.closest(".EditButton").css("float", "left");
                            $fmButton.addClass("fm-button fm-button-icon-left")
                                .html("<span class=\"" + $.jgrid.icons.getClass("searchReset") + "\"></span><span>" + $fmButton.text() + "</span>");
                        } else if ($this.hasClass("ui-icon-comment")) {
                            $this.closest(".EditButton").css("float", "right");
                            $fmButton.addClass("fm-button fm-button-icon-right")
                                .html("<span class=\"" + $.jgrid.icons.getClass("searchQuery") + "\"></span><span>" + $fmButton.text() + "</span>");
                        }
                    });
                }).bind("jqGridAddEditBeforeShowForm", function (e, $form) {
                    // alternative to beforeShowForm callback
                    var $dialog = $form.closest(".ui-jqdialog"),
                        $iconSpans = $dialog.find("a.fm-button>span.ui-icon");
                    $iconSpans.each(function () {
                        var $this = $(this), $fmButton = $this.parent();
                        if ($this.hasClass("ui-icon-triangle-1-w")) {
                            $this.removeClass("ui-icon ui-icon-triangle-1-w")
                                .addClass($.jgrid.icons.getClass("formPrev"));
                        } else if ($this.hasClass("ui-icon-triangle-1-e")) {
                            $this.removeClass("ui-icon ui-icon-triangle-1-e")
                                .addClass($.jgrid.icons.getClass("formNext"));
                        } else if ($this.hasClass("ui-icon-disk")) {
                            //$this.closest(".EditButton").css("float", "right");
                            if ($fmButton.hasClass("fm-button-icon-right")) {
                                $fmButton.html("<span>" + $fmButton.text() + "</span><span class=\"" + $.jgrid.icons.getClass("formSave") + "\"></span>");
                            } else {
                                $fmButton.html("<span>" + $fmButton.text() + "</span><span class=\"" + $.jgrid.icons.getClass("formSave") + "\"></span>");
                            }
                        } else if ($this.hasClass("ui-icon-close")) {
                            //$this.closest(".EditButton").css("float", "right");
                            if ($fmButton.hasClass("fm-button-icon-right")) {
                                $fmButton.html("<span>" + $fmButton.text() + "</span><span class=\"" + $.jgrid.icons.getClass("formUndo") + "\"></span>");
                            } else {
                                $fmButton.html("<span>" + $fmButton.text() + "</span><span class=\"" + $.jgrid.icons.getClass("formUndo") + "\"></span>");
                            }
                        }

                    });
                }).bind("jqGridHeaderClick", function (e, gridstate) {
                    var $icon;
                    if (this.p.fontAwesomeIcons) {
                        $icon = $(this).closest(".ui-jqgrid").find(".ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span");
                        if (gridstate === "visible") {
                            $icon.removeClass("ui-icon ui-icon-circle-triangle-n ui-icon-circle-triangle-s " + $.jgrid.icons.getClass("titleHiddenGrid"))
                                .addClass($.jgrid.icons.getClass("titleVisibleGrid")).parent().addClass($.jgrid.icons.getClass("titleIcon"));
                        } else if (gridstate === "hidden") {
                            $icon.removeClass("ui-icon ui-icon-circle-triangle-n ui-icon-circle-triangle-s " + $.jgrid.icons.getClass("titleVisibleGrid"))
                                .addClass($.jgrid.icons.getClass("titleHiddenGrid")).parent().addClass($.jgrid.icons.getClass("titleIcon"));
                        }
                    }
                }).bind("jqGridInitGrid", function () {
                    var $this = $(this), $pager, $sortables;

                    if (this.p.fontAwesomeIcons) {
                        $pager = $this.closest(".ui-jqgrid").find(".ui-pg-table");
                        $pager.find(".ui-pg-button>span.ui-icon-seek-first")
                            .removeClass("ui-icon ui-icon-seek-first")
                            .addClass($.jgrid.icons.getClass("pagerFirst"));
                        $pager.find(".ui-pg-button>span.ui-icon-seek-prev")
                            .removeClass("ui-icon ui-icon-seek-prev")
                            .addClass($.jgrid.icons.getClass("pagerPrev"));
                        $pager.find(".ui-pg-button>span.ui-icon-seek-next")
                            .removeClass("ui-icon ui-icon-seek-next")
                            .addClass($.jgrid.icons.getClass("pagerNext"));
                        $pager.find(".ui-pg-button>span.ui-icon-seek-end")
                            .removeClass("ui-icon ui-icon-seek-end")
                            .addClass($.jgrid.icons.getClass("pagerLast"));

                        $this.closest(".ui-jqgrid")
                            .find(".ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>.ui-icon-circle-triangle-n")
                            .removeClass("ui-icon ui-icon-circle-triangle-n")
                            .addClass($.jgrid.icons.getClass("titleVisibleGrid")).parent().addClass("ui-corner-all " + $.jgrid.icons.getClass("titleIcon"));

                        $sortables = $this.closest(".ui-jqgrid")
                                .find(".ui-jqgrid-htable .ui-jqgrid-labels .ui-jqgrid-sortable span.s-ico");
                        $sortables.find(">span.ui-icon-triangle-1-s")
                            .removeClass("ui-icon ui-icon-triangle-1-s")
                            .addClass($.jgrid.icons.getClass("sortAsc"));
                        $sortables.find(">span.ui-icon-triangle-1-n")
                            .removeClass("ui-icon ui-icon-triangle-1-n")
                            .addClass($.jgrid.icons.getClass("sortDesc"));
                    }
                });
            });
        }
    });
}(jQuery));
