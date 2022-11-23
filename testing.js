function openNav() {
    document.getElementById("full_page_nav").style.display = "flex";
}

function closeNav() {
    document.getElementById("full_page_nav").style.display = "none";
}

function hide(el) {
    el.style.visibility = 'hidden';
    return el;
}

function show(el) {
    el.style.visibility = 'visible';
    return el;
}

$(document).ready(function () {

    $(window).scroll(function () {

        if ($(window).width() > $(window).height()) {

            var scrollTop = $(window).scrollTop();
            var height = $(window).height();

            var opacity = (height - scrollTop) / (height);

            $('.name').css({
                'opacity': opacity
            });

            if (opacity <= 0) {
                hide($(".name")[0]);
                hide($(".name")[1]);
            }
            if (opacity > 0) {
                show($(".name")[0]);
                show($(".name")[1]);
            }
        }
        else {
            $('.name').css({
                'opacity': 1
            });
        }

    });

    $(window).resize(function() {
        if ($(window).width() < $(window).height()) {
            $('.name').css({
                'opacity': 1
            });

            $(".name").show();
        }
    });

});