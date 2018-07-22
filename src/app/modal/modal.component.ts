import { Component, OnInit, Input } from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input() msg;
  @Input() option1;
  @Input() option2;

  constructor(public activeModal: NgbActiveModal) {}
  ngOnInit() {
  }

}
