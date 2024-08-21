window.addEventListener('DOMContentLoaded', function () {
    const nininotext = document.getElementsByClassName('pt_typo_text')[0];
    const textwidth = document.getElementsByClassName('pt_typo_width')[0];

    textwidth.innerText = nininotext.offsetWidth + "px";
});