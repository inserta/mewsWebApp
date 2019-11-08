import { Component, ViewChild, Input, Renderer2 } from '@angular/core';
import { AlertController, Slides, Platform, Toast, NavController, NavParams, ModalController, Loading, Content, Events } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from "../../app/services/service.storage";

import { ServiceAPI } from "../../app/services/service.api";
import { ApiComponents } from "../../components/api-components";

import { User } from '../../app/models/user.model';
import { AuthProvider } from '../../providers/auth/auth';
import { QRCodeComponent } from 'angular2-qrcode';
//import { GeoPageClick } from '../../pages/geoclick/geoclick';

import { FastcheckinPage } from '../../pages/fastcheckin/fastcheckin';
//import { FiltersPage } from '../../pages/filters/filters';


declare var becheckinLock;

@Component({
    selector: 'be-key',
    templateUrl: 'be-key.html'
})
export class BeKeyComponent  {

    @ViewChild(Slides) slides: Slides;

    @Input() room: string = '';
    @Input() name: string = '';
    @Input() codeOne: string = ''
    @Input() codeTwo: string = '';
    @Input() nameBelux: string = '';
    @Input() codeOneBelux: string = ''
    @Input() codeTwoBelux: string = '';
    @Input() start: string = '';
    @Input() finish: string = '';
    @Input() image: string = '';
    @Input() backgroundColor: string = '';
    @Input() hasLight: boolean;
    @Input() user: User;
    @Input() keyRoomId: string = '';
    @Input() keyclient: string = '';
    @Input() nslide: boolean = true;

    qr: string = '../../assets/imgs/qr.png'
    map: string = '../../assets/imgs/maps.png'
    imguser: string = '../../assets/imgs/user.png'

    private service: string = "FFE0";
    private characterist: string = "FFE1";
    private service32: string = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
    private characterist32: string = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
    public isDark: boolean = false;
    private openError: boolean = false;
    private esMqtt: boolean = false;
    private codeUno: string = '';
    private codeDos: string = '';
    private nombreBt: string = '';
    private dispositivoActual = '';
    private mac: string = '00:00:00:00:00:00';
    private requestOpen: any;
    private requestRegister: any;
    private esChina: boolean = false;
    private tokenUser: string;
    private tokenFirebaseUser: string;
    private vm: any;
    public myloading: any;
    private isFake: boolean = false;
    public tooEarly: boolean = false;
    public tooLate: boolean = false;
    public cargado: boolean =false;
    public abrir: boolean = true;
    code: string = '';
    pulsadolight: boolean = false;


    constructor(
        private translate: TranslateService,
        private platform: Platform,
        private serviceAPI: ServiceAPI,
        private apiComponents: ApiComponents,
        private _ble: BLE,
        private modalCtrl: ModalController,
        private bluetoothSerial: BluetoothSerial,
        private alertCtrl: AlertController,
        private renderer: Renderer2,
        private storageService: StorageService,
        private Auth: AuthProvider,
        private events: Events,
        private navCtrl: NavController,
        public params: NavParams,

    ) {

        this.vm = this;
        this.code = this.storageService.getCode() ? this.storageService.getCode() : "";
        console.log("code:", this.code)
        //console.log('client: ', this.client)
        //this.irTravel()


    }

    abrirPuerta() {
      if (this.abrir) {
        this.connectToDevice('becheckin', 0)
      }
      this.abrir = true;
    }

    openChina(loading) {
        let vm = this;
        let dismissed = false;
        this.myloading = loading;
        setTimeout(() => {
            if (!dismissed) {
                vm.vm.myloading.dismiss();
                // vm.showToast('ERROR_CONNECT_DOOR');
            }
        }, 15000);
        becheckinLock.initialize({ init: 'init', code: this.codeDos, nombre: this.nombreBt },
            function (response) {
                dismissed = true;
                vm.vm.myloading.dismiss();
                vm.showToast('OPEN_DOOR');
                if (vm.hasLight) vm.connectToDevice('belux', 0);
                vm.registerOpenDoor();
            }, function (error) {

            });
    }

