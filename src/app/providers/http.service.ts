import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import 'rxjs/add/operator/map'

const URI:any = 'http://stevertus.ga/'//'http://localhost:3000/'//'http://stevertus.ga/'//
const URL = URI + 'api/'
@Injectable()
export class HttpService {

  constructor(private _http: Http) { }
  addDownload(tool) {
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({ headers: headers });
    let content = {
      tool: tool
    }
    return this._http.post(URL + 'downloads', JSON.stringify(content), options)
    .map((response: Response) => response.json())
  }
  addView(tool) {
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({ headers: headers });
    let content = {
      tool: tool
    }
    return this._http.post(URL + 'views', JSON.stringify(content), options)
    .map((response: Response) => response.json())
  }
  submit(mail, text) {
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({ headers: headers });
    let content = {
      tool: 'dManager',
      mail: mail,
      msg: text
    }
    return this._http.post(URL + 'help', JSON.stringify(content), options)
    .map((response: Response) => response.json())
  }
  getFile(url){
    if(url.substr(0,1) == "/") url = URI + url.substr(1)
    let promise = new Promise((resolve, reject) => {
      this.getFullLink(url).then((url2 : string) => {
        let options = new RequestOptions({responseType: ResponseContentType.Blob });
        this._http.get(url2, options).map(res => res.blob())
        .toPromise()
        .then(res => {
          if(res) resolve({file: res,url: url2})
          else reject()
        })
      })
    })
    return promise
  }
  getFullLink(url){
    let promise = new Promise((resolve, reject) => {
      if(url.slice(0,20) == "https://nofile.io/f/"){
        let options = new RequestOptions({responseType: ResponseContentType.Text });
        this._http.get(url, options).map(res => res.text())
        .toPromise().then(res => {
          res = res.toString()
          let aElement = res.match(/\<a.href="\/g\/.+/g)[0]
          let href = aElement.match(/href=".*\" /)[0]
          href= "https://nofile.io" + href.substr(6,href.length - 8)
          if(href.substr(-1) == "/") href = href.substr(0,href.length - 1)
          resolve(href)
        })
      } else {
        resolve(url)
      }

    })
    return promise
  }
  getTextFile(url){
    if(url.substr(0,1) == "/") url = URI + url.substr(1)
    let promise = new Promise((resolve, reject) => {
      this.getFullLink(url).then((url2:string) => {
        let options = new RequestOptions({responseType: ResponseContentType.Text });
        this._http.get(url2, options).map(res => res.text())
        .toPromise()
        .then(res => {
          if(res) resolve(res)
          else reject()
        }).catch(err => {
          reject(err)
        })
      })
    })
    return promise
  }
  public prePacks: any = []
  getPacketsSync(){
    return this.prePacks
  }
  getPackets() {
    let promise = new Promise((resolve, reject) => {
      if(!this.prePacks.length) this.getServerPackets().then(res => {
        this.prePacks = res
        resolve(this.prePacks)
      })
      else resolve(this.prePacks)
    })
    return promise
  }
  getServerPackets = async function(){
    let res
    try {
      if(URI.slice(0) == "http://localhost:3000/") res = await this.getTextFile("/downloads/datapacks.json")
      else res = await this.getTextFile("http://raw.githubusercontent.com/Stevertus/dManager-packages/master/datapacks.json")
    } catch(err) {
      console.log(err)
    }
    if(res){
      res = JSON.parse(res)
      let itemArray = []
      for(let item of res){
        let url = item.url
        if(url.slice(0,1) == "/") url = "/downloads" + item.url
        if(url.slice(-5) != ".json") url += "/datapack.json"
        itemArray.push(new Promise((resolve,reject) => {
          this.getTextFile(url).then(res => resolve(res))
          .catch(err => {
            console.log("Error getting pack for " + url)
            resolve(false)
          })
        }))
      }
      res = await Promise.all(itemArray)
      res = res.filter(x => x != false)
      res = res.map(x => {
        x = JSON.parse(x)
        if(!x.logo) x.logo = "/logo.png"
        if(!x.type) x.type = "datapack"
        if(!x.description) x.description = "/desc.md"
        if(x.url && x.url.substr(0,1) == "/") x.url = URI + "downloads" + x.url
        if(x.video){
          let regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
          var match = x.video.match(regExp);
          if (match && match[2].length == 11) {
            x.video = match[2]
          }
        }
        if(x.url && x.url.substr(-1) != "/") x.url += "/"
        if(x.url && x.logo.substr(0,1) == "/") x.logo = x.url + x.logo.substr(1)
        if(x.banner && x.banner.substr(0,1) == "/") x.banner = x.url + x.banner.substr(1)
        for(let version of Object.keys(x.files)){
          let file = x.files[version]
          if(x.url && file.substr(0,1) == "/") x.files[version] = x.url + file.substr(1)
        }
        if(x.url && x.description.substr(0,1) == "/") x.description = x.url + x.description.substr(1)
        return x
      })
      return res
    }
  }
}
