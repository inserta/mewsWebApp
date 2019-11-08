import { KeyRoom, Client } from './../../app/models/room.model';
import { Component, ViewChild } from '@angular/core';
import { Events, Alert, Loading, Toast, Content, Platform, NavController, NavParams, IonicPage } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from 'ionic-angular';

import { ConnectionProvider } from "../../providers/connection/connection";
import { ServiceAPI } from '../../app/services/service.api';
import { StorageService } from '../../app/services/service.storage';
import { ApiComponents } from '../../components/api-components';

import { User } from '../../app/models/user.model';

import { Observable, Subscription } from 'rxjs/Rx';
import { AuthProvider } from '../../providers/auth/auth';
//import { FiltersPage } from '../filters/filters';

@IonicPage()
@Component({
	selector: 'page-keys',
	templateUrl: 'keys.html',
})
export class KeysPage {

	@ViewChild(Content) content: Content;

	private keys: KeyRoom[];
	private keysEmpty: any = [];
	private userIsLoged: boolean;
	public user: User;
	public bluetoothOn: boolean = false;
	public wifiOn: boolean = false;
	public androidPlatform: boolean = false;
	public subscription: Subscription = undefined;
	public countdownInterval: number;
	private tokenloaded: boolean = false;
	private searchKeyInput: string = "";
	private showSearchIcon: boolean = false;
	private showSearch: boolean = false;
  public nslide: boolean =false;
  actualClient: any;

	constructor(
		private service: ServiceAPI,
		private events: Events,
		private translate: TranslateService,
		private connectionProvider: ConnectionProvider,
		private storageService: StorageService,
		private apiComponents: ApiComponents,
		private platform: Platform,
		private Auth: AuthProvider,
		private _apiService: ServiceAPI,
		public navCtrl: NavController,
    private alertCtrl: AlertController,
    private params: NavParams
	) {

		if (platform.is('android')) {
			this.androidPlatform = true;
		}
		this.checkWifiConnection();
		//this.checkBluetoothConnection();
	}

	ngOnChanges() {
		this.content.resize();
    console.log('on: ', this.nslide)
	}

	showSearchBar() {
		this.showSearch = !this.showSearch;
		this.content.resize();
	}

	ionViewDidEnter() {

		this.userIsLoged = this.storageService.getUserIsLoged();
		this.events.publish('enableDisableMenu', true);
		this.getKeys();


	}

	public goToSettings() {
		let promises = [
			this.translate.get('KEYS.ALERT_NO_WIFI_TITLE').toPromise(),
			this.translate.get('KEYS.ALERT_NO_WIFI_BODY').toPromise(),
			this.translate.get('GENERAL.EXIT').toPromise(),
			this.translate.get('GENERAL.CONFIGURATION').toPromise()
		];
		Promise.all(promises).then((strings: string[]) => {
			this.apiComponents.createAlert(
				strings[0],
				strings[1],
				strings[2],
				strings[3],
				() => {
					this.connectionProvider.openNetworkSettings();
				},
				() => {

				}
			).then((alert: Alert) => {
				alert.present();
			});
		});
	}

	public activateBluetooth() {
		this.connectionProvider.enableBluetooth()
			.then((data) => {
				this.bluetoothOn = true;
			}).catch((error) => {
				this.bluetoothOn = false;
			})
	}

	public loadProfile() {
		this.getKeys();
	}

	private getKeys() {
		this.storageService.getUserData()
			.then((user: User) => {
        console.log('user data: ', user)
				this.storageService.getClient().then((client: Client) => {
				if (user && client.hasFastcheckin && user.guest.fastcheckin.name && user.guest.keysRooms || (user && this.service.actualHotel.hasFast == '0')) {
        			this.apiComponents.createLoading().then((loading: Loading) => {
							if (this.storageService.getUserIsLoged()) {
								loading.present();
								this.Auth.relogin().then((token) => {
									this.storageService.getUserData()
										.then((response) => {
											console.log("Getkey: ", response)
											this.user = response;

											this.service.getKeysOfGuest(this.user).then((data) => {
												loading.dismiss();
												this.user = data;

												if (this.user.guest.keysRooms.length > 10) {
													this.showSearchIcon = true;
												}
												this.keys = this.user.guest.keysRooms;
                        console.log("keys: ", response)
												this.keysEmpty = this.user.guest.keysRooms;
												this.checkKeyPermisions(this.user);
												this.storageService.setUserData(data);
											}).catch((error) => {
												console.log(error);
												loading.dismiss();
											})
										});
								}).catch((error) => {
									loading.dismiss();
									this.translate.get('KEYS.TOAST_NO_KEYS').subscribe((res: any) => {
										this.apiComponents.createToast(res, 3000, 'bottom')
											.then((toast: Toast) => {
												toast.present();
											});
									});
									console.log(error);
									this.events.publish('reLogin');
								})
							} else {
								loading.present();
								this.service.getKeyByCode(this.storageService.getCode())
									.then((response) => {
										if (response.response.length > 0) {
											console.log(response)
											this.keys = response.response;
											this.events.publish('setClient', { client: this.keys[0].client })
											this.checkKeyPermisions(user)
										} else {
											this.translate.get('ADD_KEY.NO_KEY').subscribe((res: any) => {
												this.apiComponents.createToast(res, 3000, 'bottom')
													.then((toast: Toast) => {
														toast.present();
													});
											});
										}
										loading.dismiss();
									})
									.catch((error) => {
										console.log(error);
										loading.dismiss();
										this.translate.get('ADD_KEY.NO_KEY').subscribe((res: any) => {
											this.apiComponents.createToast(res, 3000, 'bottom')
												.then((toast: Toast) => {
													toast.present();
												});
										});
									});
							}
						});
					} else {
               if ( this.service.actualHotel.hasFast == '1') {
                  let alert = this.alertCtrl.create({
                      title: this.translate.instant("POLICY.TITLE"),
                      subTitle: '',
                      message: this.translate.instant("POLICY.DESCRIPTION_THREE"),
                      buttons: [
                                 { text: this.translate.instant("FASTCHECKIN.LATER"),
                                      handler: data => {'OK'}
                                 },
                                 { text: this.translate.instant("FASTCHECKIN.COMPLETAR"),
                                      handler: data => {
                                        this.navCtrl.setRoot('FastcheckinPage', {});
                                     }
                                 }
                               ]
                  });
                  alert.present();
                }
              }
/*
						this.apiComponents.createDialogAlert('Rellene sus datos antes de continuar', "Petición de datos", "OK")
						this.navCtrl.setRoot('FastcheckinPage', {});
					}*/
				});
			})
	}

