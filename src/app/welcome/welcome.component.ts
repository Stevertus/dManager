import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../providers/electron.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  constructor(private electronService: ElectronService) { }
  welcome = `
    Hello and welcome to dManager, the datapack installer and updater.<br>
    The usage is simple: Select a world on the left and install datapacks from the given list.<br><br>
  `
  ngOnInit() {
    if(sessionStorage.getItem('home-page') == "no-worlds"){
      this.welcome += 'Sorry, but no worlds were found! Please check if you put the executeable into the .minecraft folder or select a minecraft folder: '
      sessionStorage.removeItem('home-page')
    } else {
      this.welcome += 'You can also open a different Minecraft folder: <br>'
    }
  }
  selectPath(){
    this.electronService.remote.dialog.showOpenDialog({title: 'Please select your .minecraft folder', properties: ['openDirectory']},(folder) => {
      localStorage.setItem('mcFolder',folder[0])
      this.electronService.remote.getCurrentWindow().reload()
    })
  }
}
