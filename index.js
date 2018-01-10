
window.onerror = function errorFunction(errorMsg, url, lineNumber) {
	setTimeout("location.reload(true)",60000);
}

var locations = ['Arvada Library',
    'Belmar Library','Columbine Library','Conifer Library',
    'Edgewater Library','Evergreen Library','Golden Library',
    'Lakewood Library','Standley Lake Library','Wheat Ridge Library'];
var slidesSeen = 0;
var currentSlide = 0;
var localbranch = "Lakewood Library";
var xmlDoc;
var slidesBeforeRefresh = 30;
var dateLoaded = new Date().getDate();
var timeOnSlide = 60; // in seconds

// get local branch from key value pair in url
var noShowList = ["Baby Time", "Family Time", "Toddler Time"];

var queryString = "";
if (window.location.search.length > 1) {
    queryString = window.location.search.substring(1);
	var elements = queryString.split ("&");
	var keyValues = {};
	for(var i in elements) { 
		var key = elements[i].split("=");
		if (key.length > 1) {
		  keyValues[decodeURIComponent(key[0].replace(/\+/g, " "))] = decodeURIComponent(key[1].replace(/\+/g, " "));
		}
	}
	localbranch = keyValues["branch"];
}

function getXML(){
    $.ajax({
        type: 'GET',
        dataType: "xml",
        cache: false,
        processData: true,
        crossDomain: true,
        jsonp: true, 
        async: false, 
        url: "https://jeffcolibrary.bibliocommons.com/events/rss/all?nocache=" + Math.random(),
        // converters: {"xml": jQuery.parseXML},
        success: function (responseData, textStatus, jqXHR) {
            xmlDoc = jqXHR.responseXML;
        },
        error: function (responseData, textStatus, errorThrown) {
            // alert('GET failed.');
        }
    });
}

// function getXML() {
// 	xhttp=new XMLHttpRequest();
// 	var url = "https://jeffcolibrary.bibliocommons.com/events/rss/all" + Math.random();
// 	xhttp.open("GET",url,true);
//     xhttp.send();
//     debugger;
// 	xmlDoc=xhttp.responseXML;
// }

