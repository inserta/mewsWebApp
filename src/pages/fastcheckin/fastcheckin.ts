import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, Content, Loading, Toast, ModalController, Events, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DNIValidator } from '../../validators/dni';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from 'ionic-angular';
import moment from 'moment';
import { ApiComponents } from '../../components/api-components'
import { StorageService } from '../../app/services/service.storage'
import { ServiceAPI } from "../../app/services/service.api";
import { GoogleCloudVisionServiceProvider } from '../../providers/vision/google-cloud-vision-service';
import { CryptProvider } from '../../providers/crypt/crypt';

import { User } from '../../app/models/user.model';
import { Auth } from 'angularfire2/interfaces';
import { AuthProvider } from '../../providers/auth/auth';
//import * as Countries from 'i18n-iso-countries';
@IonicPage()
@Component({
    selector: 'page-fastcheckin',
    templateUrl: 'fastcheckin.html',
})
export class FastcheckinPage {

    @ViewChild('canvas') canvasElement: ElementRef;
    @ViewChild(Content) content: Content;


    public dataUpdate: boolean = false;
    private loginForm: FormGroup;
    private user: User;
    private sex: string = 'F';
    private typeDocument: string = 'dni';
    private signature: string;
    private keys: any[];
    private email: string;
    private password: string;
    private name: string;
    private code: string;
    private first: boolean = true;
    private salida: boolean = false;
    private conditions: boolean =false;
    image: string = '';
    filestring: string = '';
    files: FileList;
    bookingData: any;
    newGuest: boolean = false;
    clienteActual: any;


    constructor(
        private modalCtrl: ModalController,
        private alertCtrl: AlertController,
        private translate: TranslateService,
        private apiComponents: ApiComponents,
        private vision: GoogleCloudVisionServiceProvider,
        private formBuilder: FormBuilder,
        private storageService: StorageService,
        private serviceAPI: ServiceAPI,
        private cryptProvider: CryptProvider,
        private events: Events,
        private authProvider: AuthProvider,
        private service: ServiceAPI,
        private navCtrl: NavController,
        public params: NavParams) {

        this.code = this.storageService.getCode() ? this.storageService.getCode() : "";
        console.log('this.code: ', this.params, 'Another: ', this.params.get('isAnother') )
        this.getUserData();
        if (!this.params.get('isAnother') && (!this.params.get('comeFromCard'))) {
          this.newGuest = true;
          console.log('ng: ', this.newGuest)
          this.mensajeEntrada();
        }

    }

    pdf() {
      this.service.getHotel(this.clienteActual).then( hotel => {
        console.log('populate: ', hotel)
        let pdfWindow = window.open("")
         pdfWindow.document.write("<iframe width='100%' height='100%' src='data:application/pdf;base64, " + encodeURI(hotel[0].doc.doc) + "'></iframe>")

        /*
        this.pdf.open('path/to/file.pdf', 'application/pdf')
          .then(() => console.log('File is opened'))
          .catch(e => console.log('Error opening file', e));*/
      })
    }

    mensajeEntrada() {

      let alert = this.alertCtrl.create({
          title: this.translate.instant("FASTCHECKIN.AVISO"),
          subTitle: '',
          message: this.translate.instant("FASTCHECKIN.MENSAJEINICIO"),
          buttons: [
                     { text: this.translate.instant("FASTCHECKIN.LATER"),
                          handler: data => {
                            console.log("Come: ", this.params.get('comeFromCard'))
                            if (this.params.get('comeFromCard'))
                              this.navCtrl.setRoot('KeysPage')
                            else
                              this.navCtrl.setRoot('AddKeyPage');
                          }
                     },
                     { text: this.translate.instant("FASTCHECKIN.COMPLETAR"),
                          handler: data => { //this.saveProfile()
                    }
                     }
                   ]
      });
      alert.present();
    }

    alerta(titulo, mensaje) {
        let alert = this.alertCtrl.create({
            title: titulo,
            subTitle: '',
            message: mensaje,
            buttons: [
                       
                       { text: 'Ok',
                            handler: data => {  }
                       }
                     ]
        });
        alert.present();
    }
    


