import { Component, OnInit } from '@angular/core';
import {HttpService} from '../providers/http.service'
import { ElectronService } from '../providers/electron.service';
import {Router, ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-pack-page',
  templateUrl: './pack-page.component.html',
  styleUrls: ['./pack-page.component.scss']//,'./markdown-styles.scss']
})
export class PackPageComponent implements OnInit {

  constructor(private server: HttpService,public electronService: ElectronService, private route: ActivatedRoute) { }
  worldName = ""
  selectedVersion = "Choose an older version"
  packId: any
  status = ""
  playvideo
  pack: any
  version: any
  desc:string = "The creator didn´t provide a description."
  objectKeys = Object.keys
  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.worldName = params.name
      this.packId = params.id
      this.server.addView('dM-' + this.packId).subscribe(res=>{console.log(res)})
      if(params.status && params.status != "undefined") this.status = params.status
      if(params.version && params.version != -1){
        this.version = params.version
        this.selectedVersion = params.version
      }
      console.log(params)
        this.server.getPackets().then((all: any) => {
          this.pack = all.find(x => x.id === this.packId)
          console.log(this.pack.description)
          this.server.getTextFile(this.pack.description).then((res: string) => {
            this.desc = res
          })
        }).catch(err => {
          console.log(err)
        })
    })
  }
  selectVersion(v){
    if(v == -1) this.selectedVersion = "Choose an older version"
    else this.selectedVersion = v
  }
  install(pack){
    this.status = "installing"
    let version = ""
    if(this.selectedVersion != "Choose an older version") version = this.selectedVersion
    this.electronService.installPack(pack,this.worldName,version).then((res:any) => {
      this.status = "installed"
      if(version){
        this.selectedVersion = version
        this.version = version
      } else {
        this.selectedVersion = "Choose an older version"
        this.version = pack.version
      }

    })
  }
  uninstall(pack){

    this.electronService.removePack(pack,this.worldName).then(res => {
      console.log(res)
      this.status = ""
      this.version = ""
      this.selectedVersion = "Choose an older version"
    })
  }
  openInBrowser(link){
    console.log(link)
    this.electronService.shell.openExternal(link)
  }
}
