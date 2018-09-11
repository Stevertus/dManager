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
  selectedVersion = "detail.choose-older"
  packId: any
  status = ""
  playvideo
  pack: any
  installed:any
  version: any
  desc:string = "The creator didn´t provide a description."
  objectKeys = Object.keys
  alreadyRated:number
  isLoading = false
  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.worldName = params.name
      this.packId = params.id
      this.server.addStat(this.packId,'view')
      this.isLoading = true
      this.server.getFullPack(this.packId).then(res => {
        this.isLoading = false
        if(res && res.success){
          console.log(res)
          this.pack = res.pack
          if(res.editable) this.pack.editable = true
          this.desc = res.pack.description
        }
      }).catch(err => this.isLoading = false)
      this.electronService.getInstalledPacks(this.worldName).then((res: any) => {
        let p = res.find(x => x.id == this.packId)
        console.log(p)
        if(p) this.installed = p.version
        if(p) this.selectedVersion = p.version
      })
    })
    if(localStorage.getItem('dm-ratings')){
      this.alreadyRated = JSON.parse(localStorage.getItem('dm-ratings'))[this.packId]
    }
  }
  getButtonState(){
    if(this.status == 'installing') return -1
        let selectedVersion = this.selectedVersion
        if(selectedVersion == "detail.choose-older") selectedVersion = this.pack.version
        if(this.installed && this.installed == selectedVersion) return 4
    if(this.installed && this.pack.files.indexOf(selectedVersion) < this.pack.files.indexOf(this.installed)) return 2
    if(this.pack.files.indexOf(selectedVersion) == 0) return 0
    if(this.installed && this.pack.files.indexOf(selectedVersion) > this.pack.files.indexOf(this.installed)) return 3

    return 1
  }
  selectVersion(v){
    if(v == -1) this.selectedVersion = "detail.choose-older"
    else this.selectedVersion = v
  }
  install(pack){
    this.status = "installing"
    let version = ""
    if(this.selectedVersion != "detail.choose-older") version = this.selectedVersion
    this.electronService.installPack(pack,this.worldName,version).then((res:any) => {
      this.status = "installed"
      if(version){
        this.selectedVersion = version
        this.version = version
        this.installed = version
      } else {
        this.selectedVersion = "detail.choose-older"
        this.version = pack.version
        this.installed = this.pack.files[0]
      }

    })
  }
  onRate(e){
    let rate:any = {rating:e}
    let ratings = {}
    if(localStorage.getItem('dm-ratings')){
      ratings = JSON.parse(localStorage.getItem('dm-ratings'))
    }
    ratings[this.packId] = e
    if(this.alreadyRated){
      rate.rating = e - this.alreadyRated
      rate.rated = true
    }
    console.log(rate)
    this.alreadyRated = e
    this.server.addStat(this.packId,'rating',rate).then(res => {
      console.log(res)
      if(!this.alreadyRated) this.pack.stats.totalRaters = this.pack.stats.totalRaters ? this.pack.stats.totalRaters + 1 : 1
      this.pack.stats.ratingPoints = this.pack.stats.ratingPoints ? this.pack.stats.ratingPoints + rate.rating : e
      localStorage.setItem('dm-ratings',JSON.stringify(ratings))
    })
  }
  getRating(){
    return  Math.round(this.pack.stats.ratingPoints / (this.pack.stats.totalRaters / 2)) / 2
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
