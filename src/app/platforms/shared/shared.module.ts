import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";

import {AngularEditorModule} from "@kolkov/angular-editor";
import {YouTubePlayerModule} from "@angular/youtube-player";

import {GreetingComponent} from "./slides/greeting/greeting.component";
import {BaseSlideComponent} from "./slides/base-slide.component";
import {AgendaComponent} from "./slides/agenda/agenda.component";
import {BlanksComponent} from "./slides/blanks/blanks.component";
import {EmbedGameComponent} from "./slides/embed-game/embed-game.component";
import {EndingComponent} from "./slides/ending/ending.component";
import {GenericComponent} from "./slides/generic/generic.component";
import {ImageGeneratorComponent} from "./slides/image-generator/image-generator.component";
import {RandomSelectorComponent} from "./slides/random-selector/random-selector.component";
import {ReadingComponent} from "./slides/reading/reading.component";
import {TemplateComponent} from "./slides/template/template.component";
import {TitleComponent} from "./slides/title/title.component";
import {UnseenComponent} from "./slides/unseen/unseen.component";
import {VideoComponent} from "./slides/video/video.component";
import {WordRepeaterComponent} from "./slides/word-repeater/word-repeater.component";
import {WordTranslatorComponent} from "./slides/word-translator/word-translator.component";
import {WritingComponent} from "./slides/writing/writing.component";
import {CapitalizePipe} from "./pipes/capitalize/capitalize.pipe";
import {DatetimeFormatPipe} from "./pipes/datetime-format/datetime-format.pipe";
import {RangePipe} from "./pipes/range/range.pipe";
import {SafeHtmlPipe} from "./pipes/safe-html.pipe";
import {SafePipe} from "./pipes/safe.pipe";
import { HearingComponent } from './slides/hearing/hearing.component';
import { SpeakingComponent } from './slides/speaking/speaking.component';
import {VideoIeltsComponent} from "./slides/video-ielts/video-ielts.component";
import {DynamicFontSizeDirective} from "./directives/dynamic-font-size/dynamic-font-size.directive";
// import { LottieModule } from 'ngx-lottie';
//
//
// export function playerFactory() {
//   return import('lottie-web');
// }


@NgModule({
    declarations: [
        BaseSlideComponent,
        AgendaComponent,
        BlanksComponent,
        EmbedGameComponent,
        EndingComponent,
        GenericComponent,
        GreetingComponent,
        ImageGeneratorComponent,
        RandomSelectorComponent,
        ReadingComponent,
        TemplateComponent,
        TitleComponent,
        UnseenComponent,
        VideoComponent,
        WordRepeaterComponent,
        WordTranslatorComponent,
        WritingComponent,
        HearingComponent,
        SpeakingComponent,
        VideoIeltsComponent,

        CapitalizePipe,
        DatetimeFormatPipe,
        RangePipe,
        SafeHtmlPipe,
        SafePipe,

        DynamicFontSizeDirective
    ],
    imports: [
        CommonModule,
        FormsModule,
        YouTubePlayerModule,
        AngularEditorModule
        // LottieModule.forRoot({ player: playerFactory })
    ],
    exports: [
        AgendaComponent,
        BlanksComponent,
        EmbedGameComponent,
        EndingComponent,
        GenericComponent,
        GreetingComponent,
        ImageGeneratorComponent,
        RandomSelectorComponent,
        ReadingComponent,
        TemplateComponent,
        TitleComponent,
        UnseenComponent,
        VideoComponent,
        WordRepeaterComponent,
        WordTranslatorComponent,
        WritingComponent,
        HearingComponent,
        SpeakingComponent,
        VideoIeltsComponent,

        CapitalizePipe,
        DatetimeFormatPipe,
        RangePipe,
        SafeHtmlPipe,
        SafePipe,

        DynamicFontSizeDirective
    ]
})
export class SharedModule { }
