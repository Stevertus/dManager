import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
  pure: false
})
export class SearchPipe implements PipeTransform {

  transform(items: any[], filter): any[] {
    if(!items) return []
    if(!filter) return items

    if(filter.search && !filter.filter){
      filter.search = filter.search.toLowerCase()

      items = items.filter(x => {
        return x.title.toLowerCase().includes(filter.search) || x.id.toLowerCase().includes(filter.search) || x.creator.toLowerCase().includes(filter.search)
      })
    }
    if(filter.filter){
      switch(filter.filter){
        case 'id': {
          items = items.filter(x => {
            console.log(filter.search, x.id.toLowerCase().includes(filter.search))
            return  filter.search ? x.id.toLowerCase().includes(filter.search) : true
          })
          break;
        }
        case 'version': {
          items = items.filter(x => {
            return  x.version.toLowerCase().includes(filter.search)
          })
          break;
        }
        case 'depends': {
          items = items.filter(x => {
            return  x.dependencies ? x.dependencies.map(x => x.toLowerCase()).indexOf(filter.search) >= 0 : false
          })
          break;
        }
      }
    }
    if(!filter.display.datapacks) items = items.filter(x => x.type != 'datapack')
    if(!filter.display.resourcepacks) items = items.filter(x => x.type != 'resourcepack')
    return items
  }

}
