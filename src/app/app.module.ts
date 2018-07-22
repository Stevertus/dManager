import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NbThemeModule } from '@nebular/theme';
import { NbSidebarModule, NbSidebarService, NbLayoutModule, NbMenuModule, NbCardModule } from '@nebular/theme';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { MarkdownModule } from 'ngx-markdown';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ElectronService } from './providers/electron.service';
import {NgxFsModule} from 'ngx-fs';
import { HttpService } from './providers/http.service';

import { WebviewDirective } from './directives/webview.directive';
import { SafeURLPipe } from './safe-url.pipe';

import { AppComponent } from './app.component';
import { PackListComponent } from './pack-list/pack-list.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ModalComponent } from './modal/modal.component';
import { PackPageComponent } from './pack-page/pack-page.component';
import { SubmitComponent } from './submit/submit.component'


@NgModule({
  declarations: [
    AppComponent,
    WebviewDirective,
    PackListComponent,
    WelcomeComponent,
    ModalComponent,
    PackPageComponent,
    SubmitComponent,
    SafeURLPipe
  ],
  entryComponents:[ModalComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    HttpModule,
    NgbModule.forRoot(),
    NbThemeModule.forRoot({ name: 'default' }),
    NbSidebarModule, NbLayoutModule, NbMenuModule,NbCardModule,
    NgxFsModule,
    MarkdownModule.forRoot()
  ],
  providers: [ElectronService, HttpService, NbSidebarService],
  bootstrap: [AppComponent]
})
export class AppModule { }
