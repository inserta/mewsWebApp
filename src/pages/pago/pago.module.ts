import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PagoPage } from './pago';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PagoPage,
  ],
  imports: [
    IonicPageModule.forChild(PagoPage),
    TranslateModule.forChild()
  ],
})
export class PagoPageModule {}
