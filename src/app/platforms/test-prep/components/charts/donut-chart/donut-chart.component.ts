import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {ECharts, EChartsOption, init} from "echarts";

@Component({
    selector: 'app-donut-chart',
    templateUrl: './donut-chart.component.html',
    styleUrls: ['./donut-chart.component.less']
})
export class DonutChartComponent {
    @ViewChild('chart') chart!: ElementRef;

    @Input('labels') labels: string[] = [];
    @Input('data') data: any[] = [];
    @Input('colors') colors: string[] = [];
    @Input('name') name: string = '';

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
            },
            series: [
                {
                    type: 'pie',
                    radius: ['40%', '70%'],
                    width: '100%',
                    height: '100%',
                    left: 'center',
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    name: this.name,
                    label: {
                        alignTo: 'edge',
                        formatter: function (params: any) {
                            return `${params.name}\n${params.percent}%`;
                        },
                        minMargin: 5,
                        edgeDistance: 10,
                        lineHeight: 15,
                        rich: {
                            time: {
                                fontSize: 10,
                                color: '#999'
                            }
                        }
                    },
                    labelLine: {
                        length: 15,
                        length2: 0,
                        maxSurfaceAngle: 80
                    },
                    labelLayout: (params: any) => {
                        const isLeft = params.labelRect.x < this.chartEl.getWidth() / 2;
                        const points = params.labelLinePoints;
                        // Update the end point.
                        points[2][0] = isLeft
                            ? params.labelRect.x
                            : params.labelRect.x + params.labelRect.width;
                        return {
                            labelLinePoints: points
                        };
                    },
                    data: this.data
                }
            ]
        };
    }

    setLegendWidth() {
        if (this.chart) {
            const container = this.chart.nativeElement;
            var width = container.offsetWidth;
            var fontSize = width / 15 + 'px';
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
