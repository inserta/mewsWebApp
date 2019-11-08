import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ApiProvider {
  apiUrl = "https://booking.becheckin.com/";
  staticMode = false;

  constructor(public http: HttpClient) {
    console.log('Hello ApiProvider Provider. !!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  }

  getLocations() {
    return new Promise(resolve => {
      if(this.staticMode){
        this.http.post(this.apiUrl + 'gethotel', {
          headers: new HttpHeaders().set('Content-Type', 'application/json')
        }).subscribe(
          data => {
            console.log(data);
            resolve(data);
          }, err => {
            console.log(err);
          });
      }else{
        let data = [
          {
            id: "5c17f89b95214d0015854a91",
            name: "Hotel Pruebas",
            img: "https://s-ec.bstatic.com/images/hotel/max1280x900/101/101430248.jpg"
          }
          /*,
          {
            id: "5c17f89b95214d0015854a91",
            name: "Hotel Catalonia Giralda",
            img: "https://pix10.agoda.net/hotelImages/115/1157073/1157073_16062412150044053329.jpg?s=1024x768"
          },
          {
            id: "5c17f89b95214d0015854a91",
            name: "Hotel Meliá Lebreros",
            img: "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2018/02/14/1226/Hyatt-Place-St-George-Convention-Center-P004-Exterior.jpg/Hyatt-Place-St-George-Convention-Center-P004-Exterior.16x9.adapt.1920.1080.jpg"
          },
          {
            id: "5c17f89b95214d0015854a91",
            name: "Hotel Don Paco",
            img: "https://www.rwsentosa.com/-/media/project/non-gaming/rwsentosa/hotels/hard-rock-hotel-singapore/hardrockhotelsg-exterior.jpg"
          }*/

        ]

        resolve(data);
      }
    });
  }

  getHotelLocation(id){
    const data = {'idCliente': id};
    return new Promise(resolve => {
      if(!this.staticMode){
        this.http.post(this.apiUrl + 'gethotel', JSON.stringify(data) ,{
          headers: new HttpHeaders().set('Content-Type', 'application/json')
        }).subscribe(
          data => {
            console.log(data);
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

  getHotelPlaces(id){
    const data = {'idCliente': id};
    return new Promise(resolve => {
      this.http.post(this.apiUrl + 'getmap', JSON.stringify(data) ,{
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(
        data => {
          console.log(data);
          resolve(data);
        }, err => {
          console.log(err);
        });

    });
  }

  getHotelBasicPlaces(id){
    const data = {'idCliente': id};
    return new Promise(resolve => {
      this.http.post(this.apiUrl + 'getBasic', JSON.stringify(data) ,{
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }).subscribe(
        data => {
          console.log(data);
          resolve(data);
        }, err => {
          console.log(err);
        });

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

  // Consigue las actividades que se recuperan en el banner del mapa:
  // Estructura:
  // Parámetro de entrada:  id cliente;
  // Datos recuperados:
  // tipo actividad, código actividad, nombre actividad, url actividad
  getActivitiesBanner(id) {
    
    return new Promise(resolve => {
    this.http.get(this.apiUrl + 'banners/'+id).subscribe(
      data => {
        resolve(data);
      }, err => {
        let data=[];
        console.log(err);
        resolve(data);
      });
  });
}    

         /*   let data = [
              {
                tipo: "ESPECTÁCULOS",
                codigo: "15",
                nombre: "BAILE FLAMENCO",
                link: "http://www.flamencolacava.com/"
              },
              {
                tipo: "TRANSFER",
                codigo: "16",
                nombre: "TRANSFER",
                link: "http://autoscasado.es/"
              }];
*/
            /*let data = [
              {
                tipo: "BARES Y RESTAURANTES",
                codigo: "5",
                nombre: "Bodeguita Antonio Romero",
                link: "https://www.bodeguitasantonioromero.com/"
              },
              {
                tipo: "MUSEOS Y MONUMENTOS",
                codigo: "9",
                nombre: "Catedral y Giralda de Sevilla",
                link: "https://www.catedraldesevilla.es/"
              },
              {
                tipo: "BUS Y BARCO TURÍSTICO",
                codigo: "6",
                nombre: "City Sightseeing Sevilla",
                link: "https://www.city-ss.es/en/destination/seville/"
              },
              {
                tipo: "ESPECTÁCULOS (TABLAOS Y TEATROS)",
                codigo: "4",
                nombre: "Museo del Baile Flamenco",
                link: "https://museodelbaileflamenco.com/"
              },
              {
                tipo: "ALQUILER COCHE, MOTO, BICI...",
                codigo: "11",
                nombre: "Alquiler de motos eléctricas",
                link: "https://muving.com/"
              },
              {
                tipo: "TRANSFER",
                codigo: "10",
                nombre: "Sevilla Transfer",
                link: "https://www.sevillatransfer.es/"
              },
              {
                tipo: "OTRAS (RUTAS, SPA, EXCURSONES)",
                codigo: "8",
                nombre: "Visita Itálica ",
                link: "http://www.italicasevilla.org/"
              },
              {
                tipo: "OTROS",
                codigo: "14",
                nombre: "Acuario de Sevilla",
                link: "https://www.acuariosevilla.es/"
              },
            ]*/
    
        //    resolve(data);
          //  console.log(err);
          //});

  // Consigue las actividades top que se mostrarán en los cajones de abajo del todo del mapa:
  // Estructura:
  // Parámetro de entrada:  id cliente;
  // Datos recuperados:
  // tipo actividad, código actividad, nombre actividad, url actividad
  getActivitiesTop(id) {
    return new Promise(resolve => {
  
        this.http.get(this.apiUrl + 'cajonAll/'+id).subscribe(
          data => {
            resolve(data);
          }, err => {
            let data=[];
            console.log(err);
            resolve(data);
          });
      });
}

}
