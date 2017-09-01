export function notify(a, b, c, d) {
    function e(a) {
        var b = $("<div class='toast'></div>").addClass(c).html(a);
        return b.hammer({prevent_default: !1}).bind("pan", function(a) {
            var c = a.gesture.deltaX, d = 80;
            b.hasClass("panning") || b.addClass("panning");
            var e = 1 - Math.abs(c / d);
            0 > e && (e = 0), b.velocity({left: c,opacity: e}, {duration: 50,queue: !1,easing: "easeOutQuad"})
        }).bind("panend", function(a) {
            var c = a.gesture.deltaX, e = 80;
            Math.abs(c) > e ? b.velocity({marginTop: "-40px"}, {duration: 375,easing: "easeOutExpo",queue: !1,complete: function() {
                    "function" == typeof d && d(), b.remove()
                }}) : (b.removeClass("panning"), b.velocity({left: 0,opacity: 1}, {duration: 300,easing: "easeOutExpo",queue: !1}))
        }), b
    }
    if (c = c || "", 0 == $("#toast-container").length) {
        var f = $("<div></div>").attr("id", "toast-container");
        $("body").append(f)
    }
    var f = $("#toast-container"), g = e(a);
    f.append(g), g.css({top: parseFloat(g.css("top")) + 35 + "px",opacity: 0}), g.velocity({top: "0px",opacity: 1}, {duration: 300,easing: "easeOutCubic",queue: !1});
    var h = b, i = setInterval(function() {
        0 === g.parent().length && window.clearInterval(i), g.hasClass("panning") || (h -= 100), 0 >= h && (g.velocity({opacity: 0,marginTop: "-40px"}, {duration: 375,easing: "easeOutExpo",queue: !1,complete: function() {
                "function" == typeof d && d(), $(this).remove()
            }}), window.clearInterval(i))
    }, 100)
}