    ngOnChanges() {
        console.log('con: ', this.nslide)
        if (this.nslide) this.irServicios()
        this.isDark = this.getBrightness(this.hexToRgb(this.backgroundColor));
        if (this.storageService.getDownloadCode()) {
            this.tokenUser = "";
            this.tokenFirebaseUser = "";
        } else {
            this.tokenUser = this.user.token;
            this.tokenFirebaseUser = this.user.guest.tokenFirebase;
        }
    }

    irServicios() {
          console.log('1')
          this.abrir = false;
          this.nslide = false;
          this.slides.lockSwipeToNext(false);
          this.slides.slideTo(2, 500);
          this.slides.lockSwipeToPrev(true);
          this.slides.lockSwipeToNext(true);


    }

    irTravel() {
          this.slides.lockSwipeToPrev(false);
          this.slides.slideTo(0, 500);
          this.slides.lockSwipeToPrev(true);
          this.slides.lockSwipeToNext(true);

    }

    connectToDevice(tipo, procede) {
        this.Auth.relogin().then((token) => {
            this.esChina = false;
            this.dispositivoActual = tipo;
            let mensaje = '';

            if (tipo == 'becheckin') {
                this.codeUno = this.codeOne;
                this.codeDos = this.codeTwo;
                this.nombreBt = this.name;
                this.translate.get('KEYS.MESSAGES.' + 'OPENING_DOOR').subscribe((res: any) => {
                    mensaje = res
                });
            } else {
                this.codeUno = this.codeOneBelux;
                this.codeDos = this.codeTwoBelux;
                this.nombreBt = this.nameBelux;
                this.translate.get('KEYS.MESSAGES.' + 'LIGHTING_LIGHT').subscribe((res: any) => {
                    mensaje = res
                });
            }

            if (this.isDesactivate()) {
                this.slides.lockSwipeToNext(false);
                this.slides.slideTo(3, 500);
                this.slides.lockSwipeToPrev(true);
                this.slides.lockSwipeToNext(true);
                return;
            }

            if ((this.codeUno == "-----") && (this.codeDos != '-----'))
                this.esMqtt = true
            else
                this.esMqtt = false;

            if ((this.codeUno == "*****")) {
                this.esChina = true;
            }

            this.apiComponents.createLoadingWithMessage(mensaje).then((loading: Loading) => {
                loading.present();
                if (this.esChina) {
                    this.vm.myloading = loading;
                    this.openChina(loading)
                } else {
                    if ((this.codeUno == "-----") && (procede == 0)) {
                      console.log('abriendo por wifi')
                        this.openWifi(loading, tipo);

                    } else {
                        this.checkBluetooth(loading, tipo);
                    }
                }
            });
        }).catch((error) => {
            console.log("error relogin");
            this.events.publish('reLogin');
        })
    }

    slideStarts(e?) {

        let currentIndex = this.slides.getActiveIndex();
        console.log('index: ', currentIndex)
        if (e) {
            let id = e.id;
            let slide = document.getElementsByClassName("slides-" + id)[0];
            this.renderer.addClass(slide.getElementsByTagName('ion-slide')[currentIndex], 'opacity-transition');
            setTimeout(() => {
                this.renderer.removeClass(slide.getElementsByTagName('ion-slide')[currentIndex], 'opacity-transition');
            }, 2000);
        }
        if (currentIndex == 0) {
            this.slides.lockSwipeToPrev(true);
            this.slides.lockSwipeToNext(false);
            setTimeout( t => {
              if (!this.pulsadolight)
                this.irTravel();
            }, 5000)
        }
        if (this.openError) {
            if (currentIndex == 1) {
                this.slides.lockSwipeToPrev(false);
                this.slides.lockSwipeToNext(false);
                this.slides.slideNext();
            }

            if (currentIndex == 2) {
                this.openError = false;
                this.slides.lockSwipeToPrev(false);
                this.slides.lockSwipeToNext(true);
            }
        } else {
            if (currentIndex == 1) {
                this.slides.lockSwipeToPrev(false);
                this.slides.lockSwipeToNext(true);
            }

            if (currentIndex == 2) {
                this.slides.slidePrev();
            }
        }

        if (currentIndex == 3) {
            this.slides.lockSwipeToPrev(true);
            this.slides.lockSwipeToNext(true);
        }
    }

    private hideLoading(loading) {
        setTimeout(data => {
            loading.dismiss();
        }, 2000);
    }

