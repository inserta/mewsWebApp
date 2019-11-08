import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalImagePage } from './modal-image';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    //ModalImagePage,
  ],
  imports: [
    IonicPageModule.forChild(ModalImagePage),
    TranslateModule.forChild()
  ],
})
export class ModalImagePageModule {}
