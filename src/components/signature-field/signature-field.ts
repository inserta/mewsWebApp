import { Component, ViewChild, ViewChildren, Output, QueryList, EventEmitter, ElementRef, Input } from '@angular/core';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';


@Component({
  selector: 'signature-field',
  templateUrl: 'signature-field.html'
})

export class SignatureFieldComponent {

  public options: Object = {};
  public _signature: any = null;
  public isEnabled: boolean;
  @Output() finished = new EventEmitter<any>();
  @Input() data: string;

  @ViewChild(SignaturePad) public signaturePad: SignaturePad;
  @ViewChildren('signatureContainer') public signatureContainer: QueryList<ElementRef>;

  constructor() { }

  public ngAfterViewInit() {
    this.setSizes();
    if (this.data) {
      this.signaturePad.fromDataURL(this.data, { width: this.signatureContainer.first.nativeElement.clientWidth, height: 200 });
    }
    this.signaturePad.off();
    this.isEnabled = false;
  }

  public setSizes() {
    this.signaturePad.set('canvasWidth', this.signatureContainer.first.nativeElement.clientWidth);
    this.signaturePad.set('canvasHeight', '200');
  }

  public clear() {
    this.signaturePad.clear();
    this.signature = '';
  }

  get signature(): any {
    return this._signature;
  }

  set signature(value: any) {
    this._signature = value;
    this.finished.emit(value);
  }

  public drawComplete(): void {
    this.signature = this.signaturePad.toDataURL();
  }

  public enable(): void {
    this.signaturePad.on();
    document.getElementById("signatureContainer").style.background = "#fff";
    this.isEnabled = true;
  }

  public disable(): void {
    this.signaturePad.off();
    document.getElementById("signatureContainer").style.background = "#ebf4ff";
    this.isEnabled = false;
  }

}