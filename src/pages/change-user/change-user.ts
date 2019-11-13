
import { FastCheckin } from './../../app/models/user.model';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, Content, Loading, NavController, NavParams, Toast, Events, ModalController, ViewController, Platform } from 'ionic-angular';
import { User } from '../../app/models/user.model';
import { CryptProvider } from '../../providers/crypt/crypt';
import { ServiceAPI } from "../../app/services/service.api";
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { MimapPage } from '../mimap/mimap';
import { TranslateService } from '@ngx-translate/core';
import { ApiComponents } from '../../components/api-components'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from '../../app/services/service.storage';
import { AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { GoogleCloudVisionServiceProvider } from '../../providers/vision/google-cloud-vision-service';
import { DNIValidator } from '../../validators/dni';
import { ImageViewerController } from "ionic-img-viewer";


import moment from 'moment';
import { GlobalService } from '../../app/services/globalService';
import { ErroresFormularioRegistro, PasoAnterior, DatosDocumento } from '../../app/models/others.model';

@IonicPage()
@Component({
  selector: 'page-change-user',
  templateUrl: 'change-user.html'
})
export class ChangeUserPage {
  users: any[];
  private signature: string;

  public dataUpdate: boolean = false;
  private loginForm: FormGroup;
  private user: User;
  private sex: string = 'F';
  private keys: any[];
  private keysRooms: any[];
  private email: string;
  private password: string;
  private name: string;
  private code: string;
  private first: boolean = true;
  private salida: boolean = false;
  private conditions: boolean = false;
  private policysecurity: boolean = false;
  private condiciones_hotel: any = "";

  public photosNif: any;
  public photosPassport: any;
  public photosNifSubida: any;
  public photosPassportSubida: any;
  public linksSubidos: any;
  public id_img: any;

  image: string = '';
  filestring: string = '';
  files: FileList;
  bookingData: any;
  newGuest: boolean = false;
  clienteActual: any;
  hotel: any;
  existFastcheckin: boolean = false;
  fastcheckinSuccess: boolean = false;
  existSignature: boolean = false;
  emailfield: string = '';
  imagen_dni: any;

  datosDocumento: DatosDocumento

  @ViewChild('sigpad') sigpad: SignaturePad;
  @ViewChild('canvas') canvasElement: ElementRef;
  @ViewChild(Content) content: Content;

  public signaturePadOptions: Object = {
    'minWidth': 2,
    'canvasWidth': 300,
    'canvasHeight': 160,
    'backgroundColor': '#f6fbff',
    'penColor': '#666a73',
    'dotSize': 1
  };

  public isDrawing = false;

  hotel_id: any;
  hotel_name: any;
  selected_filter = [];

  textofast: string;

  //Nuevos atributos

  tipoDoc: string = "dni";
  paso: number = -1;
  pasosAnteriores: PasoAnterior[] = [];
  progreso: string = "0\%";
  errorScan: number = 0;
  fastcheckin: FastCheckin;
  erroresRegistroManual: ErroresFormularioRegistro;
  tiposDocumentos = {
    opciones: [
      { id: 'D', name: this.translate.instant("HUESPED.REGISTRO_MANUAL.DNI") },
      { id: 'P', name: this.translate.instant("HUESPED.REGISTRO_MANUAL.PASAPORTE") }
    ]
  };
  tiposSexo = {
    opciones: [
      { id: 'M', name: this.translate.instant("HUESPED.REGISTRO_MANUAL.HOMBRE") },
      { id: 'F', name: this.translate.instant("HUESPED.REGISTRO_MANUAL.MUJER") }
    ]
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public api: ServiceAPI,
    private globalService: GlobalService,
    private platform: Platform,
    private translate: TranslateService,
    private apiComponents: ApiComponents,
    private storageService: StorageService,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private serviceAPI: ServiceAPI,
    private authProvider: AuthProvider,
    private events: Events,
    private service: ServiceAPI,
    private modalCtrl: ModalController,
    private vision: GoogleCloudVisionServiceProvider,
    private cryptProvider: CryptProvider,
    public imageViewerCtrl: ImageViewerController
  ) {

    /*   this.hotel_id = this.navParams.get("hotel_id");
       this.hotel_name = this.navParams.get("hotel_name");
   
       this.users = navParams.get('users');
       for (let user of this.users) {
         if (user.fastcheckin)
           user.fastcheckin = CryptProvider.decryptData(user.fastcheckin, user._id)
       }
       console.log(this.users); */

    this.code = this.storageService.getCode() ? this.storageService.getCode() : "";
    //console.log('this.code: ', this.navParams, 'Another: ', this.navParams.get('isAnother') )
    //this.getUserData();
    this.user = this.navParams.get('user');
    if(this.navParams.get('paso')){
      this.paso = this.navParams.get('paso');
    }
    console.log('user en change: ', this.user)

    // Get conditions of hotel:
    this.get_condiciones();

    // Get Hotel:
    // get Hotel:
    this.hotel = JSON.parse(this.storageService.getHotel());
    this.hotel_id = this.hotel.idCliente;
    this.hotel_name = this.hotel.nombre;

    // Get keyRooms:
    // get Keys:
    this.keysRooms = this.storageService.getKeysRooms();

    // Inicializamos las imagenes:
    // Inicializamos los arrays que contendrán las imagenes en B64 para mostrar:
    this.photosNif = [];
    this.photosPassport = [];

    // Inicializamos los arrays que contendrán las imagenes tal y como vienen para enviar:
    this.photosNifSubida = [];
    this.photosPassportSubida = [];


    this.vuelcaPhotos();

    this.inicializaDatosHuesped();
  }

  private inicializaDatosHuesped() {

    this.datosDocumento = new DatosDocumento();
    this.datosDocumento.nombre = "";
    this.datosDocumento.pais = "";
    this.datosDocumento.apellido1 = "";
    this.datosDocumento.apellido2 = "";
    this.datosDocumento.documento = "";
    this.datosDocumento.expedicion = "";
    this.datosDocumento.nacimiento = "";
    this.datosDocumento.sexo = "";
    this.datosDocumento.tipoDocumento = "";
  }

  public vuelcaPhotos() {
    //Inicializamos el primer item con la cámara:
    this.photosNif.push('assets/imgs/fotodenitrasera.png');
    this.photosNif.push('assets/imgs/fotodenidelantera.png');
    this.photosPassport.push('assets/imgs/camera.png');

    // Inicializamos los arrays de subida a blanco:
    this.photosNifSubida.push('');
    this.photosNifSubida.push('');
    this.photosPassportSubida.push('');
  }

  filtro() {
    return this.users.filter((user) => {
      return user.fastcheckin != null;
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChangeUserPage');
  }

  add() {
    this.viewCtrl.dismiss({ new: true });
  }

  useUser(user) {
    console.log('user usado:', user)

    var fechaInicio = new Date(user.fastcheckin.birthday).getTime();
    var fechaFin = new Date().getTime();

    var diff = fechaFin - fechaInicio;

    var edad = diff / (1000 * 60 * 60 * 24 * 365)

    console.log(diff / (1000 * 60 * 60 * 24 * 365));
    this.api.actualUser.edad = edad


    this.viewCtrl.dismiss({ user: user })
  }


  close() {
    //this.viewCtrl.dismiss();
    //this.hotel_id = this.platform.getQueryParam('hotelId');
    //this.hotel_name = this.platform.getQueryParam('nombre');

    // a pelo para sacar mapa rápidamente: (Quitar en futuro):
    //this.hotel_id = "5bd84ece588f7600184f0c1f";
    //this.hotel_name = "becheckin";



    this.selected_filter = ["indice", "visita", "excursiones1", "excursiones2", "espectaculos", "parques", "barco", "rutas", "spa", "museos", "transfer", "alquiler", "agua", "punto", "other"];
    console.log(this.selected_filter)
    this.navCtrl.push(MimapPage, { "hotel_id": this.hotel_id, "hotel_name": this.hotel_name, "selected_filter": this.selected_filter, "llaves": false })


  }

  // Cuando pulsa en la llave de arriba, abre el mapa pero con el control de llave extendido:
  llaves() {
    this.selected_filter = ["indice", "visita", "excursiones1", "excursiones2", "espectaculos", "parques", "barco", "rutas", "spa", "museos", "transfer", "alquiler", "agua", "punto", "other"];
    console.log(this.selected_filter)
    this.navCtrl.push(MimapPage, { "hotel_id": this.hotel_id, "hotel_name": this.hotel_name, "selected_filter": this.selected_filter, "llaves": true })

  }

  signatureData(data) {
    this.signature = data;
  }
  drawComplete() {
    this.isDrawing = false;
  }

  drawStart() {
    this.isDrawing = true;
    this.existSignature = true;
  }

  savePad() {
    this.signature = this.sigpad.toDataURL();
    this.user.guest.fastcheckin.signature = this.signature;
    this.user.guest.fastcheckin.email = this.email;
    console.log('Firma: ', this.signature)
  }

  clearPad() {
    this.sigpad.clear();
    this.signature = "";
    this.existSignature = false;
  }

  // Show the instructions by scan:
  instructions() {
    this.navCtrl.push('pdf', { "archivo": "instructions_pdf", animate: true, direction: 'backward' });
  }

  private showToast(message: string) {
    this.translate.get(message).subscribe((res: any) => {
      this.apiComponents.createToast(res, 3000, 'bottom')
        .then((toast: Toast) => {
          toast.present();
        });
    });
  }

  exit() {
    if (this.user.guest.fastcheckin.name) {
      this.navCtrl.setRoot('KeysPage', { animate: true, direction: 'backward' });
    } else {
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

  pdf() {
    this.service.getHotel(this.clienteActual).then(hotel => {
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
        {
          text: this.translate.instant("FASTCHECKIN.LATER"),
          handler: data => {
            console.log("Come: ", this.navParams.get('comeFromCard'))
            if (this.navParams.get('comeFromCard'))
              this.navCtrl.setRoot('KeysPage')
            else
              this.navCtrl.setRoot('AddKeyPage');
          }
        },
        {
          text: this.translate.instant("FASTCHECKIN.COMPLETAR"),
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

        {
          text: 'Ok',
          handler: data => { }
        }
      ]
    });
    alert.present();
  }



  saveProfilemio(loading) {
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
    // Enviamos las imagenes del cliente al servidor:
    // Enviamos imagenes del DNI o pasaporte según tenga seleccionado:
    // solamente enviamos en caso de haber recogido alguna imagen:

    // HACEMOS LAS SUBIDAS DE LAS IMÁGENES QUE HAYA REALIZADO EL CLIENTE:
    // POSIBLES IMÁGENES:  PARTE DELANTERA DEL DNI Y PARTE TRASERA DEL MISMO
    // PASAPORTE

    this.linksSubidos = [];

    // PARA SELECCIÓN DE DNI:
    if (this.user.guest.fastcheckin.typeOfDocument == 'D' || this.user.guest.fastcheckin.typeOfDocument == 'I') {

      // SUBIDA PARTE TRASERA DNI:

      this.globalService.subirArchivo(this.photosNifSubida[0], 'huespedes/' + this.user.guest._id, 'dni_trasero')
        .then(ok => {
          console.log('Subido DNI trasero con éxito');
          this.linksSubidos.push({ enlace: 'huespedes/' + this.user.guest._id, nombre: 'dni_trasero' + this.getExtension(this.photosNifSubida[0]) });

          // SUBIDA PARTE FRONTAL DNI:
          this.globalService.subirArchivo(this.photosNifSubida[1], 'huespedes/' + this.user.guest._id, 'dni_frontal')
            .then(ok => {
              console.log('Subido DNI frontal con éxito');
              this.linksSubidos.push({ enlace: 'huespedes/' + this.user.guest._id, nombre: 'dni_frontal' + this.getExtension(this.photosNifSubida[1]) });
              this.sendProfile(loading);
            }).catch((error) => {
              loading.dismiss();
              console.log('Error subida trasera DNI');
            });
        }).catch((error) => {
          loading.dismiss();
          console.log('Error Subida frontal DNI');
        });

    } else {

      // SUBIDA PASAPORTE:
      this.globalService.subirArchivo(this.photosPassportSubida[0], 'huespedes/' + this.user.guest._id, 'pasaporte')
        .then(ok => {
          console.log('Subido Pasaporte con éxito');
          this.linksSubidos.push({ enlace: 'huespedes/' + this.user.guest._id, nombre: 'pasaporte' + this.getExtension(this.photosPassportSubida[0]) });
          this.sendProfile(loading);
        }).catch((error) => {
          loading.dismiss();
          console.log('Error subida pasaporte');
          //this.sendProfile();
        });
    }

  }


  // Devuelve la extensión del fichero binario de una imagen:
  getExtension(fichero) {
    let regex = /(?:\.([^.]+))?$/;
    let extension = regex.exec(fichero.name);
    return extension[0];
  }

  comprobardatos() {
    this.existFastcheckin = false;
    this.fastcheckinSuccess = false;
    this.user.guest.fastcheckin.caducate = this.user.keysRooms[0].start;
    this.user.guest.fastcheckin._id = this.user.guest._id;
    this.user.guest.fastcheckin.reserve = this.user.keysRooms[0].downloadCode;
    this.user.guest.fastcheckin.email = this.email;
    this.user.guest.email = this.email;
    //this.savePad();
    if (this.user.guest.fastcheckin && this.user.guest.fastcheckin.typeOfDocument == 'P') {

      if (this.user.guest.fastcheckin
        && this.user.guest.fastcheckin.birthday != ""
        && this.user.guest.fastcheckin.caducate != null
        && this.user.guest.fastcheckin.name != ""
        && this.user.guest.fastcheckin.surnameOne != ""
        && this.user.guest.fastcheckin.sex != ""
        && (this.user.guest.fastcheckin.passport.identifier != "")
      ) {
        this.existFastcheckin = true;
        this.fastcheckinSuccess = true;
        if (this.paso != 3) {
          let pasoAnterior = new PasoAnterior();
          pasoAnterior.paso = this.paso;
          pasoAnterior.progreso = this.progreso;
          this.pasosAnteriores.push(pasoAnterior);
          this.paso = 3
          this.progreso = "33\%";
        }
      } else {
        // Llamamos a confirmación de imágenes en caso de error:
        this.existFastcheckin = true;
        this.fastcheckinSuccess = false;
        if (this.paso != 3) {
          let pasoAnterior = new PasoAnterior();
          pasoAnterior.paso = this.paso;
          pasoAnterior.progreso = this.progreso;
          this.pasosAnteriores.push(pasoAnterior);
          this.paso = 3
          this.progreso = "33\%";
        }

        /*
        this.existFastcheckin = false;
        this.errorScan = this.errorScan + 1;
        if (this.errorScan >= 2) {
          this.activarFormularioManual();
        } else {
          let titleAlert = this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TITULO");
          let textAlert = this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TEXTO");

          let alert = this.alertCtrl.create({
            title: titleAlert,
            subTitle: textAlert,
            buttons: ['OK']
          });
          alert.present();
        }*/
      }
    } else {
      if (this.user.guest.fastcheckin
        && this.user.guest.fastcheckin.birthday != ""
        && this.user.guest.fastcheckin.caducate != null
        && this.user.guest.fastcheckin.date_exp != ""
        && this.user.guest.fastcheckin.name != ""
        && this.user.guest.fastcheckin.surnameOne != ""
        && this.user.guest.fastcheckin.nationality != ""
        && this.user.guest.fastcheckin.sex != ""
        && this.user.guest.fastcheckin.typeOfDocument != ""
        && (this.user.guest.fastcheckin.dni.identifier != "" || this.user.guest.fastcheckin.passport.identifier != "")
      ) {
        this.existFastcheckin = true;
        this.fastcheckinSuccess = true;

        if (this.id_img === 1) {
          if (this.paso != 3) {
            let pasoAnterior = new PasoAnterior();
            pasoAnterior.paso = this.paso;
            pasoAnterior.progreso = this.progreso;
            this.pasosAnteriores.push(pasoAnterior);
            this.paso = 3;
            this.progreso = "50\%";
          }
        } else if (this.id_img === 2) {
          if (this.paso != 3) {
            let pasoAnterior = new PasoAnterior();
            pasoAnterior.paso = this.paso;
            pasoAnterior.progreso = this.progreso;
            this.pasosAnteriores.push(pasoAnterior);
            this.paso = 2;
            this.progreso = "25\%";
          }
        }
      } else {

        // Llamamos a confirmación de imágenes en caso de error:
        this.existFastcheckin = true;
        this.fastcheckinSuccess = false;
        if (this.id_img === 1) {
          if (this.paso != 3) {
            let pasoAnterior = new PasoAnterior();
            pasoAnterior.paso = this.paso;
            pasoAnterior.progreso = this.progreso;
            this.pasosAnteriores.push(pasoAnterior);
            this.paso = 3;
            this.progreso = "50\%";
          }
        } else if (this.id_img === 2) {
          if (this.paso != 3) {
            let pasoAnterior = new PasoAnterior();
            pasoAnterior.paso = this.paso;
            pasoAnterior.progreso = this.progreso;
            this.pasosAnteriores.push(pasoAnterior);
            this.paso = 2;
            this.progreso = "25\%";
          }
        }

        /*
        this.existFastcheckin = false;
        this.errorScan = this.errorScan + 1;
        if (this.errorScan >= 2) {
          this.activarFormularioManual();
        } else {
          let titleAlert = this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TITULO");
          let textAlert = this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TEXTO");

          let alert = this.alertCtrl.create({
            title: titleAlert,
            subTitle: textAlert,
            buttons: ['OK']
          });
          alert.present();
        }*/
      }
    }
  }

  saveProfile() {
    this.apiComponents.createLoading().then((loading: Loading) => {
      loading.present();
      if (this.existFastcheckin) {
        // No tiene condiciones hotel:
        if (this.condiciones_hotel.length == 0) {
          if (this.policysecurity) {
            this.savePad();
            this.user.guest.fastcheckin.email = this.email;
            this.user.guest.email = this.email;
            //this.user.email = this.email;
            console.log("User: ", this.user.guest)
            if (!this.existSignature) {
              loading.dismiss();
              let alert = this.alertCtrl.create({
                title: 'FASTCHECKIN',
                subTitle: this.translate.instant("FASTCHECKIN.NOSIGNATURE"),
                buttons: ['OK']
              });
              alert.present();
            } else {
              this.saveProfilemio(loading);
            }

          }
          else {
            loading.dismiss();
            let alert = this.alertCtrl.create({
              title: this.translate.instant("POLICY.TITLECONDITIONS"),
              subTitle: this.translate.instant("POLICY.CONDITIONSP"),
              buttons: ['OK']
            });
            alert.present();
          }
        }
        else {
          if (this.conditions && this.policysecurity) {
            this.savePad();
            console.log("User: ", this.user.guest)
            if (!this.existSignature) {
              loading.dismiss();
              let alert = this.alertCtrl.create({
                title: 'FASTCHECKIN',
                subTitle: this.translate.instant("FASTCHECKIN.NOSIGNATURE"),
                buttons: ['OK']
              });
              alert.present();
            } else {
              this.saveProfilemio(loading);
            }

          }
          else {
            loading.dismiss();
            let alert = this.alertCtrl.create({
              title: this.translate.instant("POLICY.TITLECONDITIONS"),
              subTitle: this.translate.instant("POLICY.CONDITIONS"),
              buttons: ['OK']
            });
            alert.present();
          }

        }
      }
      else {
        loading.dismiss();
        let alert = this.alertCtrl.create({
          title: 'FASTCHECKIN',
          subTitle: this.translate.instant("FASTCHECKIN.NOFOTO"),
          buttons: ['OK']
        });
        alert.present();
      }
    });
  }

  private checkKeyPermisions() {
    //if (this.salida) {
    //  this.navCtrl.setRoot('KeysPage', { animate: true, direction: 'backward' });
    //}else{
    //let existe = 0;
    let idGuest = this.user.guest._id
    for (let keyRoom of this.user.guest.keysRooms) {
      if (this.user.guest.clientOf.some(x => x === keyRoom.client._id)) {
        console.log("Existe key permiso");
        //existe = 1;
        //this.close();
        //this.anotherGuest();

      }
      else {
        this.user.guest.clientOf.push(keyRoom.client._id);
        this.service.setPermissionPersonalData(idGuest, keyRoom.client._id, keyRoom.client.name, "yes")
          .then((response) => {
            //this.close();
            //this.anotherGuest();

          }).catch((error) => {
            console.log(error);
          });
      }
    }
    this.paso = 5;
    this.progreso = "100\%";
    //this.anotherGuest();
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

  analyze(image) {

    console.log('analizando...');
    console.log("imagen destino a guardar: " + this.id_img);

    // Volcamos la imagen en el campo correcto:
    // switch (this.id_img) {
    //   case 1:
    //     this.photosNif[0] = "data:image/jpeg;base64," + image;
    //     break;
    //   case 2:
    //     this.photosNif[1] = "data:image/jpeg;base64," + image;
    //     break;
    //   case 3:
    //     this.photosPassport[0] = "data:image/jpeg;base64," + image;
    // }

    try {
      this.apiComponents.createLoading().then((loading: Loading) => {
        loading.present();

        try {
          this.vision.getLabels(image).subscribe((result: any) => {
            //console.log(result._body);
            let res = JSON.parse(result._body).responses[0].fullTextAnnotation;
            if (res) {

              if (this.tipoDoc == 'dni') {
                console.log('dni')
                this.serviceAPI.crearOcrDniTrasero(res.text, this.datosDocumento).then(respuestaDniTrasero => {
                  this.datosDocumento = respuestaDniTrasero;
                  this.recognizeDNIText(loading);
                }).catch(error => {
                  console.log(error);
                  loading.dismiss();
                  this.errorScan = this.errorScan + 1;
                  if (this.errorScan >= 2) {
                    this.activarFormularioManual("Fallo en OCR DNI");
                  } else {
                    let alert = this.alertCtrl.create({
                      title: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TITULO"),
                      subTitle: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TEXTO"),
                      buttons: ['OK']
                    });
                    alert.present();
                  }
                });
              } else {
                this.serviceAPI.crearOcrPasaporte(res.text).then(respuestaPasaporte => {
                  this.datosDocumento = respuestaPasaporte;
                  this.recognizePassportText(loading);
                }).catch(error => {
                  console.log(error);
                  loading.dismiss();
                  this.errorScan = this.errorScan + 1;
                  if (this.errorScan >= 2) {
                    this.activarFormularioManual("Fallo en OCR pasaporte");
                  } else {
                    let alert = this.alertCtrl.create({
                      title: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TITULO"),
                      subTitle: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TEXTO"),
                      buttons: ['OK']
                    });
                    alert.present();
                  }
                });
              }
            } else {
              loading.dismiss()
              this.errorScan = this.errorScan + 1;
              if (this.errorScan >= 2) {
                this.activarFormularioManual("Fallo al reconocer texto");
              } else {
                let alert = this.alertCtrl.create({
                  title: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TITULO"),
                  subTitle: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TEXTO"),
                  buttons: ['OK']
                });
                alert.present();
              }
            }
          }, err => {
            loading.dismiss();
            console.log(err);
            this.errorScan = this.errorScan + 1;
            if (this.errorScan >= 2) {
              this.activarFormularioManual("Fallo en Google");
            } else {
              let alert = this.alertCtrl.create({
                title: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TITULO"),
                subTitle: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TEXTO"),
                buttons: ['OK']
              });
              alert.present();
            }
          });
        } catch (error) {

          loading.dismiss();
          console.log(error);
          //this.showToast("FASTCHECKIN.NO_SCANNER");
          this.errorScan = this.errorScan + 1;
          if (this.errorScan >= 2) {
            this.activarFormularioManual("Fallo general");
          } else {
            let alert = this.alertCtrl.create({
              title: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TITULO"),
              subTitle: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TEXTO"),
              buttons: ['OK']
            });
            alert.present();
          }
        }
      });
    } catch (error) {
      console.log(error);
      this.errorScan = this.errorScan + 1;
      if (this.errorScan >= 2) {
        this.activarFormularioManual("Fallo en loading");
      } else {
        let alert = this.alertCtrl.create({
          title: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TITULO"),
          subTitle: this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TEXTO"),
          buttons: ['OK']
        });
        alert.present();
      }
    }
  }

  //Nuevos métodos para OCR

  analizaDNIDelantero(image) {

    console.log('analizando...');
    console.log("imagen destino a guardar: " + this.id_img);

    try {

      this.apiComponents.createLoading().then((loading: Loading) => {
        loading.present();
        try {
          this.vision.getLabels(image).subscribe((result: any) => {
            console.log(result);
            let res = JSON.parse(result._body).responses[0].fullTextAnnotation;
            if (res) {

              this.serviceAPI.crearOcrDniFrontal(res.text).then(respuestaDniFrontal => {
                if (respuestaDniFrontal) {
                  if (respuestaDniFrontal.error) {
                    this.mostrarAlertaDocumentacionErronea(respuestaDniFrontal.error, loading);
                  } else {
                    this.datosDocumento = respuestaDniFrontal;
                    this.recognizeFrontalDNIText(loading);
                  }
                } else {
                  this.datosDocumento = new DatosDocumento();
                  this.recognizeFrontalDNIText(loading);
                }
              });
            } else {
              this.avanzaDNIDelantero("Error: Fallo al reconocer el texto de la imagen", loading);
            }
          }, err => {
            this.avanzaDNIDelantero(err, loading);
          });
        } catch (error) {
          console.log(error);
          this.avanzaDNIDelantero(error, loading);
        }
      });
    } catch (error) {
      this.avanzaDNIDelantero(error);
    }
  }

  avanzaDNIDelantero(mensaje?, loading?) {
    if (loading) {
      loading.dismiss();
    }
    if (mensaje) {
      console.log(mensaje);
    }
    if (this.paso != 3) {
      let pasoAnterior = new PasoAnterior();
      pasoAnterior.paso = this.paso;
      pasoAnterior.progreso = this.progreso;
      this.pasosAnteriores.push(pasoAnterior);
      this.paso = 2;
      this.progreso = "25\%";
    }
  }

  private mostrarAlertaDocumentacionErronea(tipoDocError, loading) {
    loading.dismiss();
    if (tipoDocError == 'pasaporte') {
      this.alerta(this.translate.instant("HUESPED.DOCUMENTO_ERROR.TITULO"), this.translate.instant("HUESPED.DOCUMENTO_ERROR.DESCRIPCION_PASAPORTE"));
    } else if (tipoDocError == 'NO_INFO_GENERAL') {
      this.errorScan = this.errorScan + 1;
      if (this.errorScan >= 2) {
        this.activarFormularioManual("Fallo en OCR Pasaporte");
      } else {
        this.alerta(this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TITULO"), this.translate.instant("HUESPED.ERROR_RECO_IMAGEN_TEXTO"));
      }
    } else {
      this.alerta(this.translate.instant("HUESPED.DOCUMENTO_ERROR.TITULO"), this.translate.instant("HUESPED.DOCUMENTO_ERROR.DESCRIPCION_GENERAL"));
    }
  }

  private recognizeFrontalDNIText(loading) {

    if (this.datosDocumento.apellido1) {
      this.user.guest.fastcheckin.surnameOne = this.datosDocumento.apellido1;
    }
    if (this.datosDocumento.apellido2) {
      this.user.guest.fastcheckin.surnameTwo = this.datosDocumento.apellido2;
    }
    if (this.datosDocumento.nombre) {
      this.user.guest.fastcheckin.name = this.datosDocumento.nombre;
    }
    if (this.datosDocumento.pais) {
      this.user.guest.fastcheckin.nationality = this.datosDocumento.pais;
    }
    if (this.datosDocumento.documento) {
      this.user.guest.fastcheckin.dni.identifier = this.datosDocumento.documento;
    }
    if (this.datosDocumento.tipoDocumento) {
      this.user.guest.fastcheckin.typeOfDocument = this.datosDocumento.tipoDocumento;
    }
    if (this.datosDocumento.sexo) {
      this.user.guest.fastcheckin.sex = this.datosDocumento.sexo;
    }
    if (this.datosDocumento.nacimiento) {
      this.user.guest.fastcheckin.birthday = this.datosDocumento.nacimiento;
    }

    this.avanzaDNIDelantero("Analizado correctamente", loading);
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
            this.service.addUsertoKey(data.guest._id, key.id).then(ok => { });
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
    this.close();
    /*
   if (response.guest.fastcheckin.name == '')
     this.navCtrl.setRoot('FastcheckinPage', { animate: true, direction: 'backward', isAnother: true });
   else
     this.navCtrl.setRoot('KeysPage', { animate: true, direction: 'backward' });
   */
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

  private sendProfile(loading) {
    console.log(this.user);

    // Introducimos las imagenes en la estructura de FastCheckin:
    this.user.guest.fastcheckin.imagenes = this.linksSubidos;

    let fastcheckin = this.cryptProvider.encryptData(this.user);
    ///
  this.serviceAPI.inyectar(this.code, this.user.guest.fastcheckin).then((resp) => {
    //loading.dismiss()
     
    this.serviceAPI.setFastcheckin(this.user, fastcheckin.toString())
      .then((response) => {
        this.serviceAPI.actualGuests.push(this.user.guest);
        this.user.guest.fastcheckin = CryptProvider.decryptData(fastcheckin.toString(), this.user.guest._id);
        console.log('Fast: ', this.user.guest.fastcheckin);
        var fechaInicio = new Date(this.user.guest.fastcheckin.birthday).getTime();
        var fechaFin = new Date().getTime();

        var diff = fechaFin - fechaInicio;

        var edad = diff / (1000 * 60 * 60 * 24 * 365)

        console.log(diff / (1000 * 60 * 60 * 24 * 365));
        this.serviceAPI.actualUser.edad = edad
        this.storageService.setUserData(this.user);
        this.events.publish('setUser', this.user);
        this.dataUpdate = true;
        this.serviceAPI.getHotel(this.user.keysRooms[0].client._id).then(hotel => {
          console.log('h: ', hotel)
          let mail = this.user.keysRooms[0].client.email;

          if ((hotel[0].email) && (hotel[0].email != hotel[0].user) && (hotel[0].email != '')) {
            mail = mail + ', ' + hotel[0].email;
            if (hotel[0].activo == '0')
              mail = hotel[0].email;
          }

          let isMY = (hotel[0].pms.pms_user === 'MASTERYIELD') ? true : false;

          console.log('user keys: ', this.user.keysRooms[0]);




          console.log('email to: ', mail)

          let asunto = "Nuevo Fastcheckin";
          let mailTo = mail;
          let cco = "amalia@becheckin.com, lidia@becheckin.com";
          let nombreHuesped = this.user.keysRooms[0].client.name;
          let nombreReserva = this.user.keysRooms[0].downloadCode;
          let fechaInicio = this.user.keysRooms[0].start.substring(0, 10);
          let fechaFin = this.user.keysRooms[0].finish.substring(0, 10);
          let fastcheckin: FastCheckin = this.user.guest.fastcheckin;
          let mensaje = "<!doctype html><html><head><title>Becheckin<\/title><style>.cuerpo{margin: 2%;background: #003581;border-radius: 10px;border: 2px solid #444;box-shadow: 0px 0px 10px 4px #888888;color:#E5E5E5;padding: 1%;}.imagen{margin-top: 10px;margin-bottom: 5px;display: flex;justify-content: center;align-items: center;}img{margin: 0 auto; border-radius: 5px;overflow: hidden;}.bienvenida{margin-left: 3%;margin-right: 3%;font-size: 20px;font-weight: bold;}.nombre{color: #f9ffac;}.reserva{font-weight: bold;color: #ecffbf;}.texto{margin-top: 20px;margin-left: 6%;margin-right: 6%;font-size: 18px;}.fecha1{color: #c4ffb5;}.fecha2{color: #ffb5b5;}.info{margin-bottom: 10px;}.fechas{margin-bottom: 10px;}.datos{margin-bottom: 10px;}.dato{font-size: 14px;margin: 5px 2%;}.texto_final{margin-bottom: 30px;font-size: 14px;font-style: italic;}a{color: #feffce;}.pie{text-align: center;font-style: italic;color: #7e7e7e;}<\/style><\/head><body><div class='cuerpo'><div class='imagen'><img src='https:\/\/dashboard.becheckin.com\/imgs\/logo\/inserta.png' width='50' height='50' \/><\/div><div class='bienvenida'>Hola <span class='nombre'>" + (nombreHuesped ? nombreHuesped : "") + "<\/span><\/div><div class='texto'><div class='info'>Tu reserva <span class='reserva'>" + (nombreReserva ? nombreReserva : "") + "<\/span> tiene un nuevo FastCheckin.<\/div><div class='fechas'>Entrada <span class='fecha1'>" + (fechaInicio ? fechaInicio : "") + "<\/span> | Salida <span class='fecha2'>" + (fechaFin ? fechaFin : "") + "<\/span><\/div><div class='datos'>Datos huésped:<div class='dato'>Nombre: " + (fastcheckin.name ? fastcheckin.name : "") + "<\/div><div class='dato'>Apellidos: " + (fastcheckin.surnameOne ? fastcheckin.surnameOne : "") + "<\/div><div class='dato'>Fecha Nacimiento: " + (fastcheckin.birthday ? fastcheckin.birthday : "") + "<\/div><div class='dato'>Fecha Expedicion: " + (fastcheckin.date_exp ? fastcheckin.date_exp : "") + "<\/div><div class='dato'>Dni: " + (fastcheckin.dni.identifier ? fastcheckin.dni.identifier : "") + "<\/div><div class='dato'>Pasaporte: " + (fastcheckin.passport.identifier ? fastcheckin.passport.identifier : "") + "<\/div><div class='dato'>Nacionalidad: " + (fastcheckin.nationality ? fastcheckin.nationality : "") + "<\/div><div class='dato'>Sexo: " + (fastcheckin.sex ? fastcheckin.sex : "") + "<\/div><div class='dato'>Email: " + (fastcheckin.email ? fastcheckin.email : "") + "<\/div><\/div><div class='texto_final'>Puedes consultar los datos FastCheckin en tu dashboard: <a href='https:\/\/dashboard.becheckin.com'target='_blank' style='color:#feffce;'>https:\/\/dashboard.becheckin.com <\/a><br \/>Nos tienes siempre a tu disposición en Booking@becheckin.com y en el teléfono +34 627 07 41 73.<\/div><\/div><\/div><\/body><footer><hr \/><div class='pie'>Atentamente, BeCheckin Team.<\/div><\/footer><\/html>";
          if (!mailTo) {
            mailTo = "amalia@becheckin.com";
            cco = "lidia@becheckin.com";
          }
          this.service.sendGenericMail(asunto, mensaje, mailTo, "", cco).then(res => {
            console.log(res);
            loading.dismiss();
            this.checkKeyPermisions(); 
            if (isMY) {
              let url = 'https://masteryield.eu/channel_post.php?apikey=7a3680c5-9eb4-m52f-8775-440e31dbe0f2';
              let license: String = this.user.keysRooms[0].downloadCode;
              license = license.substring(0, 5);
              url = url + '&license=' + license;
              url = url + '&json=' + this.user.keysRooms[0].downloadCode;
              this.serviceAPI.sendMY(url).then(resp => { console.log('MY: ', resp) })
            } else {
              console.log('No es MY');
            }  
          });
          // this.serviceAPI.sendmail(
          //   this.user.keysRooms[0].client.name,
          //   this.user.keysRooms[0].downloadCode,
          //   mail,
          //   this.user.keysRooms[0].start.substring(0, 10),
          //   this.user.keysRooms[0].finish.substring(0, 10),
          //   this.user.guest.fastcheckin

          // ).then(resp => {
          //   // this.content.scrollToTop();
          //   //this.anotherGuest();

          // })
        })

        /*
        setTimeout(() => {
            this.dataUpdate = false;
        }, 3000);
            }).catch((error) => {
        loading.dismiss();
        console.log(error); */
      });
  })
    
   ///
    /*/ Send to booking
       console.log("User: ",this.user, " Code: ", this.code);
       this.serviceAPI.sendBooking(this.user.guest.fastcheckin, this.code)
           .then((response) => {
             console.log("Booking dice: ", response.body)

           }).catch((error) => {});


    //*/
  }

  private recognizePassportText(loading: Loading) {
    loading.dismiss();
    this.user.guest.fastcheckin.name = this.datosDocumento.nombre;
    this.user.guest.fastcheckin.surnameOne = this.datosDocumento.apellido1;
    this.user.guest.fastcheckin.surnameTwo = this.datosDocumento.apellido2;
    this.user.guest.fastcheckin.passport.identifier = this.datosDocumento.documento;
    this.user.guest.fastcheckin.sex = this.datosDocumento.sexo;
    this.user.guest.fastcheckin.birthday = this.datosDocumento.nacimiento;
    this.user.guest.fastcheckin.date_exp = this.datosDocumento.expedicion;
    this.user.guest.fastcheckin.nationality = this.datosDocumento.pais;
    if (this.datosDocumento.tipoDocumento) {
      this.user.guest.fastcheckin.typeOfDocument = this.datosDocumento.tipoDocumento;
    } else {
      this.user.guest.fastcheckin.typeOfDocument = 'P';
    }
    this.comprobardatos();
  }

  private recognizeDNIText(loading: Loading) {
    loading.dismiss();
    this.user.guest.fastcheckin.name = this.datosDocumento.nombre;
    this.user.guest.fastcheckin.surnameOne = this.datosDocumento.apellido1;
    this.user.guest.fastcheckin.surnameTwo = this.datosDocumento.apellido2;
    this.user.guest.fastcheckin.dni.identifier = this.datosDocumento.documento;
    this.user.guest.fastcheckin.sex = this.datosDocumento.sexo;
    this.user.guest.fastcheckin.birthday = this.datosDocumento.nacimiento;
    this.user.guest.fastcheckin.date_exp = this.datosDocumento.expedicion;
    this.user.guest.fastcheckin.nationality = this.datosDocumento.pais;
    if (this.datosDocumento.tipoDocumento) {
      this.user.guest.fastcheckin.typeOfDocument = this.datosDocumento.tipoDocumento;
    } else {
      this.user.guest.fastcheckin.typeOfDocument = 'D';
    }
    this.comprobardatos();

  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString);  // Converting binary string data.
    this.image = this.filestring;

    switch (this.id_img) {
      case 1:
        this.photosNif[0] = "data:image/jpeg;base64," + this.image;
        this.analyze(this.image)
        break;
      case 2:
        this.photosNif[1] = "data:image/jpeg;base64," + this.image;
        this.analizaDNIDelantero(this.image);
        break;
      case 3:
        this.photosPassport[0] = "data:image/jpeg;base64," + this.image;
        this.analyze(this.image)
    }

  }

  getFiles(event, id, paso?) {
    this.id_img = id;
    this.files = event.target.files;
    var reader = new FileReader();
    // Guardaos las imagenes tal y como viene para una subida:
    if (id === 1) {
      this.photosNifSubida[0] = this.files[0];
      reader.readAsBinaryString(this.files[0]);
      reader.onload = this._handleReaderLoaded.bind(this);
    } else if (id === 2) {
      this.photosNifSubida[1] = this.files[0];
      reader.readAsBinaryString(this.files[0]);
      reader.onload = this._handleReaderLoaded.bind(this);
    } else if (id === 3) {
      reader.readAsBinaryString(this.files[0]);
      reader.onload = this._handleReaderLoaded.bind(this);
      this.photosPassportSubida[0] = this.files[0];
    }

  }

  get_condiciones() {
    this.hotel = JSON.parse(this.storageService.getHotel());
    this.condiciones_hotel = this.hotel.doc ? this.hotel.doc.doc : "";
  }

  anotherGuest() {

    this.navCtrl.setRoot('AddKeyPage', { newuser: 1 }, { animate: true, direction: 'backward' });
  }

  vew_conditions() {
    let archivo = "";
    //this.navCtrl.push('pdf', {"archivo": "data:application/pdf;base64, "+this.condiciones_hotel, animate: true, direction: 'backward' });
    // Para archivos en Base64:
    if (this.condiciones_hotel.substring(0, 4) != "http") {
      archivo = "data:application/pdf;base64, ";
    }
    this.navCtrl.push('pdf', { "archivo": archivo + this.condiciones_hotel, animate: true, direction: 'backward' });
  }

  view_policysecurity() {
    this.navCtrl.push('pdf', { "archivo": "policysecurity_pdf", animate: true, direction: 'backward' });
  }


  // Visualizar foto:
  visualizaFoto(imagen) {
    const viewer = this.imageViewerCtrl.create(imagen);
    viewer.present();
  }

  // Borra foto:
  borraFoto(id) {
    switch (id) {
      case 1:
        this.photosNif[0] = 'assets/imgs/fotodenitrasera.png';
        break;
      case 2:
        this.photosNif[1] = 'assets/imgs/fotodenidelantera.png';
        break;
      case 3:
        this.photosPassport[0] = 'assets/imgs/camera.png';
    }

  }

  //Volver atrás
  atras() {
    let pasoAnterior = this.pasosAnteriores.pop();
    this.paso = pasoAnterior.paso;
    this.progreso = pasoAnterior.progreso;
    // if (this.paso > 0) {
    //   if (this.tipoDoc == 'pasaporte') {
    //     if (this.paso == 4) {
    //       this.paso = 3;
    //       this.progreso = "33\%";
    //     } else {
    //       this.paso = this.paso - 2;
    //       this.progreso = "0\%";
    //     }
    //   } else {
    //     if (this.paso == 4) {
    //       this.progreso = "50\%"
    //     } else if (this.paso == 3) {
    //       this.progreso = "25\%";
    //     } else {
    //       this.progreso = "0\%";
    //     }
    //     this.paso = this.paso - 1;
    //   }
    // }
  }

  confirmaImagenes() {
    // Volcamos los datos obtenidos en el fastcheckin en caso de éxito:
    this.activarFormularioManual("sin_error");
    this.vuelcaDatosFastcheckin();
    if (this.tipoDoc == 'pasaporte') {
      this.progreso = "66\%";
    } else {
      this.progreso = "75\%";
    }
  }


  vuelcaDatosFastcheckin() {

    this.fastcheckin.dni.identifier = this.user.guest.fastcheckin.dni.identifier;
    this.fastcheckin.passport.identifier = this.user.guest.fastcheckin.passport.identifier;
    this.fastcheckin.date_exp = this.user.guest.fastcheckin.date_exp;
    this.fastcheckin.name = this.user.guest.fastcheckin.name;
    this.fastcheckin.surnameOne = this.user.guest.fastcheckin.surnameOne;
    this.fastcheckin.surnameTwo = this.user.guest.fastcheckin.surnameTwo;
    this.fastcheckin.birthday = this.user.guest.fastcheckin.birthday;
    this.fastcheckin.sex = this.user.guest.fastcheckin.sex;
    this.fastcheckin.nationality = this.user.guest.fastcheckin.nationality;
  }


  activarFormularioManual(texto) {
    //Vamos al paso especial para mostrar formulario manual.
    let pasoAnterior = new PasoAnterior();
    pasoAnterior.paso = this.paso;
    pasoAnterior.progreso = this.progreso;
    this.pasosAnteriores.push(pasoAnterior);
    this.paso = 0;
    this.progreso = "50\%";
    this.fastcheckin = new FastCheckin();
    this.erroresRegistroManual = new ErroresFormularioRegistro();
    this.fastcheckin.typeOfDocument = (this.tipoDoc == 'dni') ? 'D' : 'P';
    this.fastcheckin.sex = "M";
    //Generamos un código aleatorio de 20 caracteres.
    let cadena = this.globalService.generarCadenaAleatoria(20);
    //Subimos la imagen obtenida en la carpeta de errores con el nuevo código generado.
    if (this.tipoDoc == "dni" && texto != 'sin_error') {
      this.globalService.subirArchivo(this.photosNifSubida[1], "huespedes/errores/dni/" + cadena + "/frontal", cadena).then(res1 => {
        this.globalService.subirArchivo(this.photosNifSubida[0], "huespedes/errores/dni/" + cadena + "/trasero", cadena).then(res2 => {
          let asunto = "[TEST] Error al registrarse en webapp con DNI: " + texto;
          let mensaje = "<p>Se ha producido un error en el registro de un huésped</p><p>Cara frontal:</p><p>" + res1 + "</p><p>Cara trasera:</p><p>" + res2 + "</p>";
          let mailTo = "javier@becheckin.com, amalia@becheckin.com";
          //Enviamos informe de error.
          this.service.sendGenericMail(asunto, mensaje, mailTo).then(res => {
            console.log("informe de errores enviado.");
          });
        });
      });
    } else if (texto != 'sin_error') {
      this.globalService.subirArchivo(this.photosPassportSubida[0], "huespedes/errores/passport", cadena).then(res => {
        let asunto = "[TEST] Error al registrarse en webapp con Pasaporte: " + texto;
        let mensaje = "<p>Se ha producido un error en el registro de un huésped</p><p>Se puede ver la imagen utilizada a través del siguiente enlace:</p><p>" + res + "</p>";
        let mailTo = "javier@becheckin.com, amalia@becheckin.com";
        //Enviamos informe de error.
        this.service.sendGenericMail(asunto, mensaje, mailTo).then(res => {
          console.log("informe de errores enviado.");
        });
      });
    }
  }

  guardarDatosManuales() {
    console.log(this.photosNifSubida);
    console.log(this.photosPassportSubida);
    if (this.compruebaDatosRegistroManual()) {
      this.guardarFastcheckin();
    }
  }

  guardarFastcheckin() {
    this.user.guest.fastcheckin.typeOfDocument = this.fastcheckin.typeOfDocument;
    if (this.fastcheckin.typeOfDocument == "D") {
      this.user.guest.fastcheckin.dni.identifier = this.fastcheckin.dni.identifier;
    } else {
      this.user.guest.fastcheckin.passport.identifier = this.fastcheckin.passport.identifier;
    }
    this.user.guest.fastcheckin.date_exp = this.fastcheckin.date_exp;
    this.user.guest.fastcheckin.name = this.fastcheckin.name;
    this.user.guest.fastcheckin.surnameOne = this.fastcheckin.surnameOne;
    this.user.guest.fastcheckin.surnameTwo = this.fastcheckin.surnameTwo;
    this.user.guest.fastcheckin.birthday = this.fastcheckin.birthday;
    this.user.guest.fastcheckin.sex = this.fastcheckin.sex;
    this.user.guest.fastcheckin.nationality = this.fastcheckin.nationality;
    this.user.guest.fastcheckin.province = this.fastcheckin.province ? this.fastcheckin.province : '';
    this.existFastcheckin = true;
    let pasoAnterior = new PasoAnterior();
    pasoAnterior.paso = this.paso;
    pasoAnterior.progreso = this.progreso;
    this.pasosAnteriores.push(pasoAnterior);
    this.paso = 4;
    this.progreso = "75\%";
  }

  compruebaDatosRegistroManual() {
    let result = true;
    if (!this.fastcheckin.typeOfDocument) {
      this.erroresRegistroManual.tipoDocumento = "obligatorio";
      result = false;
    }
    if (this.fastcheckin.typeOfDocument == "D") {
      if (!this.fastcheckin.dni.identifier) {
        this.erroresRegistroManual.numIdentificacion = "obligatorio";
        result = false;
      }
    } else {
      if (!this.fastcheckin.passport.identifier) {
        this.erroresRegistroManual.numIdentificacion = "obligatorio";
        result = false;
      }
    }
    if (!this.fastcheckin.date_exp) {
      this.erroresRegistroManual.fechaExpedicion = "obligatorio";
      result = false;
    }
    if (!this.fastcheckin.name) {
      this.erroresRegistroManual.nombre = "obligatorio";
      result = false;
    }
    if (!this.fastcheckin.surnameOne) {
      this.erroresRegistroManual.apellido1 = "obligatorio";
      result = false;
    }
    // if (!this.fastcheckin.surnameTwo) {
    //   this.erroresRegistroManual.apellido2 = "obligatorio";
    //   result = false;
    // }
    if (!this.fastcheckin.birthday) {
      this.erroresRegistroManual.fechaNacimiento = "obligatorio";
      result = false;
    }
    if (!this.fastcheckin.sex) {
      this.erroresRegistroManual.sexo = "obligatorio";
      result = false;
    }
    if (!this.fastcheckin.nationality) {
      this.erroresRegistroManual.nacionalidad = "obligatorio";
      result = false;
    }
    // FGV: Comprobación fecha expedición y fecha de nacimiento:
    // FEcha expedición franja :   30 años atrás y tope fecha checkin
    // Fecha de nacimiento:  100 años atrás y tope fecha checkin
    // CONTROL FECHA DE EXPEDICIÓN:
    if (this.fastcheckin.date_exp) {
      let fechainicio_checkin = this.storageService.getPeriodReserve();
      fechainicio_checkin = JSON.parse(fechainicio_checkin);
      fechainicio_checkin = new Date(fechainicio_checkin.start);
      let exp = new Date(this.fastcheckin.date_exp);
      let anyo30 = new Date();
      anyo30.setFullYear(anyo30.getFullYear() - 30);
      if (exp < anyo30) {
        this.alerta(this.translate.instant("HUESPED.CONTROL_FECHA_EXPEDICION_TITULO"), this.translate.instant("HUESPED.CONTROL_FECHA_EXPEDICION_INFERIOR"));
        result = false;
      }
      if (exp > fechainicio_checkin) {
        this.alerta(this.translate.instant("HUESPED.CONTROL_FECHA_EXPEDICION_TITULO"), this.translate.instant("HUESPED.CONTROL_FECHAS_SUPERIOR") + moment(fechainicio_checkin).format('DD/MM/YYYY'));
        result = false;
      }
    }
    // CONTROL FECHA DE NACIMIENTO:
    if (this.fastcheckin.birthday) {
      let fechainicio_checkin = this.storageService.getPeriodReserve();
      fechainicio_checkin = JSON.parse(fechainicio_checkin);
      fechainicio_checkin = new Date(fechainicio_checkin.start);
      let exp = new Date(this.fastcheckin.birthday);
      let anyo100 = new Date();
      anyo100.setFullYear(anyo100.getFullYear() - 100);
      if (exp < anyo100) {
        this.alerta(this.translate.instant("HUESPED.CONTROL_FECHA_NACIMIENTO_TITULO"), this.translate.instant("HUESPED.CONTROL_FECHA_NACIMIENTO_INFERIOR"));
        result = false;
      }
      if (exp > fechainicio_checkin) {
        this.alerta(this.translate.instant("HUESPED.CONTROL_FECHA_NACIMIENTO_TITULO"), this.translate.instant("HUESPED.CONTROL_FECHAS_SUPERIOR") + moment(fechainicio_checkin).format('DD/MM/YYYY'));
        result = false;
      }
    }

    this.erroresRegistroManual.tieneErrores = !result;
    return result;
  }

  modificaCampoRegistroManual(campo) {
    switch (campo) {
      case "tipoDocumento":
        this.erroresRegistroManual.tipoDocumento = "";
        break;
      case "numIdentificacion":
        this.erroresRegistroManual.numIdentificacion = "";
        break;
      case "fechaExpedicion":
        this.erroresRegistroManual.fechaExpedicion = "";
        break;
      case "nombre":
        this.erroresRegistroManual.nombre = "";
        break;
      case "apellido1":
        this.erroresRegistroManual.apellido1 = "";
        break;
      case "apellido2":
        this.erroresRegistroManual.apellido2 = "";
        break;
      case "fechaNacimiento":
        this.erroresRegistroManual.fechaNacimiento = "";
        break;
      case "sexo":
        this.erroresRegistroManual.sexo = "";
        break;
      case "nacionalidad":
        this.erroresRegistroManual.nacionalidad = "";
        break;

      default:
        break;
    }
    if (!this.erroresRegistroManual.tipoDocumento &&
      !this.erroresRegistroManual.numIdentificacion &&
      !this.erroresRegistroManual.fechaExpedicion &&
      !this.erroresRegistroManual.nombre &&
      !this.erroresRegistroManual.apellido1 &&
      // !this.erroresRegistroManual.apellido2 &&
      !this.erroresRegistroManual.fechaNacimiento &&
      !this.erroresRegistroManual.sexo &&
      !this.erroresRegistroManual.nacionalidad
    ) {
      this.erroresRegistroManual.tieneErrores = false;
    }
  }

  cambiarTipoDocumento(tipoDocumento) {
    this.fastcheckin.typeOfDocument = tipoDocumento;
  }
  cambiarSexo(tipoSexo) {
    this.fastcheckin.sex = tipoSexo;
  }

  resetFile(id) {
    let input: any = document.getElementById(id);
    input.value = null;
  }

  nuevoHuesped(){
    this.paso = 1;
  }
}
