import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'lang-selector',
  templateUrl: './lang-selector.component.html',
  styleUrls: ['./lang-selector.component.scss']
})
export class LangSelectorComponent implements OnInit {
  langMenuOpen = false
  toggleMenu(){
    this.langMenuOpen = this.langMenuOpen ? false : true
  }
  selectedLang:any = {}
  displayedLangs = [[],[],[],[],[]]
  languages = [{id: 'en', name: 'English', icon: 'en.png'},
  {id: 'de', name: 'Deutsch', icon: 'de.png'},
  {id: 'fr', name: 'Français', icon: 'fr.png'},
  {id: 'rus', name: 'Русский', icon: 'rus.png'},
  {id: 'es', name: 'Español', icon: 'es.png'},
  {id: 'prt', name: 'Português', icon: 'prt.png'},
  {id: 'nld', name: 'Nederlands', icon: 'nld.png'},
  {id: 'dnk', name: 'Dansk', icon: 'dnk.png'}
]
  constructor(private translate: TranslateService) { }

  ngOnInit() {
    let i = 0
    do {
      if(this.languages[i ]) this.displayedLangs[0].push(this.languages[i])
      if(this.languages[i + 1]) this.displayedLangs[1].push(this.languages[i + 1])
      if(this.languages[i + 2]) this.displayedLangs[2].push(this.languages[i + 2])
      if(this.languages[i + 3]) this.displayedLangs[3].push(this.languages[i + 3])
      if(this.languages[i + 4]) this.displayedLangs[4].push(this.languages[i + 4])
      i += 5
    } while (i < this.languages.length)

    if(this.translate.getBrowserLang() && !localStorage.getItem('lang')) localStorage.setItem("lang", this.translate.getBrowserLang())
    this.translate.setDefaultLang('en');
    if(localStorage.getItem('lang')) {
      let langTag = localStorage.getItem('lang')
            this.translate.use(langTag);
      let i:any = this.displayedLangs.find(x => x.find(lang => lang.id === langTag) != undefined)
      let j:any = i.indexOf(i.find(lang => lang.id === langTag))
      i = this.displayedLangs.indexOf(i)
      this.setLang(i,j)
    } else this.setLang(0,0)
    }
    selectLang(i,j,lang){
      if(!lang.selected){
        this.setLang(i,j)
        localStorage.setItem('lang',lang.id)
      }
    }
    setLang(i,j){
      if(this.selectedLang.lang) delete this.displayedLangs[this.selectedLang.i][this.selectedLang.j].selected
      this.displayedLangs[i][j].selected = true
      this.selectedLang = {i: i, j: j, lang: this.displayedLangs[i][j]}
      this.translate.use(this.displayedLangs[i][j].id);
    }
  }
