import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Loading, Toast, Events, ModalController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { ServiceAPI } from "../../app/services/service.api";
import { ApiComponents } from "../../components/api-components";
import { StorageService } from "../../app/services/service.storage";
import { AlertController } from 'ionic-angular';

import { AuthProvider } from '../../providers/auth/auth';
import { Configuration } from '../../environments/configuration';
import { Guest } from '../../app/models/user.model';
import { KeyRoom } from '../../app/models/room.model';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { CryptProvider } from '../../providers/crypt/crypt';

import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { MimapPage } from '../mimap/mimap';


@IonicPage()
@Component({
  selector: 'page-add-key',
  templateUrl: 'add-key.html'
})
export class AddKeyPage {

  public code: string;
  private email: string;
  private password: string;
  private name: string;
  private keys: KeyRoom[];
  private reserva: any;
  private llaves: any;
  private keyroomBooking: any;
  listarooms: any = [];
  user: any;


  irBooking: boolean = false;
  esnuevo: boolean = false;

  loginhide: boolean = false;
  showgetcode: boolean = true;
  flag: boolean = false;  // usado para crear SIEMPRE, USER NUEVO.

  private hotel: any;
  private idReservaParam: string = "";
  private MuestraFastCheckinParam: string = "";

  showBtn: boolean = false;
  private deferredPrompt: any;


  constructor(
    private navCtrl: NavController,
    public params: NavParams,
    private viewCtrl: ViewController,
    private serviceAPI: ServiceAPI,
    private apiComponents: ApiComponents,
    private translate: TranslateService,
    private storageService: StorageService,
    private service: ServiceAPI,
    private authProvider: AuthProvider,
    private events: Events,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private iab: InAppBrowser,
    public navParams: NavParams,
    public plt: Platform,
    public statusbar: StatusBar
  ) {
    this.code = this.storageService.getCode() ? this.storageService.getCode() : "";
    this.keyroomBooking = [];
    console.log('params:', this.navParams)
    if (this.navParams.get('newuser')) {
      this.loginhide = true;
      this.getKey();
    } else {
      this.loginhide = false;
    }


    this.plt.ready().then((readySource) => {
      console.log('Platform ready from', readySource);
      // Platform now ready, execute any required native code
      this.statusbar.hide();
      // Obtener parámetros de la URL de entrada:
      this.getParams();
    });

  }

  // Obtenemos parámetros de entrada, en caso de tener id de Reserva hacemos el autologin:
  getParams() {
    this.idReservaParam = this.getParameterByName('idReserva');
    this.MuestraFastCheckinParam = this.getParameterByName('muestraFastcheckin');

    // Autologin:
    if (this.idReservaParam !== null) {
      this.code = this.idReservaParam;
      this.getKey();
    }


  }