    saveProfilemio() {
      /*
      let alert = this.alertCtrl.create({
          title: this.translate.instant("POLICY.TITLE"),
          subTitle: '',
          message: this.translate.instant("POLICY.DESCRIPTION_THREE") + '\n' +
          this.translate.instant("POLICY.CONDITIONS1"),
          buttons: [
                     { text: this.translate.instant("GENERAL.CANCEL"),
                          handler: data => {

                            //this.navCtrl.setRoot('AddKeyPage');
                          }
                     },
                     { text: this.translate.instant("POLICY.DATA_ACCESS"),
                          handler: data => {
                            //this.saveProfile()
                            this.sendProfile();
                          }
                     }
                   ]
      });
      alert.present();*/
      this.sendProfile();
    }

    saveProfile() {
      if (this.conditions) {
        this.user.guest.fastcheckin.name = this.loginForm.value.name;
        this.user.guest.fastcheckin.surnameOne = this.loginForm.value.lastname;
        this.user.guest.fastcheckin.birthday = this.loginForm.value.birthday;
        this.user.guest.fastcheckin.date_exp = this.loginForm.value.expedition;
        this.user.guest.fastcheckin.caducate = this.user.keysRooms[0].start;
        //this.user.guest.fastcheckin.caducate = this.loginForm.value.caducate;
        this.user.guest.fastcheckin.typeOfDocument = this.typeDocument;
        this.user.guest.fastcheckin._id = this.user.guest._id;
        this.user.guest.fastcheckin.reserve = this.loginForm.value.reserve;
        this.user.guest.fastcheckin.update = new Date().toISOString();
        this.user.guest.fastcheckin.email = this.loginForm.value.email ? this.loginForm.value.email : this.user.guest.email;
        //this.user.guest.fastcheckin.email = this.loginForm.value.email;

        if (this.typeDocument == 'dni') {
            this.user.guest.fastcheckin.dni.identifier = this.loginForm.value.document;
        } else {
            this.user.guest.fastcheckin.passport.identifier = this.loginForm.value.document;
        }
        this.user.guest.fastcheckin.nationality = this.loginForm.value.nationality;
        this.user.guest.fastcheckin.sex = this.sex;
        this.user.guest.fastcheckin.signature = this.signature;
        if (this.user.guest.fastcheckin
           && this.user.guest.fastcheckin.birthday != ""
           && this.user.guest.fastcheckin.caducate != null
           && this.user.guest.fastcheckin.date_exp != null
           && this.user.guest.fastcheckin.name != ""
           && this.user.guest.fastcheckin.surnameOne != ""
           && this.user.guest.fastcheckin.nationality != ""
           && this.user.guest.fastcheckin.sex != ""
           && this.user.guest.fastcheckin.typeOfDocument != ""
           && (this.user.guest.fastcheckin.dni.identifier != "" || this.user.guest.fastcheckin.passport.identifier != "")
           && this.user.guest.fastcheckin.signature != ""
           && this.user.guest.fastcheckin.email != ""
        ) {
            console.log("User: ", this.user.guest)
            this.saveProfilemio();
            //this.sendProfile();
        } else {
          console.log(this.first)
          //if (!this.first) {
            let titleAlert = this.translate.instant("FASTCHECKIN.ADVICE_BEFORE_ANALIZE_TITLE");
            let textAlert = this.translate.instant("FASTCHECKIN.ADVICE_BEFORE_ANALIZE_TEXT");

            let alert = this.alertCtrl.create({
                title: titleAlert,
                subTitle: textAlert,
                buttons: ['OK']
            });
            alert.present();
          //}else{

        //    this.navCtrl.setRoot('AddKeyPage', { animate: true, direction: 'backward' });
        //    this.storageService.setUserIsLoged(false);
        //    this.storageService.setUserData(null);
        //  }

        }
      }else{
        let alert = this.alertCtrl.create({
            title: this.translate.instant("POLICY.TITLECONDITIONS"),
            subTitle: this.translate.instant("POLICY.CONDITIONS"),
            buttons: ['OK']
        });
        alert.present();
      }

    }

