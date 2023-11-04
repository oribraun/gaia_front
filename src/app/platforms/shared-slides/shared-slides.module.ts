import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import {AngularEditorModule} from "@kolkov/angular-editor";
import {FormsModule} from "@angular/forms";
import {YouTubePlayerModule} from "@angular/youtube-player";



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
        WritingComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        YouTubePlayerModule,
        AngularEditorModule
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
        WritingComponent
    ],
})
export class SharedSlidesModule { }
