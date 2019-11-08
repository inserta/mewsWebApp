import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, Events, Alert, } from 'ionic-angular';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StorageService } from '../../app/services/service.storage';
import { ServiceAPI } from '../../app/services/service.api';
import { TranslateService } from '@ngx-translate/core';
import { AccessPage } from '../access/access';



@IonicPage()
@Component({
  selector: 'page-request-permission',
  templateUrl: 'request-permission.html',
})
export class RequestPermissionPage {

  @ViewChild(Nav) nav: Nav;

  guest: any;
  rootPage: any;
  client: string = "";
  idClient: string = "";
  message: string = "";
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storageService: StorageService,
    private _apiService: ServiceAPI,
    private translate: TranslateService) {

    this.client = this.navParams.get("client");
    this.idClient = this.navParams.get("idClient");
    let parameters = { value: this.client };
    this.translate.get("POLICY.ASK_PERMISSIONS", parameters).subscribe((res: string) => {
      this.message += res;
    });

  }

  ionViewDidLoad() {

  }

  acceptRequest() {
    this.storageService.getUserData().then((user) => {
      let idGuest = "";
      console.log(user)
      if (user) {
        idGuest = user.guest._id
        this._apiService.setPermissionPersonalData(idGuest, this.idClient, this.client, "yes")
          .then((response) => {
            if (this.storageService.getUserIsLoged()) {
              this.navCtrl.setRoot('KeysPage', {});
            } else {
              this.navCtrl.setRoot(AccessPage);
            }
          }).catch((error) => {
            console.log(error);
          });
      }
    }).catch(() => {

    })
  }

  declineRequest() {
    this.storageService.getUserData().then((user) => {
      let idGuest = "";
      console.log(user)
      if (user) {
        idGuest = user.guest._id
        this._apiService.setPermissionPersonalData(idGuest, this.idClient, this.client, "yes")
          .then((response) => {
            if (this.storageService.getUserIsLoged()) {
              this.navCtrl.setRoot('KeysPage', {});
            } else {
              this.navCtrl.setRoot(AccessPage);
            }
          }).catch((error) => {
            console.log(error);
          });
      }
    })
  }

}
