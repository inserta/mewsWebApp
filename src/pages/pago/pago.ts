import { Component } from '@angular/core';
import { IonicPage, Loading, NavController, NavParams } from 'ionic-angular';
import { StorageService } from '../../app/services/service.storage'
import { User } from '../../app/models/user.model';
import { ApiComponents } from '../../components/api-components';
import { AlertController } from 'ionic-angular';
import { ServiceAPI } from "../../app/services/service.api";
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-pago',
  templateUrl: 'pago.html',
})
export class PagoPage {

  cardData = {
    numero: '',
    mes: '1',
    anio: '2019',
    cvc: '',
    idUsuario: '',
    card: '****'
  }

  private user: User;

  constructor(public navCtrl: NavController,   private translate: TranslateService, private serviceAPI: ServiceAPI, private alertCtrl: AlertController, private apiComponents: ApiComponents, private storageService: StorageService, public navParams: NavParams) {

      this.card()

  }

  card() {
                    console.log('incard')
                    this.storageService.getUserData().then((userData) => {
                        if (userData) {
                            this.user = userData;
                            console.log(this.user)

                            let body = { idUsuario:this.user.guest._id  }
                            this.serviceAPI.getcard(body).then(pin => {
                              console.log('pin: ', pin)
                              if (pin.estado[0] != null) {
                                console.log('card: ', pin.estado[0].card)
                                if (pin.estado[0].card) {
                                   let n = pin.estado[0].numero
                                   console.log(n.length)
                                   this.cardData.numero = "*****" + n.substring(n.length - 4, n.length - 5 + 5)
                                   this.cardData.mes = pin.estado[0].mes
                                   this.cardData.anio = pin.estado[0].anio
                                   this.cardData.cvc = '***'
                                } else
                                  this.cardData.numero = ''
                              }else{
                                this.cardData.numero = ''
                              }

                            })

                        }
                    });



  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PagoPage');
  }

  saveCard() {
    this.apiComponents.createLoading().then((loading: Loading) => {
    this.storageService.getUserData()
        .then((response) => {
            this.user = response;

            this.cardData.idUsuario = this.user.guest._id;
            this.cardData.card = this.cardData.cvc;
            console.log('Datos a grabar: ', this.cardData);
            this.serviceAPI.grabarCard(this.cardData).then((card => {
              loading.dismiss();
              let alert = this.alertCtrl.create({
                  title: this.translate.instant("PAGO.TITULO"),
                  subTitle: this.translate.instant("PAGO.SUCCESS"),
                  buttons: ['OK']
              });
              alert.present();
            }))



        }).catch((error) => {
          console.log('user');
          loading.dismiss();
          let alert = this.alertCtrl.create({
              title: this.translate.instant("PAGO.TITULO"),
              subTitle: this.translate.instant("PAGO.ERROR"),
              buttons: ['OK']
          });
          alert.present();
        });
    console.log('Card: ', this.cardData)
  });
 };

 goInit() {
   this.navCtrl.setRoot('KeysPage', {});
 }

}
