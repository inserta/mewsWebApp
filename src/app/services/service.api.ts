import { Injectable } from '@angular/core';
import { AbstractService } from './abstract.service'
import { CryptProvider } from '../../providers/crypt/crypt';

import { api_guest } from '../../config/api'
import { User, FastCheckin } from '../../app/models/user.model'
import { KeyRoom } from '../../app/models/room.model'
import { KeysResponse } from '../../app/models/promise-response.model'
import { filter } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import { Http, Headers } from "@angular/http";

import { Events } from 'ionic-angular';
import { StorageService } from './service.storage';
import { DatosDocumento } from '../models/others.model';


@Injectable()
export class ServiceAPI extends AbstractService {

	id: string = '';

	actualUser = {
		edad: 0
	}

	actualHotel: any;
	clienteActual: any;
	actualGuests: any = [];

	databooking: any;

	// apiUrl = "https://booking.becheckin.com/";

	apiUrl = "http://192.168.99.100:15000/";

	constructor(
		private _http: Http,
		private _storage: StorageService,
		private _events: Events) {
		super(_http, _storage, _events)
	}

	public subirArchivo(body) {
		return this._http.post('https://dashboard.becheckin.com/php/fileUploadHotel.php', body)
			.map(res => res.json());
	}



	getKeysOfGuest(user: User): Promise<any> {
		let body = {
			token: user.token,
			idGuest: user.guest.tokenFirebase
		}
		return this.makePostRequest(api_guest.get.getKeysOfGuest, body)
			.then((response: any) => {
				user.guest.keysRooms = [];
				response.object.keysRooms.forEach(element => {
					if (element && element.room && element.room.mainDevice) {
						user.guest.keysRooms.push(new KeyRoom(element));
					}
				});
				return Promise.resolve(user);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	addUsertoKey(guest, keyroom) {
		let body = {
			guest: guest,
			keyroom: keyroom
		}
		return this.makePostRequest(api_guest.post.addUsertoKey, body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}
	getNotification(user: User) {
		let body = {
			token: user.token,
			idGuest: user.guest.tokenFirebase,
			guest: user.guest._id
		}
		return this.makePostRequest(api_guest.get.getNotification, body)
			.then((response: any) => {
				let aux = [];
				if (response.notifications) {
					response.notifications.forEach((item) => {
						let value = aux.filter((element) => { return element.grupo == item.grupo })
						if (value && value.length == 0) { aux.push(item) }
					})
				}
				return Promise.resolve(aux);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}
	getKeyByCode(code: string): Promise<KeysResponse> {
		let body = {
			downloadCode: code
		}
		return this.makeGetRequest(api_guest.get.getKeysByCode, body)
			.then((response: any) => {
				let keysResponse: KeysResponse = new KeysResponse();
				for (let key of response.object) {
					keysResponse.response.push(new KeyRoom(key));
				}
				return Promise.resolve(keysResponse);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	login(user: User): Promise<any> {
		console.log('user:', user)
		let body = {
			token: user.token,
			guest: user.guest ? user.guest.tokenFirebase : '',
			tokenCloudMessaging: user.tokenCloudMessaging
		}
		return this.makePostRequest(api_guest.post.login, body)
			.then((response: any) => {
				user.setUserDetails(response);
				user.becheckin_guest_token = response.token;
				user.guest._id = response.guest._id;
				user.guest.fastcheckin = response.guest.fastcheckin ? CryptProvider.decryptData(response.guest.fastcheckin, user.guest._id) : new FastCheckin();

				return Promise.resolve(user);

			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	createUser(data): Promise<any> {
		return this.makePostRequest(api_guest.post.create, data)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	existUser(data): Promise<any> {
		return this.makePostRequest(api_guest.post.exist, data)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	getAllKeys(data): Promise<any> {
		return this.makePostRequest(api_guest.post.downloadAll, data)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	booking2(reserva) {
		let utl = this.apiUrl + "reserva?hotel/reserva=" + reserva

		return this.makeGet(utl)
			.then((response: any) => {
				console.log('Booking: ', response)
				this.databooking = response;
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	sendmail(usuario, reserva, mailTo, start, finish, fast): Promise<any> {
		let body = {
			asunto: 'Nuevo Fastcheckin',
			reserva: reserva,
			usuario: usuario,
			mailTo: mailTo,
			type: 2,
			start: start,
			finish: finish,
			fast: fast
		}
		return this.makePost(this.apiUrl + "mail", body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	  sendMY(url) {
		        console.log('MY Url: ', url)
		        return this.makeGetMY(url)
		            .then((response: any) => {
		                console.log('MY Response: ', response)
		                //this.databooking = response;
		                return Promise.resolve(response);
		            })
		            .catch((response: any) => {
		                return Promise.reject(response);
		            });
		    }

	sendGenericMail(asunto, mensaje, mailTo, cc?, cco?): Promise<any> {
		let body = {
			asunto: asunto,
			mensaje: mensaje,
			mailTo: mailTo,
			cc: cc,
			cco: cco
		}
		return this.makePost(this.apiUrl + "gmail", body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	sendBooking(data, code): Promise<any> {
		console.log("fast:", data)
		let doc = { type: '', "identifier": '' }
		if (data.dni.identifier != '') {
			doc.type = 'dni',
				doc.identifier = data.dni.identifier
		} else {
			doc.type = 'passport',
				doc.identifier = data.dni.identifier
		}

		let body = {
			reserva: code,
			firstname: data.name,
			lastname: data.surnameOne + " " + data.surname,
			email: data.email,
			status: "REQUESTED",
			nationality: "in",
			birthdate: data.birthday,
			gender: data.sex,
			signature: data.signature,
			documents: [
				doc
			]
		}

		console.log("Mandamos a test: ", body)

		return this.makePost(this.apiUrl + "sendBooking", body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}   

	booking(reserva): Promise<any> {
		let body = {
			reserva: reserva
		}
		return this.makePost(this.apiUrl + "get_mews_code", body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	inyectar(reserva, fast): Promise<any> {
		let body = {
			reserva: reserva,
			fast: fast 
		}
		return this.makePost(this.apiUrl + "set_mews_fast", body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	getHotel(hotelId): Promise<any> {
		let body = {
			idCliente: hotelId
		}
		return this.makePost(this.apiUrl + "populate", body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	populate(): Promise<any> {
		let body = {
			idCliente: this.actualHotel.idCliente
		}
		return this.makePost(this.apiUrl + "populate", body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	getHotelbyId(hotelId): Promise<any> {
		let body = {
			idBooking: hotelId
		}
		return this.makePost(this.apiUrl + "gethotelbyid", body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	crearllave(data, room): Promise<any> {
		//return Promise.resolve("0")
		//return this.makePost(this.apiUrl + "keyByCode", data)
		if (room != '0') {
			data.room = room
			console.log('Grabo: ', data)
			return this.makePost(this.apiUrl + "createKey", data)
				.then((response: any) => {

					return Promise.resolve(response);
				})
				.catch((response: any) => {
					return Promise.reject(response);
				});
		} else {
			return Promise.resolve('0');
		}

	}

	grabarDatosReserva(reserva): Promise<any> {
		//return Promise.resolve("0")
		//return this.makePost(this.apiUrl + "keyByCode", data)

		console.log('Grabo reserva: ', reserva)
		return this.makePost(this.apiUrl + "datosReserva", reserva)
			.then((response: any) => {

				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});

	}


	getpin(data): Promise<any> {
		console.log('getpin: ', data)
		return this.makePost(this.apiUrl + "setcvc", data)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	getcard(data): Promise<any> {
		return this.makePost(this.apiUrl + "getcard", data)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	grabarCard(data): Promise<any> {
		return this.makePost(this.apiUrl + "cardStripe", data)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	setPin(data): Promise<any> {
		return this.makePost(this.apiUrl + "pin", data)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	deleteGuest(data): Promise<any> {
		return this.makePost("https://insinno.api.becheckin.es/api/v1/utils/deleteGuest", data)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	getRooms(cliente) {

		let body = {
			client: cliente
		}

		return this.makePost(this.apiUrl + "getRooms", body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}
	getClient(user, pass) {

		let body = {
			email: user,
			password: pass
		}

		return this.makePost(this.apiUrl + "getClient", body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}


	getKey(code: string, user: User): Promise<any> {
		let body = {
			downloadCode: code,
			guest: user.guest.tokenFirebase
		}

		return this.makePostRequest(api_guest.post.downloadKey, body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	openDoor(token: string, data: string, keyRoomId: string): Promise<any> {
		let body = {
			token: token,
			nameDevice: data,
			action: 1,
			keyRoomId: keyRoomId
		}
		return this.makePostRequest(api_guest.post.openDoor, body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	turnBelux(token: string, data: string, keyRoomId: string, onoff): Promise<any> {
		let body = {
			token: token,
			nameDevice: data,
			action: onoff,
			keyRoomId: keyRoomId
		}
		return this.makePostRequest(api_guest.post.openDoor, body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}



	registerOpenDoor(token: string, nameDevice: string, mac: string, tokenFirebase: string): Promise<any> {
		let body = {
			token: token,
			mac: mac,
			nameDevice: nameDevice,
			guest: tokenFirebase
		}
		return this.makePostRequest(api_guest.post.registerOpen, body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	sendMqttCommand(nameDevice, topic, action) {
		const body = {
			nameDevice: nameDevice,
			topic: topic,
			action: action
		};

		return this.makePost("https://insinno.api.becheckin.es/api/v1/utils/sendMqttCommand", body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}


	registerOpenDoorFake(nameDevice: string, code: string): Promise<any> {
		let body = {
			token: '',
			nameDevice: nameDevice,
			code: code
		}
		return this.makePostRequest(api_guest.post.registerOpenFake, body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	setFastcheckin(user: User, fastcheckin: string): Promise<any> {
		let body = {
			token: user.token,
			guest: user.guest.tokenFirebase,
			fastcheckin: fastcheckin
		}
		return this.makePostRequest(api_guest.post.setFastcheckin, body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}

	setPermissionPersonalData(idGuest: string, idClient: string, client: string, response: string): Promise<any> {
		let body = {
			idGuest: idGuest,
			idClient: idClient,
			client: client,
			response: response
		}
		return this.makePostRequest(api_guest.post.allowPersonalData, body)
			.then((response: any) => {
				return Promise.resolve(response);
			})
			.catch((response: any) => {
				return Promise.reject(response);
			});
	}


	// Para escanear imágenes con el OCR

	public crearOcrDniFrontal(text) {
		let body = {
			text: text
		}
		return this.makePost(this.apiUrl + 'ocr/dni/frontal', body)
			.then(res => {
				return Promise.resolve(res);
			})
			.catch(error => {
				console.log('Error: ' + error);
				return Promise.reject(error);
			});
	}

	public crearOcrDniTrasero(text, datosDocumento: DatosDocumento) {

		let body = {
			text: text,
			nombre: datosDocumento.nombre,
			apellido1: datosDocumento.apellido1,
			apellido2: datosDocumento.apellido2,
			documento: datosDocumento.documento,
			pais: datosDocumento.pais,
			nacimiento: datosDocumento.nacimiento,
			genero: datosDocumento.sexo,
			expedicion: datosDocumento.expedicion,
			tipoDocumento: datosDocumento.tipoDocumento
		}

		return this.makePost(this.apiUrl + 'ocr/dni/trasero', body)
			.then(res => {
				return Promise.resolve(res);
			})
			.catch(error => {
				console.log('Error: ' + error);
				return Promise.reject(error);
			});
	}

	public crearOcrPasaporte(text) {

		let body = {
			text: text
		}
		return this.makePost(this.apiUrl + 'ocr/pasaporte/', body)
			.then(res => {
				return Promise.resolve(res);
			})
			.catch(error => {
				console.log('Error: ' + error);
				return Promise.reject(error);
			});
	}

	// Fin métodos OCR

}
