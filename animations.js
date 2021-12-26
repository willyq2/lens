var modal = document.getElementById("myModal");
var modalImg = document.getElementById("img");

function enlarge(myImg) {
    var img = document.getElementById("myImg");

    modal.style.display = "flex";
    modalImg.src = document.getElementById(myImg).src;
    captionText.innerHTML = this.id;
}

modalImg.onclick = function() {
    modal.style.display = "none";
}