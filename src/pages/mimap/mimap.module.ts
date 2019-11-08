import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MimapPage } from './mimap';
import { TranslateModule } from "@ngx-translate/core";
import { ModalImagePage } from '../modal/modal-image/modal-image';


@NgModule({
  declarations: [
    //MimapPage,
    ModalImagePage
  ],
  imports: [
    //ModalImagePage,
    IonicPageModule.forChild(MimapPage),
    TranslateModule.forChild()

  ]
})
export class MimapPageModule {}
