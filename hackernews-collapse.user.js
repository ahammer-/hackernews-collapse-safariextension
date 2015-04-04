// ==UserScript==
// @name         Hacker News Collapse
// @namespace    https://github.com/ahammer-
// @version      1.0.1
// @description  Collapse Hacker News comment trees.
// @author       Arthur Hammer
// @match        https://news.ycombinator.com/item*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.4.1/jquery.min.js
// @grant        none
// ==/UserScript==

/**
 * Based on a script by Alexander Kirk (MIT License):
 * http://alexander.kirk.at/2010/02/16/collapsible-threads-for-hacker-news/
 **/

// from: http://stackoverflow.com/a/2117523
function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}


jQuery(function($) {

    var showNumChildComments = true;

    $("body").addClass("collapsible-comments");

    function collapse(e) {
        var $e = $(e.target);
        var el = $e.closest("table");

        var comment = el.find("span.comhead").parent().siblings().not("br");
        var childComments = $("table.parent-" + el.data("comment")).closest("tr");
        var thread = childComments.add(comment);
        var votearrow = comment.closest("td").prev();
        var numChildComments = el.find("span.numchildcomments");

        var visible = childComments.length ? childComments.is(":visible") : comment.is(":visible");

        if (visible) {
            // Expand all child comments before hiding thread
            childComments
                .find("span.collapse")
                    // Collapse label
                    .text("[-]")
                .end()
                .find("span.numchildcomments")
                    // Hide number of child comments
                    .text("")
                .end()
                .find("span.comhead")
                    // Show arrows
                    .parent().siblings().closest("td").prev().css("visibility", "visible")
                .end()
                .find("span.comhead")
                    // Expand comments
                    .parent().siblings().not("br").show()
                .end();

            // Hide thread
            $e.text("[+]");
            thread.hide();
            votearrow.css("visibility", "hidden");

            if (showNumChildComments) {
                numChildComments.text(numChildCommentText);
            }
            else {
                numChildComments.text("");
            }
        }
        else {
            // Show thread
            $e.text("[-]");
            thread.show();
            votearrow.css("visibility", "visible");
            numChildComments.text("");
        }
    }

    var comments = $("body table table").eq(2);
    var parents = [];

    // Prepare comments
    $("table", comments).each(function() {
        var $this = $(this);
        var level = Math.floor($("td img[src*='s.gif']", this)[0].width / 40);

        var comhead = $("span.comhead", this);
        // Prepend collapse icon to comment header
        comhead.prepend(" ", $("<span class='collapse'>[-]</span><span> </span>")
                        .css({cursor: "pointer"})
                        .click(collapse)
                        .hover(function() { this.style.textDecoration = "underline"; },
                               function() { this.style.textDecoration = "none"; }));
        // Append number of comments
        comhead.append(" ", $("<span class='numchildcomments'></span>"))

        // Extract comment IDs
        var commentIDs = $("a[href*=item]", comhead);
        var id = commentIDs[0];

        if (typeof id === 'undefined' || id === null) {
            // Some comments, such as flagged ones, don't have IDs
            id = guid();
        }
        else {
            id = commentIDs[0].href;
            id = id.substr(id.indexOf("=") + 1);
        }

        // Add comment IDs
        $this.addClass("comment-" + id).data("comment", id);

        // Add all parent's IDs to each comment
        parents[level] = id;
        if (level > 0) {
            for (var i = 0; i < level; i++) {
                $this.addClass("parent-" + parents[i]);
            }
        }
    });
});