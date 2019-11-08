import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { ComponentsModule } from '../../components/components.module';
import { FastcheckinPage } from './fastcheckin';

@NgModule({
	declarations: [
		FastcheckinPage,
	],
	imports: [
		IonicPageModule.forChild(FastcheckinPage),
		ComponentsModule,
		TranslateModule.forChild()
	]
})
export class FastcheckinPageModule { }
