import { Component, NgZone, Input } from '@angular/core';
import { Platform, ModalController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { StorageService } from '../../app/services/service.storage'

import { ApiProvider } from '../../providers/api/api';

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
//import { MapFilterPage } from '../map-filter/map-filter';
//import { MapPage } from '../map/map';
// import { FiltersPage } from '../filters/filters';


/**
 * Generated class for the GeoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-geo',
  templateUrl: 'geo.html',
})
export class GeoPage {

  solomapa: boolean = false;

  map: GoogleMap;

  my_lat: any;
  my_lng: any;
  user: any;

  userPosition;

  hotel: any =  {
    id: '0',
    name: 'Pruebas',
    image: ''
  };

  show_place_info = false;

  info_name;
  info_desc;
  info_img;

  markers = [];

  @Input() saltar: boolean;

  constructor(public navCtrl: NavController,
              private platform:Platform,
              private geolocation: Geolocation,
              private zone: NgZone,
              public modalCtrl: ModalController,
              private storageService: StorageService,
              private params: NavParams,
              public api: ApiProvider) {
                // this.locations = this.api.getLocations();
              console.log('params geo:', this.params)
              if (this.params.get('idHotel')) {
                this.solomapa = true;
                this.hotel.id = this.params.get('idHotel');
                this.hotel.name = this.params.get('nombre');
                console.log(this.hotel)
              }else{
                this.solomapa = false;
              }

              this.get();



  }

  get(){
   console.log('hotel en get: ', this.hotel.id)
   if (this.hotel.id == '0') {

    this.storageService.getUserData()
        .then((response) => {
            this.user = response;
            console.log(this.user.guest.keysRooms[0].client);
            this.hotel.id = this.user.guest.keysRooms[0].client._id;
            this.hotel.name = this.user.guest.keysRooms[0].client.name;
            this.hotel.image = this.user.guest.keysRooms[0].client.image;
            console.log('saltar: ', this.saltar)


               // this.navCtrl.setRoot(FiltersPage, {"hotel_id": this.hotel.id, "hotel_name": this.hotel.name})



          })
      }


  }

  goToMap(hotel_id, hotel_name){
    console.log(hotel_id, " ", hotel_name)
    //this.navCtrl.push(FiltersPage, {"hotel_id": hotel_id, "hotel_name": hotel_name})
  }

  goInit() {
    if (!this.solomapa) this.navCtrl.setRoot('KeysPage', {});
  }


}
