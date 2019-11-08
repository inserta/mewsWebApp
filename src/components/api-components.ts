import { Injectable } from '@angular/core';
import { LoadingController, Loading, AlertController, Alert, ToastController, Toast, Events } from 'ionic-angular';
import { WindowRef } from '../app/window';
import { TranslateService } from '@ngx-translate/core';
import { Camera } from '@ionic-native/camera';
import { Dialogs } from '@ionic-native/dialogs';

@Injectable()
export class ApiComponents {

    constructor(
        private events: Events,
        private translate: TranslateService,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private camera: Camera,
        private winRef: WindowRef,
        private dialogs: Dialogs) { }

    createLoading(): Promise<Loading> {
        return new Promise((resolve, reject) => {
            let loading = this.loadingCtrl.create();
            resolve(loading);
        });
    }

    createLoadingWithMessage(message): Promise<Loading> {
        return new Promise((resolve, reject) => {
            this.translate.get(message).subscribe((res: any) => {
                let loading = this.loadingCtrl.create({
                    content: res,
                });
                resolve(loading);
            });
        });
    }

    createToast(message: string, duration: number, position: string): Promise<Toast> {
        return new Promise((resolve, reject) => {
            let toast = this.toastCtrl.create({
                message: message,
                duration: duration,
                position: position
            });
            resolve(toast);
        });
    }

    createAlert(title: string, subtitle: string, titleCancel: string, titleOk: string, callbackOk?: () => void, callbackCancel?: () => void): Promise<Alert> {
        return new Promise((resolve, reject) => {
            let alert = this.alertCtrl.create({
                title: title,
                subTitle: subtitle,
                buttons: [
                    {
                        text: titleCancel,
                        handler: () => {
                            if (callbackCancel) {
                                callbackCancel();
                            }
                        }
                    },
                    {
                        text: titleOk,
                        handler: () => {
                            if (callbackOk) {
                                callbackOk();
                            }
                        }
                    }
                ]
            });
            resolve(alert);
        });
    }

    createDialogAlert(message: string, title: string, buttonName: string) {
        let promises = [
            this.translate.get(message).toPromise(),
            this.translate.get(title).toPromise(),
            this.translate.get(buttonName).toPromise()];
        Promise.all(promises).then((strings: string[]) => {
            this.dialogs.alert(strings[0], strings[1], strings[2])
                .then(() => console.log('Dialog dismissed'))
                .catch(e => console.log('Error displaying dialog', e));
        });
    }

    createActionSheetTakeImage(): Promise<String> {
        return new Promise((resolve, reject) => {
            let vm = this;
            let promises = [
                this.translate.get('GENERAL.TAKE_PHOTO_CAMERA').toPromise(),
                this.translate.get('GENERAL.SELECT_PHOTO_GALLERY').toPromise(),
                this.translate.get('GENERAL.CANCEL').toPromise()];
            Promise.all(promises).then((strings: string[]) => {
                var options = {
                    buttonLabels: [strings[0], strings[1]],
                    addCancelButtonWithLabel: strings[2],
                    destructiveButtonLast: true
                };
                this.winRef.nativeWindow.plugins.actionsheet.show(options, function (buttonIndex) {
                    if (buttonIndex == 1) {
                        resolve(vm.takePhoto(vm.prepareOptionsCamera()));
                    } else if (buttonIndex == 2) {
                        resolve(vm.takePhoto(vm.prepareOptionsGallery()));
                    }
                });

            });
        });
    }

    private takePhoto(cameraOptions: any): Promise<string> {
        this.events.publish('noNeedPin', true);
        return new Promise((resolve, reject) => {
            this.camera.getPicture(cameraOptions).then((imageData) => {
                resolve(imageData);
            }, (err) => {
                console.log(err);
            });
        });
    }

    private prepareOptionsCamera() {
        return {
            quality: 50,
            saveToPhotoAlbum: false,
            correctOrientation: false,
            destinationType: this.camera.DestinationType.DATA_URL,
            mediatype: this.camera.MediaType.PICTURE
        }
    }

    private prepareOptionsGallery() {
        return {
            saveToPhotoAlbum: false,
            correctOrientation: true,
            mediatype: this.camera.MediaType.PICTURE,
            destinationType: this.camera.DestinationType.DATA_URL,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
        }
    }
}
