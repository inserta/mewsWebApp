import { Belux } from './../../app/models/room.model';
import { Component, ViewChild, ElementRef, NgZone, SimpleChanges, Input } from '@angular/core';
import { IonicPage, NavController, Loading, NavParams, Platform, ModalController, AlertController, Slides } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';
import { ApiProvider } from '../../providers/api/api';

import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { ApiComponents } from '../../components/api-components';
import { TranslateService } from '@ngx-translate/core';
import { ServiceAPI } from "../../app/services/service.api";

import { ModalImagePage } from '../modal/modal-image/modal-image';
import { ModalEditHuesped } from '../modal/modal-edit-huesped/modal-edit-huesped';


import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { StorageService } from './../../app/services/service.storage';
import { BLE } from '@ionic-native/ble';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { User } from '../../app/models/user.model';
import { DomSanitizer } from '@angular/platform-browser';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Environment,
  GoogleMapOptions,
  Marker,
  LatLng,
  HtmlInfoWindow
} from '@ionic-native/google-maps';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { ContentDrawer } from '../../components/content-drawer/content-drawer';


declare var google;


@IonicPage()
@Component({
  providers: [ContentDrawer],
  selector: 'page-mimap',
  templateUrl: 'mimap.html',
})
export class MimapPage {
  native = true;
  map: GoogleMap;
  mapBrowser: any;

  my_lat: any;
  my_lng: any;

  zoom = 14;

  userPosition;

  b_gotoUser: boolean = false;

  locations: any = [];

  show_place_info = false;
  show_list = true;
  show_km = false;

  info_recomendaciones;
  info_name;
  info_desc;
  info_img;
  info_location;
  info_link;
  info_direccion;

  markers = [];
  kms = [];

  hotel_id: any;
  hotel_name: any;
  hotel_direccion: any;
  base64 = 'data:image/jpeg;base64,';
  cmp = '';
  city = ''
  edad = 0;


  hotel_position = {
    lat: 0,
    lng: 0
  }

  bound: any;
  directionsService: any;
  directionsDisplay: any;




  hidecategorias: boolean = true;
  array_filter_categorie = [true, true, true, true, true, true, true, true, true, true, true, true, true, true];
  array_filter_categorie_text = ['visita', 'excursiones1', 'excursiones2', 'espectaculos', 'parques', 'barco', 'rutas', 'spa', 'museos', 'transfer', 'alquiler', 'agua', 'punto', 'other']
  array_filter_categorie_text_temp = ['visita', 'excursiones1', 'excursiones2', 'espectaculos', 'parques', 'barco', 'rutas', 'spa', 'museos', 'transfer', 'alquiler', 'agua', 'punto', 'other']
  hidelistmode: boolean = true;
  hidehomecontrol: boolean = false;
  fromlist: boolean = false;
  miposition: boolean = true;

  location_filters: any;
  location_filters_temp: any;
  checkboxall: boolean = true;
  distancia_a: string = "H";
  address: string;
  public dates_banner: any = [];
  public dates_top_activities: any = [];
  public ultimo_indice_categoria = "";
  public actualizar_filtros: boolean = false;


  ////////// VARIABLES DEL BE-KEY.TS PARA IMPLEMENTAR APERTURA //////
  private service: string = "FFE0";
  private characterist: string = "FFE1";
  private service32: string = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
  private characterist32: string = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

  private esMqtt: boolean = false;
  private codeUno: string = '';
  private codeDos: string = '';
  private name: string = '';
  private nameBelux: string = '';
  private codeOne: string = '';
  private codeTwo: string = '';
  private codeOneBelux: string = '';
  private codeTwoBelux: string = '';
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
  public cargado: boolean = false;
  public abrir: boolean = true;
  code: string = '';
  pulsadolight: boolean = false;
  public start: '';
  public finish: '';
  public keyRoomId: string = '';
  public hasLight: boolean = false;
  user: User;



  //////////////////////////////////////////////////////////////////

  // Estructura que cargará de la api:
  //public keys=[{"id":1, "name": "room1", "code":"code1","state":false},{"id":2, "name": "room2", "code":"code2","state":false},{"id":3, "name": "room3", "code":"code3","state":false}];
  // public keys=[]; // Prueba no pinta control de llaves cuando esta vacío el array de llaves keys.
  public keys: any;
  public wifi: any;
  public huespedes: any = [];
  public contacthotel = { "direccion": "", "phone": "645458972", "whatsapp": "645458972", "email": "hotel@becheckin.com" };
  public idPdfCiudad = "";
  public code_reserve;
  public period_reserve: any;

  drawerOptions: any;

  public color_icon1: string;
  public color_icon2: string;
  public color_icon3: string;

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('mySlider') slider: Slides;
  @ViewChild('slidesActivities') slidesActivities: Slides;
  @ViewChild('coda') coda: any;

  public icon1: boolean = false;
  public icon2: boolean = false;
  public icon3: boolean = false;
  public icon4: boolean = false;
  public icon5: boolean = false;
  public icon6: boolean = false;


