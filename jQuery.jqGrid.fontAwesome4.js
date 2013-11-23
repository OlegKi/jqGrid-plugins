/**
 * Copyright (c) 2013, Oleg Kiriljuk, oleg.kiriljuk@ok-soft-gmbh.com
 * Dual licensed under the MIT and GPL licenses
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl-2.0.html
 * Date: 2013-11-23
 * see http://stackoverflow.com/q/20151921/315935 for more details
 */
/*global $ */
(function ($) {
    "use strict";
    /*jslint unparam: true */
    $.extend($.jgrid, {
        icons: {
            common: "fa",
            scale: "", // fa-lg
            titleVisibleGrid: "fa fa-arrow-circle-up",
            titleHiddenGrid: "fa fa-arrow-circle-down",
            titleIcon: "ui-corner-all fa-title",
            close: "fa fa-times",
            edit: "fa fa-pencil fa-fw",
            add: "fa fa-plus fa-fw",
            del: "fa fa-trash-o fa-fw",
            search: "fa fa-search fa-fw",
            refresh: "fa fa-refresh fa-fw",
            view: "fa fa-file-o fa-fw",
            pager: {
                first: "fa fa-step-backward fa-fw",
                prev: "fa fa-backward fa-fw",
                next: "fa fa-forward fa-fw",
                last: "fa fa-step-forward fa-fw"
            },
            form: {
                prev: "fa fa-caret-left",
                next: "fa fa-caret-right",
                save: "fa fa-floppy-o",
                undo: "fa fa-undo",
                close: "fa fa-times",
                delete: "fa fa-trash-o"
            },
            searchForm: {
                reset: "fa fa-undo",
                query: "fa fa-comments-o",
                search: "fa fa-search"
            }
        }
    });

    $.extend($.jgrid.nav, {
        editicon: $.jgrid.icons.edit,
        addicon: $.jgrid.icons.add,
        delicon: $.jgrid.icons.del,
        searchicon: $.jgrid.icons.search,
        refreshicon: $.jgrid.icons.refresh,
        viewicon: $.jgrid.icons.view
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
                    .addClass($.jgrid.icons.close);
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
                        .addClass($.jgrid.icons.form.prev);
                } else if ($this.hasClass("ui-icon-triangle-1-e")) {
                    $this.removeClass("ui-icon ui-icon-triangle-1-e")
                        .addClass($.jgrid.icons.form.next);
                } else if ($this.hasClass("ui-icon-close")) {
                    $fmButton.removeClass("fm-button-icon-left")
                        .addClass("fm-button-icon-right")
                        .html("<span class=\"" + $.jgrid.icons.form.close + "\"></span><span>" + $fmButton.text() + "</span>");
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
                    $fmButton.html("<span class=\"" + $.jgrid.icons.form.delete + "\"></span><span>" + $fmButton.text() + "</span>");
                    $fmButtonNew.append($fmButton);
                } else if ($this.hasClass("ui-icon-cancel")) {
                    $fmButton.html("<span class=\"" + $.jgrid.icons.form.undo + "\"></span><span>" + $fmButton.text() + "</span>");
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
                            $fmButton.addClass("fm-button-icon-right")
                                .html("<span class=\"" + $.jgrid.icons.searchForm.search + "\"></span><span>" + $fmButton.text() + "</span>");
                        } else if ($this.hasClass("ui-icon-arrowreturnthick-1-w")) {
                            $this.closest(".EditButton").css("float", "left");
                            $fmButton.addClass("fm-button-icon-left")
                                .html("<span class=\"" + $.jgrid.icons.searchForm.reset + "\"></span><span>" + $fmButton.text() + "</span>");
                        } else if ($this.hasClass("ui-icon-comment")) {
                            $this.closest(".EditButton").css("float", "right");
                            $fmButton.addClass("fm-button-icon-right")
                                .html("<span class=\"" + $.jgrid.icons.searchForm.query + "\"></span><span>" + $fmButton.text() + "</span>");
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
                                .addClass($.jgrid.icons.form.prev);
                        } else if ($this.hasClass("ui-icon-triangle-1-e")) {
                            $this.removeClass("ui-icon ui-icon-triangle-1-e")
                                .addClass($.jgrid.icons.form.next);
                        } else if ($this.hasClass("ui-icon-disk")) {
                            $this.closest(".EditButton").css("float", "right");
                            $fmButton.html("<span class=\"" + $.jgrid.icons.form.save + "\"></span><span>" + $fmButton.text() + "</span>");
                        } else if ($this.hasClass("ui-icon-close")) {
                            $this.closest(".EditButton").css("float", "right");
                            $fmButton.removeClass("fm-button-icon-left")
                                .addClass("fm-button-icon-right")
                                .html("<span class=\"" + $.jgrid.icons.form.undo + "\"></span><span>" + $fmButton.text() + "</span>");
                        }

                    });
                }).bind("jqGridHeaderClick", function (e, gridstate) {
                    var $icon;
                    if (this.p.fontAwesomeIcons) {
                        $icon = $(this).closest(".ui-jqgrid").find(".ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span");
                        if (gridstate === "visible") {
                            $icon.removeClass("ui-icon ui-icon-circle-triangle-n fa-arrow-circle-down")
                                .addClass($.jgrid.icons.titleVisibleGrid).parent().addClass($.jgrid.icons.titleIcon);
                        } else if (gridstate === "hidden") {
                            $icon.removeClass("ui-icon ui-icon-circle-triangle-n fa-arrow-circle-up")
                                .addClass($.jgrid.icons.titleHiddenGrid).parent().addClass($.jgrid.icons.titleIcon);
                        }
                    }
                }).bind("jqGridInitGrid", function () {
                    var $this = $(this), $pager, $sortables;

                    if (this.p.fontAwesomeIcons) {
                        $pager = $this.closest(".ui-jqgrid").find(".ui-pg-table");
                        $pager.find(".ui-pg-button>span.ui-icon-seek-first")
                            .removeClass("ui-icon ui-icon-seek-first")
                            .addClass($.jgrid.icons.pager.first);
                        $pager.find(".ui-pg-button>span.ui-icon-seek-prev")
                            .removeClass("ui-icon ui-icon-seek-prev")
                            .addClass($.jgrid.icons.pager.prev);
                        $pager.find(".ui-pg-button>span.ui-icon-seek-next")
                            .removeClass("ui-icon ui-icon-seek-next")
                            .addClass($.jgrid.icons.pager.next);
                        $pager.find(".ui-pg-button>span.ui-icon-seek-end")
                            .removeClass("ui-icon ui-icon-seek-end")
                            .addClass($.jgrid.icons.pager.last);

                        $this.closest(".ui-jqgrid")
                            .find(".ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>.ui-icon-circle-triangle-n")
                            .removeClass("ui-icon ui-icon-circle-triangle-n")
                            .addClass("fa fa-arrow-circle-up").parent().addClass("ui-corner-all fa-title");

                        $sortables = $this.closest(".ui-jqgrid")
                                .find(".ui-jqgrid-htable .ui-jqgrid-labels .ui-jqgrid-sortable span.s-ico");
                        $sortables.find(">span.ui-icon-triangle-1-s")
                            .removeClass("ui-icon ui-icon-triangle-1-s")
                            .addClass("fa fa-sort-asc fa-lg");
                        $sortables.find(">span.ui-icon-triangle-1-n")
                            .removeClass("ui-icon ui-icon-triangle-1-n")
                            .addClass("fa fa-sort-desc fa-lg");
                    }
                });
            });
        }
    });
}(jQuery));
