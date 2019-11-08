export const url = 'http://localhost';
export const uri = ':15000/api/guest/v1';

export const api_guest = {
    get: {
        getKeysOfGuest: '/getKeysOfGuest/',
        getKeysByCode: '/keyroom/set/guest',
        getNotification: '/getNotifications'
    },
    post: {
        create: '/create',
        login: '/login',
        exist: '/exist',
        downloadKey: '/keyroom/set/guest',
        downloadAll: '/keyroom/set/with_email',
        openDoor: '/becheckin/open',
        registerOpen: '/becheckin/register',
        registerOpenFake: '/becheckin/registerFake',
        setFastcheckin: '/set/fastcheckin',
        allowPersonalData: '/personalDataPermissions',
        addUsertoKey: '/keyroom/set/addUsertoKey'
    }
}