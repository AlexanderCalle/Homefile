const realFileBtn = document.getElementById("file");
const fileTxt = document.getElementById("fileTxt")

realFileBtn.addEventListener('change', function() {
    if(realFileBtn.value) {
        fileTxt.innerHTML = realFileBtn.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
    } else {
        fileTxt.innerHTML = "No file chosen..."
    }
})