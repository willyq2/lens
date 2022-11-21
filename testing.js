function openNav() {
    document.getElementById("full_page_nav").style.display = "block";
}

function closeNav() {
    document.getElementById("full_page_nav").style.display = "none";
}

var lastScrollTop = 0;

$(window).scroll(function () {
    var st = $(this).scrollTop();
    if (st < lastScrollTop){
            $('.name').FadeOut();
    } else {
        $('.name').FadeIn();
    }
    lastScrollTop = st;
})