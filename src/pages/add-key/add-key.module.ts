import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddKeyPage } from './add-key';
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
	declarations: [
		AddKeyPage,
	],
	imports: [
		IonicPageModule.forChild(AddKeyPage),
		TranslateModule.forChild()
	],
})
export class AddKeyPageModule { }
