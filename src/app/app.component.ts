import { Component, ViewChild } from '@angular/core';
import { enableProdMode } from '@angular/core';
//enableProdMode();
import { Platform, MenuController, Loading, Nav, Events, Alert, ModalController, NavController, IonicPage } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';
import { Globalization } from '@ionic-native/globalization';

import { StorageService } from "./services/service.storage";
import { Configuration } from "../environments/configuration";

import { ApiComponents } from "../components/api-components";
import { FCM } from '@ionic-native/fcm';
// import { LocalNotifications } from '@ionic-native/local-notifications';
import { WindowRef } from './window';

import { User } from "./models/user.model";
import { AuthProvider } from '../providers/auth/auth';
import { ServiceAPI } from './services/service.api';
import { Client } from './models/room.model';
//import { PagoPage } from '../pages/pago/pago';
import { GeoPage } from '../pages/geo/geo';
//import { V4MAPPED } from 'dns';
import { Camera } from '@ionic-native/camera';

@Component({
	templateUrl: 'app.html'
})
export class MyApp {

	@ViewChild(Nav) nav: Nav;

	public rootPage: any;
	public pages: any;
	public showCloseSession: boolean = true;
	private pagesMenuAll: any;
	private pagesMenuReduce: any;
	private currentUser: User;
	private client: Client;
	public miloading: any;

	public hotelId: '';
	constructor(
		private Auth: AuthProvider,
		private platform: Platform,
		private statusBar: StatusBar,
		private splashScreen: SplashScreen,
		private menuCtrl: MenuController,
		private storageService: StorageService,
		private events: Events,
		private apiComponents: ApiComponents,
		private globalization: Globalization,
		private translate: TranslateService,
		//private fcm: FCM,
		private window: WindowRef,
		private _apiService: ServiceAPI,
		private modalCtrl: ModalController


		//private navCtrl: NavController
		//private localNotifications: LocalNotifications
	) {
		this.platform.ready().then(() => {

			if (this.platform.is('cordova')) {




				this.splashScreen.hide();


				this.globalization.getPreferredLanguage().then(res => {
					let currentLanguage = Configuration.languages.filter(elem => {
						return elem.value === res.value;
					})[0];
					this.translate.setDefaultLang(currentLanguage.language)
				}).catch(e => {
					console.log(e);
					this.translate.setDefaultLang(Configuration.defaultLanguage);
				});
			} else {
				this.translate.setDefaultLang(Configuration.defaultLanguage);
			}

			console.log('Lenguaje: ', this.translate.getDefaultLang())
/* ORIENTACIÓN COMENTADA: REALIZADA EN PWA, EN MANIFEST.JS
			// Control orientación pantalla
			this.miloading = "";
			// Comprobación inicial si tiene orientación negativa solo para móviles:
			if (this.platform.is('ios') || this.platform.is('android')) {
				if (window.nativeWindow.screen.orientation.type.indexOf("landscape") != -1) {
					setTimeout(() => {
						this.apiComponents.createLoadingWithMessage(this.translate.instant('GENERAL.HORIZONTAL_CHANGE')).then((loading: Loading) => {
							loading.present();
							this.miloading = loading;
						});
					}, 1000);
				}
				// Listen for orientation change: Vertical or horizontal mode:
				window.nativeWindow.addEventListener("orientationchange", (e) => {
					// Control of horizontal change:
					if (window.nativeWindow.screen.orientation.type.indexOf("landscape") != -1) {
						if (this.miloading == "") {
							this.apiComponents.createLoadingWithMessage(this.translate.instant('GENERAL.HORIZONTAL_CHANGE')).then((loading: Loading) => {
								loading.present();
								this.miloading = loading;
							});
						}
						// Control of vertical change:
					} else {
						if (this.miloading != "") {
							this.miloading.dismiss();
							this.miloading = "";
						}
					}

				}, false);
			}
*/
			setTimeout(() => {
				//document.documentElement.requestFullscreen();
				this.statusBar.styleLightContent();
				this.splashScreen.hide();
				// set to portrait
				//this.sc.lock('portrait');
				// allow user rotate
				this.statusBar.hide();
			}, 2000);

			if (this.platform.is('cordova')) {
				this.initFirebase();
			}

			this.hotelId = this.platform.getQueryParam('hotelId');
			console.log('Hotel: ', this.hotelId)

			if (this.hotelId) {
				console.log('en root')
				this.nav.setRoot('GeoPage', { idHotel: this.hotelId, nombre: this.platform.getQueryParam('nombre') })
			} else {


				this.selectScreen();
				this.initPages();
				this.prepareUserLoged();

				this.listenerToEnableDisableMenu();
				this.listenerToUpdateMenu();
				this.listenerToSetUser();
				this.listenerToSetClient();
			}

		});
	}

	public openPage(page: any) {
		switch (page) {
			case 1:
				this.nav.setRoot('AddKeyPage');
				break;
			case 2:
				this.nav.setRoot('FastcheckinPage');
				break;
			case 3:
				this.nav.setRoot('FaqPage');
				break;
			case 4:
				this.modalCtrl.create('TourPage').present();
				break;
			case 5:
				this.nav.setRoot('PagoPage');
				break;
			case 6:
				//this.navCtrl.push('GeoPage');
				this.nav.setRoot('GeoPage');
				break;
			default:
				break;
		}
		this.menuCtrl.close();
	}

