import { Component, OnInit } from '@angular/core';
import {HttpService} from '../providers/http.service'

@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss']
})
export class SubmitComponent implements OnInit {

  constructor(private server: HttpService) { }
  Validation = {
    mail: "",
    mess: "",
    url:"",
    success: false
  }
  email
  message
  url
  ngOnInit() {
    this.server.addView('dMSubmit').subscribe(res=>{console.log(res)})
    this.server.getTextFile(' /assets/submit.md').then(res => {
      console.log(res)
    })
  }
  async submitPack(mail, mess, url){
    var self = this
    if(!mail || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail) != true) this.Validation.mail = 'form-control-danger'
    else if(url.trim().length) {
      let datapack:any = await this.server.getTextFile(url)
      datapack = JSON.parse(datapack)
      console.log(datapack)
      if(!datapack || !datapack.id || !datapack.title) this.Validation.url = 'form-control-danger'
      else if(!mess || mess.length > 200) this.Validation.mess = 'form-control-danger'
      else {
        this.Validation.mess = ''
        this.Validation.mail = ''
        this.Validation.url = ''
        mess = "url: " + url + "\n" + mess
        this.server.submit(mail, mess).subscribe(res=>{
          if(res.success){
            this.Validation.success = true
            this.email = null
            this.url = null
            this.message = null
          }
        })
        setTimeout(function(){self.Validation.success = false},3000)
      }
    } else {
      this.Validation.url = 'form-control-danger'
    }
  }
}
