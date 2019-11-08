import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FaqPage } from './faq';
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    FaqPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(FaqPage),
    TranslateModule.forChild()
  ],
})
export class FaqPageModule {}
