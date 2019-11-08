import { Component } from '@angular/core';
import { IonicPage, ViewController, Loading, Toast } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailValidator } from '../../../validators/email';
import { TranslateService } from '@ngx-translate/core';

import { ApiComponents } from '../../../components/api-components';
import { AuthProvider } from '../../../providers/auth/auth';

@IonicPage()
@Component({
	selector: 'page-forgot-password',
	templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {

	private form: FormGroup;

	constructor(
		private viewCtrl: ViewController,
		private translate: TranslateService,
		private formBuilder: FormBuilder,
		private apiComponents: ApiComponents,
		private authProvider: AuthProvider, ) {

		this.form = this.formBuilder.group({
			email: ['', Validators.compose([Validators.required, EmailValidator.isValid])]
		});
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	resetPassword() {
		this.apiComponents.createLoading().then((loading: Loading) => {
			loading.present();
			this.authProvider.resetPassword(this.form.value.email)
				.then((response) => {
					this.showToast("ACCESS.FORGOT_PASSWORD.FORGOT_PASSWORD_SUCCESS", loading);
				}).catch(() => {
					this.showToast("ACCESS.FORGOT_PASSWORD.FORGOT_PASSWORD_ERROR", loading);
				})
		});
	}

	private showToast(message: string, loading: Loading) {
		loading.dismiss();
		this.translate.get(message).subscribe((res: any) => {
			this.apiComponents.createToast(res, 3000, 'bottom')
				.then((toast: Toast) => {
					toast.present();
				});
		});
	}

}
