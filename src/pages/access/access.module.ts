import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { AccessPage } from './access';

@NgModule({
	declarations: [
		AccessPage,
	],
	imports: [
		ComponentsModule,
		IonicPageModule.forChild(AccessPage),
		TranslateModule.forChild()
	],
})
export class AccessPageModule { }
