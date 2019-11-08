import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the ModalImagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modal-image',
  templateUrl: 'modal-image.html'
})
export class ModalImagePage {

  @ViewChild('slider', { read: ElementRef })slider: ElementRef;
  img: any;
  path: any;
  type: any;
  activities: any;
  name: any;
  cmp: any;

  sliderOpts = {
    zoom: {
      maxRatio: 5
    }
  };

 

  constructor(private navParams: NavParams, 
    private modalController: ModalController,
    private viewCtrl: ViewController,
    private iab: InAppBrowser,
    private domSanitizer: DomSanitizer
    ) {
   }

  ngOnInit() {
    this.img = this.navParams.get('image');
    this.activities = this.navParams.get('activities');
    this.name = this.navParams.get('name');
    this.cmp=this.navParams.get('cmp');
  }

  zoom(zoomIn: boolean) {
    let zoom = this.slider.nativeElement.swiper.zoom;
    if (zoomIn) {
      zoom.in();
    } else {
      zoom.out();
    }
  }

  close() {
    this.viewCtrl.dismiss();
  }

  open_link(link) {
    let parametros="";
    if (link.indexOf('civitatis')!==-1) parametros='?aid=4104&cmp=' + this.cmp;
    const browser = this.iab.create(link+parametros, '_system');
    browser.show();
  }

  sanitize(url: string) {
    //return url;
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }
 
}
