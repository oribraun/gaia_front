import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('videoplayer') videoplayer!: ElementRef;
  videoUrl = environment.staticUrl + 'assets/videos/loop_video..mp4';
  title = 'frontend';
  staticServerPath = '';
  constructor() {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const media = this.videoplayer.nativeElement;
    media.muted = true; // without this line it's not working although I have "muted" in HTML
    media.play();
  }

}
