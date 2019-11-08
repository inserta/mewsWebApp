import { FormControl } from '@angular/forms';

export class DNIValidator {
    static isValid(control: FormControl) {
        const re = /^[0-9]{8}[a-zA-Z]{1}$/.test(control.value) || /^[a-zA-Z]{3}[0-9]{6}$/.test(control.value) ;
        if (re) {
            return null;
        }
        return {
            "invalidDni": true
        };
    }
}