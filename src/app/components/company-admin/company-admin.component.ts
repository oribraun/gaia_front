import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {IsActiveMatchOptions} from "@angular/router";
import {User} from "../../entities/user";
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {lastValueFrom} from "rxjs";
import {environment} from "../../../environments/environment";

@Component({
    selector: 'app-company-admin',
    templateUrl: './company-admin.component.html',
    styleUrls: ['./company-admin.component.less']
})
export class CompanyAdminComponent implements OnInit {

    @ViewChild('header') header: ElementRef | undefined;
    @ViewChild('main') main: ElementRef | undefined;

    routerLinkActiveOptions: IsActiveMatchOptions = {
        fragment: "exact",
        paths: "exact",
        queryParams: 'subset',
        matrixParams: 'subset'
    }

    user!: User;
    company: any;
    errMessage = '';
    successMessage = '';
    howToImplement = '';
    currentComponent: any;
    host = ''
    constructor(
        private config: Config,
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
        this.host = this.config.server_host || environment.serverUrl
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
        });
        setTimeout(() => {
            this.setMainPos();
        })
        this.getCompanySettings()
    }

    async getCompanySettings() {
        const response: any = await lastValueFrom(this.apiService.getCompany({}));
        if (!response.err) {
            if (!response.data) {
                this.errMessage = 'Company do not exist';
            } else {
                this.company = response.data;
                this.setHowToImplement()
                if (this.currentComponent) {
                    this.currentComponent.company = this.company;
                    this.currentComponent.howToImplement = this.howToImplement;
                }
            }
        } else {
            this.errMessage = response.errMessage;
        }
    }

    onOutletLoaded(component: any) {
        // component.company = this.company;
        this.currentComponent = component;
        this.currentComponent.company = this.company;
        this.currentComponent.howToImplement = this.howToImplement;
        // if (component instanceof MyComponent1) {
        //     component.someInput = 123;
        //   } else if (component instanceof MyComponent2) {
        //     component.anotherInput = 456;
        //   }
    }

    setHowToImplement() {
        this.howToImplement = `function postData(url = '', data = {}, token = '') {
    return fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
}

function handleStreamResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let result = '';

  const read = () => {
    return reader.read().then(({ done, value }) => {
      if (done) {
        return result;
      }

      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
      console.log('handleStreamResponse', result)
      return read();
    });
  };

  return read();
}

// your GAIA API token:
api_token = '${this.company.api_token}'

// send question:
stream = false;
data = {prompt: 'Hi', stream: stream, conversation_id: 'some_conversation_id'}
url = '${this.host}${this.apiService.baseApi}ct/chatbot'
postData(url, data, api_token).then(async (response) => {
    if (!stream) {
        const r = await response.json();
        console.log('Response:', r);
    } else {
        this.handleStreamResponse(response)
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });

// get conversation history:
data = {conversation_id: 'some_conversation_id'}
url = '${this.host}${this.apiService.baseApi}ct/get-conversation-history'
postData(url, data, api_token).then((response) => {
    console.log('Response:', response);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

// Angular Example:

sendToChatBot(prompt: string, conversation_id: string, stream: boolean, api_token = '') {
    const httpOptions: any = {
        headers: {
            'GAIA-AI-TOKEN': api_token ? api_token : ''
        },
        responseType: 'text',
        observe: 'events',
        reportProgress: true,
    }
    const body: any = {
        prompt: prompt,
        conversation_id: conversation_id,
        stream: stream
    }
    return this.http.post('${this.host}${this.apiService.baseApi}ct/chatbot', body,
        httpOptions
    )
}

this.chatSubscribe = this.sendToChatBot(text, conversation_id, stream, api_token).subscribe((event: any) => {
    console.log(event.partialText);
}, (err) => {
    console.log(err);
})

stopChatBotStreaming() {
    if (this.chatSubscribe) {
        this.chatSubscribe.unsubscribe();
    }
}
`;
    }

    setMainPos() {
        if (this.header) {
            const height = this.header.nativeElement.clientHeight;
            if (this.main) {
                this.main.nativeElement.style.top = height + 'px';
            }
        }
    }

    @HostListener('window:resize')
    onWindowResize() {
        this.setMainPos();
    }

}
