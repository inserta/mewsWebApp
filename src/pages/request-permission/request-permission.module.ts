import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RequestPermissionPage } from './request-permission';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    RequestPermissionPage,
  ],
  imports: [
    IonicPageModule.forChild(RequestPermissionPage),
    TranslateModule.forChild()
  ],
})
export class RequestPermissionPageModule {}
