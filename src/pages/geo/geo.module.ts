import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GeoPage } from './geo';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    GeoPage
  ],
  imports: [
    IonicPageModule.forChild(GeoPage),
    TranslateModule.forChild()

  ],

})
export class GeoPageModule {}
