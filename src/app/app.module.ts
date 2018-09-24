import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NbThemeModule } from '@nebular/theme';
import { NbSidebarModule, NbSidebarService, NbLayoutModule, NbMenuModule, NbCardModule, NbUserModule, NbCheckboxModule, NbBadgeModule, NbAlertModule } from '@nebular/theme';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

import {BarRatingModule} from 'ngx-bar-rating'

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
import { AboutComponent } from './about/about.component'
import { LangSelectorComponent } from './components/lang-selector/lang-selector.component';
import { FilterModule } from './components/filter/filter.module';
import { ListItemComponent } from './components/list-item/list-item.component';
import { LoginComponent } from './components/login/login.component'
import { SpinnerComponent } from './components/spinner/spinner.component'
import { SearchPipe } from './components/search.pipe';
import { UpdateComponent } from './components/update/update.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http,'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    WebviewDirective,
    PackListComponent,
    WelcomeComponent,
    ModalComponent,
    PackPageComponent,
    SafeURLPipe,
    AboutComponent,
    LangSelectorComponent,
    ListItemComponent,
    LoginComponent,
    SearchPipe,
    SpinnerComponent,
    UpdateComponent
  ],
  entryComponents:[ModalComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    HttpModule,
    FilterModule,
    NgbModule.forRoot(),
    NbThemeModule.forRoot({ name: 'default' }),
    NbSidebarModule, NbLayoutModule, NbMenuModule,NbCardModule,NbUserModule, NbCheckboxModule, NbBadgeModule, NbAlertModule,
    BarRatingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgxFsModule,
    MarkdownModule.forRoot()
  ],
  providers: [ElectronService, HttpService, NbSidebarService],
  bootstrap: [AppComponent]
})
export class AppModule { }
