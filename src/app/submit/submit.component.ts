import { Component, OnInit, Inject } from '@angular/core';
import {HttpService} from '../providers/http.service'
@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss']
})
export class SubmitComponent implements OnInit {

  constructor(private server: HttpService) { }
  installGuide: string
  showGuide = true
  dependencies: any
  editorOptions = {theme: 'vs-dark', language: 'json', readOnly: true, scrollbar: {handleMouseWheel: false}};

  formInput:any = {
    type:"Select your type"
  }
  formValidation:any = {}
  versionInvalid:any = {}
  versions: any = {
    selected: 0,
    all : {
    }
  }
  genResult = ""
  errorMessage = ""
  successMessage = ""
  ngOnInit() {
    this.server.getTextFile("http://stevertus.ga/dManager install.html").then((res:string) => {
      if(res) this.installGuide = res
      else this.installGuide = "Sorry, the requested file was not found!"
    })
    this.server.getTextFile("https://raw.githubusercontent.com/Stevertus/dManager-packages/master/datapacks.json").then((res:string) => {
      if(res){
        let arr = JSON.parse(res).map(x => x.id)
        this.dependencies = {}
        arr.forEach(item => {
          this.dependencies[item] = false
        })
        if(localStorage.getItem('dm-dependencies')){
          for(let depend of JSON.parse(localStorage.getItem('dm-dependencies'))){
            if(this.dependencies[depend] == false){
              this.dependencies[depend] = true
            }
          }
        }
      }
      console.log(this.dependencies)
    })
    if(localStorage.getItem('dm-formInput')){
      this.formInput = JSON.parse(localStorage.getItem('dm-formInput'))
      this.versions = JSON.parse(localStorage.getItem('dm-versions'))
    }

  }
  timer
  onHoverInForm(e){
    let self = this
    this.timer = setInterval(() => {
      localStorage.setItem('dm-formInput',JSON.stringify(self.formInput))
      localStorage.setItem('dm-versions',JSON.stringify(self.versions))
      if(self.dependencies) localStorage.setItem('dm-dependencies',JSON.stringify(Object.keys(self.dependencies).filter(x => self.dependencies[x] == true)))
    }, 15000)
  }
  clearForm(){
    this.formInput = {
      type:"Select your type"
    }
    this.versions = {
      selected: 0,
      all : {
      }
    }
    for(let depend in this.dependencies){
      this.dependencies[depend] = false
    }
    this.genResult = ""
    localStorage.removeItem('dm-formInput')
    localStorage.removeItem('dm-versions')
    localStorage.removeItem('dm-dependencies')

  }
  onHoverOutForm(e){
    clearInterval(this.timer)
  }
  getKeys(obj){
    return Object.keys(obj)
  }
  getSelectedDepend(){
    return this.getKeys(this.dependencies).filter(x => this.dependencies[x] == true).join(", ")
  }
  addVersion(version, link){
    if(version.value.trim().length && this.isUrl(link.value)){
      this.versions.all = Object.assign({[version.value]: {url: link.value}},this.versions.all)
      this.versions.selected ++
      version.value = ""
      link.value = ""
    }
  }
  editVersion(v){
    this.versions.all[v].editUrl = this.versions.all[v].url;
  }
  changeMainVersion(i){
    this.versions.selected = i
  }
  deleteVersion(v){
    delete this.versions.all[v]
    if(this.versions.selected == Object.keys(this.versions.all).length) this.versions.selected--
  }
  saveEditVersion(v){
    if(this.isUrl(this.versions.all[v].editUrl)){
      this.versions.all[v].url = this.versions.all[v].editUrl
      delete this.versions.all[v].editUrl
    }
  }
  isUrl(url){
    if(url.trim().length) return true
    else return false
  }
  checkErrors(){
    this.errorMessage = ""
    this.formValidation = {}
    let inp = this.formInput
    if(!inp.email || (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(inp.email) != true && /.*#[0-9]{4}/.test(inp.email) != true)){
      this.formValidation.email = true
      this.errorMessage += 'Please provide a valid email or discord tag!\n'
    }
    if(!inp.creator || inp.creator.trim().length <= 2){
      this.formValidation.creator = true
      this.errorMessage += 'Please provide your username!\n'
    }

    if(!inp.id || inp.id.trim().length > 20 || inp.id.trim().length <= 2){
      this.formValidation.id = true
      this.errorMessage += 'Your id has to be between 2 and 20 characters long!\n'
    }
    if(this.dependencies && inp.id && inp.id.trim().length > 1 && Object.keys(this.dependencies).indexOf(inp.id) >= 0){
      this.formValidation.id = true
      this.errorMessage += 'Your id has to be unique!\n'
    }
    if(!inp.title || inp.title.trim().length > 50 || inp.title.trim().length <= 4){
      this.formValidation.title = true
      this.errorMessage += 'Your name has to be between 4 and 50 characters long!\n'
    }
    if(!inp.logo || !this.isUrl(inp.logo)){
      this.formValidation.logo = true
      this.errorMessage += 'Please provide a valid direct url for the logo.\n'
    }
    if(!inp.description || !this.isUrl(inp.description)){
      this.formValidation.description = true
      this.errorMessage += 'Please provide a valid direct url for the description.\n'
    }
    if(!Object.keys(this.versions.all).length){
      this.errorMessage += 'You have to submit minimum one version and file link.\n'
    }
    if(this.errorMessage){
      this.errorMessage = " [Error]!\n" + this.errorMessage
      return true
    }
    return false
  }
  submit(){
    this.generate()
    this.successMessage = ""
    let message = this.genResult + "\n\n" + this.formInput.creator.toLowerCase() + "-" + this.formInput.id + ".json"
    if(message && !this.errorMessage) this.server.submit(this.formInput.email, message).subscribe(res => {
      if(res && res.success) this.successMessage = `Thanks for your submission!<br>
      The process was successfull and the team is notified.<br>
      We will process your submission and check it manually, so it can take 1-3 days until it is released<br>
      However we will message you, if anything is invalid or it´s published<br>
      So be attainable on your given contact method.
      `
    })
  }
  generate(){
    this.genResult = ""
    if(!this.checkErrors()){
      let res = Object.assign({},this.formInput)
      delete res.email
      if(this.dependencies) res.dependencies = Object.keys(this.dependencies).filter(x => this.dependencies[x] == true)
      if(res.dependencies && !res.dependencies.length){
        delete res.dependencies
      }
      res.version = Object.keys(this.versions.all)[this.versions.selected]
      res.files = Object.assign({},this.versions.all)
      for(let file in res.files){
        res.files[file] = res.files[file].url
      }
      this.genResult = JSON.stringify(res).replace(/,/g,",\n").replace(/{/g,"{\n").replace(/\[/g,"[\n").replace(/}/g,"\n}").replace(/\]/g,"\n]")
    }
  }
  importJson(text){
    try {
      let json = JSON.parse(text.value)
      if(json){
        let url
        if(json.url){
          url = json.url
          delete json.url
          if(url.substr(-1) != "/") url += "/"
        }
        if(url){
          if(json.banner && json.banner.substr(0,1) == "/") json.banner = url + json.banner.substr(1)
          if(json.logo.substr(0,1) == "/") json.logo = url + json.logo.substr(1)
          if(json.logo.substr(0,1) == "/") json.logo = url + json.logo.substr(1)
          if(json.description.substr(0,1) == "/") json.description = url + json.description.substr(1)
        }
        let versions = {
          selected: Object.keys(json.files).indexOf(json.version),
          all: {}
        }
        for(let version of Object.keys(json.files)){
          if(json.files[version].substr(0,1) == "/"&&url) json.files[version] = url + json.files[version].substr(1)
          versions.all[version] = {url:json.files[version]}
        }
        delete json.files
        delete json.version
        if(json.dependencies){
          for(let depend of json.dependencies){
            if(this.dependencies[depend] == false){
              this.dependencies[depend] = true
            }
          }
          delete json.dependencies
        }
        this.formInput = json
        this.versions = versions
        text.value = ""
      }
    } catch (err){
      console.log(err)
    }
  }
}
