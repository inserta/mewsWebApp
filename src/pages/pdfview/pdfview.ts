import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the PdfviewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

const ZOOM_STEP:number = 0.25;
const DEFAULT_ZOOM:number = 1;

@IonicPage({
  name:'pdf'
})
@Component({
  selector: 'page-pdfview',
  templateUrl: 'pdfview.html',
})
export class PdfviewPage {
  pdfSrc: string;
  archivo: string;
  tipo: string;

  public pdfZoom:number = DEFAULT_ZOOM;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private translate: TranslateService,
    private viewCtrl: ViewController
   ) {
  }

  cargaPDF()
  {
    let idioma=false;
    this.tipo = this.navParams.get("archivo");
    // Para archivos en Base64:
    if (this.tipo.substring(0, 4)==="data" || this.tipo.substring(0, 4)==="http") {
      this.archivo=this.tipo;
      if (this.tipo.substring(0, 4)==="http") {
        this.archivo="https://cors-anywhere.herokuapp.com/"+this.archivo;
      }
    }
    // Para resto de archivos pdf:
    else{
    // Abrimos archivo según tipo:
    switch (this.tipo)
    {
      case "instructions_pdf":
          idioma=true;
          this.archivo="../assets/pdf/instructions";
          break;
      case "conditions_pdf":
          idioma=true;
          this.archivo="../assets/pdf/conditions";
          break;
      case "policysecurity_pdf":
              idioma=true;
              this.archivo="../assets/pdf/policysecurity";
              break;
     
  
      // Por defecto, abre las guias de las ciudades:
      default:
          idioma=true;
          this.archivo="../assets/pdf/ciudades/"+this.tipo;
    }

    if (idioma)
    {
    // Recogemos idioma y componemos el archivo a abrir:
    let deviceLang = this.translate.getDefaultLang();
    
    switch(deviceLang){
      case 'es': this.archivo = this.archivo+"_es.pdf";
                  break;
      case 'en': this.archivo = this.archivo+"_en.pdf";  
                  break;  
      default:
          this.archivo = this.archivo+"_en.pdf";  

    } }
    else {
      this.archivo = this.archivo+".pdf";
    }
  }
      this.pdfSrc=this.archivo;
  
  }

 
  public zoomIn()
	{
		this.pdfZoom += ZOOM_STEP;
	}

	public zoomOut()
	{
		if (this.pdfZoom > DEFAULT_ZOOM) {
			this.pdfZoom -= ZOOM_STEP;
		}
	}

	public resetZoom()
	{
		this.pdfZoom = DEFAULT_ZOOM;
	}

  ionViewDidLoad() {
    console.log('ionViewDidLoad vPDfPAge');
    this.cargaPDF();
  }

  public dismiss()
	{
		this.viewCtrl.dismiss();
	}
}
