import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../providers/electron.service';
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  showMenu
  version = ""
  translators = {
    "German": "Stevertus",
    "Spanish": "Javier107",
    "Russian": "1LotS",
    "French": "Paul, Simon511000",
    "Portuguese": "RagnarPT",
    "Danish": "Seba244c, Momento",
    "Dutch": "Wout1200, alexcubed"
  }
  getKeys(m){
    return Object.keys(m)
  }
  toggleMenu(){
    this.showMenu = this.showMenu ? false : true
  }
  constructor(public electronService: ElectronService) { }

  ngOnInit() {
    console.log(this.electronService.remote.app.getVersion())
    this.version = this.electronService.remote.app.getVersion()
  }

}