    anotherGuest() {
      /*
      let alert = this.alertCtrl.create({
          title: this.translate.instant("FASTCHECKIN.ATENCION"),
          subTitle: '',
          message: this.translate.instant("FASTCHECKIN.MAS"),
          buttons: [
                     { text: this.translate.instant("FASTCHECKIN.ANOTHER"),
                          handler: data => {
                              this.sendUser()
                          }
                     },
                     { text: this.translate.instant("FASTCHECKIN.TRAVEL"),
                          handler: data => {

                              this.navCtrl.setRoot('KeysPage', { animate: true, direction: 'backward' });
                          }
                     }
                   ]
      });
      alert.present();*/
      this.navCtrl.setRoot('KeysPage', { animate: true, direction: 'backward' });
    }

    private checkKeyPermisions() {
      //if (this.salida) {
      //  this.navCtrl.setRoot('KeysPage', { animate: true, direction: 'backward' });
      //}else{

        let idGuest = this.user.guest._id
        for (let keyRoom of this.user.guest.keysRooms) {
            if (this.user.guest.clientOf.some(x => x === keyRoom.client._id)) {
                console.log("Existe key permiso");

                //this.navCtrl.setRoot('KeysPage', { animate: true, direction: 'backward' });

            }
            else {
                this.user.guest.clientOf.push(keyRoom.client._id);
                this.service.setPermissionPersonalData(idGuest, keyRoom.client._id, keyRoom.client.name, "yes")
                    .then((response) => {

                      //this.navCtrl.setRoot('KeysPage', { animate: true, direction: 'backward' });
                      //this.anotherGuest();

                    }).catch((error) => {
                        console.log(error);
                    });
            }
        }
      //}
    }

    takePhoto() {
        let modal = this.modalCtrl.create('ModalHelpPage');
        modal.present();
        modal.onDidDismiss(data => {
            this.apiComponents.createActionSheetTakeImage().then((response: string) => {
                this.analyze(response);
            });
        });
    }

