import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalTermsPage } from './modal-terms';

@NgModule({
	declarations: [
		ModalTermsPage,
	],
	imports: [
		IonicPageModule.forChild(ModalTermsPage),
		TranslateModule.forChild()
	]
})
export class modalQrPageModule { }
