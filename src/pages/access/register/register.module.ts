import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { RegisterPage } from './register';

@NgModule({
	declarations: [
		RegisterPage,
	],
	imports: [
		ComponentsModule,
		IonicPageModule.forChild(RegisterPage),
		TranslateModule.forChild()
	],
})
export class RegisterPageModule { }
