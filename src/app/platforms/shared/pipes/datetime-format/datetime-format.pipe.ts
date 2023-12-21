import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'datetimeFormat'
})
export class DatetimeFormatPipe implements PipeTransform {
    transform(value: string): string {
        const date = new Date(value);
        const formattedDate = `${this.padZero(date.getDate())}/${this.padZero(date.getMonth() + 1)}/${date.getFullYear()}`;
        const formattedTime = `${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}:${this.padZero(date.getSeconds())}`;
        return `${formattedDate} ${formattedTime}`;
    }

    private padZero(value: number): string {
        return value.toString().padStart(2, '0');
    }
}
