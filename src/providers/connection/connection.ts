import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Network } from '@ionic-native/network';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { Platform } from 'ionic-angular';

import { Configuration } from '../../environments/configuration';

@Injectable()
export class ConnectionProvider {

    constructor(
        private platform: Platform,
        private bluetoothSerial: BluetoothSerial,
        private openNativeSettings: OpenNativeSettings,
        private network: Network) { }


    public checkConnectioBluethooth(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.platform.is('cordova')) {
                this.bluetoothSerial.isEnabled()
                    .then((response) => {
                        if (response == 'OK' || !response) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }).catch((error) => {
                        resolve(false);
                    });
            } else {
                resolve(true)
            }
        });
    }

    public checkConnectionWifi(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.platform.is('cordova')) {
                if (this.network.type == Configuration.connection_wifi || this.network.type == Configuration.connection_4g || this.network.type == Configuration.connection_3g) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } else {
                resolve(true)
            }
        });
    }

    public enableBluetooth():Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.bluetoothSerial.enable()
            .then((response) => {
                resolve(true);
            }).catch((error) => {
                reject(false);
            });
        })
    }

    public openNetworkSettings() {
        this.openNativeSettings.open("network");
    }

}