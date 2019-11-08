import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Environment } from '../../environments/environments';

@Injectable()
export class GoogleCloudVisionServiceProvider {

    constructor(public http: Http) { }

    getLabels(base64Image) {
        const body = {
            "requests": [
                {
                    "image": {
                        "content": base64Image
                    },
                    "features": [
                        {
                            "type": "DOCUMENT_TEXT_DETECTION"
                        }
                    ]
                }
            ]
        }

        return this.http.post('https://vision.googleapis.com/v1/images:annotate?key=' + Environment.googleCloudVisionAPIKey, body);
    }

}