function refreshSlides(collapseseries) {

var todaysDate = new Date().getDate();
if (dateLoaded != todaysDate) {
	location.reload(true);
}

var titlesSeen = [];
var titleHasBeenSeen = false;
var title = "";
var titledaytime = "";
var newParent = document.createElement("div");
newParent.setAttribute("id","events");

getXML();

if(xmlDoc){
var x=xmlDoc.getElementsByTagName("item");
for (var i=0;i<x.length;i++) {

	// get event's branch
	
	if (x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","name")[0] && x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","name")[0].childNodes[0]) {
	
		var branch = x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","name")[0].childNodes[0].nodeValue;

	} else {
	
		branch = "";
	
	}
	
	if (branch == localbranch) {
	
		// Event ends less than an hour from now? If so, don't add slide.
		
		if (x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","end_date")[0] && x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","end_date")[0].childNodes[0]) {
		
			var oneHourFromNow = new Date();
			oneHourFromNow.setHours(oneHourFromNow.getHours()+1);
			var endDateToCheck = new Date(x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","end_date")[0].childNodes[0].nodeValue); 
			if (endDateToCheck < oneHourFromNow) {
				continue;
			}
		
		}
	
		// Has the event been cancelled?
			
		if (x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","is_cancelled")[0] && x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","is_cancelled")[0].childNodes[0] && x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","is_cancelled")[0].childNodes[0].nodeValue == "true") {
	
			continue;
		
		} 
		
		// Is the event full?
		
		if (x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","is_full")[0] && x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","is_full")[0].childNodes[0] && x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","is_full")[0].childNodes[0].nodeValue == "true") {
	
			continue;
		
		} 
            
        // if event is in the noShow List
        		
        if (x[i].getElementsByTagName("title")[0] && 
            (x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue.match(/Baby Time/i) ||
             x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue.match(/Toddler Time/i) || 
             x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue.match(/Family Time/i) ))
        {
	
			continue;
		
        }
		// Is this the first time we've seen this title/day/time? If not, don't make slide unless collapseseries = false
		
		if (collapseseries == true && x[i].getElementsByTagName("title")[0] && x[i].getElementsByTagName("title")[0].childNodes[0] && x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","start_date")[0] && x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","start_date")[0].childNodes[0]) {
			title = x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
			var eventdate = new Date(x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","start_date")[0].childNodes[0].nodeValue);
			var day = eventdate.getDay();
			var hour = eventdate.getHours();
			var minutes = eventdate.getMinutes();
			titledaytime = title + day + hour + minutes;
			if (titlesSeen.length == 0) {
				titlesSeen.push(titledaytime);
				} else {
					titleHasBeenSeen = false;
					for (var j=0;j<titlesSeen.length;j++) {
						if (titlesSeen[j] == titledaytime) {
							titleHasBeenSeen = true;
							continue;
						}			
					} // for
					if (titleHasBeenSeen == true) { 
						continue;
					} else {
						titlesSeen.push(titledaytime);
					}
				} // if titlesSeen.length == 0
			} // if title and start date exist

		// title/day/time is unique and neither canceled or full, so add slide

		var div = document.createElement("div");
		div.setAttribute("class","slide");
		newParent.appendChild(div);
		
		// add Upcoming Events header
		
		var h1 = document.createElement("h1");
    var logo = document.createElement("img");
		logo.setAttribute("src","http://cor-liv-cdn-static.bibliocommons.com/images/CO-JEFFERSON/logo.png");
		logo.setAttribute("class","logo");
		h1.appendChild(logo);
		var span = document.createElement("span");
		span.setAttribute("class","h1text");
		var prettybranch = localbranch;
		span.appendChild(document.createTextNode("Upcoming Events @ " + prettybranch));
		h1.appendChild(span);
		div.appendChild(h1);			
		
		var innerDiv = document.createElement("div");
		innerDiv.setAttribute("class","event");
		div.appendChild(innerDiv);
		
		// if event is happening today, add banner
		
		if (x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","start_date")[0] && x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","start_date")[0].childNodes[0]) {
		
			var eventdateforbanner = new Date(x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","start_date")[0].childNodes[0].nodeValue);
			var rightNow = new Date();
			if (eventdateforbanner.toDateString() == rightNow.toDateString()) {
			
				var today = document.createElement("div");
				today.setAttribute("class","today");
				today.appendChild(document.createTextNode("Today"));
				innerDiv.appendChild(today);
				
			}
			
		}
		
		title = x[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
		var h2 = document.createElement("h2");
		h2.appendChild(document.createTextNode(title));
		innerDiv.appendChild(h2);
		
		var endtime = "";
		var endhour = "";
		var endminutes = "";
		var endampm = "";
		
		if (x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","end_date")[0] && x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","end_date")[0].childNodes[0]) {
	
		var eventenddate = new Date(x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","end_date")[0].childNodes[0].nodeValue);
		
		endhour = eventenddate.getHours();
		endminutes = eventenddate.getMinutes();
		endampm = " a.m.";
		var endseparator = ":";
		if (endhour == 12 && endminutes == 0) {
			endhour = "noon";
			endminutes = "";
			endampm = "";
			endseparator = "";
		} else if (endhour == 23 & endminutes == 59) {
			endhour = "";
			endminutes = "";
			endampm = ""
			endseparator = "";
		} else {
			if (endhour == 12 && endminutes > 0) {
				endampm = " p.m.";
			}
			if (endhour > 12) {
				endhour = endhour - 12;
				endampm = " p.m.";
			}
			if (endminutes < 10) {
				endminutes = "0" + endminutes;
			}
		}
		endtime = endhour + endseparator + endminutes + endampm;
		
		} // if enddate
		
		if (x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","start_date")[0] && x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","start_date")[0].childNodes[0]) {
		
			var eventdate = new Date(x[i].getElementsByTagNameNS("http://bibliocommons.com/rss/1.0/modules/event/","start_date")[0].childNodes[0].nodeValue);
			var daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
			var day = daysOfWeek[eventdate.getDay()];
			var monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			var month = monthsOfYear[eventdate.getMonth()];
			var date = eventdate.getDate();
			var dateDiv = document.createElement("div");
			dateDiv.setAttribute("class","date");
			dateDiv.appendChild(document.createTextNode(day + ", " + month + " " + date));
			innerDiv.appendChild(dateDiv);
			
			var hour = eventdate.getHours();
			var minutes = eventdate.getMinutes();
			var ampm = " a.m.";
			var separator = ":";
			if (hour == 12 && minutes == 0) {
				hour = "Noon";
				minutes = "";
				ampm = "";
				separator = "";
			} else if (hour == 0 & minutes == 0) {
				hour = "All Day";
				minutes = "";
				ampm = ""
				separator = "";
			} else {
				if (hour == 12 && minutes > 0) {
					ampm = " p.m.";
				}
				if (hour > 12) {
					hour = hour - 12;
					ampm = " p.m.";
				}
				if (minutes < 10) {
					minutes = "0" + minutes;
				}
			}
			if ((hour == endhour) && (minutes == endminutes) && (ampm == endampm)) {
				endtime = "";
				endampm = "";
			}
			if (ampm == endampm) {
				ampm = "";
			}
			if (endtime.length > 0) {
				endtime = " to " + endtime;
			}
			var timeDiv = document.createElement("div");
			timeDiv.setAttribute("class","time");
			timeDiv.appendChild(document.createTextNode(hour + separator + minutes + ampm + endtime));
			innerDiv.appendChild(timeDiv);
		
		} // if startdate
		
		if (x[i].getElementsByTagName("description")[0] && x[i].getElementsByTagName("description")[0].childNodes[0]) {
			var description = x[i].getElementsByTagName("description")[0].childNodes[0].data;
			description = description.replace(/Display: Block/igm, "display: none");
			var descriptionDiv = document.createElement("div");
			descriptionDiv.setAttribute("class","description");
			descriptionDiv.innerHTML = description;
			var fade = document.createElement("div");
			fade.setAttribute("class","fadeout");
			descriptionDiv.appendChild(fade);
			innerDiv.appendChild(descriptionDiv);
		
		
		} // if description
		
	} // if branch = localBranch

} // for loop to cycle through events in feed

}
// replace slides

