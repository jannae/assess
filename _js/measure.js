var socket = io.connect();
var iosData = {};
var socketData = {};
var users = {};
var dataShow = {};
var lineColor = {};
var nX, nY, nZ, gA, gB, gG, arA, arB, arG;
var pad = 20;

var chartData = {
    x: [],
    y: [],
    z: [],
    ar: [],
    br: [],
    gr: [],
    a: [],
    b: [],
    g: []
};

var thresh = {};

var freq = 100;
var xAxMin = 0;
var xAxMax = freq;
var yAxMin = -400;
var yAxMax = 400;

$(document).ready(function() {
    var bot = document.getElementById('sources').offsetHeight;
    var top = document.getElementById('header').offsetHeight;
    
    document.getElementById('printData').style.top = top+'px';
    var cnvW = window.innerWidth;
    var cnvH = window.innerHeight - bot - top;
    console.log(cnvW-pad+', '+cnvH-pad);
    
    //freq = cnvW;
    
    $('#chart').width(cnvW).height(cnvH); 
    
    // soundBeep = document.getElementById('beep');

    // setup plot
    var defaultOptions = {
        series: {
            color: 'rgb(255,255,255)',
            shadowSize: 0,
        },  // drawing is faster without shadows
        yaxis: {
            min: yAxMin,
            max: yAxMax
        },
        xaxis: {
            min: xAxMin,
            max: xAxMax,
            show: false
        }
    };

    //call Flot plot
    chart = $.plot($('#chart'), [clearData()], defaultOptions);
});

// function threshold(id,h,l) {
//     thresh[id] = { 'h' : h, 'l' : l };
//     thresh.push(thresh[id]);
//     console.log(thresh);
//     return thresh;
// }

function setNew(item, d) {
    if (chartData[item].length > 0) {
        chartData[item] = chartData[item].slice(1);
        chartData[item].push(d);
    }
    //console.log('setting',d);
    // zip the generated y values with the x values
    var res = [];
    for (var i = 0; i < chartData[item].length; ++i) {
        res.push([i, chartData[item][i]]); //[x1,y1],[x2,y2],etc
    }
    return res;
}

function clearData() {
    // fill remaining array empty elements with zeros. fill it up.
    while (chartData.g.length < freq) {
        chartData.x.push(0);
        chartData.y.push(0);
        chartData.z.push(0);
        chartData.ar.push(0);
        chartData.br.push(0);
        chartData.gr.push(0);
        chartData.a.push(0);
        chartData.b.push(0);
        chartData.g.push(0);
    }

    //this array is just to prefill the chart before any activity takes place.
    var res = [];
    for (var i = 0; i < chartData.g.length; ++i){
        res.push([i, chartData.g[i]]);
    }
    return res;
}

function esc(msg) {
    return msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
    

socket.on('updateusers', function(data) {
    $('#printData').empty();
    $.each(data, function(key, value) {
        users[key] = value;
        $('<div/>', {'id' : 'data-'+value } ).appendTo('#printData');
    });
});

socket.on('useradded', function(username, data, colors){
    $.each(data, function(key, value){
        dataShow[key] = value;
    });
    $.each(colors, function(key, value){
        lineColor[key] = value;
    });
});

socket.on('mobileData', function(username, data){
    var divTxt  = "<p>Tracking : " + username + "</p>";
    
    $.each(data, function(key, value){
        iosData[key] = value;
        
        if(dataShow[key] == true) {
            divTxt += '<div id="print-'+key+'" style="color: '+lineColor[key]+'">'+key+' : ' + value + '</div>';
        }
        console.log('#print-'+key+': '+lineColor[key]);
    });
    
    $('#data-'+username).html(divTxt);
    
    chart.setData([{                                                                                                                      
        label:'X-Axis Acceleration',
        data: setNew('x', iosData['x']),
        lines: { show: dataShow['x'], fill: false },
        color: lineColor['x'],
        },{
        label:'Y-Axis Acceleration',
        data: setNew('y', iosData['y']),
        lines: { show: dataShow['y'], fill: false },
        color: lineColor['y'],
        },{
        label:'Z-Axis Acceleration',
        data: setNew('z', iosData['z']),
        lines: { show: dataShow['z'], fill: false },
        color: lineColor['z'],
        },{
        label:'Alpha Acceleration at Rotation',
        data: setNew('ar', iosData['ar']),
        lines: { show: dataShow['ar'], fill: false },
        color: lineColor['ar'],
        },{
        label:'Beta Acceleration at Rotation',
        data: setNew('br', iosData['br']),
        lines: { show: dataShow['br'], fill: false },
        color: lineColor['br'],
        },{
        label:'Gamma Acceleration at Rotation',
        data: setNew('gr', iosData['gr']),
        lines: { show: dataShow['gr'], fill: false },
        color: lineColor['gr'],
        },{                                                                                                                    
        label:'Alpha',
        data: setNew('a', iosData['a']),
        lines: { show: dataShow['a'], fill: false },
        color: lineColor['a'],
        },{
        label:'Beta',
        data: setNew('b', iosData['b']),
        lines: { show: dataShow['b'], fill: false },
        color: lineColor['b'],
        },{
        label:'Gamma',
        data: setNew('g', iosData['g']),
        lines: { show: dataShow['g'], fill: false },
        color: lineColor['c'],
    }]);
    
    chart.draw();

    // if (data.data.x > 7 || data.data.x < -7) {
    //     console.log('triggering x');
    //     //command to play audio
    //     soundBeep.play();
    // } else {
    //     //pause audio if values aren't outside of the threshold
    //     soundBeep.pause();
    // }
});

socket.on('end', function(username, data){
    $.each(iosData, function(key, value){
        iosData[key] = 0;
    });
    chart.setData([clearData()]);
    chart.draw();
    console.log(iosData);
});