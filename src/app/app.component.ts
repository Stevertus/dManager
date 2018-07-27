import { Component, OnInit } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { AppConfig } from './app.config';
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  worlds: any = []
  noWorlds = false
  selectedWorld = -1
  constructor(public electronService: ElectronService,private router: Router) {

    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      if(!localStorage.getItem('mcFolder')){
        let path: any
        path = this.electronService.remote.app.getPath('appData') + '/.minecraft'
        console.log(path)
        if(!this.electronService.fs.existsSync(path)) path = ""
        if(!path){
          this.electronService.remote.app.getAppPath().split("/")
          if(path.length == 1) path = path[0].split("\\")
          let index = path.indexOf(".minecraft")
          if(index != -1){
            path = path.slice(0,index + 1)
          }
          path = path.join("/")
        }
        localStorage.setItem('mcFolder',path)
        console.log("detected " + path + " as minecraft folder")
      }
    } else {
      console.log('Mode web');
    }
  }
  ngOnInit(){
    this.getWorlds()
  }
  getWorlds(){
    this.electronService.fs.readdir(localStorage.getItem('mcFolder') + "/saves",(err,res) => {
      if(res) this.worlds = res.filter(x => this.electronService.fs.existsSync(localStorage.getItem('mcFolder') + "/saves/" + x + "/level.dat"))
      if(err || !this.worlds.length){
        if(err) console.error(err)
        console.log("No worlds loaded for path " + localStorage.getItem('mcFolder') + "/saves")
        sessionStorage.setItem('home-page','no-worlds')
        this.router.navigate([''])
        this.noWorlds = true
      } else {
        for(let world of this.worlds){
          let path = localStorage.getItem('mcFolder') + "/saves/" + world + "/icon.png"
          this.worlds[this.worlds.indexOf(world)] = {name: world}
          if(this.electronService.fs.existsSync(path)){
            this.electronService.fs.readFile(path,{},(err,file:any) => {
              let img: any = new Buffer(file, 'binary')
              img = img.toString('base64');

              this.worlds.find(x => x.name === world).icon = `data:image/png;base64,${img}`
            })
          }
        }
      }
    })
  }
  onSelectWorld(world,i){
    this.selectedWorld = i
  }
}
