import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../providers/http.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private server: HttpService) { }
  loginError : string
  name
  password
  user:any
  ngOnInit() {
    if(localStorage.getItem('JWT-Token')) this.server.getUserData().subscribe(res => {
      if(res && res.success) this.user = {username: res.username, avatar: res.avatar}
    })
  }
  loginDrop
  toggleLoginDrop(){
    this.loginDrop = this.loginDrop ? false : true
  }
  onLogin(){
    this.loginError = ""
    this.server.login(this.name, this.password).subscribe(res => {
      console.log(res)
      if(res && res.success){
        this.user = {username: res.data.username}
        if(res.data.avatar) this.user.avatar = res.data.avatar
        localStorage.setItem('JWT-Token',res.token)
        this.loginDrop = false
      } else if(res && res.msg) this.loginError = res.msg
    })
  }
  onLogOut() {
    localStorage.removeItem('JWT-Token')
    location.reload()
  }
}
