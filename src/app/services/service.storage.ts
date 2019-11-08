import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { User } from "../models/user.model";
import { Room, Client } from "../models/room.model";

@Injectable()
export class StorageService {

    private user = 'user';
    private userIsLoged = 'userIsLoged';
    private keys = 'keys';
    private email = 'email';
    private password = 'password';
    private codeDownloadUse = 'codeDownloadUse';
    private tokenFirebase = 'tokenFirebase';
    private code = 'code';
    private tutorial = 'tutorial';
    private client = 'client';
    private hotel = 'hotel';
    private periodReserve = "periodReserve";
    private guests = "guests";

    constructor(public storage: Storage) { }

    public clear() {
        this.storage.clear();
    }

    /**
    * USER
    */

    public setUserIsLoged(isLoged: boolean): void {
        localStorage.setItem(this.userIsLoged, JSON.stringify(isLoged));
    }

    public getUserIsLoged(): boolean {
        return localStorage.getItem(this.userIsLoged) == 'true';
    }

    public setUserData(userData) {
        localStorage.setItem(this.user, JSON.stringify(userData));
    }

    public getUserData(): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            resolve(JSON.parse(localStorage.getItem(this.user)));
        });
    }

    public setUserEmail(email: string): void {
        localStorage.setItem(this.email, JSON.stringify(email));
    }

    public getUserEmail(): string {
        return localStorage.getItem(this.email) as string;
    }

    public setUserPassword(password: string): void {
        localStorage.setItem(this.password, JSON.stringify(password));
    }

    public getUserPassword(): string {
        return localStorage.getItem(this.password) as string;
    }

    /**
    * ROOM
    */
    public setKeys(keys) {
        localStorage.setItem(this.keys, JSON.stringify(keys));
    }

    public getKeys(): Promise<Room[]> {
        return new Promise<Room[]>((resolve, reject) => {
            resolve(JSON.parse(localStorage.getItem(this.keys)));
        });
    }

    /**
     * DOWNLOAD CODE
     */
    public setDownloadCode(dowloadCodeIsUsed: boolean): void {
        localStorage.setItem(this.codeDownloadUse, JSON.stringify(dowloadCodeIsUsed));
    }

    public getDownloadCode(): boolean {
        return localStorage.getItem(this.codeDownloadUse) == 'true';
    }

    /**
     * TOKEN FIREBASE
     */
    public setTokenFirebase(tokenFirebase: string): void {
        localStorage.setItem(this.tokenFirebase, JSON.stringify(tokenFirebase));
    }

    public getTokenFirebase(): string {
        return localStorage.getItem(this.tokenFirebase) as string;
    }

    /**
     * CODE
     */
    public setCode(code: string): void {
        localStorage.setItem(this.code, code);
    }

    public getCode(): string {
        return localStorage.getItem(this.code);
    }


    /**
     * Client
     */
    public setClient(client): void {
        localStorage.setItem(this.client, JSON.stringify(client));
    }

    public getClient(): Promise<Client> {
        return new Promise<Client>((resolve, reject) => {
            resolve(JSON.parse(localStorage.getItem(this.client)));
        });
    }

    /**
     * tutorial
     */
    public setTutorial(tutorial: string): void {
        localStorage.setItem(this.tutorial, tutorial);
    }

    public getTutorial(): string {
        return localStorage.getItem(this.tutorial);
    }


    public getKeysRooms(): any {
        return localStorage.getItem(this.user);
    }

    public setHotel(hotel): any {
        localStorage.setItem(this.hotel, JSON.stringify(hotel));
    }

    public getHotel(): any {
        return localStorage.getItem(this.hotel);
    }

    public setPeriodReserve(period): any {
        localStorage.setItem(this.periodReserve, JSON.stringify(period));
    }

    public getPeriodReserve(): any {
        return localStorage.getItem(this.periodReserve);
    }

    public setGuests(guests): any {
        console.log('Storage Guest: ', guests)
        localStorage.setItem(this.guests, JSON.stringify(guests));
    }

    public getGuests(): Promise<Room[]> {
        return new Promise<Room[]>((resolve, reject) => {
            resolve(JSON.parse(localStorage.getItem(this.guests)));
        });
    }
}
