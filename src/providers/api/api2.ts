import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ApiProvider {
  apiUrl = "https://localhost:3000";
  staticMode = true;

  constructor(public http: HttpClient) {
    console.log('Hello ApiProvider Provider');
  }

  getLocations() {
    return new Promise(resolve => {
      if(!this.staticMode){
        this.http.get(this.apiUrl + '/hotels').subscribe(
          data => {
            resolve(data);
          }, err => {
            console.log(err);
          });
      }else{
        let data = [
          {
            id: 1,
            name: "Hotel Dona Maria",
            img: "https://s-ec.bstatic.com/images/hotel/max1280x900/101/101430248.jpg"
          },
          {
            id: 2,
            name: "Hotel Catalonia Giralda",
            img: "https://pix10.agoda.net/hotelImages/115/1157073/1157073_16062412150044053329.jpg?s=1024x768"
          },
          {
            id: 3,
            name: "Hotel Meliá Lebreros",
            img: "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2018/02/14/1226/Hyatt-Place-St-George-Convention-Center-P004-Exterior.jpg/Hyatt-Place-St-George-Convention-Center-P004-Exterior.16x9.adapt.1920.1080.jpg"
          },
          {
            id: 4,
            name: "Hotel Don Paco",
            img: "https://www.rwsentosa.com/-/media/project/non-gaming/rwsentosa/hotels/hard-rock-hotel-singapore/hardrockhotelsg-exterior.jpg"
          }
        ]

        resolve(data);
      }
    });
  }

  getLocation(id){
    return new Promise(resolve => {
      if(!this.staticMode){
        this.http.get(this.apiUrl + '/hotels/' + id).subscribe(
          data => {
            resolve(data);
          }, err => {
            console.log(err);
          });
      }else{
        let data = this.getStaticLocation(id);

        resolve(data);
      }
    });
  }

  getStaticLocation(id){
    return [
      {
        title: "Plaza de España",
        desc: "Praça de referência com um grande curso de água, bancos com azulejos pintados e um pavilhão ornamentado.",
        img: "https://lh5.googleusercontent.com/p/AF1QipO2hvO2-Eid6ri7IDQfkYXpxYCyrDP19L7hZK5P=w408-h270-k-no",
        lat: 37.378556,
        lng: -5.981463,
        type: "monument"
      },
      {
        title: "El Divino Salvador",
        desc: "Igreja católica",
        img: "https://lh5.googleusercontent.com/p/AF1QipMYr-DxdAs63Lrw_gLASsu6HaFbpJM4H7L-wLul=w408-h283-k-no",
        lat: 37.392633,
        lng: -5.986678,
        type: "monument"
      },
      {
        title: "Flores Gourmet",
        desc: "Restaurante",
        img: "https://lh5.googleusercontent.com/p/AF1QipOK77yy_-BQ9nbi_TNZHT7i9y1yye0poRnkByob=w408-h229-k-no",
        lat: 37.393458,
        lng: -5.999604,
        type: "restaurant"
      },
      {
        title: "Rincón De Rosita",
        desc: "Bar",
        img: "https://lh5.googleusercontent.com/p/AF1QipPk5amgGnrkiHIH2TawRbqTtG-_Uay492NHbBGl=w408-h306-k-no",
        lat: 37.404084,
        lng: -5.984439,
        type: "bar"
      },
      {
        title: "Hotel Ítaca Artemisa",
        desc: "Hotel de 3 estrelas",
        img: "https://lh5.googleusercontent.com/p/AF1QipOoNPctzKAzsVsIfVYyCl9BF9X6DvbE-OBOaaxb=w408-h611-k-no",
        lat: 37.395273,
        lng: -5.984352,
        type: "hotel"
      }
    ]
  }

}