  constructor(public navCtrl: NavController,
    private platform: Platform,
    private geolocation: Geolocation,
    private zone: NgZone,
    public modalCtrl: ModalController,
    public api: ApiProvider,
    public sapi: ServiceAPI,
    private params: NavParams,
    public alertCtrl: AlertController,
    private apiComponents: ApiComponents,
    private launchNavigator: LaunchNavigator,
    private translate: TranslateService,
    private nativeGeocoder: NativeGeocoder,
    private iab: InAppBrowser,
    private storageService: StorageService,
    private _ble: BLE,
    private bluetoothSerial: BluetoothSerial,
    private cd: ContentDrawer,
    private domSanitizer: DomSanitizer) {

    // Full Screen:
    // Para Android:
    if (this.platform.is('android'))
      document.documentElement.requestFullscreen();

    // Set configuration for slide bottom:
    this.drawerOptions = {
      handleHeight: 150,
      thresholdFromBottom: 200,
      thresholdFromTop: 200
      // bounceBack: false
    };

    // get Hotel:
    this.wifi = storageService.getHotel();
    this.wifi = JSON.parse(this.wifi);
    this.code_reserve = storageService.getCode();
    this.period_reserve = this.storageService.getPeriodReserve();
    this.period_reserve = JSON.parse(this.period_reserve);
    this.huespedes = this.sapi.actualGuests;
    console.log('Huespedes: ', this.huespedes)

    this.dates_banner = [""];
    this.dates_top_activities = [""];

    // get Keys:
    this.keys = this.storageService.getKeysRooms();
    console.log('keys: ', this.keys)
    this.storageService.getUserData().then((userData) => {
      if (userData) {
        this.user = userData;
        console.log(this.user)
      }
    });
    this.keys = JSON.parse(this.keys).keysRooms;
    console.log('keys map:', this.keys)
    // Inicializamos los estados de las puertas a cerrado:
    // y de bombillas a apagado:
    this.keys.forEach(item => {
      item.room.state = false;
      item.room.statelight = false;
    });

    // BasicPlace ciudad:
    this.idPdfCiudad = this.wifi.basicPlace;

    // Datos contacto hotel:
    this.contacthotel.email = this.wifi.email;
    this.contacthotel.phone = this.wifi.telefono;
    this.contacthotel.whatsapp = this.wifi.whatsapp.telefono;
    this.contacthotel.direccion = this.hotel_direccion;


    ////console.log("IN MAP.TS");
    this.hotel_id = this.params.get("hotel_id");
    this.hotel_name = this.params.get("hotel_name");
    let selected_filter = this.params.get("selected_filter");
    let llaves = this.params.get("llaves");
    if (llaves) {
      setTimeout(() => {
        this.showKeyHotel();
      }, 1000);
    }
    //console.log('Params .- h: ', this.hotel_id, 'n: ', this.hotel_name, 'f: ', selected_filter )
    this.edad = this.sapi.actualUser.edad;
    this.api.getHotelLocation(this.hotel_id)
      .then(data => {
        //console.log('Hotel location: ', data)
        // let filter_list = [];
        if (!data["error"]) {
          this.locations.push(data[0]);
          this.hotel_name = data[0]['nombre'];
          this.cmp = data[0].cmp;
          this.hotel_position.lat = data[0].lat;
          this.hotel_position.lng = data[0].lng;
          this.hotel_direccion = data[0].direccion;
          console.log('hotel direccion: ', this.hotel_direccion)

          // this.locations.forEach(function (value) {
          //   if(selected_filter.indexOf(value.type) != -1){
          //     filter_list.push(value);
          //   }
          // });
          // this.locations = filter_list;

          // this.platform.ready().then(() => {
          //   this.initMaps();
          // });
        } else {
          ////console.log(data);
        }
      });

    let edad = this.sapi.actualUser.edad;



    this.api.getHotelPlaces(this.hotel_id)
      .then(data => {
        let filter_list = [];
        if (!data["error"]) {
          //////console.log("Data: ", data);
          const temp_locations: any = data;


          // this.locations = data;
          temp_locations.forEach(function (value) {
            if (selected_filter.indexOf(value.type) != -1) {
              //////console.log('min:',value.emin, ' max:', value.emax,' edad:', edad)
              if ((edad >= value.emin) && (edad <= value.emax)) {
                if (value.lat !== '0' && value.lng !== '0') {
                  filter_list.push(value);
                }
              }
            }
          });
          // parte mia de añadir basic places

          this.api.getHotelBasicPlaces(this.hotel_id)
            .then(databasic => {
              if (databasic[0]) {
                ////console.log("Databasic: ", databasic);
                const temp_locations: any = databasic;
                // this.locations = data;
                temp_locations.forEach(function (value) {
                  //
                  var getKilometros = function (lat1, lon1, lat2, lon2) {
                    var rad = function (x) { return x * Math.PI / 180; }
                    var R = 6378.137; //Radio de la tierra en km
                    var dLat = rad(lat2 - lat1);
                    var dLong = rad(lon2 - lon1);
                    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var d = R * c;
                    return (d.toFixed(2)); //Retorna tres decimales
                  }
                  //
                  if (selected_filter.indexOf(value.type) != -1) {
                    if ((edad >= value.emin) && (edad <= value.emax)) {
                      if (value.lat !== '0' && value.lng !== '0') {
                        filter_list.push(value);
                      }
                    }
                  }
                });
              }
              this.locations = this.locations.concat(filter_list);
              //////console.log("all: ", this.locations)
              this.platform.ready().then(() => {
                this.initMaps();
              });


            })
          //


        } else {
          ////console.log(data);
        }
      });


    //Recupera los datos del Banner:
    this.getAllActivitiesBanner();

    //Recupera los datos de top activities:
    this.getActivitiesTop();

    // Abre el hotel:
    /*  setTimeout(() => {
         this.goToHotelShow();
     }, 3000);
*/

  }

  ///////////////// métodos para apertura importados de be-key.ts

  alerta(titulo, mensaje) {
    let alert = this.alertCtrl.create({
      title: titulo,
      subTitle: '',
      message: mensaje,
      buttons: [

        {
          text: 'Ok',
          handler: data => { }
        }
      ]
    });
    alert.present();
  }



  abrirPuerta() {

    this.connectToDevice('becheckin', 0)

  }

