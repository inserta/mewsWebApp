import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase/app';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { StorageService } from './../../app/services/service.storage';

import { UserResponse } from './../../app/models/promise-response.model';
import { User } from './../../app/models/user.model';


@Injectable()
export class AuthProvider {

    constructor(
        private afAuth: AngularFireAuth,
        private storageService: StorageService,
        private facebook: Facebook,
        private googlePlus: GooglePlus) { }

    public loginUser(newEmail: string, newPassword: string): firebase.Promise<any> {
        return this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword).then((response: any) => {
            let user = new User();
            let tokenFirebase = this.storageService.getTokenFirebase();
            user.setUser(response, tokenFirebase);
            this.storageService.setUserData(user);
            return Promise.resolve(user);
        }).catch((response: any) => {
            return Promise.reject(response.code);
        });
    }

    public resetPassword(email: string): firebase.Promise<any> {
        return this.afAuth.auth.sendPasswordResetEmail(email);
    }

    public logoutUser(): firebase.Promise<any> {
        return this.afAuth.auth.signOut();
    }

    public signupUser(name: string, email: string, password: string): firebase.Promise<any> {
        return this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((response: any) => {
            let userResponse: UserResponse = new UserResponse;
            userResponse.response = new User();
            userResponse.response.setUser(response, this.storageService.getTokenFirebase());
            userResponse.response.guest.name = name;
            this.storageService.setUserData(userResponse.response);
            this.storageService.setUserIsLoged(true);
            return Promise.resolve(userResponse);
        }).catch((response: any) => {
            return Promise.reject(response.code);
        });
    }

    public relogin(): any {
        let vm = this;
        return this.storageService.getUserData().then((userData: User) => {
            if (userData) {
                if (this.afAuth.auth.currentUser) {
                    this.afAuth.auth.currentUser.getToken(true).then((token) => {
                        userData.token = token;
                        vm.storageService.setUserData(userData);
                        return Promise.resolve(userData);
                    }).catch((error) => {return Promise.reject(error)});
                } else {
                    return Promise.reject(userData);
                }
            }
        })
    }

    public loginFacebook(): firebase.Promise<any> {
        return new Promise<User>((resolve, reject) => {
            return this.facebook.login(['email'])
                .then((response) => {
                    firebase.auth().signInWithCredential(firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken))
                        .then((success) => {
                            let user = new User();
                            user.setUser(success, this.storageService.getTokenFirebase());
                            user.guest.name = name;
                            resolve(user);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                }).catch((error) => {
                    reject(error)
                });
        });
    }

    public loginGoogle(): firebase.Promise<any> {
        return new Promise<User>((resolve, reject) => {
            return this.googlePlus.login({
                webClientId: "89222153541-gb8d41g3t5t9psofar1jf4a6c094ckcu.apps.googleusercontent.com",
                offline: true,
            }).then((response) => {
                const googleCredential = firebase.auth.GoogleAuthProvider.credential(response.idToken);
                firebase.auth().signInWithCredential(googleCredential)
                    .then((success) => {
                        let user = new User();
                        user.setUser(success, this.storageService.getTokenFirebase());
                        user.guest.name = name;
                        resolve(user);
                    }).catch((error) => {
                        reject(error);
                    });
            }).catch((error) => {
                reject(error);
            });
        });
    }
}