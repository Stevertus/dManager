import { Injectable } from '@angular/core';
import {HttpService} from './http.service'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalComponent} from '../modal/modal.component'
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote, shell } from 'electron';
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

  constructor(private server: HttpService,private modalService: NgbModal) {
    // Conditional imports
    if (this.isElectron()) {
    this.ipcRenderer = window.require('electron').ipcRenderer;
    this.webFrame = window.require('electron').webFrame;
    this.remote = window.require('electron').remote;
    this.shell = window.require('electron').shell;

    this.childProcess = window.require('child_process');
    this.fs = window.require('fs');
  }
}
isElectron(){
  return window && window.process && window.process.type;
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
saveMc(url,file){
  let promise = new Promise((resolve, reject) => {
    url = localStorage.getItem('mcFolder') + url
    this.fs.writeFile(url, file, (err) => {
      if(err) reject(err)
      else resolve(url)
    })
  })
  return promise
}
isUptoDate(){
  return this.server.getTextFile('/downloads/dManager version.txt')
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
  this.saveMc("/saves/" + world + "/datapacks/.datapacks",JSON.stringify(content)).then(res => {
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
        this.openModal("The pack " + pack.id + " is relying on these other datapacks: "+pack.dependencies.join(", ")+". \n Should these be installed too?",{color:"success",t:"Yes"},{color:"warning",t:"No"}).then(option => {
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
    this.server.addDownload('dM-' + pack.id).subscribe(res => {})
    this.server.getFile(pack.files[version]).then((getFile:any) => {
      let self = this
      toBuffer(getFile.file, (err, buffer) => {
        if (err) throw err
        let file = buffer
        let filename = getFile.url.split("/").slice(-1).toString()
        filename = filename.split('?').slice(0,1).toString()
        filename = filename.replace(/%20/g," ")
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
          installed.file = pack.files[version].split("/").slice(-1)
          this.updateLogFile(this.installedDatapacks[world],world)
        } else {
          if(!this.installedDatapacks[world]) this.installedDatapacks[world] = []
          this.installedDatapacks[world].push({id: pack.id, version: version, file: filename, title: pack.title})
          this.updateLogFile(this.installedDatapacks[world],world)
        }
        if(pack.type == "resourcepack"){
          this.openModal("Do you want to install the resourcepack " + pack.id + " in Resources.zip inside your world(a current resource could be overwritten) or do you want to install it to your resourcepack folder?",{color:"success",t:"Into world"},{color:"info",t:"As Resourcepack"}).then(option => {
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
              installed.file = "/resourcepacks/" + pack.files[version].split("/").slice(-1)
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
  })
  return promise
}
removePack(pack,world){
  let promise = new Promise((resolve, reject) => {
    this.openModal("Do you really want to remove " + pack.title + "?",{color:"danger",t:"Yes"},{color:"info",t:"Cancel"}).then(option => {
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