  connectToDevice(tipo, procede) {

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
        //this.openChina(loading)
      } else {
        if ((this.codeUno == "-----") && (procede == 0)) {
          console.log('abriendo por wifi')
          this.openWifi(loading, tipo);

        } else {
          console.log('aqui');
          this.checkBluetooth(loading, tipo);
        }
      }
    });

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


  private hideLoading(loading) {
    setTimeout(data => {
      loading.dismiss();
    }, 2000);
  }


  private isDesactivate() {
    let start = new Date(this.start);
    let finish = new Date(this.finish)
    let now = new Date();
    if (start > now) this.tooEarly = true;
    else if (finish < now) this.tooLate = true;
    return (this.tooEarly || this.tooLate)
  }

  private translateLoadingContent(loading: Loading, label: string) {
    this.translate.get('KEYS.MESSAGES.' + label).subscribe((res: any) => {
      loading.data.content = res
    });
  }

  private turnBelux(tipo) {  // tipo = 0, enciende, tipo = 1, apaga

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
      this.sapi.turnBelux(this.tokenUser, this.nombreBt, this.keyRoomId, tipo).then((response) => {
        //this.registerOpenDoor();
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

  }

  private openWifi(loading, tipo) {
    let lanzado = false;
    console.log('token: ', this.tokenUser)
    console.log('Placa: ', this.nombreBt)
    console.log('RoomID: ', this.keyRoomId)
    this.sapi.openDoor(this.tokenUser, this.nombreBt, this.keyRoomId).then((response) => {
      this.registerOpenDoor();
      lanzado = true;
      if ((this.esMqtt) && (tipo == 'becheckin')) {
        setTimeout(() => {
          this.hideLoading(loading);
          //this.checkBluetooth(loading, tipo);
          this.turnBelux(1);
        }, 2000);

      } else {
        this.translateLoadingContent(loading, "OPEN_DOOR");
        this.hideLoading(loading);
        if ((this.hasLight) && (tipo == 'becheckin')) {
          //this.connectToDevice('belux', 0);
          this.turnBelux(1);
        }
      }
    }).catch((error) => {
      lanzado = true;
      this.hideLoading(loading);

    });
    setTimeout(() => {
      if (!lanzado) {
        //this.checkBluetooth(loading, tipo)
        this.hideLoading(loading)
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
                this.alerta('Bluetooth', 'KEY_SEND_ERROR_BT');
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
        this.sapi.registerOpenDoor(this.tokenUser, this.name, this.mac, userData.guest._id)
          .then((response) => { }).catch((error) => {
            this.requestRegister.unsubscribe()
          });
      } else {
        this.sapi.registerOpenDoorFake(this.name, this.storageService.getCode())
          .then((response) => { }).catch((error) => {
            this.requestRegister.unsubscribe()
          });
      }
    });
  }




  ////////////////////////////////////////////////////////////////

  initMaps() {
    this.native = false;
    this.userPosition = new LatLng(37.388781, -5.985330);
    this.setUserPosition(); // llama  a this.loadMapBrowser();,t

  }

  startMaps() {

    /*
    if(this.platform.is('cordova') &&
    (this.platform.is('ios') || this.platform.is('android'))){
      this.loadMapNative();
    } else {
      this.native = false;
      this.loadMapBrowser();
    }*/
  }

  loadMapNative() {
    ////console.log("LOAD MAP!!!!!!!!");
    // This code is necessary for browser
    // Environment.setEnv({
    //   'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyBy7du-T718SPVzEKu4vjDrK8MLrkO68Uo',
    //   'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyBy7du-T718SPVzEKu4vjDrK8MLrkO68Uo'
    // });

    this.userPosition = new LatLng(37.388781, -5.985330);

    let mapOptions: GoogleMapOptions = {
      camera: {
        target: this.userPosition,
        zoom: this.zoom,
        tilt: 30
      },
      controls: {
        myLocationButton: true,
        myLocation: true,
        compass: false,
      },
      gestures: {
        rotate: false
      }
    };

    this.map = GoogleMaps.create('map', mapOptions);

    this.map.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe(data => {
      this.map.moveCamera({
        target: this.userPosition,
        zoom: this.zoom,
        tilt: 30
      });
      this.geolocation.getCurrentPosition().then((resp) => {
        this.userPosition = new LatLng(resp.coords.latitude, resp.coords.longitude);
      }).catch((error) => {
        ////console.log('Error getting location', error);
      });
    });

    this.setMarkersNative(this.locations);
  }

  setMarkersNative(localtion_list) {
    console.log("location FGV: " + localtion_list);
    localtion_list.forEach((item, i) => {

      let size = 28;

      if (!item.type || item.type == "hotel") {
        item.type = "hotel";
        size = 48;
      } else {
        size = 28;
      }
      ////console.log("Item: ", item.nombre," type: ", item.type)
      var position = new LatLng(item["lat"], item["lng"]);
      let marker: Marker = this.map.addMarkerSync({
        icon: {
          url: "assets/imgs/maps/i" + item.type + ".png",
          size: {
            width: size,
            height: size
          }
        },
        position: position
      });


      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        this.zone.run(() => {
          this.show_place_info = true;
          this.info_name = item.nombre
          this.info_desc = item.descripcion
          this.info_recomendaciones = item.recomendaciones
          this.info_direccion = item.direccion
          this.info_img = item.imagen
          this.info_link = item.link
          this.info_location = item["lat"] + ", " + item["lng"]
        });

        let target = new LatLng(item["lat"] - 0.002, item["lng"])
        this.map.animateCamera({
          target: target,
          duration: 300
        });
      });

      this.markers.push(marker);
    });
  }

  closeInfo() {
    this.show_place_info = false;
    if (this.fromlist) {
      this.showListMode();
      this.icon3 = true;
      this.fromlist = false;
    };

  }

  closeInfo2() {
    this.show_place_info = false;

  }
  closeList() {
    this.show_list = false;
  }

  openApp(data) {
    ////console.log(data)
    ////console.log('nick: ', this.info_name)
    if (data == "opt1")  // MAPS
      window.open("maps://maps.google.com/maps?daddr=" + this.info_location + "&amp;ll=");
    if (data == 'opt2')  // UBER
      window.open("uber://?action=setPickup&dropoff[latitude]=" + this.info_location.split(", ")[0] + "&dropoff[longitude]=" + this.info_location.split(", ")[1] + "&dropoff[nickname]=" + this.info_name);
    if (data == 'opt3')  // CABIFY
      window.open('cabify://cabify/journey?json={"stops":[ { "loc":{ "latitude":' + this.userPosition["lat"] + ', "longitude":' + this.userPosition["lng"] + ' } }, { "loc":{ "latitude":' + this.info_location.split(", ")[0] + ', "longitude":' + this.info_location.split(", ")[1] + ' } } ]}');
    if (data == 'opt4')  // WEB MAPS
      window.open("https://maps.google.com/maps?daddr=" + this.info_location + "&amp;ll=");
  }

  openMapInApp() {

    let myAlert = this.alertCtrl.create({
      title: this.translate.instant('MAP.VISIT'),
      subTitle: '',
      enableBackdropDismiss: true,
      message: this.translate.instant('MAP.APPS'),
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.openApp(data);
          },
          role: ''
        },
        {
          text: 'Cancel',
          handler: data => {

          },
          role: 'cancel'
        }
      ],
      inputs: [
        {
          type: 'radio',
          id: 'opt1',
          name: 'opt1',
          'label': 'MAPS',
          value: 'opt1',
          'checked': true
        },
        {
          type: 'radio',
          id: 'opt2',
          name: 'opt2',
          'label': 'Uber',
          value: 'opt2',
          'checked': false
        },
        {
          type: 'radio',
          id: 'opt3',
          name: 'opt3',
          'label': 'Cabify',
          value: 'opt3',
          'checked': false
        },
        {
          type: 'radio',
          id: 'opt4',
          name: 'opt4',
          'label': 'Web Google Maps',
          value: 'opt4',
          'checked': false
        }
      ]
    });
    myAlert.present();



  }



  listadoclick(loc) {
    this.fromlist = true;
    this.go(loc);
  }
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  //////////////////// BROWSER MAPS /////////////////////////////
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////

  go(loc) {
    //this.zoom = 10;

    ////console.log(loc)
    this.hidelistmode = true;
    this.icon3 = false;
    this.closeInfo2();
    this.closeList();

    this.show_km = false;
    this.show_place_info = true;
    this.info_name = this.locations[loc.indice].nombre
    this.info_desc = this.locations[loc.indice].descripcion
    this.info_recomendaciones = this.locations[loc.indice].recomendaciones
    this.info_direccion = this.locations[loc.indice].direccion
    this.info_img = this.locations[loc.indice].imagen
    this.info_link = this.locations[loc.indice].link
    this.info_location = this.locations[loc.indice]["lat"] + ", " + this.locations[loc.indice]["lng"]
    this.show_place_info = true;
    this.kms = []
    //this.show_place_info = true;

    // Para que no cambie cuando pulsas en listado el mapa de situación:
    /*setTimeout( t => {
      this.loadMapBrowser(loc.lat, loc.lng)
    }, 100)
   */

    this.calculatekm();

  }

  loadMapBrowser(lat, lng) {
    //this.my_lat = 37.388781;
    //this.my_lng = -5.985330;
    //this.setUserPosition();

    //////console.log('12 ', this.my_lat, ',', this.my_lng)



    let latLng = new google.maps.LatLng(lat, lng) //(this.my_lat, this.my_lng);

    let opts = {
      center: latLng,
      zoom: this.zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      tilt: 30,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: google.maps.ControlPosition.TOP_LEFT
      },
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT_BOTTOM
      },
      scaleControl: true,
      streetViewControl: true,
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
      }
    };


    this.mapBrowser = new google.maps.Map(this.mapElement.nativeElement, opts);




    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({ map: this.mapBrowser });
    directionsDisplay.setOptions({ suppressMarkers: true });

    //////console.log('dd: ', directionsDisplay)

    this.calculatekm();

    this.setMarkersBrowser(this.locations);




    let marker = new google.maps.Marker({
      position: this.userPosition,
      map: this.mapBrowser,
      icon: {
        url: "assets/imgs/maps/user_position.png",
        scaledSize: new google.maps.Size(48, 48)
      },

    });


    //////console.log(marker)
    marker.addListener('click', (event) => {

      this.zone.run(() => {
        this.miposition = false;
        // Comentamos hasta que sepamos si se va a contratar Geocode:
        // this.getAddressFromCoords(event.latLng.lat(), event.latLng.lng())
      });

    });
    //this.calculateAndDisplayRoute(directionsDisplay, directionsService);



    // Comprobamos si tiene que actualizar filtros:
    if (this.actualizar_filtros) {

      // Activamos todos los filtros:
      this.checkboxall = true;
      this.filter_categorie(100);
      this.actualizar_filtros = false;
    }

  }

  setUserPosition() {
    this.geolocation.getCurrentPosition().then((resp) => {
      //////console.log("Position: ", resp)
      this.my_lat = resp.coords.latitude;
      this.my_lng = resp.coords.longitude;

      this.userPosition = new LatLng(resp.coords.latitude, resp.coords.longitude);


      ////console.log(this.my_lat, ',', this.my_lng)

      if (!this.b_gotoUser) {
        this.my_lat = this.locations[0].lat;
        this.my_lng = this.locations[0].lng;
      } else {
        this.my_lat = this.userPosition.lat;
        this.my_lng = this.userPosition.lng;
      }

      this.loadMapBrowser(this.my_lat, this.my_lng)

    }).catch((error) => {
      this.my_lat = 6.42342;  //IFEMA
      this.my_lng = 34.3232;
      ////console.log('Error getting location', error);
      this.loadMapBrowser(this.my_lat, this.my_lng)
    });


  }

  calculatekm() {



    var lat = 0;
    var lng = 0;
    var i = 0;
    let km;

    var getKilometros = function (lat1, lon1, lat2, lon2) {

      var rad = function (x) { return x * Math.PI / 180; }
      var R = 6378.137; //Radio de la tierra en km
      var dLat = rad(lat2 - lat1);
      var dLong = rad(lon2 - lon1);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return (d.toFixed(3)); //Retorna tres decimales
    }

    this.kms = []

    this.locations.forEach(location => {

      if (i == 0) {
        lat = this.my_lat //location.lat
        lng = this.my_lng//location.lng
      } else {
        km = getKilometros(lat, lng, location.lat, location.lng)
        km = Number(km)

        this.kms.push({ km: km, name: location.nombre, lat: location.lat, lng: location.lng, indice: i })
      }

      i++;

    })

    this.ordenar(this.kms)

    ////console.log('kms: ', this.kms)

  }

  ordenar(tabla) {

    tabla.sort((o1, o2) => {
      if (o1.km > o2.km) return 1;
      else if (o1.km > o2.km) return 0;
      else return -1;
    })

  }

  goToUser() {

    this.actualizar_filtros = true;
    this.b_gotoUser = true;
    this.setUserPosition();


  }

  goToHotel() {
    this.actualizar_filtros = true;
    this.hidehomecontrol = false;
    this.b_gotoUser = false;
    //this.setUserPosition();
    this.my_lat = this.locations[0].lat;
    this.my_lng = this.locations[0].lng;
    this.loadMapBrowser(this.my_lat, this.my_lng);

  }

  goToHotelShow() {
    this.cd.asoma(this.coda.element.nativeElement);
    this.icon2 = true;
    this.show_place_info = false;
    this.icon1 = this.icon3 = this.icon4 = this.icon5 = this.icon6 = false;
  }

  goToKm() {
    this.modalCtrl.create('ModalQrPage', { locations: this.locations }).present();
  }

  nada() {

  }

  setMarkersBrowser(localtion_list) {


    this.location_filters = localtion_list;
    console.log("FGV.............List location: ", localtion_list)
    localtion_list.forEach((item, i) => {
      var position = new google.maps.LatLng(item["lat"], item["lng"]);
      let size = 28;
      if (!item.type || item.type == "hotel") {
        item.type = "hotel";
        size = 48;
      } else {
        size = 28;
      }
      //console.log("Item: ", item.nombre," type: ", item.type)
      let marker = new google.maps.Marker({
        position: position,
        map: this.mapBrowser,
        icon: {
          url: "assets/imgs/maps/i" + item.type + ".png",
          scaledSize: new google.maps.Size(size, size)
        }

      });

      this.markers.push(marker);

      // Construyo el infowindow:
      // Comprobación recomendaciones e imagen:
      let recomendaciones = "";
      let imagen = "";
      let imagen2 = "";
      let link_url = "";
      let direccion = "";
      // Comprobaciones recomendaciones e imagen:
      if (item.recomendaciones != "" && item.recomendaciones !== undefined) recomendaciones = '<div>' + this.translate.instant('MAP.RECOMENDACIONES') + ":" + item.recomendaciones + '</div>';
      if (item.imagen != "" && item.imagen !== undefined) imagen = '<div><img src="' + this.base64 + item.imagen + '">' + '</div>';
      if (item.webimg != "" && item.webimg !== undefined) imagen2 = '<img src="' + item.webimg + '" style="width:100px;height:100px;border-radius: 5px 5px 5px 5px;">';
      // Si webimg viene con '-'
      if (item.webimg == '-') {
        imagen2 = '<img src="' + this.base64 + item.imagen + '" style="width:100px;height:100px;border-radius: 5px 5px 5px 5px;">';
        imagen = ""
      }

      // Comprobación si tiene más info:
      if (item.link != "" && item.link != undefined) link_url = '<div id="infoWindowButtonMasInfo"><h6><a href="#">' + this.translate.instant('MAP.MASINFO') + '</a></h6></div>';
      // Comprobación si tiene direccion
      if (item.direccion != "" && item.direccion != undefined) direccion = '<div><h6>' + item.direccion + '</h6></div><hr>';

      const infoWindowContent = '<div><table><tr><td><h5 class="title">' + item.nombre + '</h4></td><td rowspan="1" style="padding-left:10px">' + imagen2 + '</td></tr></div>' +
        '<tr><td colspan="2"><div>' + direccion + '<div></td></tr></table>' +
        '<div>' + item.descripcion + '<div>' +
        recomendaciones + imagen +
        '<div id="infoWindowButtonComoLlegar"><h6><a href="#">' + this.translate.instant('MAP.COMOLLEGAR') + '</a></h6></div>' +
        link_url;





      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
        closeOnMapClick: true,
        pointer: true,
        shadow: true,
      });


      marker.addListener('click', () => {
        this.info_name = item.nombre
        this.info_desc = item.descripcion
        this.info_recomendaciones = item.recomendaciones
        this.info_direccion = item.direccion
        this.info_img = item.imagen
        this.info_link = item.link
        this.info_location = item["lat"] + ", " + item["lng"]
        this.city = item._id
        infoWindow.open(this.mapBrowser, marker);
      });

      infoWindow.addListener('domready', () => {
        document.getElementById("infoWindowButtonComoLlegar").addEventListener("click", () => {
          this.openMapInApp();
        });
        // Solo generamos el evento de click en caso de existir la url de link:
        if (item.link != "" && item.link != undefined) {
          document.getElementById("infoWindowButtonMasInfo").addEventListener("click", () => {
            this.openLink();
          });
        }
      });




      //////console.log(marker)
      /*   marker.addListener('click', (event) => {
 
           this.zone.run(() => {
             this.show_place_info = true;
             this.info_name = item.nombre
             this.info_desc = item.descripcion
             this.info_recomendaciones = item.recomendaciones
             this.info_img = item.imagen
             this.info_link = item.link
             this.info_location = item["lat"] + ", " + item["lng"]
             this.city = item._id
           });
 
           //////console.log('link: ', this.info_link)
 
           //////console.log('city: ', this.city)
 
           // FGV Comentadas para que no se mueva el mapa al hacer click en los markers:
           //let target = new google.maps.LatLng(item["lat"] - 0.01, item["lng"])
           //this.mapBrowser.panTo(target);
 
 
         });*/

    });
  }
  openLink() {
    //const browser = this.iab.create(this.info_link+'?aid=4104&cmp=' + this.cmp, '_system');
    debugger;
    let parametroaid = "";
    if (this.info_link.indexOf('aid=') === -1) parametroaid = '?aid=4104';
    const browser = this.iab.create(this.info_link + parametroaid + '&cmp=' + this.cmp, '_system');
    browser.show();
  }

  openLink2() {
    this.apiComponents.createLoadingWithMessage(this.translate.instant('MAP.PROVEEDOR')).then((loading: Loading) => {
      loading.present();
      setTimeout(() => {

        loading.dismiss();

        window.open(this.info_link + '?aid=4104&cmp=' + this.cmp, '_parent');
        //const browser = this.iab.create(this.info_link+'?aid=4104&cmp=' + this.cmp, '_system');
        //browser.show();
      }, 2000)
    })
  }


  calculateAndDisplayRoute(directionsDisplay, directionsService) {
    var markerArray = [];
    // First, remove any existing markers from the map.
    for (var i = 0; i < markerArray.length; i++) {
      markerArray[i].setMap(null);
    }

    // Retrieve the start and end locations and create a DirectionsRequest using
    // WALKING directions.
    var position_start = new google.maps.LatLng(37.389400, -6.007465);
    var position_end = new google.maps.LatLng(37.395273, -5.984352);

    var waypoints = [];
    ////console.log(this.locations.length);
    /*this.locations.forEach((item, i) => {
      ////console.log(item)
      if(i == 0){
        var position_start = new google.maps.LatLng(item.lat, item.lng);
      }else if(i == (this.locations.length - 1)){
        var position_end = new google.maps.LatLng(item.lat, item.lng);
      }else if(i < 3){
        waypoints.push({
          location: new google.maps.LatLng(item.lat, item.lng),
          stopover: false
        })
      }
    });*/

    // var stay_point = new google.maps.LatLng(37.395273, -5.984352);
    // var stay_point2 = new google.maps.LatLng(38.934819, -3.976493);

    position_start = new google.maps.LatLng(this.locations[0].lat, this.locations[0].lng);
    position_end = new google.maps.LatLng(this.locations[4].lat, this.locations[4].lng);
    waypoints.push({
      location: new google.maps.LatLng(this.locations[1].lat, this.locations[1].lng),
      stopover: false
    })
    waypoints.push({
      location: new google.maps.LatLng(this.locations[2].lat, this.locations[2].lng),
      stopover: false
    })
    directionsService.route({
      origin: position_start,
      destination: position_end,
      waypoints: waypoints,
      travelMode: 'WALKING'
    }, function (response, status) {
      ////console.log('response: ', response)
      // Route the directions and pass the response to a function to create
      // markers for each step.

      if (status === 'OK') {
        directionsDisplay.setDirections(response);
        this.showSteps(response, markerArray, this.mapBrowser);
        var myRoute = response.routes[0].legs[0];

        for (var i = 0; i < myRoute.steps.length; i++) {

          var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;

          marker.setMap(this.mapBrowser);
          marker.setPosition(myRoute.steps[i].start_location);
        }
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }


  openPreview(img, indice, name) {

    //this.stopBanner();

    console.log(this.dates_top_activities[indice].actividades);
    let modal = this.modalCtrl.create('ModalImagePage', { 'image': img, 'activities': this.dates_top_activities[indice].actividades, 'name': name, 'cmp': this.cmp });

    modal.onDidDismiss(data => {
      //this.followBanner();
    });

    modal.present();


    /*let modal = this.modalCtrl.create({
      component: ModalImagePage,
      componentProps: {
        img: img
      }
    })
      modal.present();*/

  }
  showCategorias() {
    this.cd.asoma(this.coda.element.nativeElement);
    this.icon1 = true;
    this.show_place_info = false;
    this.icon2 = this.icon3 = this.icon4 = this.icon5 = this.icon6 = false;
    // this.hidecategorias=false;
  }

  closeCategorias() {
    this.hidecategorias = true;
  }

  filter_categorie(indice) {

    // Si viene 0 es activar/desactivar todos:
    if (indice == 100) {
      if (!this.checkboxall) {
        this.array_filter_categorie_text_temp = [];
        console.log('vaciamos: ' + this.array_filter_categorie_text_temp);
        this.array_filter_categorie = [false, false, false, false, false, false, false, false, false, false, false, false, false, false];
      } else {
        this.array_filter_categorie_text_temp = this.array_filter_categorie_text;
        console.log('rellenamos: ' + this.array_filter_categorie_text_temp);
        this.array_filter_categorie = [true, true, true, true, true, true, true, true, true, true, true, true, true, true];
      }
    } else {
      this.array_filter_categorie[indice] = !this.array_filter_categorie[indice];

      // En caso de ser true añadimos, en caso de ser false eliminamos:
      // Según contenido de array_filter_categorie dejamos listo el array de filtros:
      this.actualiza_filtros();

    };
    this.erase_all_markers();


  }

  actualice_markers_continue() {

    this.locations.forEach((item, i) => {
      var position = new google.maps.LatLng(item["lat"], item["lng"]);
      let size = 28;
      if (!item.type || item.type == "hotel") {
        item.type = "hotel";
        size = 48;
      } else {
        size = 28;
      }

      // Solo pintamos los que están dentro del filtro:
      if (this.array_filter_categorie_text_temp.indexOf(item.type) !== -1 || item.type == "hotel") {
        //console.log("Item: ", item.nombre," type: ", item.type)
        let marker = new google.maps.Marker({
          position: position,
          map: this.mapBrowser,
          icon: {
            url: "assets/imgs/maps/i" + item.type + ".png",
            scaledSize: new google.maps.Size(size, size)
          }

        });

        this.markers.push(marker);



        // Construyo el infowindow:
        // Comprobación recomendaciones e imagen:
        let recomendaciones = "";
        let imagen = "";
        let imagen2 = "";
        let link_url = "";
        let direccion = "";
        // Comprobaciones recomendaciones e imagen:
        if (item.recomendaciones != "" && item.recomendaciones !== undefined) recomendaciones = '<div>' + this.translate.instant('MAP.RECOMENDACIONES') + ":" + item.recomendaciones + '</div>';
        if (item.imagen != "" && item.imagen !== undefined) imagen = '<div><img src="' + this.base64 + item.imagen + '">' + '</div>';
        if (item.webimg != "" && item.webimg !== undefined) imagen2 = '<img src="' + item.webimg + '" style="width:100px;height:100px;border-radius: 5px 5px 5px 5px;">';
        if (item.webimg == '-') {
          imagen2 = '<img src="' + this.base64 + item.imagen + '" style="width:100px;height:100px;border-radius: 5px 5px 5px 5px;">';
          imagen = ""
        }
        // Comprobación si tiene más info:
        if (item.link != "" && item.link != undefined) link_url = '<div id="infoWindowButtonMasInfo"><h6><a href="#">' + this.translate.instant('MAP.MASINFO') + '</a></h6></div>';
        // Comprobación si tiene direccion
        if (item.direccion != "" && item.direccion != undefined) direccion = '<div><h6>' + item.direccion + '</h6></div><hr>';

        const infoWindowContent = '<div><table><tr><td><h5 class="title">' + item.nombre + '</h4></td><td rowspan="1" style="padding-left:10px">' + imagen2 + '</td></tr></div>' +
          '<tr><td colspan="2"><div>' + direccion + '<div></td></tr></table>' +
          '<div>' + item.descripcion + '<div>' +
          recomendaciones + imagen +
          '<div id="infoWindowButtonComoLlegar"><h6><a href="#">' + this.translate.instant('MAP.COMOLLEGAR') + '</a></h6></div>' +
          link_url;




        const infoWindow = new google.maps.InfoWindow({
          content: infoWindowContent,
          closeOnMapClick: true,
          pointer: true,
          shadow: true,
        });


        marker.addListener('click', () => {
          this.info_name = item.nombre
          this.info_desc = item.descripcion
          this.info_recomendaciones = item.recomendaciones
          this.info_direccion = item.direccion
          this.info_img = item.imagen
          this.info_link = item.link
          this.info_location = item["lat"] + ", " + item["lng"]
          this.city = item._id
          infoWindow.open(this.mapBrowser, marker);
        });

        infoWindow.addListener('domready', () => {
          document.getElementById("infoWindowButtonComoLlegar").addEventListener("click", () => {
            this.openMapInApp();
          });
          // Solo generamos el evento de click en caso de existir la url de link:
          if (item.link != "" && item.link != undefined) {
            document.getElementById("infoWindowButtonMasInfo").addEventListener("click", () => {
              this.openLink();
            });
          }
        });

      }
    });
    /*
   
    marker.addListener('click', (event) => {

      this.zone.run(() => {
        this.show_place_info = true;
        this.info_name = item.nombre
        this.info_desc = item.descripcion
        this.info_recomendaciones = item.recomendaciones
        this.info_direccion = item.direccion
        this.info_img = item.imagen
        this.info_link = item.link
        this.info_location = item["lat"] + ", " + item["lng"]
        this.city = item._id
      });

  

      let target = new google.maps.LatLng(item["lat"] - 0.01, item["lng"])
      this.mapBrowser.panTo(target);


    });

   } */





  }

  erase_all_markers() {
    //Loop through all the markers and remove
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers = [];
    this.actualice_markers_continue();
  }

  // Actualiza el array de filtros:
  actualiza_filtros() {
    let con = 0;
    this.array_filter_categorie_text_temp = [];
    this.array_filter_categorie.forEach((item) => {
      if (item) {
        this.array_filter_categorie_text_temp.push(this.array_filter_categorie_text[con]);
      }
      con++;
    });

    // Comprobamos si el checkbox de todos esta completo o vacío:
    if (this.array_filter_categorie_text_temp.length == 0) {
      this.checkboxall = false;
    }

    if (this.array_filter_categorie_text_temp.length == 14) {
      this.checkboxall = true;
    }

  }

  // Visualiza en modo listado los puntos en el mapa:
  goToListado() {
    this.hidelistmode = false;
  }

  showListMode() {
    this.cd.asoma(this.coda.element.nativeElement);
    this.icon3 = true;
    this.show_place_info = false;
    this.icon1 = this.icon2 = this.icon4 = this.icon5 = this.icon6 = false;
    // this.hidelistmode=false;
  }

  closeListMode() {
    this.hidelistmode = true;
  }
  showControlHome() {
    this.hidehomecontrol = false;
  }

  closeHomeControl() {
    this.hidehomecontrol = true;
  }

  closeMyPosition() {
    this.miposition = true;
  }

  getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords " + lattitude + " " + longitude);

    var myLatLng = new google.maps.LatLng(lattitude, longitude);
    let gmgeocoder = new google.maps.Geocoder();

    gmgeocoder.geocode({ 'latLng': myLatLng }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          if (results[0].formatted_address.length > 64) {
            this.address = results[0].formatted_address.substring(0, 64) + '...';
          }
          else {
            this.address = results[0].formatted_address;
            //console.log(results[0].formatted_address);    
          }
        }
      }
      else {
        this.address = "Dirección no encontrada";
      }
    });
  }




  followBanner() {
    this.slider.freeMode = true;
    this.slider.autoplay = 300;
    this.slider.speed = 3000;
    this.slider.loop = true;
    this.slider.startAutoplay();
  }


  stopBanner() {
    this.slider.stopAutoplay();
  }


  // Recupera los as actividades del banner:
  getAllActivitiesBanner() {
    // Comprobamos el código con el que llamos a la api:
    let codigo = "";
    if (this.wifi.personalizaMapa) {
      codigo = this.wifi._id;
    } else {
      codigo = this.wifi.basicPlace;
    }
    this.dates_banner = [];
    this.api.getActivitiesBanner(codigo)
      .then(data => {
        let datos: any;
        datos = data;
        for (var i in datos) {
          this.dates_banner[i] = data[i];
          this.dates_banner[i].image = data[i].image;
        }

      });
  }

  sanitize(url: string) {
    //return url;
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  // Recupera las actividades del banner:
  getActivitiesTop() {
    // Comprobamos el código con el que llamos a la api:
    let codigo = "";
    if (this.wifi.personalizaMapa) {
      codigo = this.wifi._id;
    } else {
      codigo = this.wifi.basicPlace;
    }
    this.dates_top_activities = [];
    this.api.getActivitiesTop(codigo)
      .then(data => {
        let datos: any;
        datos = data;
        for (var i in datos.cajon) {
          this.dates_top_activities[i] = datos.cajon[i];
        }

      });
    //this.getActivitiesTopTemporal();
  }

  /*
  // Recupera las actividades del banner:
  getActivitiesTopTemporal() {
    let datos: any;
    let data: any;
    //this.idPdfCiudad='81';
    // Según la ciudad cargamos uno u otro Json:
    switch(this.idPdfCiudad)
    {
        case '57':
              data=this.sevillajson;
              break;
        case '119':
              data=this.cadizjson;
              break;
        case '95':
              data=this.alicantejson;
              break;
        case '2':
                  data=this.madridjson;
                  break;
        case '35':
                  data=this.barcelonajson;
                  break;
        case '110':
                  data=this.laspalmasjson;
                  break;
        case '80':
                  data=this.mallorcajson;
                  break;
        case '120':
                  data=this.valenciajson;
                  break;
        case '52':
                  data=this.granadajson;
                  break;
        case '321':
                  data=this.marbellajson;
                  break;
        case '81':
                  data=this.cordobajson;
                  break;
        default:
                  data="";
              break;

    }       

      if (data!="")
      {
         datos = data;
         for (var i in datos)
         {
            this.dates_top_activities[i]=data[i];
         }
      }else {
          this.dates_top_activities=[];
        }

 
  }*/




  open_banner_link(link) {
    const browser = this.iab.create(link, '_system');
    browser.show();

    //window.open(link, '_parent');

  }


  // Muestra un PDF de la ciudad mostrada en el mapa, Ingles o Español según idioma:
  showInfoPDF() {
    let arrayguiasexistentes = ["57", "2", "35", "80", "81", "83", "109", "110", "119", "120", "52"];

    // Comprobamos si tiene pdf en la lista de ciudades existentes:
    if (arrayguiasexistentes.indexOf(this.idPdfCiudad) !== -1) {
      this.navCtrl.push('pdf', { "archivo": this.idPdfCiudad, animate: true, direction: 'backward' });
    } else {
      this.alerta(this.translate.instant('MAP.TITULO_GUIA'), this.translate.instant('MAP.DESCRIPCION_GUIA'));
    }





  }

  closeLight(indice) {
    this.keys[indice].room.statelight = false;
    this.nameBelux = this.keys[indice].room.beluxs[0] ? this.keys[indice].room.beluxs[0].nameDevice : '';
    this.codeOneBelux = this.keys[indice].room.beluxs[0] ? this.keys[indice].room.beluxs[0].codeOne : '';
    this.codeTwoBelux = this.keys[indice].room.beluxs[0] ? this.keys[indice].room.beluxs[0].codeTwo : '';
    this.keyRoomId = this.keys[indice]._id;
    this.turnBelux(0);
  }

  openLight(indice) {
    this.keys[indice].room.statelight = true;
    this.nameBelux = this.keys[indice].room.beluxs[0] ? this.keys[indice].room.beluxs[0].nameDevice : '';
    this.codeOneBelux = this.keys[indice].room.beluxs[0] ? this.keys[indice].room.beluxs[0].codeOne : '';
    this.codeTwoBelux = this.keys[indice].room.beluxs[0] ? this.keys[indice].room.beluxs[0].codeTwo : '';
    this.keyRoomId = this.keys[indice]._id;
    this.turnBelux(1);
  }

  // Cierra la puerta, aquí debería de llamar a cerrar la puerta con su clave
  closeDoorClick(indice) {
    this.keys[indice].room.state = false;
    this.sapi.sendMqttCommand(this.keys[indice].room.mainDevice.nameDevice, 'open_door', '5door');
    const mensaje = this.translate.instant('MAP.TEXTCLOSEDOOR');
    this.apiComponents.createLoadingWithMessage(mensaje).then((loading: Loading) => {
      loading.present();
      setTimeout(t => {
        loading.dismiss();
      }, 2000);

    });
  }

  // Abrir la puerta, aquí debería de llamar a abrir la puerta con su clave
  openDoorClick(indice) {
    this.keys[indice].room.state = true;
    console.log(this.keys[indice]);
    this.hasLight = (this.keys[indice].room.beluxs.length) > 0;
    this.start = this.keys[indice].start;
    this.finish = this.keys[indice].finish;
    this.name = this.keys[indice].room.mainDevice.nameDevice;
    //this.nameBelux = this.keys[indice].room.beluxs[0].name;
    this.tokenUser = this.user.token;
    this.tokenFirebaseUser = this.user.guest.tokenFirebase;
    this.codeOne = this.keys[indice].room.mainDevice.codeOne;
    this.codeTwo = this.keys[indice].room.mainDevice.codeTwo;
    this.nameBelux = this.keys[indice].room.beluxs[0] ? this.keys[indice].room.beluxs[0].nameDevice : '';
    this.codeOneBelux = this.keys[indice].room.beluxs[0] ? this.keys[indice].room.beluxs[0].codeOne : '';
    this.codeTwoBelux = this.keys[indice].room.beluxs[0] ? this.keys[indice].room.beluxs[0].codeTwo : '';
    this.keyRoomId = this.keys[indice]._id;

    this.abrirPuerta();

  }

  // Debe de consultar el huesped por clave:
  viewhuesped(huesped) {

    /*
    const textofast =  `<p> ` + huesped.fastcheckin.name + " " + huesped.fastcheckin.surnameOne +
              `<p><strong> ` + huesped.fastcheckin.dni.identifier + `</strong></p>
              <p><strong> ` + this.translate.instant('FASTCHECKIN.BIRTHDAY') + `</strong></p>
              <p> ` + huesped.fastcheckin.birthday + `</p>
              <p><strong>` + this.translate.instant('FASTCHECKIN.EXPEDITION_DATE') + `</strong></p>
              <p> ` + huesped.fastcheckin.date_exp + `</p>
              <p><strong>` + this.translate.instant('FASTCHECKIN.NATIONALITY') + `</strong></p>
              <p> ` + huesped.fastcheckin.nationality + `</p>
              <p><strong>` + this.translate.instant('FASTCHECKIN.SEX') + `</strong></p>
              <p> ` + huesped.fastcheckin.sex + `</p>`;
  
    this.alerta('FASTCHECKIN', textofast);*/
    let modal = this.modalCtrl.create('ModalEditHuesped', { 'huesped': huesped });
    modal.onDidDismiss(data => {
      // Recargamos la lista de huéspedes para refrescar:
      this.huespedes = this.sapi.actualGuests;
    });

    modal.present();

  }
  // Enlace a WhatsApp
  private sharedWhatsapp() {
    this.iab.create("https://wa.me/" + this.contacthotel.whatsapp);
  }

  // Enlace al correo electrónico
  public getMessageEmail() {
    return "mailto:" + this.contacthotel.email;
  }

  // Enlace a mensajería SMS
  public getMessagePhone() {
    return "tel:" + this.contacthotel.phone;
  }

  public anadirhuesped() {
    this.storageService.setUserIsLoged(false);
    this.storageService.setUserData(null);
    this.navCtrl.setRoot('AddKeyPage', { newuser: 1 }, { animate: true, direction: 'backward' });

  }

  public cerrarSesion() {
    this.storageService.setUserIsLoged(false);
    this.storageService.setUserData(null);
    this.navCtrl.setRoot('AddKeyPage', { animate: true, direction: 'backward' });
  }

  public showKeyHotel() {
    this.cd.asoma(this.coda.element.nativeElement);
    this.icon4 = true;
    this.show_place_info = false;
    this.icon1 = this.icon2 = this.icon3 = this.icon5 = this.icon6 = false;
  }
  public showTopActivities() {
    this.cd.asoma(this.coda.element.nativeElement);
    this.icon5 = true;
    this.show_place_info = false;
    this.icon1 = this.icon2 = this.icon3 = this.icon4 = this.icon6 = false;
  }

  public showGuia() {
    this.cd.oculta(this.coda.element.nativeElement);
    this.icon6 = true;
    this.icon1 = this.icon2 = this.icon3 = this.icon4 = this.icon5 = false;
    this.showInfoPDF();
  }

  public ocultaPanel() {
    this.cd.oculta(this.coda.element.nativeElement);
    this.icon1 = this.icon2 = this.icon3 = this.icon4 = this.icon5 = this.icon6 = false;
  }

  EventIonSlideReachEnd(slides) {
    if (slides.getActiveIndex() == slides._slides.length - 1) {
      setTimeout(
        () => {
          slides.startAutoplay();
        }, 12000)
    }
  }
}