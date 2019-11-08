import { Injectable } from '@angular/core';
import AES from "crypto-js/aes";
import CryptoJS from "crypto-js/crypto-js";

import { User, FastCheckin } from '../../app/models/user.model';

@Injectable()
export class CryptProvider {

    constructor() { }

    public encryptData(user: User): string {
        let fastcheckin = AES.encrypt(JSON.stringify(user.guest.fastcheckin), user.guest._id);
        return fastcheckin;
    }

    public static decryptData(fastcheckin: string, userId: string): FastCheckin {
        var bytes = AES.decrypt(fastcheckin, userId)
        let res = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))            
        return res;
    }
}