import { IonicModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { NgModule } from '@angular/core';
import { BeKeyComponent } from './be-key/be-key';

import { ApiComponents } from './api-components';
import { SignatureFieldComponent } from './signature-field/signature-field';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ContentDrawer } from './content-drawer/content-drawer';

@NgModule({
	declarations: [
		BeKeyComponent,
		SignatureFieldComponent,
    ContentDrawer
	],
	imports: [
		IonicModule,
		SignaturePadModule,
		TranslateModule.forChild()
	],
	exports: [
		BeKeyComponent,
		SignatureFieldComponent,
    ContentDrawer
	],
	providers: [
		ApiComponents,
		
	]
})
export class ComponentsModule { }
