import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from '../../providers/electron.service'

@Component({
  selector: 'auto-updater',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
  @Input('show') show = false
  @Input('version') version:string
  @Input('state') state = ''
  constructor(private electron: ElectronService,private cdr: ChangeDetectorRef) { }
  animatedPoints = ''
  timer:any
  ngOnInit() {
    let self = this
    let i = 0
    this.electron.ipcRenderer.on('update-state',(e,state,args) => {
      this.show = true
      if(!(state == 'error' && !this.state)) this.state = state
      else if(typeof args == 'string') this.version = args
      console.log(state,args)
      if(state == 'downloading'){
        this.timer = setInterval(() => {
          if(i == 0) self.animatedPoints = '      ';
          else if(i == 1) self.animatedPoints = ' .    ';
          else if(i == 2) self.animatedPoints = ' . .  ';
          else if(i == 3) self.animatedPoints = ' . . .';
          i++
          console.log(i)
          if(i == 4) i = 0
        },500)
      } else {
        clearInterval(this.timer)
      }
      this.cdr.detectChanges()
    })
  }
  restart(){
    this.electron.ipcRenderer.send('restart')
  }

}
