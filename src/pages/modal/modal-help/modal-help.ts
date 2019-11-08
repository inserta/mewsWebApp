import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
	selector: 'page-modal-help',
	templateUrl: 'modal-help.html',
})
export class ModalHelpPage {

	constructor(private viewCtrl: ViewController) { }

	closeModal() {
		this.viewCtrl.dismiss();
	}
}