  private getParameterByName(name) {
    var url = window.location.href;
    var name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return null;
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  keyRooms(cliente) {
    this.reserva.getRooms(cliente).subscribe(rooms => {
      this.listarooms = rooms.rooms;
      console.log('Rooms: ', this.listarooms)

    })
  }

  dismiss() {
    this.viewCtrl.dismiss();
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
            if (funcion == 1) this.getKey();
          }
        }
      ]
    })
    alert.present()
  }

  alertGetKey(reserva, key) {

    let body = {
      idReserva: key._id,
      numero_reserva: reserva.id,
      pms: 'booking',
      nombre: reserva.booker.firstname,
      apellidos: reserva.booker.lastname,
      telefono: reserva.booker.phone,
      email: reserva.booker.email,
      estado: reserva.status,
      precio: reserva.totalPrice,
      huespedes: reserva.totalGuests,
      checkin: reserva.roomReservations[0].checkin,
      checkout: reserva.roomReservations[0].checkout,
      pais: reserva.booker.country
    }

    this.serviceAPI.grabarDatosReserva(body).then(datos => {
      let res =
        `<p>` + this.translate.instant("BOOKING.FAST") +
        `<p>` + this.translate.instant("BOOKING.PUSH") + ` </p>`;
      this.showalert('Travel Card', '', res, 1);
    });

  }




  createkey(loading) {
    let res = '';
    this.irBooking = true;
    console.log("voy a lo de booking")
    this.serviceAPI.booking(this.code).then(xml => {

      console.log(xml.xml.status);

      
      if (xml.xml.status === 'ok') {
        res = `<p align="center"> Creada Llave con éxito. Puede loguearse.</p>`;
        this.showalert('Llaves', 'Creación Exitosa', res, 0);
        this.getKey();
      } else {
        res = `<p align="center"> Llave no encontrada. Compruebe sus códigos.</p>`;
        this.showalert('Llaves', 'Error creación llaves', res, 0);
      }
/*
      if (!reservas || (reservas.statusCode == 404)) {
        res = this.translate.instant("BOOKING.NORESERVE")
        this.showalert(this.translate.instant("BOOKING.TITLERESERVE"), '', res, 0)
      } else {
        this.reserva = reservas
        console.log("reserva mews: ", this.reserva)
        if (this.reserva.id) {

          res =
            `<p> ` + this.reserva.booker.firstname + " " + this.reserva.booker.lastname +
            `<p> ` + this.translate.instant("BOOKING.NUMGUEST") + " " + this.reserva.totalGuests + `</p>
                   <p><strong>` + this.translate.instant("BOOKING.CHECKIN") + `</strong></p>
                   <p> ` + this.reserva.roomReservations[0].checkin + `</p>
                   <p><strong>` + this.translate.instant("BOOKING.CHECKOUT") + `</strong></p>
                   <p> ` + this.reserva.roomReservations[0].checkout + `</p>
                   <p> ` + this.translate.instant("BOOKING.ASK") + " " + `</p>`
          let alert = this.alertCtrl.create({
            title: this.translate.instant("BOOKING.TITLERESERVE"),
            subTitle: this.translate.instant("BOOKING.DATA"),
            message: res,
            buttons: [
              {
                text: 'Cancel',
                role: 'cancel',
                handler: data => {
                }
              },
              {
                text: 'Ok',
                handler: data => {

                  this.serviceAPI.getHotelbyId(this.reserva.hotelId).then(hotel => {
                    console.log('hotel: ', hotel)
                    let body =
                    {
                      emailguest: this.reserva.primaryGuest.email,
                      start: this.reserva.roomReservations[0].checkin,
                      finish: this.reserva.roomReservations[0].checkout,
                      room: hotel[0].HabFast,
                      email: hotel[0].user,
                      password: hotel[0].pass,
                      downloadCode: this.reserva.id,
                      client: hotel[0].idCliente,
                      datosreserva: this.reserva
                    }
                    //console.log("body: ", body); 
                    loading.dismiss();
                    this.apiComponents.createLoading().then((loading: Loading) => {
                      loading.present();
                      let habrooms: any = [
                        { id: hotel[0].HabFast },
                        { id: hotel[0].habitaciones.uno },
                        { id: hotel[0].habitaciones.dos },
                        { id: hotel[0].habitaciones.tres },
                        { id: hotel[0].habitaciones.cuatro },
                        { id: hotel[0].habitaciones.cinco }
                      ]
                      this.serviceAPI.crearllave(body, habrooms[5].id).then(llave5 => {
                        this.serviceAPI.crearllave(body, habrooms[4].id).then(llave4 => {
                          this.serviceAPI.crearllave(body, habrooms[3].id).then(llave3 => {
                            this.serviceAPI.crearllave(body, habrooms[2].id).then(llave2 => {
                              this.serviceAPI.crearllave(body, habrooms[1].id).then(llave1 => {
                                this.serviceAPI.crearllave(body, habrooms[0].id).then(llave => {
                                  this.keyroomBooking = llave;
                                  console.log("booking key: ", this.keyroomBooking)
                                  loading.dismiss();
                                  if (this.keyroomBooking.keyRoom) {
                                    this.alertGetKey(this.reserva, llave.keyRoom)
                                  }
                                  else {
                                    this.translate.get('ADD_KEY.NO_KEY').subscribe((res: any) => {
                                      this.apiComponents.createToast(res, 3000, 'bottom')
                                        .then((toast: Toast) => {
                                          toast.present();
                                        });
                                    })
                                  }
                                })
                                  .catch(err => {
                                    res =
                                      `<p> FastCheckin Error
                                                          <p>` + this.translate.instant("BOOKING.AGAIN") + ` </p>`;
                                    loading.dismiss()
                                  }) // Llave
                              })  // llave 1
                            }) // llave2
                          })  // llave3
                        }) // llave4
                      })  // llave5

                    }) // createLoading
                  }) // getHotelId

                }
              }

            ]
          });
          alert.present();

        } else {
          this.translate.get('ADD_KEY.NO_KEY').subscribe((res: any) => {
            this.apiComponents.createToast(res, 3000, 'bottom')
              .then((toast: Toast) => {
                toast.present();
              });
          })
        }

      }
*/
    })

  }

  keyexpirada(key) {
    let expired = false;
    let start = new Date(key.start);
    let finish = new Date(key.finish)
    let now = new Date();
    console.log(start, ' ', finish, ' ', now)
    if (finish > now) expired = true;
    return (expired)
  }

  saveDataPeriodAndGuest(key) {
    // Grabamos datos del período de reserva en localStorage:
    this.storageService.setPeriodReserve({ "start": key.start, "finish": key.finish });
    //debugger
    // Grabamos los datos de los guest que no tengan el name en blanco:  

    this.serviceAPI.actualGuests = [];
    key.guests.forEach(item => {

      if (item.fastcheckin) {
        item.fastcheckin = CryptProvider.decryptData(item.fastcheckin, item._id);
        this.serviceAPI.actualGuests.push(item);
      }

    });

    console.log('save: ', this.serviceAPI.actualGuests)
    //this.storageService.setGuests(arrayGuests);

  }

  getKey() {
    let key: any
    console.log("Code: ", this.code)

    this.apiComponents.createLoading().then((loading: Loading) => {
      loading.present();
      this.serviceAPI.getKeyByCode(this.code)
        .then((response) => {

          let resp: any;

          if (response.response.length > 0) {
            console.log("getkey1: ", response)
            resp = response.response;
            key = resp[0];


            this.saveDataPeriodAndGuest(key);




            this.user = key.client;
            if (!this.keyexpirada(key)) {

              console.log('expirada');
              let ini = new Date(key.start).toDateString();
              let fin = new Date(key.finish).toDateString();
              let t = this.translate.instant('KEYS.CADUCATETITLE')
              let st = this.translate.instant('KEYS.CADUCATESUBTITLE')
              let mes = this.translate.instant('KEYS.CADUCATEMESSAGE') +
                `<p><strong>` + this.translate.instant("BOOKING.CHECKIN") + `</strong></p>
                         <p> ` + ini + `</p>
                         <p><strong>` + this.translate.instant("BOOKING.CHECKOUT") + `</strong></p>
                          <p> ` + fin + `</p>`
              this.showalert(t, st, mes, 0)

            } else {
              this.irBooking = false;
              //console.log("mas de 0")
              this.storageService.setDownloadCode(true);
              this.storageService.setCode(this.code);

              this.keys = resp;

              this.events.publish('setClient', { client: this.keys[0].client })
              this.serviceAPI.getHotel(this.keys[0].client.id).then(hotel => {

                this.serviceAPI.actualHotel = hotel[0];
                console.log('Hotel actual: ', this.serviceAPI.actualHotel);
                this.storageService.setHotel(this.serviceAPI.actualHotel);
                if (this.flag && resp[0].guests && resp[0].guests.length > 0 && this.serviceAPI.actualHotel.hasFast == '1') {
                  //this.dismiss();
                  this.user = resp[0].guests[0];
                  this.loginhide = true;


                  this.email = this.user.email;
                  this.password = this.user.email;
                  this.name = this.user.email;
                  this.loginUser();


                } else {
                  let count = resp[0].guests ? resp[0].guests.length + 1 : 1;
                  this.email = this.code + count + "@code.com";
                  this.password = this.code + count + "@code.com";
                  this.name = this.code + count + "@code.com";
                  this.loginUser();
                }

              })

            } // else de keyexpirada
          } else {
            this.translate.get('ADD_KEY.NO_KEY').subscribe((res: any) => {
              this.createkey(loading);
            })
          }  ////
          // Aqui el else de expirado
          //}
          ////


        })
        .catch((error) => {
          console.log(error);

          this.translate.get('ADD_KEY.NO_KEY').subscribe((res: any) => {
            this.apiComponents.createToast(res, 3000, 'bottom')
              .then((toast: Toast) => {
                toast.present();
              });
          })
        })

      loading.dismiss()

    })
    //

  }

  public loginUser() {

    this.apiComponents.createLoading().then((loading: Loading) => {
      loading.present();
      this.authProvider.loginUser(this.email, this.password)
        .then(authData => {
          this.service.login(authData).then((data) => {
            this.serviceAPI.getHotel(this.keys[0].client.id).then(hotel => {
              this.serviceAPI.actualHotel = hotel[0];
              console.log('Actual hotel: ', this.serviceAPI.actualHotel)
              this.loginSuccess(loading, data);
            })
          }).catch((error) => {
            loading.dismiss();
          })
        }, errorCode => {
          this.registerUser(loading);
        });

    });

  }

  public registerUser(loading) {
    this.authProvider.signupUser(this.name, this.email, this.password)
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
  }

  private registerNewuser(authData, loading) {
    this.service.createUser(authData.response).then((data) => {
      this.authProvider.loginUser(this.email, this.password)
        .then(authData => {
          for (let key of this.keys) {
            this.service.addUsertoKey(data.guest._id, key.id);
          } setTimeout(() => {
            this.service.login(authData).then((data) => {
              this.loginSuccess(loading, data);
            }).catch((error) => {
              loading.dismiss();
            })
          }, 1000);

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
    this.storageService.setUserIsLoged(false);
    this.storageService.setUserData(response);
    console.log('login Success: ', response)
    loading.dismiss();

    //console.log('user: ', response.guest.fastcheckin);
    if (this.navParams.get('newuser')){
      let modal = this.modalCtrl.create('ChangeUserPage', { user: response, paso: 1 });
      modal.present();
    } else {
      let modal = this.modalCtrl.create('ChangeUserPage', { user: response });
      modal.present();
      // this.controlContinue(response);
    }



  }

  // Método que controla la siguiente pantalla a mostrar una vez que el login se ha realizado con éxito:
  // 1- Si no tiene húespedes registrados accede a la pantalla de fastcheckin.
  // 2- Si ya tiene húespedes registrados, comprueba el control de llaves, si tienes llaves más de la de
  // por defecto de fastchekin muestra el mapa con las llaves extendidas, en caso contrario solo mapa:
  // Si viene como parámetro que debe hacer fastcheckin también abre el fastcheckin:
  private controlContinue(response) {

    // 1. Si no tiene húespedes registrados abre la pantalla de fastcheckin:
    if (this.service.actualGuests.length <= 0 || this.MuestraFastCheckinParam === "true") {
      let modal = this.modalCtrl.create('ChangeUserPage', { user: response });
      modal.present();
    } else {
      // Controlamos la apertura de mapa con llaves o sin llaves:
      // get Hotel:
      let hotel = JSON.parse(this.storageService.getHotel());
      let hotel_id = hotel.idCliente;
      let hotel_name = hotel.nombre;

      // Get keyRooms:
      // get Keys:
      let numkeys = JSON.parse(this.storageService.getKeysRooms());
      numkeys = numkeys.keysRooms.length;

      let selected_filter = ["indice", "visita", "excursiones1", "excursiones2", "espectaculos", "parques", "barco", "rutas", "spa", "museos", "transfer", "alquiler", "agua", "punto", "other"];
      this.navCtrl.push(MimapPage, { "hotel_id": hotel_id, "hotel_name": hotel_name, "selected_filter": selected_filter, "llaves": numkeys > 1 ? true : false });

    }
  }

  private showError(errorCode) {
    this.apiComponents.createToast(errorCode, 3000, 'bottom')
      .then((toast: Toast) => {
        toast.present();
      });
  }

  private translateLoadingContent(loading: Loading, label: string) {
    this.translate.get('KEYS.MESSAGES.' + label).subscribe((res: any) => {
      loading.data.content = res
    });
  }



  // Enlace a WhatsApp
  private sharedWhatsapp() {
    this.iab.create("https://api.whatsapp.com/send?text=" + this.translate.instant('FASTCHECKIN.WELCOMEBECHECKIN'));
  }

  // Enlace al correo electrónico
  public getMessageEmail() {
    return "mailto:?subject=" + this.translate.instant('FASTCHECKIN.WELCOMEBECHECKIN_TEXT') + "&body=" + this.translate.instant('FASTCHECKIN.WELCOMEBECHECKINURI');
  }

  // Enlace a mensajería SMS
  public getMessageSMS() {
    //return "sms://?body="+this.translate.instant('FASTCHECKIN.WELCOMEBECHECKINURI');
    return "sms:";
  }

  ionViewWillEnter() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('en el prompt para instalar');
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later on the button event.
      this.deferredPrompt = e;

      // Update UI by showing a button to notify the user they can add to home screen
      this.showBtn = true;
    });

    //button click event to show the promt

    window.addEventListener('appinstalled', (event) => {
      console.log('app installed');
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('display-mode is standalone');
    }
  }

  add_to_home(e) {

    // hide our user interface that shows our button
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the prompt');
        } else {
          console.log('User dismissed the prompt');
        }
        this.deferredPrompt = null;
      });
  }

}