import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule, } from "@angular/http";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { QRCodeModule } from 'angular2-qrcode';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateService } from '@ngx-translate/core';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook'
import { Camera } from '@ionic-native/camera';
import { CameraMock } from '@ionic-native-mocks/camera';
import { BLE } from '@ionic-native/ble';
import { FCM } from '@ionic-native/fcm';
//import { FileOpener } from '@ionic-native/file-opener/ngx';


//import { LocalNotifications } from '@ionic-native/local-notifications';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Globalization } from "@ionic-native/globalization";
import { Network } from '@ionic-native/network';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

import { MyApp } from './app.component';
import { ComponentsModule } from '../components/components.module';
import { WindowRef } from './window';
import { Environment } from '../environments/environments';

/** PAGES */

/** FIREBASE */
import 'firebase/storage';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth'


/** PROVIDERS */
import { AuthProvider } from '../providers/auth/auth';
import { StorageService } from "./services/service.storage";
import { ServiceAPI } from "./services/service.api";
import { GoogleCloudVisionServiceProvider } from '../providers/vision/google-cloud-vision-service';
import { ConnectionProvider } from '../providers/connection/connection';
import { CryptProvider } from '../providers/crypt/crypt';
import { Dialogs } from '@ionic-native/dialogs';

import { MimapPage } from '../pages/mimap/mimap'

//import { GeoPageClick } from '../pages/geoclick/geoclick'

// GOOGLE MAPS
import { Geolocation } from '@ionic-native/geolocation';
import { GoogleMaps } from '@ionic-native/google-maps';
import { LaunchNavigator } from '@ionic-native/launch-navigator';

import { ApiProvider } from '../providers/api/api';

import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { IonicImageViewerModule } from 'ionic-img-viewer';


// Global Service
import { GlobalService } from './services/globalService';


export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


/*class CameraMock extends Camera {
  getPicture(options) {
    return new Promise((resolve, reject) => {
      resolve("BASE_64_ENCODED_DATA_GOES_HERE");
    })
  }
*/


@NgModule({
	declarations: [
		MyApp,
		MimapPage,
		//GeoPageClick

	],
	imports: [
		BrowserModule,
		IonicImageViewerModule,
		IonicModule.forRoot(
			MyApp,
			{
				mode: 'ios'
			}
		),

		HttpClientModule,
		HttpModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: (createTranslateLoader),
				deps: [HttpClient]
			}
		}),
		ComponentsModule,
		QRCodeModule,
		AngularFireModule.initializeApp(Environment.firebaseProd),
		AngularFireDatabaseModule,
		AngularFireAuthModule,
    //FileOpener,
		IonicStorageModule.forRoot(),
	
	],
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp,
		MimapPage,
    //GeoPageClick
	],
	providers: [
		Dialogs,
		Camera,
		StatusBar,
		SplashScreen,
		ConnectionProvider,
		StorageService,
		ServiceAPI,
		AuthProvider,
		GlobalService,
		CryptProvider,
		Facebook,
		GooglePlus,
		//LocalNotifications,
		BLE,
		BluetoothSerial,
		Network,
		FCM,
		Globalization,
		GoogleCloudVisionServiceProvider,
		OpenNativeSettings,
		WindowRef,
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
	    { provide: Camera, useClass: CameraMock },
		//Camera,
	
    Geolocation,
    GoogleMaps,
    ApiProvider,
		LaunchNavigator,
		NativeGeocoder,
		InAppBrowser,

	]
})
export class AppModule { }
