import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the TourPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tour',
  templateUrl: 'tour.html',
})
export class TourPage {

  slider: any[];

  sliderEsp = [{
    titulo: 'Iniciar Sesión',
    descripcion: 'Si ha recibido un código del establecimiento, pulse donde se indica',
    img: './assets/tour/1.png'
  },
  {
    titulo: 'Iniciar Sesión con Código',
    descripcion: 'Introduzca Código y pulse Obtener Llave',
    img: './assets/tour/2.png'
  },
  {
    titulo: 'Abrir Puerta',
    descripcion: 'Deslizar hacia la izquierda y pulsar sobre la minipuerta',
    img: './assets/tour/3.png'
  },
  {
    titulo: 'Menú Llaves',
    descripcion: 'Si tiene llaves pero la pantalla le aparece vacia, pulse aqui',
    img: './assets/tour/4.png'
  },
  {
    titulo: 'Cierre Sesion',
    descripcion: 'Cierre sesion y vuelva a entra en la aplicacion',
    img: './assets/tour/5.png'
  },
  {
    titulo: 'Registro',
    descripcion: 'Si es un nuevo usuario pulse en Crear nueva cuenta',
    img: './assets/tour/6.png'
  },
  {
    titulo: 'Registro',
    descripcion: 'Rellene los campos indicados, acepte la condiciones y pulse Confirmar',
    img: './assets/tour/7.png'
  },
  {
    titulo: 'Login',
    descripcion: 'Si es un usuario registrado, rellene los campos indicados y pulse Confirmar',
    img: './assets/tour/8.png'
  },
  {
    titulo: 'FastCheckin',
    descripcion: 'En el menu lateral, en la opcion indicada, podra introducir sus datos para FastCheckin',
    img: './assets/tour/9.png'
  },
  {
    titulo: 'FastCheckin',
    descripcion: 'Para rellenar los datos de forma automatica pulse donde se indica',
    img: './assets/tour/10.png'
  },
  {
    titulo: 'FastCheckin',
    descripcion: 'Lea las instrucciones, una vez leida cierre en la esquina superior derecha y se le indicará si quiere recoger los datos desde la Camara o desde la Galeria del dispositivo',
    img: './assets/tour/11.png'
  },
  {
    titulo: 'Datos de Usuario',
    descripcion: 'Pulse aqui para mostrar sus datos a traves de un codigo QR',
    img: './assets/tour/12.png'
  },
  {
    titulo: 'Datos de Usuario',
    descripcion: 'Muestre este codigo en Recepcion para capturar sus datos de forma automatica',
    img: './assets/tour/13.png'
  }];

  sliderEng = [{
    titulo: 'Start Session',
    descripcion: 'If you have received an establishment code, click where indicated',
    img: './assets/tour/1.png'
  },
  {
    titulo: 'Start Session with Code',
    descripcion: 'Enter Code and press Get Key',
    img: './assets/tour/2.png'
  },
  {
    titulo: 'Open Door',
    descripcion: 'Slide to the left and click on the mini-door',
    img: './assets/tour/3.png'
  },
  {
    titulo: 'Menu Keys',
    descripcion: 'If you have keys but the screen appears empty, click here',
    img: './assets/tour/4.png'
  },
  {
    titulo: 'Close Session',
    descripcion: 'Close session and re-enter the application',
    img: './assets/tour/5.png'
  },
  {
    titulo: 'Registration',
    descripcion: 'If it is a new user click on Create new account',
    img: './assets/tour/6.png'
  },
  {
    titulo: 'Registration',
    descripcion: 'Fill in the fields indicated, accept the conditions and press Confirm',
    img: './assets/tour/7.png'
  },
  {
    titulo: 'Login',
    descripcion: 'If you are a registered user, fill in the indicated fields and press Confirm',
    img: './assets/tour/8.png'
  },
  {
    titulo: 'FastCheckin',
    descripcion: 'In the side menu, in the indicated option, you can enter your data for FastCheckin',
    img: './assets/tour/9.png'
  },
  {
    titulo: 'FastCheckin',
    descripcion: 'To fill in the data automatically click where indicated',
    img: './assets/tour/10.png'
  },
  {
    titulo: 'FastCheckin',
    descripcion: 'Read the instructions, once you read then closing in the upper right corner and you will be ask if you want to collect the data from the Camera or from the device Gallery',
    img: './assets/tour/11.png'
  },
  {
    titulo: 'User Data',
    descripcion: 'Click here to show your data through a QR code',
    img: './assets/tour/12.png'
  },
  {
    titulo: 'User Data',
    descripcion: 'Show this code in Reception to capture your data automatically',
    img: './assets/tour/13.png'
  }];

  constructor(public navCtrl: NavController, private translate: TranslateService, public navParams: NavParams) {


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TourPage');
    this.slider =this.sliderEsp;
  }

  salir() {
    this.navCtrl.pop();
  }

  lenguaje(l) {
    if (l == 1) this.slider = this.sliderEng;
    if (l == 0) this.slider = this.sliderEsp;
  }

}
