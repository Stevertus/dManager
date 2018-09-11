import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import 'rxjs/add/operator/map'
import * as toBuffer from 'blob-to-buffer';

const URI:any = 'https://dmanager.stevertus.com/'//'http://stevertus.ga/'//
const URL = URI + 'api/'
@Injectable()
export class HttpService {
  getToken(){
    return localStorage.getItem('JWT-Token')
  }
  getUrl(){
    return URI
  }
  getCdnIcon(url){
    if(url && url.substr(0,5) == 'icons') return URI + 'cdn/' + url
    return url
  }
  constructor(private _http: Http) { }
  login(name, password){
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({ headers: headers });
    return this._http.post(URL + 'login', JSON.stringify({name: name, password: password, lang: localStorage.getItem('lang')}), options)
    .map((response: Response) => response.json());
  }
  getUserData(){
    let headers = new Headers({'Content-Type': 'application/json','Authorization': this.getToken()});
    let options = new RequestOptions({ headers: headers });
    return this._http.get(URL + 'getUserData', options)
    .map((response: Response) => response.json());
  }
  getAllPacks(lang = undefined,sort = undefined){
    if(lang == 'any') lang = undefined
    let isStat: boolean
    if(sort){
      switch(sort){
        case 'date': {
          sort = undefined;
          break;
        }
        case 'update': {
          sort = 'timeEdited';
          break;
        }
        case 'views': {
          sort = 'totalViews';
          isStat = true
          break;
        }
        case 'downloads': {
          sort = 'totalDownloads';
          isStat = true
          break;
        }
        case 'trendy': {
          sort = 'trendRank';
          isStat = true
          break;
        }
        case 'trend': {
          sort = 'highGP';
          isStat = true
          break;
        }
      }
    }
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({ headers: headers });
    return this._http.post(URL + 'datapacks',JSON.stringify({sort: sort, lang: lang, isStat: isStat}), options)
    .map((response: Response) => response.json()).toPromise().then(res => {
      this.allPacks = res.packs
      console.log(res)
      return new Promise((re,rej) => re(res))
    }).catch((err) => {
      return new Promise((re,rej) => re({success:false}))
    });
  }
  allPacks = []
  getPacketsSync(){
    return this.allPacks
  }
  getOwnPacks(){
    let headers = new Headers({'Content-Type': 'application/json','Authorization': this.getToken()});
    let options = new RequestOptions({ headers: headers });
    return this._http.get(URL + 'ownPacks', options)
    .map((response: Response) => response.json());
  }
  downloadVersion(id,version){
    this.addStat(id,'download')
    let promise = new Promise((resolve, reject) => {
      let headers = new Headers({'Content-Type': 'application/json','Authorization': this.getToken()});
      let options = new RequestOptions({ headers: headers });
      return this._http.get(URL + 'download/' + id + '/' + version, options)
      .map((response: Response) => response.json()).toPromise().then(res => {
        if(res && res.success && res.file) resolve({file: res.file, name: res.name})
        else if(res.success && res.url) this.getFile(res.url).then((file:any) => {
          console.log(file)
          toBuffer(file.file, (err, buffer) => {
            resolve({file: buffer, name: res.name})
          })
        })
      });
    })
    return promise
  }
  getAdminStates(status){
    let headers = new Headers({'Content-Type': 'application/json','Authorization': this.getToken()});
    let options = new RequestOptions({ headers: headers });
    return this._http.get(URL + 'admin/getFromStatus/' + status, options)
    .map((response: Response) => response.json());
  }
  addStat(id,type,rating = {}){
    let headers = new Headers({'Content-Type': 'application/json','Authorization': this.getToken()});
    let options = new RequestOptions({ headers: headers });
    return this._http.post(URL + 'addProperty/' + id, Object.assign({type: type,lang: localStorage.getItem('lang')},rating), options)
    .map((response: Response) => response.json()).toPromise();
  }
  getFullPack(id){
    let url = URL + 'pack/'
    let headers = new Headers({'Content-Type': 'application/json','Authorization': this.getToken()});
    let options = new RequestOptions({ headers: headers });
    return this._http.get(url + id, options).map((response: Response) => response.json()).toPromise();
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
}
