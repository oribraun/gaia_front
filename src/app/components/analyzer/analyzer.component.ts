import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiService} from "../../services/api.service";

@Component({
    selector: 'app-analyzer',
    templateUrl: './analyzer.component.html',
    styleUrls: ['./analyzer.component.less']
})
export class AnalyzerComponent implements OnInit {

    uploadFilePath = ''
    analyzeFilePath = 'media/uploads/'
    constructor(
        private http: HttpClient,
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
    }

    resetUploadFilePAth() {
        this.uploadFilePath = '';
    }

    resetAnalyzeFilePAth() {
        this.analyzeFilePath = '';
    }

    uploadFiles(event: Event) {
        const target = event.target as HTMLInputElement;
        const files = target.files as FileList;
        this.filesDropped(files);
    }

    async filesDropped(files: FileList) {
        const formData = new FormData();
        formData.append('file', files[0], files[0].name);
        this.apiService.upload(formData).subscribe((res: any) => {
            console.log('res', res)
            this.uploadFilePath = res.file_path;
        }, (err) => {
            console.log('err', err)
        })
    }

    analyze() {
        this.apiService.analyze(this.analyzeFilePath).subscribe((res: any) => {
            console.log('res', res)
        }, (err) => {
            console.log('err', err)
        })
    }

    makeAnalyzeFilePath() {
        this.analyzeFilePath = this.uploadFilePath;
    }

}
