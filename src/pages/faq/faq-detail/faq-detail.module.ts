import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FaqDetailPage } from './faq-detail';
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "../../../components/components.module";

@NgModule({
	declarations: [
		FaqDetailPage,
	],
	imports: [
		ComponentsModule,
		IonicPageModule.forChild(FaqDetailPage),
		TranslateModule.forChild()
	],
})
export class FaqDetailPageModule { }
