import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './filter.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NbLayoutModule,NbCardModule, NbActionsModule, NbUserModule, NbCheckboxModule, NbBadgeModule } from '@nebular/theme'
@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    NbCheckboxModule,
    NgbModule
  ],
  declarations: [FilterComponent],
  exports: [FilterComponent]
})
export class FilterModule { }
