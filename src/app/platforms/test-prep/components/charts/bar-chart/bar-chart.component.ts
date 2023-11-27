import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {ECharts, EChartsOption, init} from "echarts";

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.less']
})
export class BarChartComponent {
    @ViewChild('chart') chart!: ElementRef;

    @Input('labels') labels: string[] = [];
    @Input('data') data: number[] = [];
    @Input('colors') colors: string[] = [];

    chartEl!: ECharts;

    options!: EChartsOption;

    ngAfterViewInit(): void {
        if (this.chart) {
            const container = this.chart.nativeElement;
            this.chartEl = init(container);
            this.setUpOptions();
            new ResizeObserver(() => {
                this.chartEl.resize();
                this.setLegendWidth();
            }).observe(container);
            this.chartEl.setOption<EChartsOption>(this.options);
            this.setLegendWidth();
        }
    }

    setUpOptions() {
        this.options = {
            grid: {
                containLabel: true,
                // width: '50%'
            },
            tooltip: {
                trigger: 'item',
            },
            xAxis: {
                show: true,
                type: 'category',
                data: this.labels.slice().reverse(),
                axisLabel: {
                    show: true,
                    interval: 0,
                    rotate: 45,
                },
                // max: 100,
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    type: 'bar',
                    showBackground: true,
                    backgroundStyle: {
                        color: 'rgba(220, 220, 220, 0.8)'
                    },
                    data: this.data.slice().reverse(),
                    color: this.colors.slice().reverse(),
                    barWidth: '50%',
                    barGap: '50%',
                    // barCategoryGap: '20%',
                    colorBy: 'data',
                    roundCap: true,
                    // label: {
                    //     show: true,
                    //     // Try changing it to 'insideStart'
                    //     position: 'start',
                    //     formatter: '{b}'
                    // },
                }
            ]
        }
    }

    setLegendWidth() {
        if (this.chart) {
            const container = this.chart.nativeElement;
            var width = container.offsetWidth;
            var fontSize = width / 30 + 'px';
            var legendWidth = width / 4 + 'px';
            // this.chartEl.setOption({
            //     textStyle: {
            //         fontSize: fontSize
            //     }
            // });

            // this.chartEl.setOption({
            //     legend: {
            //         width: legendWidth
            //     }
            // });
        }
    }
}