    private checkBluetooth(loading, device) {
      /*
        this._ble.isEnabled()
            .then(() => {
                this.openBluetooth(loading, device)
            })
            .catch(() => {
                const alert = this.alertCtrl.create({
                    title: 'Bluetooth desactivado',
                    subTitle: 'Actívelo para usar la llave.',
                    buttons: ['OK']
                });
                alert.present();
                this.hideLoading(loading)
            })
            */
            this.hideLoading(loading)
    }

    private isDesactivate() {
        let start = new Date(this.start);
        let finish = new Date(this.finish)
        let now = new Date();
        if (start > now) this.tooEarly = true;
        else if (finish < now) this.tooLate = true;
        return (this.tooEarly || this.tooLate)
    }

    private turnBelux(tipo)  {  // tipo = 0, enciende, tipo = 1, apaga
       this.Auth.relogin().then((token) => {
         this.pulsadolight = true;
         let mensaje = ''
         this.codeUno = this.codeOneBelux;
         this.codeDos = this.codeTwoBelux;
         this.nombreBt = this.nameBelux;
         this.translate.get('KEYS.MESSAGES.' + 'LIGHTING_LIGHT').subscribe((res: any) => {
             mensaje = res
         });
         this.apiComponents.createLoadingWithMessage(mensaje).then((loading: Loading) => {
             loading.present();
                let lanzado = false;
                console.log('token: ', this.tokenUser)
                console.log('Placa: ', this.nombreBt)
                console.log('RoomID: ', this.keyRoomId)
                this.serviceAPI.turnBelux(this.tokenUser, this.nombreBt, this.keyRoomId, tipo).then((response) => {
                    this.registerOpenDoor();
                    lanzado = true;
                    this.hideLoading(loading);
                    this.pulsadolight = false;

                }).catch((error) => {
                    lanzado = true;

                        this.hideLoading(loading);
                        this.pulsadolight = false;

                });
                setTimeout(() => {
                    this.hideLoading(loading);
                    this.pulsadolight = false;
                }, 3000);
              })
      })
    }

    private openWifi(loading, tipo) {
        let lanzado = false;
        console.log('token: ', this.tokenUser)
        console.log('Placa: ', this.nombreBt)
        console.log('RoomID: ', this.keyRoomId)
        this.serviceAPI.openDoor(this.tokenUser, this.nombreBt, this.keyRoomId).then((response) => {
            this.registerOpenDoor();
            lanzado = true;
            if ((this.esMqtt) && (tipo == 'becheckin')) {
                setTimeout(() => {
                    this.checkBluetooth(loading, tipo);
                }, 2000);

            } else {
                this.translateLoadingContent(loading, "OPEN_DOOR");
                this.hideLoading(loading);
                if ((this.hasLight) && (tipo == 'becheckin')) {
                    this.connectToDevice('belux', 0);
                }
            }
        }).catch((error) => {
            lanzado = true;
            if (this.esMqtt) {
                this.checkBluetooth(loading, tipo);
            } else {
                this.hideLoading(loading);
            }
        });
        setTimeout(() => {
            if (!lanzado) {
                this.checkBluetooth(loading, tipo)
            }
        }, 3000);
    }

    private openBluetooth(loading, tipo) {
        let found = false;
        if (tipo == 'becheckin')
            this.translateLoadingContent(loading, "OPENING_DOOR");
        else
            this.translateLoadingContent(loading, "LIGHTING_LIGHT");

        let message = this.stringToBytes("RC" + this.codeUno + this.codeDos);
        if (this.esMqtt) message = this.stringToBytes("CJx" + this.codeDos);

        this._ble.startScan([]).subscribe(device => {
            if (device.name == this.nombreBt) {
                found = true;
                this.openDoor(device, message, loading);
                this._ble.stopScan();
            }
        }, err => {
            //loading.data.content = "Error Scan"
        })
        setTimeout(() => {
            if (!found) {
                this._ble.stopScan();
                this.translateLoadingContent(loading, "DEVICE_NOT_FOUND");
                this.hideLoading(loading);
            }
        }, 5000);
    }

