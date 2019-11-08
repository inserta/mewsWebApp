export class Configuration {

    static errorCodeAuth = {
        "auth/invalid-credential": "INVALID_CREDENTIAL",
        "auth/operation-not-allowed": "OPERATION_NOT_ALLOWED",
        "auth/user-disabled": "USER_DISABLED",
        "auth/user-not-found": "USER_NOT_FOUND",
        "auth/wrong-password": "WRONG_PASSWORD",
        "auth/invalid-email": "EMAIL_INVALID",
        "auth/email-already-in-use": "EMAIL_ALREADY_USE",
        "auth/weak-password": "WEAK_PASSWORD"
    };

    static languages = [
        { value: 'es-ES', language: 'es' },
        { value: 'en-GB', language: 'en' },
        { value: 'fr-FR', language: 'fr' },
        { value: 'it-IT', language: 'it' },
        { value: 'de-DE', language: 'de' },
        { value: 'pt-PT', language: 'pt' }
    ];

    static defaultLanguage = 'en';

    static defaultAvatar = 'assets/imgs/no-user.png';

    /**
	 *  TYPES OF CONNECTIONS NETWORK
	 */

    static connection_wifi = "wifi";
    static connection_3g = "3g";
    static connection_4g = "4g";

}
