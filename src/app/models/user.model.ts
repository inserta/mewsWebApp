export class User {
    token: string;
    tokenCloudMessaging: string;
    guest: Guest;
    becheckin_guest_token: string = '';
    keysRooms: any = [];

    constructor() {
        this.guest = this.guest ? this.guest : new Guest();
    }

    setUser(user: any, FCMToken: any) {
        this.guest = this.guest ? this.guest : new Guest();
        this.guest.name = user.displayName ? user.displayName : (user.name ? user.name : '');
        this.guest.email = user.email;
        this.token = user.Yd;
        this.guest.tokenFirebase = user.uid;
        this.tokenCloudMessaging = FCMToken ? FCMToken.replace(/"/g, '') : '';
    }

    setUserParameters(snapshot: any) {
        this.guest.name = snapshot.child("name").val();
        this.guest.email = snapshot.child("email").val();
        // this.guest.providerId = snapshot.child("providerId").val();
        // this.guest.uid = snapshot.child("uid").val();
        this.token = snapshot.child("token").val();
    }

    setUserDetails(user: any) {
        this.guest.createdAt = user.guest.createdAt;
        this.guest.canLogin = user.guest.canLogin;
        this.guest.clientOf = user.guest.clientOf;
        this.guest.device = user.guest.device;
        this.guest.email = user.guest.email;
        this.guest.fastcheckin = user.guest.fastcheckin ? user.guest.fastcheckin : new FastCheckin();;
        this.guest.isRegister = {
            email: user.isRegister ? user.isRegister.email : '',
            phone: user.isRegister ? user.isRegister.phone : ''
        }
        this.keysRooms = user.guest.keysRooms;
        this.guest.keysRooms = user.guest.keysRooms;
        this.guest.latesLogin = user.guest.latesLogin;
        this.guest.name = user.guest.name;
        this.guest.password = user.guest.password;
        this.guest.phone = user.guest.phone;
        this.guest.sim = user.guest.sim;
        this.guest.surnameOne = user.guest.surnameOne;
        this.guest.surnameTwo = user.guest.surnameTwo;
        this.guest.tokenFirebase = user.guest.tokenFirebase;
        this.guest.versionAPI = user.guest.versionAPI;
    }
}

export class Guest {
    _id: string;
    name: string;
    surnameOne: string;
    surnameTwo: string;
    email: string;
    userLogin: string;
    password: string;
    isRegister: {
        email: string;
        phone: string;
    };
    phone: string;
    device: string;
    sim: string;
    clientOf: any[];
    keysRooms: any[];
    createdAt: Date;
    latesLogin: Date;
    canLogin: boolean;
    versionAPI: string;
    tokenFirebase: string;
    fastcheckin: FastCheckin;

    constructor() {
        this._id = '';
        this.name = '';
        this.surnameOne = '';
        this.surnameTwo = '';
        this.email = '';
        this.isRegister = {
            email: '',
            phone: ''
        }
        this.phone = '';
        this.device = '';
        this.sim = '';
        this.clientOf = [];
        this.keysRooms = [];
        this.createdAt = new Date();
        this.latesLogin = new Date();
        this.canLogin = true;
        this.versionAPI = '';
        this.tokenFirebase = '';
        this.fastcheckin = new FastCheckin();
    }
}

export class FastCheckin {

    typeOfDocument: string;
    dni: {
        identifier: string;
    };
    passport: {
        identifier: string;
    };
    name: string;
    surnameOne: string;
    surnameTwo: string;
    birthday: string;
    nationality: string;
    sex: string;
    date_exp: string;
    caducate: Date;
    _id: string;
    email: string;
    signature: string;
    reserve: string;
    update: string;
    hasDni: boolean;
    hasPassport: boolean;
    tipoDoc: string;
    imagenes: any = [];
    province: string;
    

    constructor() {
        this.typeOfDocument = '';
        this.dni = {
            identifier: ''
        };
        this.passport = {
            identifier: ''
        }
        this.name = '';
        this.surnameOne = '';
        this.surnameTwo = '';
        this.birthday = '';
        this.nationality = '';
        this.sex = '';
        this.date_exp = '';
        this.signature = '';
        this.imagenes = [];
        this.province = '';
    }
}
