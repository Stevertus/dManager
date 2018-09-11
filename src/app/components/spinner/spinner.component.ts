import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'load-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {

  constructor() { }
  @Input() color: string = "#d9d9d9"
  ngOnInit() {
  }

}
