import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

    transform(value: string, type: string, cleanDashes: boolean = false, ...args: unknown[]): string {
        if (cleanDashes) {
            value = this.clean_dashes(value);
        }
        if (type == 'word') {
            return this.capitalizeWords(value);
        } else {
            return value;
        }
    }

    capitalizeWords(sentence: string) {
        // Split the sentence into words
        const words = sentence.split(' ');

        // Capitalize the first letter of each word
        const capitalizedWords = words.map(word => {
            // Handle the case where the word is an empty string
            if (word === '') {
                return '';
            }

            // Capitalize the first letter and concatenate the rest of the word
            return word[0].toUpperCase() + word.slice(1);
        });

        // Join the capitalized words back into a sentence
        const capitalizedSentence = capitalizedWords.join(' ');

        return capitalizedSentence;
    }

    clean_dashes(sentence: string) {
        return sentence.replace('-', ' ').replace('_', ' ');
    }

}
