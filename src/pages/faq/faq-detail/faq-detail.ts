import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
	selector: 'page-faq-detail',
	templateUrl: 'faq-detail.html',
})
export class FaqDetailPage {

	public faq: any;

	constructor(
		private viewCtrl: ViewController,
		private navParams: NavParams) {

		this.faq = this.navParams.get('faq');
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}
}