    analyze2(image) {

        try {
            this.apiComponents.createLoading().then((loading: Loading) => {
                loading.present();
                loading.onDidDismiss(() => {
                    let titleAlert = this.translate.instant("FASTCHECKIN.ADVICE_BEFORE_ANALIZE_TITLE");
                    let textAlert = this.translate.instant("FASTCHECKIN.ADVICE_BEFORE_ANALIZE_TEXT");

                    let alert = this.alertCtrl.create({
                        title: titleAlert,
                        subTitle: textAlert,
                        buttons: ['OK']
                    });
                    alert.present();

                });
                try {
                    this.vision.getLabels(image).subscribe((result: any) => {
                        console.log(result._body);
                        let res = JSON.parse(result._body);
                        if (res.responses[0].fullTextAnnotation) {
                            this.typeDocument = res.responses[0].fullTextAnnotation.text.indexOf('passport') >= 0 || res.responses[0].fullTextAnnotation.text.indexOf('PASSPORT') >= 0 ? 'passport' : 'dni';

                            if (this.typeDocument == 'dni') {
                              console.log('dni')
                                this.recognizeDNIText(res.responses[0].fullTextAnnotation.text, loading);
                            } else {
                                this.recognizePassportText(res.responses[0].fullTextAnnotation.text, loading);
                            }
                        } else {
                            loading.dismiss()
                        }
                    }, err => {
                        loading.dismiss();
                        console.log(err);
                    });
                } catch (error) {
                    console.log(error);
                    this.showToast("FASTCHECKIN.NO_SCANNER");
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    analyze(image) {

        try {
            this.apiComponents.createLoading().then((loading: Loading) => {
                loading.present();
                /*
                loading.onDidDismiss(() => {
                    let titleAlert = this.translate.instant("FASTCHECKIN.ADVICE_BEFORE_ANALIZE_TITLE");
                    let textAlert = this.translate.instant("FASTCHECKIN.ADVICE_BEFORE_ANALIZE_TEXT");

                    let alert = this.alertCtrl.create({
                        title: titleAlert,
                        subTitle: textAlert,
                        buttons: ['OK']
                    });
                    alert.present();

                });*/
                try {
                    this.vision.getLabels(image).subscribe((result: any) => {
                        console.log(result._body);
                        let res = JSON.parse(result._body);
                        if (res.responses[0].fullTextAnnotation) {
                            this.typeDocument = res.responses[0].fullTextAnnotation.text.indexOf('passport') >= 0 || res.responses[0].fullTextAnnotation.text.indexOf('PASSPORT') >= 0 ? 'passport' : 'dni';

                            if (this.typeDocument == 'dni') {
                              console.log('dni')
                                this.recognizeDNIText(res.responses[0].fullTextAnnotation.text, loading);
                            } else {
                                this.recognizePassportText(res.responses[0].fullTextAnnotation.text, loading);
                            }
                        } else {
                            loading.dismiss()
                        }
                    }, err => {
                        loading.dismiss();
                        console.log(err);
                    });
                } catch (error) {
                    console.log(error);
                    this.showToast("FASTCHECKIN.NO_SCANNER");
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    openQr() {
        if (this.user.guest.fastcheckin && this.user.guest.fastcheckin.name) {
            this.modalCtrl.create('ModalQrPage', { fastcheckin: this.user.guest._id }).present();
        } else {
            let titleAlert = this.translate.instant("FASTCHECKIN.ADVICE_BEFORE_ANALIZE_TITLE");
            let textAlert = this.translate.instant("FASTCHECKIN.ADVICE_BEFORE_ANALIZE_TEXT");

            let alert = this.alertCtrl.create({
                title: titleAlert,
                subTitle: textAlert,
                buttons: ['OK']
            });
            alert.present();
        }
    }

    public sendUser() {
        this.apiComponents.createLoading().then((loading: Loading) => {
            loading.present();
            this.code = this.storageService.getCode();
            this.serviceAPI.getKeyByCode(this.code)
                .then((response) => {
                    if (response.response.length > 0) {
                        console.log(response)
                        let resp = response.response;
                        this.keys = resp;
                        if (resp[0].guests && resp[0].guests.length > 0) {
                            let count = resp[0].guests.length + 1;
                            this.email = this.code + count + "@code.com";
                            this.password = this.code + count + "@code.com";
                            this.name = this.code + count + "@code.com";
                            this.loginUser();
                        } loading.dismiss();
                    }
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
        });
    }

    public loginUser() {
        this.apiComponents.createLoading().then((loading: Loading) => {
            loading.present();
            this.authProvider.loginUser(this.email, this.password)
                .then(authData => {
                    this.service.login(authData).then((data) => {
                        this.loginSuccess(loading, data);
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
                console.log(errorCode)
            });
    }

    private registerNewuser(authData, loading) {
        this.service.createUser(authData.response).then((data) => {
            this.authProvider.loginUser(this.email, this.password)
                .then(authData => {
                    for (let key of this.keys) {
                        this.service.addUsertoKey(data.guest._id, key.id).then(ok => {});
                    }
                    setTimeout(() => {
                        this.service.login(authData).then((data) => {
                            this.loginSuccess(loading, data);

                        }).catch((error) => {
                            loading.dismiss();
                        })
                    }, 1000);
                }, errorCode => {
                    console.log(errorCode)
                });
        }).catch((err) => {
            loading.dismiss();
        });
    }

    private loginSuccess(loading: Loading, response) {
        this.storageService.setUserIsLoged(false);
        this.storageService.setUserData(response);
        if (response.guest.fastcheckin.name == '')
          this.navCtrl.setRoot('FastcheckinPage', { animate: true, direction: 'backward', isAnother: true });
    	  else
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

    private sendProfile() {
        this.apiComponents.createLoading().then((loading: Loading) => {
            loading.present();
            console.log(this.user)
            let fastcheckin = this.cryptProvider.encryptData(this.user);
            this.serviceAPI.setFastcheckin(this.user, fastcheckin.toString())
                .then((response) => {
                    this.user.guest.fastcheckin = CryptProvider.decryptData(fastcheckin.toString(), this.user.guest._id);
                    var fechaInicio = new Date(this.user.guest.fastcheckin.birthday).getTime();
                    var fechaFin    = new Date().getTime();

                    var diff = fechaFin - fechaInicio;

                    var edad = diff/(1000*60*60*24*365)

                    console.log(diff/(1000*60*60*24*365) );
                    this.serviceAPI.actualUser.edad =  edad
                    this.storageService.setUserData(this.user);
                    this.events.publish('setUser', this.user);
                    this.dataUpdate = true;
                    this.serviceAPI.getHotel(this.user.keysRooms[0].client._id).then( hotel => {
                              console.log('h: ', hotel)
                              let mail = this.user.keysRooms[0].client.email;

                              if ((hotel[0].email) && (hotel[0].email != hotel[0].user) && (hotel[0].email != ''))
                              {
                                 mail = mail + ', ' + hotel[0].email;
                                 if ( hotel[0].activo == '0')
                                   mail = hotel[0].email;
                              }

                              console.log('email to: ', mail)

                              this.serviceAPI.sendmail(
                                this.user.keysRooms[0].client.name,
                                this.user.keysRooms[0].downloadCode,
                                mail,
                                this.user.keysRooms[0].start.substring(0,10),
                                this.user.keysRooms[0].finish.substring(0,10),
                                this.user.guest.fastcheckin

                              ).then ( resp => {
                                console.log(resp)
                                loading.dismiss();
                                this.checkKeyPermisions();
                                this.content.scrollToTop();
                                this.anotherGuest();

                              })
                      })

                    /*
                    setTimeout(() => {
                        this.dataUpdate = false;
                    }, 3000);
                        }).catch((error) => {
                    loading.dismiss();
                    console.log(error);*/
                });

                /*/ Send to booking
                   console.log("User: ",this.user, " Code: ", this.code);
                   this.serviceAPI.sendBooking(this.user.guest.fastcheckin, this.code)
                       .then((response) => {
                         console.log("Booking dice: ", response.body)

                       }).catch((error) => {});


                //*/
        });
    }

    private getUserData(): any {
        this.apiComponents.createLoading().then((loading: Loading) => {
            loading.present();
            this.storageService.getUserData()
                .then((response) => {
                    this.user = response;
                    console.log('Get User Data: ', this.user)
                    this.clienteActual = this.user.keysRooms[0].client._id
                    if (this.user.guest.fastcheckin.name != '') {
                      this.first = false;
                      console.log('first: ', this.first, ' ', this.code)
                    }

                    this.sex = this.user.guest.fastcheckin ? this.user.guest.fastcheckin.sex : '';
                    this.typeDocument = this.user.guest.fastcheckin ? this.user.guest.fastcheckin.typeOfDocument : '';
                    this.loginForm = this.formBuilder.group({
                      /*
                      name: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.name : '', Validators.compose([Validators.required])],
                       lastname: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.surnameOne : '', Validators.compose([Validators.required])],
                       birthday: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.birthday : '', Validators.compose([Validators.required])],
                       email: [this.user.guest.fastcheckin && this.user.guest.fastcheckin.email && !this.user.guest.fastcheckin.email.includes('@code.com') ? this.user.guest.fastcheckin.email : '', Validators.compose([Validators.required])],
                       reserve: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.reserve : '', Validators.compose([Validators.required])],
                       expedition: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.date_exp : '', Validators.compose([Validators.required])],
                       caducate: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.caducate : '', Validators.compose([Validators.required])],
                       document: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.dni.identifier ? this.user.guest.fastcheckin.dni.identifier : (this.user.guest.fastcheckin.passport.identifier ? this.user.guest.fastcheckin.passport.identifier : '') : '', Validators.compose([Validators.required, DNIValidator.isValid])],
                       nationality: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.nationality : '', Validators.compose([Validators.required])]

                      */
                        name: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.name : '', Validators.compose([Validators.required])],
                        lastname: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.surnameOne : '', Validators.compose([Validators.required])],
                        birthday: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.birthday : '', Validators.compose([Validators.required])],
                        email: [this.user.guest.fastcheckin && this.user.guest.fastcheckin.email && !this.user.guest.fastcheckin.email.includes('@code.com') ? this.user.guest.fastcheckin.email : '', Validators.compose([Validators.required])],
                        //date_exp: [this.user.guest.fastcheckin.date_exp ? this.user.guest.fastcheckin.date_exp : '', Validators.compose([Validators.required])],
                        reserve: [this.code, Validators.compose([Validators.required])],
                        expedition: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.date_exp : '', Validators.compose([Validators.required])],
                        //caducate: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.caducate : '', Validators.compose([Validators.required])],
                        caducate: [this.user.keysRooms[0].caducate],
                        document: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.dni.identifier ? this.user.guest.fastcheckin.dni.identifier : (this.user.guest.fastcheckin.passport.identifier ? this.user.guest.fastcheckin.passport.identifier : '') : '', Validators.compose([Validators.required, DNIValidator.isValid])],
                        nationality: [this.user.guest.fastcheckin ? this.user.guest.fastcheckin.nationality : '', Validators.compose([Validators.required])]
                    });
                    loading.dismiss();
                }).catch((error) => {
                    loading.dismiss();
                });
        });
    }

    private recognizePassportText(text: any, loading: Loading) {
        let texts = text.split('\n');
        let promises = [];
        promises.push(this.recognizeOtherData(texts[texts.length - 2]));
        promises.push(this.recognizeNamePassport(texts[texts.length - 3]));

        Promise.all(promises)
            .then(() => {
                loading.dismiss();
            }).catch(() => {
                loading.dismiss();
                this.apiComponents.createToast("errorCode", 3000, 'bottom')
                    .then((toast: Toast) => {
                        toast.present();
                    });
            });
    }

private recognizeDNIText(text: any, loading: Loading) {
      console.log('text DNI: ', text)
        let texts = text.split('\n');
        console.log('text ', texts)
        let promises = [];
        let ID = ''
        let found = false;
        let indice = 0;
        let cont = 0;
        console.log('Id: ', ID)

        texts.forEach(element => {
            ID = element.substring(0,2);
            if ( ID == 'ID') {
                found = true;
                indice = cont;
            }

            cont = cont + 1
            
        });

    if ( found == false ) {
          this.showToast('Error datos Scan. Vuelva a intentarlo')
          loading.dismiss();
    } else
    {

        //this.alerta('TODO', texts[indice] + '\n_$' + texts[indice + 1] + '\n_$' + texts[indice + 2]);
        
        
        promises.push(this.recognizeDNI(texts[indice].replace(/ /g, "")));
        promises.push(this.recognizeDatesAndSex(texts[indice + 1].replace(/ /g, "")));
        promises.push(this.recognizeName(texts[indice + 2]));
        promises.push(this.recognizeNationality(texts[indice + 1].replace(/ /g, "")));
        
        /*
        promises.push(this.recognizeDNI(texts[0]));
        promises.push(this.recognizeDatesAndSex(texts[1]));
        promises.push(this.recognizeName(texts[2]));
        promises.push(this.recognizeNationality(texts[1]));
        */

        Promise.all(promises)
            .then(() => {
                loading.dismiss();
                let titleAlert = this.translate.instant("FASTCHECKIN.ADVICE_BEFORE_ANALIZE_TITLE");
                    let textAlert = this.translate.instant("FASTCHECKIN.ADVICE_BEFORE_ANALIZE_TEXT");

                    let alert = this.alertCtrl.create({
                        title: titleAlert,
                        subTitle: textAlert,
                        buttons: [{ 
                            text: 'Ok',
                            handler: data => {
                                document.getElementById("nombre").focus();
                            }
                        }]
                        
                    });
                    alert.present();
               
                //this.saveProfile();
            }).catch((error) => {
                console.log(error)
                loading.dismiss();
                this.apiComponents.createToast("Error scan", 3000, 'bottom')
                    .then((toast: Toast) => {
                        toast.present();
                    });
            });
    }
}

    private recognizeDNI(lineDNI) {
        return new Promise<string>((resolve, reject) => {
            lineDNI = lineDNI.replace(/ /g, "");
            let foundLower: boolean = false;
            let isNotFirstCharacter: boolean = true;
            let lengthDNI = 9;
            let dni = "";
            for (var index = Number(lineDNI.length) - 1; index > 0; index--) {
                if (lineDNI[index] == '<') {
                    foundLower = true;
                } else if (foundLower) {
                    if (lengthDNI != 0) {
                        let character = lineDNI[index];
                        if (!isNotFirstCharacter) {
                            character = character == 'O' || character == 'o' ? 0 : character;
                        }
                        isNotFirstCharacter = false;
                        dni = character + dni;
                        lengthDNI--;
                    }
                }
            }

            this.loginForm.patchValue({ document: dni });
            this.typeDocument = 'dni';
            

            resolve();
        });
    }

    private recognizeName(lineName) {
        return new Promise<string>((resolve, reject) => {
            lineName = lineName.replace(/~/g, '');
            let lineNamesSurname = lineName.split('<<');
            let surname = lineNamesSurname[0].replace(/</g, " ");
            let name = lineNamesSurname[1].replace(/</g, " ");

            this.loginForm.patchValue({ name: name });
            this.loginForm.patchValue({ lastname: surname });
            

            resolve();
        });
    }

    private recognizeNamePassport(lineName) {
        return new Promise<string>((resolve, reject) => {
            lineName = lineName.substring(5, lineName.length);
            let index = lineName.length - 1;
            while (index >= 0) {
                if (lineName[index] != '<') {
                    lineName = lineName.substring(0, index + 1);
                    break;
                }
                index--;
            }

            let lineNamesSurname = lineName.split('<<');
            let surname = lineNamesSurname[0].replace(/</g, " ");
            let name = lineNamesSurname[1].replace(/</g, " ");

            this.loginForm.patchValue({ name: name });
            this.loginForm.patchValue({ lastname: surname });
            resolve();
        });
    }

    private calculateYear(date, date1) {
        let birth = new Date(date1);
        var diff = moment.duration(moment(birth).diff(moment(date)));
        var years = diff.asDays() / 365;
        years = years * -1;
        return years;
    }

    private recognizeDatesAndSex(lineName) {
        let expeditionYearText = null;
        let years;
        let cases = [2, 5, 10];
        //this.alerta('DateSex', lineName);

        return new Promise<string>((resolve, reject) => {

            let sex = lineName.substring(7, 8);
            this.sex = sex;
            //this.alerta('Sex', this.sex);
            let year = '19';

            let birthdateYearText = lineName.substring(0, 2);
            let birthdateMonthText = lineName.substring(2, 4);
            let birthdateDayText = lineName.substring(4, 6);
            
            if (birthdateYearText + 1 < 30) year = '20';
            let birthdateText = year + birthdateYearText + "-" + birthdateMonthText + "-" + birthdateDayText;
            this.loginForm.patchValue({ birthday: birthdateText });



            let caducateYearText = lineName.substring(8, 10);
            let caducateMonthText = lineName.substring(10, 12);
            let caducateDayText = lineName.substring(12, 14);
            let caducateText = "20" + caducateYearText + "-" + caducateMonthText + "-" + caducateDayText;
            //this.alerta('Caducate ',  caducateText);
            //this.loginForm.patchValue({ caducate: caducateText });


            cases.forEach((element) => {
                let caducateYearText1 = caducateYearText - element;
                let caducateAux = "20" + caducateYearText1 + "-" + caducateMonthText + "-" + caducateDayText;
                let dateCaducate = new Date(caducateAux);
                let year = this.calculateYear(dateCaducate, birthdateText);
                if (element == 5 && year < 30 && expeditionYearText == null) {
                    expeditionYearText = caducateYearText - 5;
                } else if (element == 2 && year < 5 && expeditionYearText == null) {
                    expeditionYearText = caducateYearText - 2;
                } else if (element == 10 && year < 70 && expeditionYearText == null) {
                    expeditionYearText = caducateYearText - 10;
                }
            });

            let ok = true;

            let m = parseInt(caducateMonthText, 10)
            if (m)
              if (m<13)
                console.log('ok: ', m)
              else {
                console.log('no ok:', m)
                ok = false;
              }
            else {
              console.log('bad: ', m)
              ok = false;
            }

              let d = parseInt(caducateDayText, 10)
              if (d)
                if (d<31)
                  console.log('ok: ', d)
                else {
                  console.log('no ok:', d)
                  ok = false;
                }
              else {
                console.log('bad: ', d)
                ok = false;
              }

            let expeditionText = ''

            if (!ok)
              expeditionText = ''
            else {
              let expeditionMonthText = caducateMonthText;
              let expeditionDayText = caducateDayText;
              expeditionText = "20" + expeditionYearText + "-" + expeditionMonthText + "-" + expeditionDayText;
           }


            this.loginForm.patchValue({ expedition: expeditionText }); //expeditionText });

            resolve();
        });
    }


    private recognizeNationality(lineName) {
        return new Promise<string>((resolve, reject) => {
            /*console.log(Countries.langs['es.json'])
            console.log(Countries.langs)
            Countries.registerLocale(Countries.langs['es.json']);*/
            var countries = require("i18n-iso-countries");
            var lang = require("i18n-iso-countries/langs/es.json");
            countries.registerLocale(lang);
            var line: string = lineName.split('<')[0];
            var nationality = line.substring(line.length - 3);
            this.loginForm.patchValue({ nationality: countries.getName(nationality, "es") });
            

            resolve();
        });
    }

    private recognizeOtherData(lineName) {
        let numberPassport = lineName.substring(0, 9);
        let birthdayText = lineName.substring(13, 19);
        let birthdateYearText = lineName.substring(13, 15);
        let birthdateMonthText = lineName.substring(15, 17);
        let birthdateDayText = lineName.substring(17, 19);
        let birthdateText = "19" + birthdateYearText + "-" + birthdateMonthText + "-" + birthdateDayText;
        let sex = lineName.substring(20, 21);

        this.loginForm.patchValue({ document: numberPassport });
        this.loginForm.patchValue({ birthday: birthdateText });
        this.sex = sex;
    }

    private showToast(message: string) {
        this.translate.get(message).subscribe((res: any) => {
            this.apiComponents.createToast(res, 3000, 'bottom')
                .then((toast: Toast) => {
                    toast.present();
                });
        });
    }

    signatureData(data) {
        this.signature = data;
    }

    getFiles(event) {

        this.files = event.target.files;
        var reader = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(this.files[0]);
        document.getElementById("nombre").focus();

   }

    _handleReaderLoaded(readerEvt) {
  var binaryString = readerEvt.target.result;
  this.filestring = btoa(binaryString);  // Converting binary string data.
  this.image = this.filestring;
  this.analyze(this.image)
  }

  showhelp() {
    let modal = this.modalCtrl.create('ModalHelpPage');
    modal.present();
  }

  exit() {
    if (this.user.guest.fastcheckin.name) {
      this.navCtrl.setRoot('KeysPage', { animate: true, direction: 'backward' });
    }else{
      this.navCtrl.setRoot('AddKeyPage', { animate: true, direction: 'backward' });
      this.storageService.setUserIsLoged(false);
      this.storageService.setUserData(null);
    }
  }

  goInit() {
    this.salida = true;
    console.log('salida')
    this.storageService.setUserIsLoged(false);
    this.checkKeyPermisions();
}

  deleteGuest() {

    /*
    console.log('detg: ', this.user.guest.fastcheckin)
    if (this.user.guest.fastcheckin.name) {
    this.serviceAPI.deleteGuest(this.user.guest._id).then( res => {
      console.log('borrado')
      this.exit()
    })
  }else{
     this.exit();
  }*/



  }

}
