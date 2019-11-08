import { User } from "./user.model";

export class KeyRoom {

    id: string;
    room: Room;
    start: string;
    finish: string;
    client: Client;
    guests: User[];
    constructor(keyRoom: any) {
        this.id = keyRoom._id;
        this.room = new Room(keyRoom.room);
        this.client = new Client(keyRoom.client);
        this.start = keyRoom.start;
        this.finish = keyRoom.finish;
        this.guests = keyRoom.guest;
    }
}

export class Room {

    id: string;
    number: string;
    name: string;
    mainDevice: Becheckin;
    becheckins: Becheckin[] = [];
    beluxs: Belux[] = [];
    hasLight: boolean;

    constructor(room: any) {
        this.id = room._id;
        this.number = room.number;
        this.name = room.name;
        this.mainDevice = room.mainDevice ? new Becheckin(room.mainDevice) : null;
        this.hasLight = room.hasLight;
        room.becheckins.forEach(becheckin => {
            if (becheckin) {
                this.becheckins.push(new Becheckin(becheckin));
            }
        });
        room.beluxs.forEach(belux => {
            if (belux) {
                this.beluxs.push(new Belux(belux));
            }
        });
    }
}

export class Becheckin {

    id: string;
    codeTwo: string;
    codeOne: string;
    nameDevice: string;
    macBLE: string;
    macBluetooth: string;
    name: string;

    constructor(becheckins: any) {
        this.id = becheckins._id;
        this.codeTwo = becheckins.codeTwo;
        this.codeOne = becheckins.codeOne;
        this.nameDevice = becheckins.nameDevice;
        this.macBLE = becheckins.macBLE;
        this.macBluetooth = becheckins.macBluetooth;
        this.name = becheckins.name
    }

}
export class Belux {

    id: string;
    codeTwo: string;
    codeOne: string;
    nameDevice: string;

    constructor(beluxs: any) {
        this.id = beluxs._id;
        this.codeTwo = beluxs.codeTwo;
        this.codeOne = beluxs.codeOne;
        this.nameDevice = beluxs.nameDevice;
    }

}


export class Client {

    id: string;
    email: string;
    name: string;
    image: Logo;
    color: string;
    hasFastcheckin: boolean;
    hasKeys: boolean;
    haschat: boolean;
    hasPayment: boolean;

    constructor(client: any) {
        this.id = client._id;
        this.email = client.email;
        this.name = client.name;
        this.image = client.image ? new Logo(client.image) : null;
        this.color = client.color;
        this.hasFastcheckin = client.hasFastcheckin;
        this.hasKeys = client.hasKeys;
        this.haschat = client.haschat;
        this.hasPayment = client.hasPayment;
    }
}

export class Logo {

    id: string;
    source: string;

    constructor(logo: any) {
        this.id = logo._id;
        this.source = 'data:image/jpeg;base64,' + logo.fileBase64Sender;
    }
}