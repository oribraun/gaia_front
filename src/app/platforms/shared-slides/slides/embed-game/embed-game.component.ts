import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";


@Component({
    selector: 'app-embed-game',
    templateUrl: './embed-game.component.html',
    styleUrls: ['./embed-game.component.less']
})

export class EmbedGameComponent extends BaseSlideComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('wrapper', { static: false }) wrapper!: ElementRef;
    @ViewChild('iframe', { static: false }) iframe!: ElementRef;

    iframe_url:SafeResourceUrl | undefined;
    isIframeFocused: boolean = false;
    checkFocusInterval: number | undefined;
    endGameTimer: number | undefined;
    alertBeforeEndGameTimer: number | undefined;
    gameTimerInterval: number | undefined;
    isActiveGame:boolean = false
    gameTimer:number = 0
    minutes:number = 0
    seconds:number = 0
    blurIframe:boolean = false
    game_duration:number = 2

    constructor(
        protected override config: Config,
        private sanitizer: DomSanitizer,
        protected override lessonService: LessonService
    ) {
        super(config, lessonService)
    }

    ngAfterViewInit() {

        function checkFocus(self:any) {
            if(document.activeElement == document.getElementsByTagName("iframe")[0]) {
                self.startGame()
            }
        }

        this.checkFocusInterval = window.setInterval(checkFocus, 2000, this);

        // this.lessonService.Broadcast('endDoNotDisturb',{})
        // this.lessonService.Broadcast('DoNotDisturb',{})
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.updateSrc(this.currentSlide['iframe_path'])
        this.game_duration = this.currentSlide['game_duration']
    }

    startGame(){
        function endGameTrigger(self:any) {
            self.stopGame()
        }
        function alertBeforeEndGameTrigger(self:any) {
            self.alertBeforeEndGame()
        }
        function progressTimer(self:any) {
            self.gameTimer= self.gameTimer+1
            self.minutes = Math.floor(self.gameTimer/60)
            self.seconds = self.gameTimer%60
        }
        if (!this.isActiveGame){
            this.isActiveGame = true
            const endGameTimeLimit = this.game_duration
            const alertBeforeEndGameTimeLimit = endGameTimeLimit-1
            console.log('Game started by the user')
            // Trigger do not disturbe
            this.lessonService.Broadcast('DoNotDisturb',{})
            // Counter for one minute before end of time
            this.endGameTimer = window.setTimeout(endGameTrigger, 60*1000*endGameTimeLimit, this);
            // Counter for end of game
            this.alertBeforeEndGameTimer = window.setTimeout(alertBeforeEndGameTrigger, 60*1000*alertBeforeEndGameTimeLimit+1, this);
            // Interval for counting game time
            this.gameTimer = 0
            this.gameTimerInterval = window.setInterval(progressTimer, 1000, this);
        }

    }

    stopGame(){
        if (this.isActiveGame){
            this.isActiveGame = false
            this.blurIframe = true
            this.minutes = this.game_duration
            this.seconds = 0
            window.clearInterval(this.checkFocusInterval)
            window.clearInterval(this.gameTimerInterval)
            this.lessonService.Broadcast('endDoNotDisturb',{})
            console.log('game ended')
            // Make Jenny say something and move on to the next slide
            setTimeout(() => {
                const data = {"event_type": "embed_game_stopped"}
                this.lessonService.Broadcast('endGameAndMoveSlide',data)
            }, 1000)
        }
    }

    alertBeforeEndGame(){
        console.log('one minute before end game')
        let text = 'שים לב נותרה דקה לסיום המשחק'
        this.lessonService.Broadcast('speakNative',{'text':text, 'onlyAudio': true})
    }

    updateSrc(url:string='') {
        this.iframe_url=this.sanitizer.bypassSecurityTrustResourceUrl(url)
    }

    override ngOnDestroy(){
        super.ngOnDestroy()
        clearTimeout(this.alertBeforeEndGameTimer)
        clearInterval(this.checkFocusInterval)
        clearInterval(this.gameTimerInterval)
    }
}
