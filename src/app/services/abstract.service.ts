import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Http, Response, Headers } from '@angular/http';

import { uri, url } from '../../config/api'

import { StorageService } from './service.storage'


@Injectable()
export class AbstractService {

    urlPrefix = null;
    environment = null;
    token = null;

    constructor(
        private http: Http,
        private storage: StorageService,
        private events: Events) {
    }

    private getHeaders(): Promise<Headers> {
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            headers.delete("Content-Type")
            headers.append("Content-Type", "application/json");
            this.storage.getUserData().then((user) => {
                if (user && user.token && user.token != '') {
                    headers.delete("Authorization")
                    headers.append("Authorization", user.becheckin_guest_token);
                } else {
                    if (this.storage.getDownloadCode()) {
                        headers.delete("Authorization")
                        headers.append("Authorization", "");
                    }
                }
                resolve(headers);
            }).catch(() => {
                resolve(headers);
            })
        });
    }

    protected makeGetRequest(path: string, paramsRequest: any): Promise<any> {
        if (!paramsRequest) {
            paramsRequest = {};
        }
        return this.getHeaders().then((headers) => {
            return new Promise((resolve, reject) => {
                this.http.get(url + uri + path, { headers: headers, params: paramsRequest }).subscribe(response => {
                    resolve(response.json());
                }, err => {
                    if (err.status == 200) {
                        resolve(err);
                    } else {
                        console.log(err);
                        this.goToLogin();
                        reject(err);
                    }
                });
            });
        });
    }

    protected makeGet(path: string): Promise<any> {

        return this.getHeaders().then((headers) => {
            return new Promise((resolve, reject) => {
                this.http.get(path, { headers: headers }).subscribe(response => {
                    resolve(response.json());
                }, err => {
                    if (err.status == 200) {
                        resolve(err);
                    } else {
                        console.log(err);
                        this.goToLogin();
                        reject(err);
                    }
                });
            });
        });
    }


    protected makePostRequest(path: string, data: any): Promise<any> {
        return this.storage.getUserData().then((user) => {
            return this.getHeaders().then((headers) => {
                return this.http.post(url + uri + path, data, { headers: headers }).toPromise().then((response: Response) => {
                    return Promise.resolve(response.json());
                }).catch(function (error) {
                    return Promise.reject(error);
                });
            });
        }).catch((error) => {
            this.goToLogin();
            return Promise.reject(error);
        })
    }

    protected makePost(path: string, data: any): Promise<any> {
        return this.storage.getUserData().then((user) => {
            return this.getHeaders().then((headers) => {
                return this.http.post(path, data, { headers: headers }).toPromise().then((response: Response) => {
                    return Promise.resolve(response.json());
                }).catch(function (error) {
                    return Promise.reject(error);
                });
            });
        }).catch((error) => {
            this.goToLogin();
            return Promise.reject(error);
        })
    }

    private goToLogin() {
        this.events.publish('reLogin');
    }

    
     protected makeGetMY(path: string): Promise<any> {

                return this.getHeaders().then((headers) => {
                    return new Promise((resolve, reject) => {
                        this.http.get(path, { headers: headers }).subscribe(response => {
                            resolve({ mensaje:'ok'});
                        }, err => {
                            if (err.status == 200) {
                                resolve(err);
                            } else {
                                console.log(err);
                                this.goToLogin();
                                reject(err);
                            }
                        });
                    });
                });
            }
        
        
}
