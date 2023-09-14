import { Component , OnInit} from '@angular/core';
import { Config } from 'src/app/config';
import { LessonService } from 'src/app/services/lesson/lesson.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.less']
})
export class HelpComponent implements OnInit{

  helpMode:string = 'disabled'
  constructor(
    private config: Config,
    private lessonService: LessonService,
) {

  }

  ngOnInit(): void {
      this.lessonService.resetHelpMode()
      this.lessonService.ListenFor("resetHelpMode").subscribe((helpMode: string) => {
        this.helpMode = helpMode
    })
  }

  setHelpMode(helpType:string='disabled'){
    console.log('setHelpMode triggered', helpType)
    this.helpMode = this.lessonService.setHelpMode(helpType)
  }

}
