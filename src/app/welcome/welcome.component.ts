import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../providers/electron.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  constructor(private electronService: ElectronService) { }
  welcome
  ngOnInit() {
    if(sessionStorage.getItem('home-page') == "no-worlds"){
      this.welcome = 'no-worlds-found'
      sessionStorage.removeItem('home-page')
    } else {
      this.welcome = 'select-folder-text'
    }
  }
  selectPath(){
    this.electronService.remote.dialog.showOpenDialog({title: 'Please select your .minecraft folder', properties: ['openDirectory']},(folder) => {
      localStorage.setItem('mcFolder',folder[0])
      this.electronService.remote.getCurrentWindow().reload()
    })
  }
}
