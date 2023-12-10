import { Component , OnInit} from '@angular/core';
import { Config } from 'src/app/platforms/main/config';
import { LessonService } from 'src/app/platforms/main/services/lesson/lesson.service';
import {SpeechRecognitionService} from "../../../../services/speech-recognition/speech-recognition.service";

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.less']
})
export class HelpComponent implements OnInit{

    helpMode:string = 'disabled';

    disableButton = false;
    constructor(
        private config: Config,
        private lessonService: LessonService,
        private speechRecognitionService: SpeechRecognitionService
    ) {

    }

    ngOnInit(): void {
        this.lessonService.resetHelpMode();
        this.lessonService.ListenFor("resetHelpMode").subscribe((helpMode: string) => {
            this.helpMode = helpMode;
            this.setHelpMode(this.helpMode, false);
        });
    }

    setHelpMode(helpType:string = 'disabled', broadcast = true){
        console.log('setHelpMode triggered', helpType);
        this.helpMode = helpType;
        this.lessonService.setHelpMode(this.helpMode);
        this.lessonService.Broadcast('stopAudio',{});
        if(helpType == 'en'){
            this.speechRecognitionService.resetToOrigLang();
            if (broadcast) {
                this.lessonService.Broadcast('getHeartBeatReply', {});
            }
        } else if (helpType == 'native'){
            this.speechRecognitionService.activateNativeLang();
            if (broadcast) {
                this.lessonService.Broadcast('getHeartBeatReply', {});
            }
        } else {
            this.speechRecognitionService.resetToOrigLang();
            if (broadcast) {
                // this.lessonService.Broadcast('getHeartBeatReply', {})
                this.lessonService.Broadcast('restartCurrentSlide', {});
            }
        }
    }
}
