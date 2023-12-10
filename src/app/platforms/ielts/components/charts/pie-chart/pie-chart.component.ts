import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';

import type { EChartsOption, ECharts } from 'echarts';
import { init } from 'echarts';
import { getInstanceByDom, connect } from 'echarts';

@Component({
    selector: 'app-pie-chart',
    templateUrl: './pie-chart.component.html',
    styleUrls: ['./pie-chart.component.less']
})
export class PieChartComponent implements AfterViewInit {

    @ViewChild('chart') chart!: ElementRef;

    @Input() labels: string[] = [];
    @Input() data: number[] = [];
    @Input() colors: string[] = [];

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
            tooltip: {
                trigger: 'item'
                // axisPointer: { type: 'cross' }
            },
            angleAxis: {
                show: false,
                max: 100
            },
            radiusAxis: {
                show: false,
                type: 'category',
                data: this.labels.slice().reverse()
            },
            polar: {},
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
                    // barGap: '10%',
                    // barGap: '10%',
                    // barCategoryGap: '20%',
                    colorBy: 'data',
                    roundCap: true,
                    label: {
                        show: true,
                        // Try changing it to 'insideStart'
                        position: 'start',
                        formatter: '{b}'
                    },
                    coordinateSystem: 'polar'
                }
            ]
        };
    }

    setLegendWidth() {
        if (this.chart) {
            const container = this.chart.nativeElement;
            const width = container.offsetWidth;
            const fontSize = width / 15 + 'px';
            const legendWidth = width / 4 + 'px';
            this.chartEl.setOption({
                textStyle: {
                    fontSize: fontSize
                }
            });

            // this.chartEl.setOption({
            //     legend: {
            //         width: legendWidth
            //     }
            // });
        }
    }


}
