import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { ComponentsModule } from '../../components/components.module';
import { KeysPage } from './keys';

@NgModule({
	declarations: [
		KeysPage,
	],
	imports: [
		IonicPageModule.forChild(KeysPage),
		ComponentsModule,
		TranslateModule.forChild()
	]
})
export class KeysPageModule { }
