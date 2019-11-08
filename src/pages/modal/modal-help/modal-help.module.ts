import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalHelpPage } from './modal-help';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [
		ModalHelpPage,
	],
	imports: [
		IonicPageModule.forChild(ModalHelpPage),
		TranslateModule.forChild()
	],
})
export class ModalHelpPageModule { }
