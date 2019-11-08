import { Injectable } from '@angular/core';
import { ServiceAPI } from './service.api';

@Injectable()
export class GlobalService {


    constructor(
        private service: ServiceAPI
    ) {
    }

    // Método para subir archivos en 1&1
    subirArchivo(file, ruta, nombre?) {

        return new Promise<string>((resolve, reject) => {
            // file: contiene el fichero subido. Si no se recibe, no sube ningún fichero.
            // ruta: indica la carpeta donde se guardará el fichero
            // nombre: indica el nombre del archivo (la extensión la detecta automáticamente la función)
            // La ruta donde se guarda es: "https://dashboard.becheckin.com/imgs/[ruta]/nombre"

            if (file) {

                let regex = /(?:\.([^.]+))?$/;
                let extension = regex.exec(file.name)[1];
                let formData = new FormData();

                formData.append('selectFile', file, file.name);
                formData.append('path', ruta); // indicamos la carpeta donde grabar el fichero
                formData.append('remotename', nombre ? nombre + "." + extension : ''); // dejar en blanco si no queremos especificar ninguno. En su defecto el nombre del fichero subido
                console.log(formData);

                this.service.subirArchivo(formData).subscribe(uploaded => {
                    console.log(uploaded);
                    if (uploaded.Status === 1) {
                        resolve("https://dashboard.becheckin.com/imgs/" + ruta + "/" + (nombre ? nombre + "." + extension : file.name));
                    } else {
                        resolve("error");
                    }
                }, err => {
                    console.log(err);
                    resolve("error");
                });

            } else {

                resolve("salto")

            }
        });
    }

    generarCadenaAleatoria(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }


    clone(obj) {
        let copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (let i = 0, len = obj.length; i < len; i++) {
                copy[i] = this.clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (let attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    }
}