var electron = require('electron');
document.addEventListener("keydown", function(e) {
  if(e.which === 123){
    electron.remote.getCurrentWindow().toggleDevTools()
  }
  if(e.which === 116){
    location.reload()
  }
})
