var socket = io.connect();
var iosData = {};
var socketData = {};
var users = {};
var userCol = {};
var nX, nY, nZ, gA, gB, gG, arA, arB, arG;
var pad = 20;

var chartData = {
    a: [],
    b: [],
    g: []
};

var freq = 100;

$(document).ready(function() {
    var bot = document.getElementById('sources').offsetHeight;
    var top = document.getElementById('header').offsetHeight;
    
    document.getElementById('printData').style.top = top+'px';
    var cnvW = window.innerWidth;
    var cnvH = window.innerHeight - bot - top;
    console.log(cnvW-pad+', '+cnvH-pad);
    
    //freq = cnvW;
    
    $('#chart').width(cnvW).height(cnvH);
    
    //$('#chart').attr('width',cnvW).attr('height',cnvH);
    
    // setup control widget
    //soundBeep = document.getElementById('beep');

    // setup plot
    var defaultOptions = {
        series: {
            color: 'rgb(255,255,255)',
            shadowSize: 0,
        },
        // drawing is faster without shadows
        yaxis: {
            min: -400,
            max: 400
        },
        xaxis: {
            show: false
        }
    };

    //call Flot plot
    chart = $.plot($('#chart'), [clearData()], defaultOptions);
});

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

socket.on('useradded', function(username, data){
    $.each(data, function(key, value){
        userCol[key] = value;
    });
    $("#data-"+username).css("color","rgb("+parseInt(userCol['r']*255)+","+parseInt(userCol['g']*255)+","+parseInt(userCol['b']*255)+")");
});

socket.on('mobileData', function(username, data){
    var divTxt  = "<p>Tracking : " + username + "</p>";
    
    $.each(data, function(key, value){
        iosData[key] = value;
        divTxt += "<p>"+key+" : " + value + "</p>";
        
    });
    
    $('#data-'+username).html(divTxt);
    
    chart.setData([{                                                                                                                      
        label:'Alpha',
        data: setNew('a', iosData['alpha']),
        lines: { show: true, fill: false },
        color:"rgb(200,0,0)",
        },{
        label:'Beta',
        data: setNew('b', iosData['beta']),
        lines: { show: true, fill: false },
        color:"rgb(0,0,200)",
        },{
        label:'Gamma',
        data: setNew('g', iosData['gamma']),
        lines: { show: true, fill: false },
        color:"rgb(0,200,0)",
    }]);
    
    chart.draw();
    
    nX = iosData['x'];
    nY = iosData['y'];
    nZ = iosData['z'];
    //r = abs(nZ)*10;  // possibly for 3D effect?
    
    gA = iosData['alpha'];
    gB = iosData['beta'];
    gG = iosData['gamma'];
    
    arA = iosData['ar'] / 100;
    arB = iosData['br'] / 100;
    arG = iosData['gr'] / 100;
    
    s = iosData['s'];
    
});

socket.on('end', function(username, data){
    $.each(iosData, function(key, value){
        iosData[key] = 0;
    });
    chart.setData([clearData()]);
    chart.draw();
    console.log(iosData);
});