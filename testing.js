function openNav() {
    document.getElementById("full_page_nav").style.display = "block";
}

function closeNav() {
    document.getElementById("full_page_nav").style.display = "none";
}

$(window).scroll(function () {
    var scrollTop = $(window).scrollTop();
    var height = $(window).height();

    $('.name').css({
        'opacity': ((height - scrollTop) / (height))
    });
});