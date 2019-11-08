import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { QRCodeComponent } from 'angular2-qrcode';

@IonicPage()
@Component({
	selector: 'page-modalqr',
	templateUrl: 'modal-qr.html',
})
export class ModalQrPage {

	private fastcheckin: String = '';
  private titulo: string ='';
  private subtitulo: string = '';

	constructor(
		private params: NavParams) {
      console.log(this.params)
		this.fastcheckin = this.params.get('fastcheckin');
    this.titulo = this.params.get('titulo');
    this.subtitulo = this.params.get('subtitulo');
    console.log(this.titulo, " ", this.subtitulo)
	}
}
