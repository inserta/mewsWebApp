import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChangeUserPage } from './change-user';
import { TranslateModule } from '@ngx-translate/core';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ComponentsModule } from '../../components/components.module';



@NgModule({
  declarations: [
    ChangeUserPage
  ],
  imports: [
    IonicPageModule.forChild(ChangeUserPage),
    TranslateModule.forChild(),
    ComponentsModule,
    SignaturePadModule
  ]
})
export class ChangeUserPageModule { }
