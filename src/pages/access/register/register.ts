import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, Events, Loading, Toast, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailValidator } from '../../../validators/email';
import { TranslateService } from '@ngx-translate/core';

import { ApiComponents } from '../../../components/api-components';
import { Configuration } from '../../../environments/configuration';

import { AuthProvider } from '../../../providers/auth/auth';
import { User } from '../../../app/models/user.model';
import { ServiceAPI } from '../../../app/services/service.api';
import { StorageService } from '../../../app/services/service.storage';

@IonicPage()
@Component({
	selector: 'page-register',
	templateUrl: 'register.html',
})
export class RegisterPage {

	private loginForm: FormGroup;
	private checkTerms: boolean = false;
	constructor(
		private modalCtrl: ModalController,
		private navCtrl: NavController,
		private viewCtrl: ViewController,
		private events: Events,
		private translate: TranslateService,
		private formBuilder: FormBuilder,
		private authProvider: AuthProvider,
		private apiComponents: ApiComponents,
		private service: ServiceAPI,
		private storageService: StorageService
	) {

		this.loginForm = this.formBuilder.group({
			name: ['', Validators.compose([Validators.minLength(3), Validators.required])],
			email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
			password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
		});
	}

	ionViewDidLoad() {
		this.events.publish('enableDisableMenu', false);
	}

	cancel() {
		this.viewCtrl.dismiss();
	}

	openTerms() {
		let modal = this.modalCtrl.create('ModalTermsPage');
		modal.present();
	}

	public forgotPassword() {
		this.navCtrl.push('ForgotPasswordPage', { animate: true, direction: 'backward' });
	}

	public registerUser() {
		this.apiComponents.createLoading().then((loading: Loading) => {
			loading.present();
			this.authProvider.signupUser(this.loginForm.value.name, this.loginForm.value.email, this.loginForm.value.password)
				.then(authData => {
					console.log(authData)
					this.registerNewuser(authData, loading);
				}, errorCode => {
					loading.dismiss();
					this.translate.get("CODE_AUTH." + Configuration.errorCodeAuth[errorCode + ""]).toPromise()
						.then((response) => {
							this.showError(response);
						})
				});
		});
	}

	private registerNewuser(authData, loading) {
		this.service.createUser(authData.response).then((data) => {
			this.authProvider.loginUser(this.loginForm.value.email, this.loginForm.value.password)
				.then(authData => {
					this.service.login(authData).then((data) => {
						this.loginSuccess(loading, data);
					}).catch((error) => {
						loading.dismiss();
					})
				}, errorCode => {
					this.translate.get("CODE_AUTH." + Configuration.errorCodeAuth[errorCode + ""]).toPromise()
						.then((response) => {
							loading.dismiss();
							this.showError(response);
						})
				});
		}).catch((err) => {
			loading.dismiss();
		});
	}

	private loginSuccess(loading: Loading, response) {
		this.storageService.setUserIsLoged(true);
		this.storageService.setUserData(response);
		this.storageService.setUserEmail(this.loginForm.value.email);
		this.storageService.setUserPassword(this.loginForm.value.password);

		this.navCtrl.setRoot('KeysPage', { animate: true, direction: 'backward' });
		this.events.publish('enableDisableMenu', true);
		this.events.publish('listenerToUpdateMenu', true);
		this.events.publish('setUser', response);
		loading.dismiss();
	}



	private showError(errorCode) {
		this.apiComponents.createToast(errorCode, 3000, 'bottom')
			.then((toast: Toast) => {
				toast.present();
			});
	}
}
