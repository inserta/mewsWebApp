import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalQrPage } from './modal-qr';
import { QRCodeComponent, QRCodeModule } from 'angular2-qrcode';

@NgModule({
	declarations: [
		ModalQrPage,
	],
	imports: [
		IonicPageModule.forChild(ModalQrPage),
		TranslateModule.forChild(),
		QRCodeModule
	],
	entryComponents: [
		QRCodeComponent
	]
})
export class ModalQrPageModule { }
