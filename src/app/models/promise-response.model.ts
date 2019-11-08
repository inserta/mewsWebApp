import { User } from './user.model'
import { KeyRoom } from './room.model'

export class PromiseResponse {
    error: any;
    response: any;
}

export class UserResponse extends PromiseResponse {
    response: User;
}

export class KeysResponse extends PromiseResponse {
    response: KeyRoom[] = [];
}