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
  topPacks = {
  installedPacks:{filter: "installed", title: "filter.installed",display: false, packs: []},
  ownPacks:{filter: "own", title: "filter.own",display: false, packs: []},
  trendPacks: {filter: "trendy", title: "filter.hot-now",display: false, packs: []},
  adminPacks: {filter: "admin", title: "[admin] All open packs right now:",display: false, packs: []}
}
packs: any = []
filterInput:any
isLoading: boolean = false
packsCreator:any

  datapacks: any
  allPacks: any
  installedPacks: any = []
  worldName = ""
  isLoggedIn
  async ngOnInit() {
    this.server.getUserData().subscribe(res => {
      if(res && res.success){
        this.isLoggedIn = 1
        if(res.role == 'staff') this.isLoggedIn = 2
        if(res.role == 'admin') this.isLoggedIn = 3
      }
    })
    this.route.params.subscribe(params => {
      this.worldName = params.name
      console.log("worldname",this.worldName)
      })
      this.installedPacks = undefined
    }
    install(pack,index,packs){
      pack.status = "installing"
      this.electronService.installPack(pack,this.worldName).then((res:any) => {
        pack.status = "installed"
        if(!res.updated){
          this.installedPacks.push(pack)
          this.getInstalledPacks(packs)
        }
        if(res.dependencies){
          for(let depend of res.dependencies){
            let newpack = packs.find(x => x.id === depend)
            newpack.status = "installed"
            if(!res.updated){
              this.installedPacks.push(newpack)
              this.getInstalledPacks(packs)
              this.getInstalledPacks(this.packs)
            }
          }
        }

      })
    }
    getObjectValues(obj){
  return Object.values(obj)
}
    uninstall(pack,index){
      this.electronService.removePack(pack,this.worldName).then(res => {
        pack.status = ""
        this.installedPacks.splice(this.installedPacks.indexOf(pack),1)
        let allpacks = this.packs.find(x => x.id === pack.id)
        if(allpacks) allpacks.status = ""
        let ownpacks = this.topPacks.ownPacks.packs.find(x => x.id === pack.id)
        if(ownpacks) ownpacks.status = ""
        let trendPacks = this.topPacks.trendPacks.packs.find(x => x.id === pack.id)
        if(trendPacks) trendPacks.status = ""
      })
    }
    getInstalledPacks(allPacks,isOffline = false){
      if(this.installedPacks){
        let changes = 0
          let packs = this.installedPacks.map(installed => {
            // pack von websource
            let pack = allPacks.find(x => x.id == installed.id)
            if(isOffline) installed.offline = true
            if(!installed.status) installed.status = "installed"
            if(pack){
              if(pack.version == installed.version) pack.status = "installed"
              else pack.status = "update"
              changes++
              return pack
            }
            return installed
          })
          console.log("installed2",packs)
          if(changes > 0 || allPacks.length == 0){
            this.topPacks.installedPacks.display = true
            this.topPacks.installedPacks.packs = packs
          }
          this.installedPacks = packs
          return allPacks
        } else {
          this.electronService.getInstalledPacks(this.worldName).then((res: any) => {
            this.installedPacks = res
            console.log('installed',res)
            this.getInstalledPacks(allPacks,isOffline)
          })
        }
    }
    filterChange(e){
      this.filterInput = e
      if(e.filter == 'by' && e.search.trim().length){
        this.isLoading = true
        this.packs = []
        this.server.getAllPacks(e.language,'creator:' + e.search.toLowerCase()).then((res:any) => {
          this.isLoading = false
          if(res && res.success){
            if(res.creator.avatar) res.creator.avatar = this.server.getUrl() + 'cdn/' +  res.creator.avatar
            this.packs = res.packs
            this.getInstalledPacks(this.packs)
            this.packsCreator = res.creator
          }
          else {
            this.packs = []
            this.packsCreator = undefined
          }
        })
      }
    }
    filterSettingChange(e){
      this.filterChange(e)
      if(e.changed == 'loading'){
        this.installedPacks = undefined
        this.topPacks.installedPacks.packs = []
      }
      if((e.changed == 'loading' && e.show.own) || (e.changed == 'show' && e.show.own)) this.server.getOwnPacks().subscribe(res => {
        if(res && this.topPacks){
          this.topPacks.ownPacks.display = true
          for(let i = res.length -1; i >= 0; i--){
            let pack = res[i]
            if(pack.id.substr(-7) == ' :edit:') {
              let orign = res.find(x => x.id == pack.id.substr(0,pack.id.length-7))
              if(orign) res.splice(res.indexOf(orign),1)
            }
          }
          this.topPacks.ownPacks.packs = res
          this.getInstalledPacks(this.topPacks.ownPacks.packs)
        }
      })
      if((e.changed == 'show' && !e.show.own)) this.topPacks.ownPacks.display = false
      if((e.changed == 'loading' && e.show.admin) || (e.changed == 'show' && e.show.admin)) this.server.getAdminStates('verifing').subscribe(res => {
        if(res && res.success){
          this.topPacks.adminPacks.display = true
          this.topPacks.adminPacks.packs = res.packs
          this.getInstalledPacks(this.topPacks.adminPacks.packs)
        }
      })
      if((e.changed == 'show' && !e.show.admin)) this.topPacks.ownPacks.display = false
      if((e.changed == 'loading' && e.show.trendy) || (e.changed == 'show' && e.show.trendy)) this.server.getAllPacks(e.language,'top5').then((res:any) => {
        if(res && res.success){
          this.topPacks.trendPacks.display = true
          this.topPacks.trendPacks.packs = res.packs
          this.getInstalledPacks(this.topPacks.trendPacks.packs)
        }
      })
      if((e.changed == 'show' && !e.show.trendy)) this.topPacks.trendPacks.display = false
      if((!this.packs.length && e.changed == 'searchFilterOff') || (!this.packs.length && e.search == '') || (e.changed == 'loading' && !this.packsCreator) || e.changed == 'sort' || e.changed == 'language'){
        this.isLoading = true
        this.server.getAllPacks(e.language,e.sort).then((res:any) => {
          this.isLoading = false
          if(!(e.changed == 'loading' && this.packsCreator)){
            if(res && res.success){
              this.packs = res.packs
              this.getInstalledPacks(this.packs)
            } else this.getInstalledPacks([],true)
            if(this.packsCreator) this.packsCreator = undefined
          }
        })
      }
    }
  }