	public closeSessionAlert() {
		let promises = [
			this.translate.get('ACCESS.CLOSE_SESSION_INFO').toPromise(),
			this.translate.get('ACCESS.CLOSE_SESSION_STAY').toPromise(),
			this.translate.get('MENU.CLOSE_SESSION').toPromise(),
		];
		Promise.all(promises).then((strings: string[]) => {
			this.apiComponents.createAlert(
				strings[0],
				'',
				strings[1],
				strings[2],
				() => {
					this.closeSession();
				},
				() => { }
			).then((alert: Alert) => {
				alert.present();
			});
		});
	}

	public closeSession() {

		this.nav.setRoot('AddKeyPage', { animate: true, direction: 'backward' });
		this.storageService.setUserIsLoged(false);
		this.storageService.setUserData(null);

	}

	private initPages() {
		this.pagesMenuAll = [
			{ title: 'MENU.OPTION1', id: 1, icon: 'log-in' },
			{ title: 'MENU.OPTION2', id: 2, icon: 'person' },
			{ title: 'MENU.OPTION7', id: 5, icon: 'card' },
			{ title: 'MENU.OPTION8', id: 6, icon: 'pin' }
		]

		this.pagesMenuReduce = [
			{ title: 'MENU.OPTION1', id: 1, icon: 'log-in' },
			{ title: 'MENU.OPTION3', id: 3, icon: 'icon-inn-help' }
		]
		this.pages = this.pagesMenuAll;
	}

	private selectScreen() {

		this.storageService.getKeys()
			.then((response) => {
				if (this.storageService.getUserIsLoged()) {
					this.storageService.getUserData().then((user) => {
						this.Auth.relogin().then((token) => {
							this.rootPage = 'AddKeyPage';
						})
							.catch((data) => {
								console.log("error relogin");
								this.rootPage = 'AddKeyPage';
							})
					})
				} else if (response) {
					this.rootPage = 'AddKeyPage';
				} else {
					this.rootPage = 'AddKeyPage';
				}
			}).catch(() => {
				this.rootPage = 'AddKeyPage';
			});


	}

	private initFirebase(): any {
		/*
			this.fcm.getToken().then((token) => {
				this.storageService.setTokenFirebase(token + "");
			}).catch((error) => {
				console.log(error);
			});
			this.fcm.onTokenRefresh().subscribe(token => {
				this.storageService.setTokenFirebase(token);
			});
			this.fcm.onNotification().subscribe(data => {
				if (data.wasTapped) {
					this.nav.setRoot('RequestPermissionPage', { client: data.cliente, idClient: data.idCliente });
				} else {
					this.openLocalNotification(data.cliente, data.idCliente);
				}
			});*/
	}

	private openLocalNotification(client?, idClient?) {
		// var vm = this;
		// let promises = [this.translate.get('GENERAL.NOTIFICATIONS.BODY_REQUEST_DATA').toPromise()];
		// Promise.all(promises).then((strings: string[]) => {
		// 	this.localNotifications.schedule({
		// 		title: "Becheckin Pro - " + client,
		// 		text: strings[0],
		// 		icon: 'assets://images/icon.png'
		// 	});
		// 	this.localNotifications.on("click").subscribe((data) => {
		// 		this.nav.setRoot('RequestPermissionPage', { client: client, idClient: idClient });
		// 	});
		// });
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
							this._apiService.setPermissionPersonalData(idGuest, idClient, client, "yes")
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
							this._apiService.id = idGuest;
							this._apiService.setPermissionPersonalData(idGuest, idClient, client, "no")
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

	private prepareUserLoged() {
		this.storageService.getUserData().then((data) => {
			if (data) {
				this.currentUser = data;
			}
		});
	}
	/** LISTENERS */
	private listenerToEnableDisableMenu() {
		this.events.subscribe('enableDisableMenu', (data) => {
			this.menuCtrl.enable(data);
		});
	}

	private listenerToSetClient() {
		this.events.subscribe('setClient', (data) => {
			if (data.client) {
				this.storageService.setClient(data.client);
				this.client = data.client
				if (!this.client.hasFastcheckin) {
					this.pages = [
						{ title: 'MENU.OPTION1', id: 1, icon: 'log-in' },
						{ title: 'MENU.OPTION3', id: 3, icon: 'person' },
						{ title: 'MENU.OPTION6', id: 4, icon: 'icon-inn-help' },
						{ title: 'MENU.OPTION7', id: 5, icon: 'icon-inn-key' },
						{ title: 'MENU.OPTION8', id: 6, icon: 'icon-inn-key' }
					]
				} else {
					this.pages = this.pagesMenuAll;
				}
			}
		});
	}

	private listenerToSetUser() {
		this.events.subscribe('setUser', (data) => {
			this.currentUser = data;
		});
	}

	private listenerToUpdateMenu() {
		this.events.subscribe('updateMenu', (data) => {
			this.showCloseSession = data;
			if (data) {
				this.pages = this.pagesMenuAll;
			} else {
				this.pages = this.pagesMenuReduce;
			}
		});
	}

	private listenerToGoToLogin() {

		this.events.subscribe('reLogin', (data) => {
			this.nav.setRoot('AddKeyPage', { animate: true, direction: 'backward' });
			this.storageService.setUserIsLoged(false);

		});

	}

}
