import { Component, OnInit } from '@angular/core';
import {HttpService} from '../providers/http.service'
import { ElectronService } from '../providers/electron.service';
import {Router, ActivatedRoute } from '@angular/router'
//import * as electron from 'electron'
@Component({
  selector: 'app-pack-list',
  templateUrl: './pack-list.component.html',
  styleUrls: ['./pack-list.component.scss']
})
export class PackListComponent implements OnInit {

  constructor(private server: HttpService,public electronService: ElectronService, private route: ActivatedRoute) {
    var app = electronService.remote.app;
  console.log(app.getAppPath());
  }
  datapacks: any
  allPacks: any
  installedDatapacks: any = []
  worldName = ""
  async ngOnInit() {
    try {
      this.allPacks = await this.server.getPackets()
    } catch(err){
      console.log(err)
    }
    this.route.params.subscribe(params => {
      this.worldName = params.name
      this.electronService.getInstalledPacks(this.worldName).then((res: any) => {
        this.installedDatapacks = res
        let worldPacks
        if(!this.allPacks){
          this.allPacks = res.map(x => {
            return {title: x.title, status: 'installed', offline: true, type: "datapack"}
          })
          worldPacks = this.allPacks
        } else {
          worldPacks = this.allPacks.slice(0).map(x => {
            delete x.status
            return x
          })
        }
        for(let installed of this.installedDatapacks){
          // pack von websource
          let pack = worldPacks.find(x => x.id == installed.id)
          console.log(pack)
          if(pack){
          if(pack.version == installed.version) pack.status = "installed"
          else pack.status = "update"
          }
        }
        this.datapacks = [
          {name:"Installed",packs:worldPacks.filter(x=> x.status == "installed" || x.status == "update")},
          {name:"Datapacks",packs:worldPacks.filter(x=> !x.status && x.type == "datapack")},
          {name:"Resourcepacks",packs:worldPacks.filter(x=> !x.status && x.type == "resourcepack")}]
        worldPacks = []
        console.log(this.datapacks)
      })
    })
  }

  install(pack,index){
    pack.status = "installing"
    this.electronService.installPack(pack,this.worldName).then((res:any) => {
      pack.status = "installed"
      if(!res.updated){
        if(pack.type == "datapack") this.datapacks[1].packs.splice(this.datapacks[1].packs.indexOf(pack),1)
        else if(pack.type == "resourcepack") this.datapacks[2].packs.splice(this.datapacks[2].packs.indexOf(pack),1)
        this.datapacks[0].packs.unshift(pack)
      }
      if(res.dependencies){
        for(let depend of res.dependencies){
          let newpack = this.datapacks[1].packs.find(x => x.id === depend)
          newpack.status = "installed"
          this.datapacks[0].packs.unshift(newpack)
          if(pack.type == "datapack") this.datapacks[1].packs.splice(this.datapacks[1].packs.indexOf(newpack),1)
          else if(pack.type == "resourcepack") this.datapacks[2].packs.splice(this.datapacks[2].packs.indexOf(newpack),1)
        }
      }

    })
  }
  uninstall(pack,index){

    this.electronService.removePack(pack,this.worldName).then(res => {
      pack.status = ""
      this.datapacks[0].packs.splice(index,1)
      if(pack.type == "datapack") this.datapacks[1].packs.unshift(pack)
      else if(pack.type == "resourcepack") this.datapacks[2].packs.unshift(pack)

    })
  }
  getPageLink(pack){
    let version = this.installedDatapacks.find(x => x.id === pack.id)
    let res = 'pack/' + pack.id + '/' + pack.status + '/'
    if(version) res += version.version
    else res += "-1"
    return res
  }
}
