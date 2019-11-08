import { Component } from '@angular/core';
import { IonicPage, NavController, Events, ViewController, Loading, Toast, Alert, ModalController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { StorageService } from '../../app/services/service.storage';
import { AuthProvider } from '../../providers/auth/auth';
import { ApiComponents } from '../../components/api-components';
import { ServiceAPI } from '../../app/services/service.api';
import { EmailValidator } from '../../validators/email';
import { Configuration } from '../../environments/configuration';

@IonicPage()
@Component({
	selector: 'page-access',
	templateUrl: 'access.html',
})
export class AccessPage {
	private loginForm: FormGroup;

	constructor(
		private navCtrl: NavController,
		private viewCtrl: ViewController,
		private events: Events,
		private formBuilder: FormBuilder,
		private storageService: StorageService,
		private translate: TranslateService,
		private authProvider: AuthProvider,
		private apiComponents: ApiComponents,
		private service: ServiceAPI,
		private modalCtrl: ModalController) {

		let email;
		let password;

		if (!this.storageService.getTutorial()) {
			this.modalCtrl.create('TourPage').present();
			this.storageService.setTutorial('tutorial done');
		}

		if ((this.storageService.getUserEmail()) && (this.storageService.getUserPassword())) {
			email = this.storageService.getUserEmail();
			password = this.storageService.getUserPassword();
		}

		this.loginForm = this.formBuilder.group({
			email: [this.storageService.getUserEmail() ? this.storageService.getUserEmail().replace(/"/g, '') + "" : '', Validators.compose([Validators.required, EmailValidator.isValid])],
			password: [this.storageService.getUserPassword() ? this.storageService.getUserPassword().replace(/"/g, '') + "" : '', Validators.compose([Validators.minLength(6), Validators.required])]
		});
	}

	ionViewDidLoad() {
		this.events.publish('enableDisableMenu', false);
	}

	public openRegister() {
		this.navCtrl.push('RegisterPage', { animate: true, direction: 'backward' });
	}

	public addKey() {
		this.navCtrl.push('AddKeyPage', { animate: true, direction: 'backward' });
	}

	public forgotPassword() {
		this.navCtrl.push('ForgotPasswordPage', { animate: true, direction: 'backward' });
	}

	public loginFacebook() {
		this.apiComponents.createLoading().then((loading: Loading) => {
			loading.present();
			this.authProvider.loginFacebook()
				.then(authData => {
					this.prepareUserSocialLogin(authData, loading);
				}, errorCode => {
					loading.dismiss().then(() => {
						this.showError("CODE_AUTH." + Configuration.errorCodeAuth[errorCode + ""]);
					});
				});
		});
	}

	public loginGoogle() {
		this.apiComponents.createLoading().then((loading: Loading) => {
			loading.present();
			this.authProvider.loginGoogle()
				.then(authData => {
					this.prepareUserSocialLogin(authData, loading);
				}, errorCode => {
					this.translate.get("CODE_AUTH." + Configuration.errorCodeAuth[errorCode + ""]).toPromise()
						.then((response) => {
							loading.dismiss();
							this.showError(response);
						})
				});
		});
	}

	public loginUser() {
		this.apiComponents.createLoading().then((loading: Loading) => {
			loading.present();
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

		});
	}

	private prepareUserSocialLogin(authData, loading: Loading) {
		this.service.login(authData).then((data) => {
			if (data) {
				this.loginSuccess(loading, data);
			} else {
				this.registerNewuser(authData, loading);
			}
		}).catch((err) => {
			if (err) {
				this.registerNewuser(authData, loading);
			} else {
				loading.dismiss();
			}
		});
	}

	private registerNewuser(authData, loading) {
		this.service.createUser(authData).then((data) => {
			if (data) {
				this.loginSuccess(loading, authData);
			} else {
				loading.dismiss();
			}
		}).catch((err) => {
			loading.dismiss();
		});
	}

	private loginSuccess(loading: Loading, response) {
		this.storageService.setUserIsLoged(true);
		this.storageService.setUserData(response);
		this.storageService.setUserEmail(this.loginForm.value.email);
		this.storageService.setUserPassword(this.loginForm.value.password);
		/*	this.service.getNotification(response).then((notifications) => {
				if (notifications) {
					let promises = [];
					for (let notification of notifications) {
						promises.push(this.openLocalNotification(notification.client, notification.clientId));
					}
				}
			})*/
		this.navCtrl.setRoot('KeysPage', { animate: true, direction: 'backward' });
		this.events.publish('enableDisableMenu', true);
		this.events.publish('setUser', response);

		this.events.publish("tokenloaded");

		loading.dismiss();

	}
	private openLocalNotification(client?, idClient?) {
		let parameters = { value: client };
		let promises = [
			this.translate.get("POLICY.ASK_PERMISSIONS", parameters).toPromise(),
			this.translate.get('GENERAL.OK').toPromise(),
			this.translate.get('GENERAL.CANCEL').toPromise(),
		];
		Promise.all(promises).then((strings: string[]) => {
			this.apiComponents.createAlert(
				strings[0],
				'',
				strings[2],
				strings[1],
				() => {
					this.storageService.getUserData().then((user) => {
						let idGuest = "";
						if (user) {
							idGuest = user.guest._id
							this.service.setPermissionPersonalData(idGuest, idClient, client, "yes")
								.then((response) => {
									return Promise.resolve();
								}).catch((error) => {
									console.log(error);
									return Promise.reject(error);
								});
						}
					}).catch(() => {

					})
				},
				() => {
					this.storageService.getUserData().then((user) => {
						let idGuest = "";
						if (user) {
							idGuest = user.guest._id
							this.service.setPermissionPersonalData(idGuest, idClient, client, "yes")
								.then((response) => {
									return Promise.resolve();
								}).catch((error) => {
									console.log(error);
									return Promise.reject(error);
								});
						}
					})
				}
			).then((alert: Alert) => {
				alert.present();
			});
		});
	}

	private showError(errorCode) {
		this.apiComponents.createToast(errorCode, 3000, 'bottom')
			.then((toast: Toast) => {
				toast.present();
			});
	}
}