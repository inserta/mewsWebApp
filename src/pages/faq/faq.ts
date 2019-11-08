import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

@IonicPage()
@Component({
	selector: 'page-faq',
	templateUrl: 'faq.html',
})
export class FaqPage {

	public faqs: any;

	constructor(
		private navCtrl: NavController) {

		this.faqs = [
			{ question: 'FAQS.QUESTION_1', answer: 'FAQS.ANSWER_1' },
			{ question: 'FAQS.QUESTION_2', answer: 'FAQS.ANSWER_2' },
			{ question: 'FAQS.QUESTION_3', answer: 'FAQS.ANSWER_3' },
			{ question: 'FAQS.QUESTION_4', answer: 'FAQS.ANSWER_4' },
			{ question: 'FAQS.QUESTION_5', answer: 'FAQS.ANSWER_5' },
			{ question: 'FAQS.QUESTION_6', answer: 'FAQS.ANSWER_6' },
		]
	}

	faqDetail(faq) {
		this.navCtrl.push('FaqDetailPage', { faq: faq });
	}
}
