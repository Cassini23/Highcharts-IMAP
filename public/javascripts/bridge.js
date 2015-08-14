document.addEventListener('DOMContentLoaded',function(){
    var doc = document.querySelector('div.container');
    var sub = document.querySelector('#submit');
    var email = document.querySelector('#email');
    var pwd = document.querySelector('#password');
    sub.addEventListener('click',function(){
        var Obj = {};
        Obj.email = email.value;
        Obj.pwd = pwd.value;
        doc.style.display = 'none';
        makeAJAXCall('POST','/gmailRoute', Obj);
    });
});

/**
 * @function makeAJAXCall
 * @param HTTPVerb
 * @param url
 * @param data
 */
function makeAJAXCall(HTTPVerb, url, data){
    var xhr = new XMLHttpRequest();
    xhr.open(HTTPVerb, url);
    if(HTTPVerb === 'POST') xhr.setRequestHeader('content-type','application/json');
    xhr.addEventListener('readystatechange', function(){
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                //returned data
                //console.log(xhr.responseText);
                processThis(JSON.parse(xhr.responseText));
            }
        }
    });
    HTTPVerb === 'POST' ? xhr.send(JSON.stringify(data)) : xhr.send();
}

/**
 * @function createElement
 * @param elementType
 * @param parent
 * @param className
 * @param innerHTML
 * @param custom
 * @returns {HTMLElement}
 */
function createElement(elementType, parent, className, innerHTML, custom) {
   var element = document.createElement(elementType);
   if (parent) parent.appendChild(element);
   if (className) element.className = className;
   if (innerHTML) element.innerHTML = innerHTML;
   if (typeof custom !== 'undefined') {
       for (var prop in custom) {
           element.setAttribute(prop, custom[prop]);
       }
   }
   return element;
}

/**
 * @function processThis
 * @param data
 */
function processThis(data){
    var obj ={};
    obj.read=0;
    obj.unread = 0;
    obj.attach = 0;
    obj.noAttach = 0;
    obj.mimeTypes = [];
    data.forEach(function(item){
        if(item['attr']['flags'].indexOf('\\Seen') === -1 ){
            obj.unread++;
        }
        else obj.read++;

        //attachments
        var att = [];
        if(item.attr.struct.length > 1) {
            item['attr']['struct'].forEach(function(subitem){
                if(subitem[0] && subitem[0].disposition && subitem[0].disposition.type === 'attachment') {
                    att.push({type: subitem[0].subtype, filename: subitem[0].disposition.params.filename});
                    obj.mimeTypes.push(subitem[0].subtype);
                }
            });
        }
        att.length === 0 ? obj.noAttach++ : obj.attach++;

    });

    var body = document.querySelector('body');
    var readUnread = createElement('div', body,'readUnread',null, null);
    createPie(readUnread, 'Read vs Unread',[{name: "Read", y: obj.read},{name:"Unread", y:obj.unread}]);

    var attachments = createElement('div', body,'attachments',null, null);
    createPie(attachments, 'Mails with attachments vs No attachments',
        [{name: "Attachments", y: obj.attach},{name:"No Attachments", y:obj.noAttach}]);
    //console.log(obj);
    var mimesArr = [];
    var mimeObj ={};
    obj.mimeTypes.map(function(item){
        console.log('mime ',item);
        if(mimeObj[item]){
            mimeObj[item]++;
        }
        else mimeObj[item] = 1;
    });

    for(var prop in mimeObj){
        mimesArr.push({
            name: prop,
            y: mimeObj[prop]
        });
    }
   // console.log(mimesArr);
    var mimes = createElement('div',body,'mimeTypes',null,null);
    createPie(mimes,'Mime types', mimesArr);
}

/**
 * @function createPie
 * @param element
 * @param chartTitle
 * @param data
 */
function createPie(element, chartTitle ,data){
    $(function () {
        $(element).highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: chartTitle
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            series: [{
                name: chartTitle,
                data: data
            }]

        });
    });
}


