import { PackListComponent } from './pack-list/pack-list.component'
import { WelcomeComponent } from './welcome/welcome.component'
import { PackPageComponent } from './pack-page/pack-page.component'
import { SubmitComponent } from './submit/submit.component'


import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: WelcomeComponent
    },
    {
        path: 'world/:name',
        component: PackListComponent
    },
    {
        path: 'world/:name/pack/:id/:status/:version',
        component: PackPageComponent
    },
    {
        path: 'submit',
        component: SubmitComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
