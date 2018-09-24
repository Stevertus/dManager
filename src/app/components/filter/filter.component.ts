import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
@Component({
  selector: 'search-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  @Output() searchInChange = new EventEmitter()
  @Output() filterChange = new EventEmitter()
  @Input('setSearch') searchInput
  @Input('focusSearch')  focusSearch: boolean = false
  @Input('isLoggedIn')  isLoggedIn: number = 0
  @Input('save')  noSave: boolean = true
  @Input('config')  filterConfig = {
    filter: true,
    display: {
      datapacks: true,
      resourcepacks: true,
      admin: false
    },
    sort: true,
    sortPossible: {
      trendy: true,
      trend: true,
      update: true,
      date: true,
      views: true,
      downloads: true
    },
    language: true,
    show: {
      admin: true,
      installed: true,
      trendy: true,
      own: true
    }
  }
  languages = [
  {id: 'en', name: 'English', icon: 'en.png'},
  {id: 'de', name: 'Deutsch', icon: 'de.png'},
  {id: 'fr', name: 'Français', icon: 'fr.png'},
  {id: 'rus', name: 'Русский', icon: 'rus.png'},
  {id: 'es', name: 'Español', icon: 'es.png'},
  {id: 'prt', name: 'Português', icon: 'prt.png'},
  {id: 'nld', name: 'Nederlands', icon: 'nld.png'},
  {id: 'da', name: 'Dansk', icon: 'da.png'}
]
  @ViewChild('searchInputField') searchInputField: ElementRef
  constructor(private translate: TranslateService,private router: Router) { }
  filterSettings = {
    search: '',
    filter: '',
    display: {
      datapacks: true,
      resourcepacks: true
    },
    sort: 'date',
    language: localStorage.getItem('lang'),
    show: {
      installed: true,
      trendy: true,
      own: true,
      admin:true
    }
  }
  ngOnInit() {
    console.log(this.isLoggedIn)
    this.init()
    this.router.events.subscribe(event => {
      if(event instanceof NavigationEnd){
        console.log(event)
        this.init()
      }
    })
  }
  init(){
    if(this.noSave == true && JSON.parse(localStorage.getItem('filter-settings'))){
      this.filterSettings = JSON.parse(localStorage.getItem('filter-settings'))
      if(this.filterSettings.filter) this.filterSettings.filter = ''
      if(this.filterSettings.search) this.filterSettings.search = ''
      this.settingChanged('loading')
    } else this.settingChanged('loading')
  }
  ngAfterViewInit(){
    console.log(this.searchInputField, this.searchInput)
    if(this.searchInputField) this.searchInputField.nativeElement.value = this.searchInput
  }
  ngOnChanges(changes: SimpleChanges){
    console.log(changes)
    if(changes.searchInput && changes.searchInput.currentValue){
      this.searchInput = changes.searchInput.currentValue
      if(this.searchInputField) this.searchInputField.nativeElement.value = changes.searchInput.currentValue
      this.searchChanged()
    }
    if(changes.isLoggedIn && changes.isLoggedIn.currentValue){
      console.log(this.isLoggedIn)
    }
  }
  checkDisplay(state,box){
    console.log(this.filterSettings.display)
    this.filterSettings.display[state] ? this.filterSettings.display[state] = false : this.filterSettings.display[state] = true
    if(!this.filterSettings.display.datapacks && !this.filterSettings.display.resourcepacks) this.filterSettings.display[state] = true
    console.log(this.filterSettings.display)
    box.value = this.filterSettings.display[state]
    this.settingChanged('display')
  }
  changeValue(val, state){
    if(val == 'language' && state != 'any') {
      localStorage.setItem('lang',state)
      this.translate.use(state)
    }
    this.filterSettings[val] = state
    this.settingChanged(val)
  }
  searchChanged(e = undefined){
    console.log('search changed')
    if(e){
      if(this.searchInput[0] == ' '&& e.code == 'Space') this.searchInput = this.searchInput.trim()
      if(this.filterSettings.filter == 'id' || this.filterSettings.filter == 'depends' || this.filterSettings.filter == 'version'){
        if(e.code == 'Space') {
          this.searchInput = this.searchInput.replace(' ','-')
        }
        this.searchInput = this.searchInput.toLowerCase()
      }
    }
    let s = this.searchInput ? this.searchInput : ''

    let hadFilter = this.filterSettings.filter ? true : false
    if(this.filterConfig.filter){
      if(s.substr(0,3) == 'id:'){
        s = s.substr(3,s.length - 3)
        this.filterSettings.filter = 'id'
      } else if(s.substr(0,3) == 'by:'){
        s = s.substr(3,s.length - 3)
        this.filterSettings.filter = 'by'
      } else if(s.substr(0,8) == 'depends:'){
        s = s.substr(8,s.length - 8)
        this.filterSettings.filter = 'depends'
      } else if(s.substr(0,8) == 'version:'){
        s = s.substr(8,s.length - 8)
        this.filterSettings.filter = 'version'
      } else if(hadFilter) {
        this.filterSettings.filter = ''
        this.filterSettings.search = s
        this.settingChanged('searchFilterOff')
      }
      if(s.substr(0,1) == '-') s = ' ' + s.substr(1,s.length -1 )
    }
    this.filterSettings.search = s.trim()
    console.log(this.filterSettings.filter,s)
    this.searchInChange.emit(this.filterSettings)
    if(this.filterSettings.filter && !hadFilter) this.settingChanged('searchFilterOn')
  }
  settingChanged(type){
    console.log("Setting Changed! " + type)
    this.searchInChange.emit(this.filterSettings)
    if(this.noSave == true) localStorage.setItem('filter-settings',JSON.stringify(this.filterSettings))
    this.filterChange.emit(Object.assign({changed: type},this.filterSettings))
  }
  menuOpen: boolean
}