	private checkBluetoothConnection(): any {
		this.connectionProvider.checkConnectioBluethooth()
			.then((response) => {
				this.bluetoothOn = response;
			}).catch((error) => {
				if (this.androidPlatform) {
					this.bluetoothOn = false;
				} else {
					this.bluetoothOn = true;
				}
				console.log(error);
			});
	}

	private checkWifiConnection(): any {
		this.connectionProvider.checkConnectionWifi()
			.then((response) => {
				this.wifiOn = response;
			}).catch((error) => {
				console.log(error);
			});
	}

	public searchKeys() {
		if (this.searchKeyInput == "") {
			this.keys = this.keysEmpty;
		}
		this.keys = this.keysEmpty.filter(elem => {
			return elem.room.name.toLowerCase().indexOf(
				this.searchKeyInput.toLowerCase()) > -1;
		});
	}

	private checkKeyPermisions(user: any) {

    this.service.clienteActual = user.keysRooms[0].client;
    

    console.log('cliente en checkKeyPermisions: ', this.service.clienteActual)

		let idGuest = user.guest._id
		if (this.storageService.getUserIsLoged()) {
			for (let keyRoom of user.guest.keysRooms) {
				if (user.guest.clientOf.some(x => x === keyRoom.client.id)) {
					console.log("Existe");
				}
				else {
					user.guest.clientOf.push(keyRoom.client.id);
					this._apiService.setPermissionPersonalData(idGuest, keyRoom.client.id, keyRoom.client.name, "yes")
						.then((response) => {
						}).catch((error) => {
							console.log(error);
						});
				}
			}
		} else {
			if (this.keys.length > 0) {
				for (let keyRoom of this.keys) {
					if (user.guest.clientOf.some(x => x === keyRoom.client.id)) {
						console.log("Existe");
					}
					else {
						user.guest.clientOf.push(keyRoom.client.id);
						this._apiService.setPermissionPersonalData(idGuest, keyRoom.client.id, keyRoom.client.name, "yes")
							.then((response) => {


							}).catch((error) => {
								console.log(error);
							});
					}
				}
			}
		}
	}

	// private openLocalNotification(client?, idClient?) {
	// 	let parameters = { value: client };
	// 	let promises = [
	// 		this.translate.get("POLICY.ASK_PERMISSIONS", parameters).toPromise(),
	// 		this.translate.get('GENERAL.OK').toPromise(),
	// 		this.translate.get('GENERAL.CANCEL').toPromise(),
	// 	];
	// 	Promise.all(promises).then((strings: string[]) => {
	// 		this.apiComponents.createAlert(
	// 			strings[0],
	// 			'',
	// 			strings[2],
	// 			strings[1],
	// 			() => {
	// 				this.storageService.getUserData().then((user) => {
	// 					let idGuest = "";
	// 					if (user) {
	// 						idGuest = user.guest._id
	// 						this._apiService.setPermissionPersonalData(idGuest, idClient, client, "yes")
	// 							.then((response) => {
	// 								return Promise.resolve();
	// 							}).catch((error) => {
	// 								console.log(error);
	// 								return Promise.reject(error);
	// 							});
	// 					}
	// 				}).catch(() => {

	// 				})
	// 			},
	// 			() => {
	// 				this.storageService.getUserData().then((user) => {
	// 					let idGuest = "";
	// 					if (user) {
	// 						idGuest = user.guest._id
	// 						this._apiService.setPermissionPersonalData(idGuest, idClient, client, "no")
	// 							.then((response) => {
	// 								return Promise.resolve();
	// 							}).catch((error) => {
	// 								console.log(error);
	// 								return Promise.reject(error);
	// 							});
	// 					}
	// 				})
	// 			}
	// 		).then((alert: Alert) => {
	// 			alert.present();
	// 		});
	// 	});
	// }

  goFast() {
    this.nslide = true
    setTimeout( t => { this.nslide = false }, 1000)

    //this.BeKeyComponent.
    //this.navCtrl.setRoot('FastcheckinPage', { comeFromCard: true });
  }
  goMap() {
    this.navCtrl.setRoot('GeoPage', { saltar: true });
  }
  goPago() {
    this.navCtrl.setRoot('PagoPage', {});
  }
  goClose(){
    this.navCtrl.setRoot('AddKeyPage', { animate: true, direction: 'backward' });
    this.storageService.setUserIsLoged(false);
    this.storageService.setUserData(null);
  }

}
