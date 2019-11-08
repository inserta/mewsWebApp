import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PdfviewPage } from './pdfview';
import { PdfViewerModule } from 'ng2-pdf-viewer';


@NgModule({
  declarations: [
    PdfviewPage,
  ],
  imports: [
    IonicPageModule.forChild(PdfviewPage),
    PdfViewerModule
  ],
})
export class PdfviewPageModule {}