    private openDoor(device, message, loading) {
        if (this.platform.is('android') && (!this.esMqtt)) {
            this.mac = device.id.substring(0, 7) + 'E' + device.id.substring(8);
            this.bluetoothSerial.connect(this.mac).subscribe(
                data => {
                    setTimeout(() => {
                        this.bluetoothSerial.write('RC' + this.codeUno + this.codeDos)
                            .then(() => {
                                this.translateLoadingContent(loading, "OPEN_DOOR");
                                this.hideLoading(loading);
                                this.registerOpenDoor();
                                this.bluetoothSerial.disconnect().then(data => {
                                    if ((this.hasLight) && (this.dispositivoActual == 'becheckin')) {
                                        this.connectToDevice('belux', 0);
                                    }
                                });
                            })
                            .catch(() => {
                                this.translateLoadingContent(loading, "KEY_SEND_ERROR");
                                this.hideLoading(loading);
                                this.bluetoothSerial.disconnect();
                            })
                    }, 1000)
                },
                err => { }
            );
        } else { 			// Apertura por BLE
            let servicio = this.service;
            let caracteristica = this.characterist;
            if (this.esMqtt) {
                servicio = this.service32;
                caracteristica = this.characterist32;
                this.openBW(device, message, loading);
            } else {
                this._ble.connect(device.id)
                    .subscribe(data => {

                        this._ble.writeWithoutResponse(device.id, servicio, caracteristica, message)
                            .then(data => {
                                this.translateLoadingContent(loading, "OPEN_DOOR");
                                this._ble.disconnect(device.id).then(data => {
                                    if (data == "OK") {
                                        this.registerOpenDoor()
                                    }
                                    if ((this.hasLight) && (this.dispositivoActual == 'becheckin')) {
                                        this.connectToDevice('belux', 0);
                                    }
                                })
                                this.hideLoading(loading);
                            })
                            .catch(error => {
                                this.translateLoadingContent(loading, "KEY_SEND_ERROR");
                                this.hideLoading(loading);
                                this._ble.disconnect(device.id);

                            })
                    }, error => {
                        this.translateLoadingContent(loading, "DEVICE_ERROR_CONNECT");
                        this.hideLoading(loading);
                    })
            }
        }
    }

    private openBW(device, message, loading) {
        let conectado, leido = false;
        this._ble.connect(device.id).subscribe(data => {
            conectado = true;
            this._ble.read(device.id, this.service32, this.characterist32)
                .then(data => {
                    let v = new Uint8Array(data)
                    leido = true;

                    if (v[0] == 1) {
                        this.translateLoadingContent(loading, "OPEN_DOOR");
                        this.hideLoading(loading);
                        this.registerOpenDoor();
                        this._ble.disconnect(device.id).then(data => {
                            if ((this.hasLight) && (this.dispositivoActual == 'becheckin')) {
                                this.connectToDevice('belux', 0);
                            }
                        })
                    } else {
                        this._ble.write(device.id, this.service32, this.characterist32, message)
                            .then(data => {
                                this.translateLoadingContent(loading, "OPEN_DOOR");
                                this.hideLoading(loading);
                                this.registerOpenDoor();
                                this._ble.disconnect(device.id).then(data => {
                                    if ((this.hasLight) && (this.dispositivoActual == 'becheckin')) {
                                        this.connectToDevice('belux', 0);
                                    }
                                })
                            }, error => {
                                this.showToast("KEY_SEND_ERROR_BT");
                                this.hideLoading(loading);
                                this._ble.disconnect(device)
                            })
                    }
                })
                .catch(error => {
                    this._ble.disconnect(device.id);
                })
        }, error => {
            if (!conectado) {
                // this.translateLoadingContent(loading, "ERROR_CONNECT_DOOR");
            }
        });
        setTimeout(() => {
            if (!conectado) {
                // this.translateLoadingContent(loading, "TIME_EXCEDED");
                this.hideLoading(loading);
                this._ble.disconnect(device)
            }
        }, 5000);
    }

    private stringToBytes(dado) {
        var array = new Uint8Array(dado.length);
        for (var i = 0, l = dado.length; i < l; i++) {
            array[i] = dado.charCodeAt(i);
        }
        return array.buffer;

    }

    private registerOpenDoor() {
        this.storageService.getUserData().then((userData) => {
            if (userData) {
                this.serviceAPI.registerOpenDoor(this.tokenUser, this.name, this.mac, userData.guest._id)
                    .then((response) => { }).catch((error) => {
                        this.requestRegister.unsubscribe()
                    });
            } else {
                this.serviceAPI.registerOpenDoorFake(this.name, this.storageService.getCode())
                    .then((response) => { }).catch((error) => {
                        this.requestRegister.unsubscribe()
                    });
            }
        });
    }

