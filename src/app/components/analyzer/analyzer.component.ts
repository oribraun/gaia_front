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
    fileUploadErr = ''
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
        target.value = ''
    }

    async filesDropped(files: FileList) {
        const file = files[0];
        if (file.type !== 'text/plain') {
            this.fileUploadErr = 'please upload txt file only';
            return;
        }
        const formData = new FormData();
        formData.append('file', file, file.name);
        this.apiService.compareVendorsUpload(formData).subscribe((res: any) => {
            // console.log('res', res)
            this.uploadFilePath = res.file_path;
        }, (err) => {
            // console.log('err', err)
            this.fileUploadErr = err.stack;
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
