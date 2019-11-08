import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { ForgotPasswordPage } from './forgot-password';

@NgModule({
	declarations: [
		ForgotPasswordPage,
	],
	imports: [
		ComponentsModule,
		IonicPageModule.forChild(ForgotPasswordPage),
		TranslateModule.forChild()
	],
})
export class ForgotPasswordPageModule { }
