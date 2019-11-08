export class ErroresFormularioRegistro{
    tipoDocumento: string;
    numIdentificacion: string;
    fechaExpedicion: string;
    nombre: string;
    apellido1: string;
    apellido2: string;
    fechaNacimiento: string;
    sexo: string;
    nacionalidad: string;
    tieneErrores: boolean;
}

export class PasoAnterior {
    paso: number;
    progreso: string;
}

export class DatosDocumento {
    nombre: string;
    apellido1: string;
    apellido2: string;
    pais: string;
    documento: string;
    sexo: string;
    nacimiento: string;
    expedicion: string;
    tipoDocumento: string;
}