var oldParent = document.getElementById("events");
document.getElementsByTagName("body")[0].replaceChild(newParent,oldParent);

// check number of slides; if one slide, try expanding series (unless we've already tried this); if no slides, add welcome slide

if (!document.getElementById("events").childNodes[0]) {
	var div = document.createElement("div");
	div.setAttribute("class","slide");
	
	var h1 = document.createElement("h1");
	var logo = document.createElement("img");
	logo.setAttribute("src","https://cor-liv-cdn-static.bibliocommons.com/images/CO-JEFFERSON/logo.png");
	logo.setAttribute("class","logo");
	h1.appendChild(logo);
	var span = document.createElement("span");
	span.setAttribute("class","h1text");
	span.appendChild(document.createTextNode("Jefferson County Public Library"));
	h1.appendChild(span);
	div.appendChild(h1);
	
	var innerDiv = document.createElement("div");
	innerDiv.setAttribute("class","event");
	div.appendChild(innerDiv);
	
	var h2 = document.createElement("h2");
	h2.setAttribute("class","welcome");
	var welcomebranch = localbranch;
	// switch (welcomebranch){
	// 		case "Daley, Richard J.-Bridgeport":
	// 			welcomebranch = "Richard J. Daley Branch";
	// 			break;
	// 		case "Daley, Richard M.-W Humboldt":
	// 			welcomebranch = "Richard M. Daley Branch";
	// 			break;
	// 		case "Harold Washington Library Center":
	// 			break;
	// 		case "Sulzer Regional":
	// 			welcomebranch += " Library";
	// 			break;
	// 		case "Woodson Regional":
	// 			welcomebranch += " Library";
	// 			break;
	// 		default:
	// 			welcomebranch += " Branch";
	// 	}
	h2.appendChild(document.createTextNode("Welcome to the " + welcomebranch));
	innerDiv.appendChild(h2);
	
	document.getElementById("events").appendChild(div);
	
} else if (!document.getElementById("events").childNodes[1]) {
	if (collapseseries == true) {
		refreshSlides(false);
	}
}

// change font-size of h1 elements for very narrow screens

if (window.innerWidth && window.innerHeight) {
	if ((window.innerWidth / window.innerHeight) < 1.8) {
		h = document.getElementsByTagName("h1");
		for (var i=0;i<h.length;i++) {
			h[i].style.fontSize = "2.6vw";
		}
	}
}

return;

} // end of function refreshSlides

function changeSlides() {
	if (slidesSeen >= slidesBeforeRefresh) {
		refreshSlides(true);
		slidesSeen = 0;
		currentSlide = 0;
	}
	var slides = document.getElementsByClassName("slide");
	slides[currentSlide].style.display = "block";
	if (slides.length > 1) {
		if (currentSlide == 0) {
			slides[slides.length-1].style.display = "none";
		} else {
			slides[currentSlide-1].style.display = "none";
		}
		if (currentSlide < (slides.length-1)) {
			currentSlide++;
		} else {
			currentSlide = 0;
		}
	}
	slidesSeen++
}

refreshSlides(true);
changeSlides();
setInterval("changeSlides()",timeOnSlide*1000);