    private hexToRgb(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    private getBrightness(color) {
        return (((color.r * 299 + color.g * 587 + color.b * 114) / 1000) < 130);
    }

    private showToast(message: string) {
        this.translate.get('KEYS.MESSAGES.' + message).subscribe((res: any) => {
            this.apiComponents.createToast(res, 3000, 'bottom')
                .then((toast: Toast) => {
                    toast.present();
                });
        });
    }

    private translateLoadingContent(loading: Loading, label: string) {
        this.translate.get('KEYS.MESSAGES.' + label).subscribe((res: any) => {
            loading.data.content = res
        });
    }

    openQr() {
            var t =  { pin: '0'}

            let alert = this.alertCtrl.create({
              title: this.translate.instant("PAGO.PIN_TITLE"),
              subTitle: this.translate.instant("PAGO.PIN_SUBTITLE"),
              enableBackdropDismiss: true ,
              message:this.translate.instant("PAGO.PIN_MESSAGE"),
              inputs: [
              {
                name: 'pin',
                type:'password',
                placeholder: this.translate.instant("PAGO.PIN_HOLDER"),
              }
            ],
              buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {
                  console.log('Cancel clicked');
                }
              },
              {
                text: 'Ok',
                handler: data => {
                  if (data) {

                    var j = JSON.stringify(data)
                    t = JSON.parse(j);
                    console.log('Data:' + t.pin)
                    //this.showQRPIN(t.pin)

                    this.storageService.getUserData().then((userData) => {
                        if (userData) {
                            this.user = userData;
                            console.log(this.user)
                            console.log(this.keyclient)
                            let body = { idUsuario:this.user.guest._id, cvc:t.pin }
                            this.serviceAPI.getpin(body).then(pin => {

                              if (pin.card != null) {
                                console.log('card: ', pin.card)
                                if (pin.card.card)
                                  this.showQRPIN(pin.card.card, this.user.guest._id)
                                else
                                  this.showQRPIN('1',0)
                              }else{
                                this.showQRPIN('1', 0)
                              }

                            })

                        }
                    });

                  } else {
                    // invalid login
                    return false;
                  }
                }
              }
            ]
          });
          alert.present();
      }


    showQRPIN(pin, user) {

      if (pin == '1') {
        let alert = this.alertCtrl.create({
            title: this.translate.instant("PAGO.PIN_ERROR"),
            subTitle: this.translate.instant("PAGO.PIN_CHECK"),
            buttons: ['OK']
        });
        alert.present();


      }else{
                let t = this.translate.instant("PAGO.TITULO");
                let st = this.translate.instant("PAGO.QR");
                this.modalCtrl.create('ModalQrPage', { fastcheckin: user + '&'+ pin, titulo:t, subtitulo:st   }).present();

    }
  }

    openMaps() {
      this.navCtrl.setRoot('GeoPage', {});
      //this.navCtrl.setRoot('FiltersPage', {});
      //this.navCtrl.push(GeoPageClick);

    /*
      let alert = this.alertCtrl.create({
          title: "Puntos de interés",
          subTitle: "Visitar Interés Turístico",
          buttons: ['OK']
      });
      alert.present();
    */

    }

    openUser() {
      this.navCtrl.setRoot('FastcheckinPage', { comeFromCard: true });
    }

    showalert(titulo, subtitulo, mensaje, funcion) {
      let alert = this.alertCtrl.create({
         title: titulo,
         subTitle: subtitulo,
         message: mensaje,
         buttons: [
         {
             text: this.translate.instant("GENERAL.OK"),
             handler: data => {

             }
         }
       ]})
       alert.present()
    }


    opendatosWifi() {
       this.showalert('WIFI','SSID: ' + this.serviceAPI.actualHotel.wifiSSID, 'PASS: '+ this.serviceAPI.actualHotel.wifiPASS, '')
    }

    openWhatsapp() {
      
      window.open("https://api.whatsapp.com/send?phone=" + this.serviceAPI.actualHotel.whatsapp.telefono);
  }

}
