let playbtn = document.getElementById("playbtn");

playbtn.addEventListener("click",function(event){
    event.preventDefault();

    console.log("Play button clicked");


    window.location.href = "mode.html";
})