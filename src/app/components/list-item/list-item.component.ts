import { Component, OnInit,Input,SimpleChanges } from '@angular/core';
import { HttpService } from '../../providers/http.service'
@Component({
  selector: 'list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent implements OnInit {
  @Input('pack') pack: any
  @Input('installed') installedDatapacks: any
  pageLink: string
  constructor(private server: HttpService) { }

  ngOnInit() {
  }
  getPageLink(pack){

  }
  ngOnChanges(changes: SimpleChanges){
  if(changes.installedDatapacks && changes.installedDatapacks.currentValue){
    let version = this.installedDatapacks.find(x => x.id === this.pack.id)
    let res = 'pack/' + this.pack.id + '/' + this.pack.status + '/'
    if(this.pack.version) res += this.pack.version
    else res += "-1"
    this.pageLink = res
  }
}
}
