import { PackListComponent } from './pack-list/pack-list.component'
import { AboutComponent } from './about/about.component'
import { WelcomeComponent } from './welcome/welcome.component'
import { PackPageComponent } from './pack-page/pack-page.component'


import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: WelcomeComponent
    },
    {
        path: 'about',
        component: AboutComponent
    },
    {
        path: 'world/:name',
        component: PackListComponent
    },
    {
        path: 'world/:name/pack/:id/:status/:version',
        component: PackPageComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
