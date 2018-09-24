import { Injectable } from '@angular/core';
import {HttpService} from './http.service'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslateService} from '@ngx-translate/core'
import {ModalComponent} from '../modal/modal.component'
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote, shell, autoUpdater } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as toBuffer from 'blob-to-buffer';

@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  shell: typeof shell;
  childProcess: typeof childProcess;
  fs: typeof fs;
  autoUpdater: typeof autoUpdater;

  constructor(private server: HttpService,private modalService: NgbModal,private translate:TranslateService) {
    // Conditional imports
    if (this.isElectron()) {
    this.ipcRenderer = window.require('electron').ipcRenderer;
    this.webFrame = window.require('electron').webFrame;
    this.remote = window.require('electron').remote;
    this.shell = window.require('electron').shell;
    this.autoUpdater = window.require('electron').autoUpdater;

    this.childProcess = window.require('child_process');
    this.fs = window.require('fs');
  }
}
isElectron(){
  return window && window.process && window.process.type;
}
registerStartup(){
  this.server.addStat('t','startup')
}
removeFile(url){
  let promise = new Promise((resolve, reject) => {
    url = localStorage.getItem('mcFolder') + url
    if(!this.fs.existsSync(url)) resolve(url)
    this.fs.unlink(url, (err) => {
      if(err) reject(err)
      else resolve(url)
    })
  })
  return promise
}
openWorld(world){
  this.shell.openExternal('file://' + localStorage.getItem('mcFolder') + '/saves/' + world)
}
saveMc(url,file,encoding = 'base64'){
  let promise = new Promise((resolve, reject) => {
    url = localStorage.getItem('mcFolder') + url
    this.fs.writeFile(url, file,{encoding: encoding}, (err) => {
      if(err) reject(err)
      else resolve(url)
    })
  })
  return promise
}
isUptoDate(){
  return this.server.getTextFile('/cdn/Releases/version.txt')
}
installedDatapacks: any = {}
getInstalledPacks(world){
  let promise = new Promise((resolve, reject) => {
    if(this.fs.existsSync(localStorage.getItem('mcFolder') + "/saves/"+world+"/datapacks/.datapacks")){
      this.fs.readFile(localStorage.getItem('mcFolder') + "/saves/"+world+"/datapacks/.datapacks",'utf8',(err,file: any) => {
        if(err) console.error(err)
        if(file){
          let needupdate = false
          file = JSON.parse(file)
          // loop reversed to remove items
          for(let i = (file.length - 1); i >= 0 ; i--){
          let pack: any = file[i]
          let path: any = "/saves/"+world+"/datapacks/" + pack.file
          if(pack.file.slice(0,1) == "/") path = pack.file
          if(!this.fs.existsSync(localStorage.getItem('mcFolder') + path)){
            needupdate = true
            file.splice(file.indexOf(pack, 1))
          }
        }
        if(needupdate) this.updateLogFile(file,world)
        this.installedDatapacks[world] = file
        resolve(file)
      }
    })
  } else {
    this.installedDatapacks[world] = []
    resolve([])
  }
})
return promise
}
updateLogFile(content,world){
  this.installedDatapacks[world] = content
  this.saveMc("/saves/" + world + "/datapacks/.datapacks",JSON.stringify(content),'').then(res => {
    console.log("Updated log file " + res)
  })
}
installPack(pack,world,version = ""){
  if(!version) version = pack.version
  let promise = new Promise((resolve, reject) => {
    if(pack.dependencies && pack.dependencies.length){
      for(let i = (pack.dependencies.length - 1); i >= 0 ; i--){
        if(this.installedDatapacks && this.installedDatapacks[world]){
          let installed = this.installedDatapacks[world].find(x => x.id === pack.dependencies[i])
          if(installed){
            pack.dependencies.splice(i,1)
          }
        }
      }
      if(pack.dependencies.length){
        this.openModal(this.translate.instant('modal.relying')+' '+pack.dependencies.join(", ")+". \n" + this.translate.instant('modal.install-too'),{color:"success",t:"modal.yes"},{color:"warning",t:"modal.no"}).then(option => {
          this.installPackBack(pack,world,version).then((res:any) => {
            res.dependencies = pack.dependencies
            resolve(res)
          })
          if(option == 1){
            let dependencies = pack.dependencies.map(dep => {
              let online = this.server.getPacketsSync().find(x => x.id === dep)
              return this.installPack(online,world)
            })
            Promise.all(dependencies).then(res => {})
          }
        })
      } else {
        this.installPackBack(pack,world,version).then(res => resolve(res))
      }
    } else {
      this.installPackBack(pack,world,version).then(res => resolve(res))
    }
  })
  return promise
}
installPackBack(pack,world,version){
  let promise = new Promise((resolve, reject) => {
    this.server.downloadVersion(pack.id, version).then((buffer:any) => {
      let self = this
      console.log(buffer.file)
        let file = buffer.file
        let filename = buffer.name
        let update = false
        if(this.installedDatapacks && this.installedDatapacks[world] && this.installedDatapacks[world].find(x => x.id === pack.id)){
          update = true
          let installed = this.installedDatapacks[world].find(x => x.id === pack.id)
          let path = "/saves/" + world + "/datapacks/" + installed.file
          if(installed.file.slice(0,1) == "/"){
            path = installed.file
          }
          this.removeFile(path).then(res => {
            console.log("Deleted " + pack.title + " from " + res)
          })
          installed.version = version
          installed.file = filename
          this.updateLogFile(this.installedDatapacks[world],world)
        } else {
          if(!this.installedDatapacks[world]) this.installedDatapacks[world] = []
          this.installedDatapacks[world].push({id: pack.id, version: version, file: filename, title: pack.title})
          this.updateLogFile(this.installedDatapacks[world],world)
        }
        if(pack.type == "resourcepack"){
          this.openModal(this.translate.instant('modal.resources1') + ' ' + pack.id + + ' ' + this.translate.instant('modal.resources2'),{color:"success",t:"modal.world"},{color:"info",t:"modal.resourcepack"}).then(option => {
            let installed = this.installedDatapacks[world].find(x => x.id === pack.id)
            if(option == 1){
              installed.file = "/saves/" + world + "/resources.zip"
              this.updateLogFile(this.installedDatapacks[world],world)
              this.saveMc("/saves/" + world + "/resources.zip",file).then(res => {
                if(update){
                  console.log("Updated " + pack.title + " to Version " + version + ". Saved " + res)
                } else {
                  console.log("Installed " + pack.title + " to " + res)
                }
                resolve({updated: update, url: res, resourcepack: true})
              })
            }
            if(option == 2){
              installed.file = "/resourcepacks/" + filename
              this.updateLogFile(this.installedDatapacks[world],world)
              this.saveMc("/resourcepacks/" + filename,file).then(res => {
                if(update){
                  console.log("Updated " + pack.title + " to Version " + version + ". Saved " + res)
                } else {
                  console.log("Installed " + pack.title + " to " + res)
                }
                resolve({updated: update, url: res, resourcepack: true})
              })
            }
          })
        } else this.saveMc("/saves/" + world + "/datapacks/" + filename,file).then(res => {
          if(update){
            console.log("Updated " + pack.title + " to Version " + version + ". Saved " + res)
          } else {
            console.log("Installed " + pack.title + " to " + res)
          }
          resolve({updated: update, url: res})
        })
      })
  })
  return promise
}
removePack(pack,world){
  let promise = new Promise((resolve, reject) => {
    this.openModal(this.translate.instant('modal.really-remove') + ' ' + pack.title + "?",{color:"danger",t:"modal.yes"},{color:"info",t:"modal.cancel"}).then(option => {
      if(option == 1){
        let installed = this.installedDatapacks[world].find(x => x.id === pack.id)
        let path = "/saves/" + world + "/datapacks/" + installed.file
        if(installed.file.slice(0,1) == "/"){
          path = installed.file
        }
        console.log(path)
        this.removeFile(path).then(res => {
          this.installedDatapacks[world].splice(this.installedDatapacks[world].indexOf(installed))
          this.updateLogFile(this.installedDatapacks[world],world)
          console.log("Deleted " + pack.title + " from " + res)
          resolve(res)
        })
      } else {
        reject('Canceled by Modal')
      }
    })
  })
  return promise
}
openModal(msg,option1:any = "",option2:any = "") {
  let promise = new Promise((resolve, reject) => {
    const modalRef = this.modalService.open(ModalComponent,{ centered: true })
    modalRef.componentInstance.msg = msg;
    if(option1.color) option1.color = 'btn-hero-' + option1.color;
    if(option2.color) option2.color = 'btn-hero-' + option2.color;
    modalRef.componentInstance.option1 = option1
    modalRef.componentInstance.option2 = option2
    modalRef.result.then((result) => {
      if(result == "option1") resolve(1)
      if(result == "option2") resolve(2)
    }, (reason) => {
      resolve(0)
    });
  })
  return promise
}
}
