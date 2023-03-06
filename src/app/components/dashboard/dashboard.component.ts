import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../services/api.service";
import {lastValueFrom} from "rxjs";
import {Config} from "../../config";
import { EChartsOption } from 'echarts';

var light_grey = '#f9fafd';
var grey = '#d8e2ef';
var dark_grey = '#4d5969';
var light_primary = '#27bcfd';
var primary = '#2c7be5';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less']
})

export class DashboardComponent implements OnInit {

    user: any;
    company_admin = false;

    gettingDashboard = false;

    results: any = [];
    results_type = '';
    company_total_prompts = -1;
    company_total_users = -1;
    total_user_prompts = -1;
    user_prompts: any = [];
    company_users: any = [];
    company_top_prompt_users: any = [];
    company_top_privacy_prompt_users: any = [];
    companies: any = [];

    weeklySalesOptions: EChartsOption = {};
    totalOrdersOptions: EChartsOption = {};
    marketShareOptions: EChartsOption = {};
    totalSalesOptions: EChartsOption = {};

    constructor(
        private config: Config,
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
        });
        this.getDashBoard();
    }

    setUpCharts() {
        var getPosition = function getPosition(pos: any, params: any, dom: any, rect: any, size: any) {
            return {
                top: pos[1] - size.contentSize[1] - 10,
                left: pos[0] - size.contentSize[0] / 2
            };
        };
        var getFormatter = function(params: any) {
            return params.map(function (_ref18: any, index: any) {
                var value = _ref18.value,
                    borderColor = _ref18.borderColor;
                return "<span class= \"fas fa-circle\" style=\"color: ".concat(borderColor, "\"></span>\n    <span class='text-600'>").concat(index === 0 ? 'Last Month' : 'Previous Year', ": ").concat(value, "</span>");
            }).join('<br/>');
        }
        this.weeklySalesOptions= {
            xAxis: {
                type: 'category',
                data: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                boundaryGap: false,
                axisLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisPointer: {
                    type: 'none'
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisPointer: {
                    type: 'none'
                }
            },
            series: [
                {
                    data: [120, 200, 150, 80, 70, 110, 120],
                    type: 'bar',
                    showBackground: true,
                    backgroundStyle: {
                        borderRadius: 10
                    },
                    barWidth: '5px',
                    itemStyle: {
                        borderRadius: 10,
                        color: primary
                    },
                    z: 10,
                    emphasis: {
                        itemStyle: {
                            color: primary
                        }
                    }
                },
            ],
            grid: {
                right: 5,
                left: 10,
                top: 0,
                bottom: 0
            }
        };
        this.totalOrdersOptions = {
            tooltip: {
                triggerOn: 'mousemove',
                trigger: 'axis',
                padding: [7, 10],
                formatter: '{b0}: {c0}',
                backgroundColor: light_grey,
                borderColor: grey,
                textStyle: {
                    color: dark_grey
                },
                borderWidth: 1,
                transitionDuration: 0,
                position: function position(pos, params, dom, rect, size) {
                    return getPosition(pos, params, dom, rect, size);
                }
            },
            xAxis: {
                type: 'category',
                data: ['Week 4', 'Week 5', 'Week 6', 'Week 7'],
                boundaryGap: false,
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: false,
                    lineStyle: {
                        color: grey,
                        type: 'dashed'
                    }
                },
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisPointer: {
                    type: 'none'
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisPointer: {
                    show: false
                }
            },
            series: [{
                type: 'line',
                lineStyle: {
                    color: primary,
                    width: 3
                },
                itemStyle: {
                    color: '#fff',
                    borderColor: primary,
                    borderWidth: 2
                },
                // hoverAnimation: true,
                data: [20, 40, 100, 120],
                // connectNulls: true,
                smooth: 0.6,
                smoothMonotone: 'x',
                showSymbol: false,
                symbol: 'circle',
                symbolSize: 8,
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0,
                            color: 'rgba(44, 123, 229, .25)'
                        }, {
                            offset: 1,
                            color: 'rgba(44, 123, 229, 0)'
                        }]
                    }
                }
            }],
            grid: {
                bottom: '2%',
                top: '0%',
                right: '10px',
                left: '10px'
            }
        }
        this.marketShareOptions = {
            color: [primary, light_primary, grey],
            tooltip: {
                trigger: 'item',
                padding: [7, 10],
                backgroundColor: light_grey,
                borderColor: grey,
                textStyle: {
                    color: dark_grey
                },
                borderWidth: 1,
                transitionDuration: 0,
                formatter: function formatter(params: any) {
                    return "<strong>".concat(params.data.name, ":</strong> ").concat(params.percent, "%");
                }
            },
            position: function position(pos: any, params: any, dom: any, rect: any, size: any) {
                return getPosition(pos, params, dom, rect, size);
            },
            legend: {
                show: false
            },
            series: [{
                type: 'pie',
                radius: ['100%', '87%'],
                avoidLabelOverlap: false,
                // hoverAnimation: false,
                itemStyle: {
                    borderWidth: 2,
                    borderColor: light_grey
                },
                label: {
                    // normal: {
                    // show: false,
                    // position: 'center',
                    // textStyle: {
                    //     fontSize: '20',
                    //     fontWeight: '500',
                    //     color: light_grey
                    // }
                    // },
                    // emphasis: {
                    //     show: false
                    // }
                },
                labelLine: {
                    show: false
                },
                data: [{
                    value: 5300000,
                    name: 'Samsung'
                }, {
                    value: 1900000,
                    name: 'Huawei'
                }, {
                    value: 2000000,
                    name: 'Apple'
                }]
            }]
        }
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var monthsnumber = [[60, 80, 60, 80, 65, 130, 120, 100, 30, 40, 30, 70], [100, 70, 80, 50, 120, 100, 130, 140, 90, 100, 40, 50], [80, 50, 60, 40, 60, 120, 100, 130, 60, 80, 50, 60], [70, 80, 100, 70, 90, 60, 80, 130, 40, 60, 50, 80], [90, 40, 80, 80, 100, 140, 100, 130, 90, 60, 70, 50], [80, 60, 80, 60, 40, 100, 120, 100, 30, 40, 30, 70], [20, 40, 20, 50, 70, 60, 110, 80, 90, 30, 50, 50], [60, 70, 30, 40, 80, 140, 80, 140, 120, 130, 100, 110], [90, 90, 40, 60, 40, 110, 90, 110, 60, 80, 60, 70], [50, 80, 50, 80, 50, 80, 120, 80, 50, 120, 110, 110], [60, 90, 60, 70, 40, 70, 100, 140, 30, 40, 30, 70], [20, 40, 20, 50, 30, 80, 120, 100, 30, 40, 30, 70]];
        this.totalSalesOptions = {
            color: light_grey,
            tooltip: {
                trigger: 'axis',
                padding: [7, 10],
                backgroundColor: light_grey,
                borderColor: grey,
                textStyle: {
                    color: dark_grey
                },
                borderWidth: 1,
                formatter: function formatter(params) {
                    return getFormatter(params);
                },
                transitionDuration: 0,
                position: function position(pos, params, dom, rect, size) {
                    return getPosition(pos, params, dom, rect, size);
                }
            },
            xAxis: {
                type: 'category',
                data: ['2019-01-05', '2019-01-06', '2019-01-07', '2019-01-08', '2019-01-09', '2019-01-10', '2019-01-11', '2019-01-12', '2019-01-13', '2019-01-14', '2019-01-15', '2019-01-16'],
                boundaryGap: false,
                axisPointer: {
                    lineStyle: {
                        color: grey,
                        type: 'dashed'
                    }
                },
                splitLine: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        // color: utils.getGrays()['300'],
                        color: 'rgba(0, 0, 0, 0.01)',
                        type: 'dashed'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: grey,
                    formatter: function formatter(value) {
                        var date = new Date(value);
                        return "".concat(months[date.getMonth()], " ").concat(date.getDate().toString());
                    },
                    margin: 15
                }
            },
            yAxis: {
                type: 'value',
                axisPointer: {
                    show: false
                },
                splitLine: {
                    lineStyle: {
                        color: grey,
                        type: 'dashed'
                    }
                },
                boundaryGap: false,
                axisLabel: {
                    show: true,
                    color: grey,
                    margin: 15
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                }
            },
            series: [{
                type: 'line',
                data: monthsnumber[0],
                lineStyle: {
                    color: 'rgba(44, 123, 229, 1)'
                },
                itemStyle: {
                    borderColor: 'rgba(44, 123, 229, 1)',
                    borderWidth: 2
                },
                symbol: 'circle',
                symbolSize: 10,
                smooth: false,
                // hoverAnimation: true,
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0,
                            color: 'rgba(44, 123, 229, .2)'
                        }, {
                            offset: 1,
                            color: 'rgba(44, 123, 229, 0)'
                        }]
                    }
                }
            }],
            grid: {
                right: '28px',
                left: '40px',
                bottom: '15%',
                top: '5%'
            }
        }
    }
    async getDashBoard() {
        this.gettingDashboard = true;
        const response: any = await lastValueFrom(this.apiService.getDashboard());
        this.gettingDashboard = false;
        console.log('response', response)
        this.results = response;
        this.total_user_prompts = response.total_user_prompts;
        this.user_prompts = response.user_prompts;

        this.results_type = response.results_type;
        this.company_admin = response.company_admin;

        // for company admin or user only
        this.company_total_prompts = response.company_total_prompts;

        // for company admin only
        this.company_total_users = response.company_total_users;
        this.company_users = response.company_users;
        this.company_top_prompt_users = response.company_top_prompt_users;
        this.company_top_privacy_prompt_users = response.company_top_privacy_prompt_users;

        // for gaia admin only
        this.companies = response.companies;

        for (let i = 0; i < 10; i++) {
            if (this.company_users && this.company_users.length < 10) {
                this.company_users.push({email: 'test'})
            }
            if (this.company_top_prompt_users && this.company_top_prompt_users.length < 10) {
                this.company_top_prompt_users.push({user__email: 'test', count: 1})
            }
            if (this.company_top_privacy_prompt_users && this.company_top_privacy_prompt_users.length < 10) {
                this.company_top_privacy_prompt_users.push({user__email: 'test', count: 1})
            }
            if (this.companies && this.companies.length < 10) {
                this.companies.push({name: 'test', domain: 'test.com'})
            }
        }

        this.setUpCharts();
    }

}
