import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalEditHuesped } from './modal-edit-huesped';
import { TranslateModule } from '@ngx-translate/core';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ComponentsModule } from './../../../components/components.module';

@NgModule({
  declarations: [
    ModalEditHuesped,
  ],
  imports: [
    IonicPageModule.forChild(ModalEditHuesped),
    TranslateModule.forChild(),
    ComponentsModule,
    SignaturePadModule
  ],
})
export class ModalEditHuespedPageModule {}
