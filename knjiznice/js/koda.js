"use strict";
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
var myPatients = [];
var patientList = [{ime: "Miha", priimek: "Novak", datumRojstva : "1982-7-18T19:30" },
                    {ime: "Anita", priimek: "Šter", datumRojstva : "1999-9-12T11:30" },
                    {ime: "Marko", priimek: "Godunc", datumRojstva : "1946-1-22T13:42" }];
                    
var vprasanja = [{patient: patientList[0], tekst: "lep pozdrav . zanima me namreč imava s punco oba isto krvno skupino in sicer 0 negativno.. odločili smo se da bi imeli otroka..ali bo vse normalno z otrokom?\nlp hvala za odgovor", id: "1"},
                {patient: patientList[1], tekst: "Imam subserozni miom, ki mi povzroča zelo močne krvavitve. Močno krvavim že 14 dni, zato mi je ginekolog predpisal primolut forte. Zanima me če bo po jemanju teh tablet, krvavitev ponehala in bodo naslednji ciklusi normalni?", id: "2"},
                {patient: patientList[2], tekst: "Pozdravljeni !\n Mene pa zanima ,kaj pomeni diagnoza ARTHRALGIA OME DEX.\nHvala in lep pozdrav!", id: "3"},
                {patient: patientList[1], tekst: "Pred enim mesecem se je partnerju na spolovilu pojavila bulica belkaste barve, trda na otip. Ob dotiku ne čuti bolečine in nima drugih težav, ne z uronoranjem ne med erekcijo. Zanima me kaj bi to bilo.", id: "4"},
                ];
                    
                    
var kreiranjeUspelo = false;


$(document).ready(function(){
    sectionButtonClick(0);
    getPacients();
    drawVprasanja();
});


function zbrisi(pacient) {
    console.log(pacient);
    var id = pacient.partyId;
    setSessionId();
    $.ajax({
        url: baseUrl + "/demographics/party/" + id,
        type: 'DELETE',
        success: function(res) {
            console.log("Deleted pacient: " + res);
            getPacients();
        },
	    error: function(err) {
	        console.log(err);
	    }
        
    });
}


function getPacients() {
    setSessionId();
    var searchData = [
        {key: "app_id", value: "eZdravnikBase"},
    ];
    
    $.ajax({
        url: baseUrl + "/demographics/party/query",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(searchData),
        success: function (res) {
            myPatients = [];
            drawPatients(myPatients);
            if(!res) return;
            for (var i in res.parties) {
                var party = res.parties[i];
                var ehrId;
                for (var j in party.partyAdditionalInfo) {
                    if (party.partyAdditionalInfo[j].key === 'ehrId') {
                        ehrId = party.partyAdditionalInfo[j].value;
                        break;
                    }
                }
                var pacient = {ime: party.firstNames, priimek: party.lastNames, datumRojstva: party.dateOfBirth, id: ehrId, partyId: party.id};
                myPatients.push(pacient);
                drawPatients(myPatients);
            }
        }
    });
}

function odgovoriClick(id) {
    var odgovor = $("#form" + id).val();
    if(!odgovor || odgovor.trim().length == 0) {
        drawAlertDiv("warning", "Prosim vnesite odgovor!");
    } else {
        drawAlertDiv("success", "Odgovor poslan");
        var index = vprasanja.indexOf(id);
        vprasanja.splice(index, 1);
        drawVprasanja();
    }

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function dodajVitalneZnakePacientu(ehrId) {
    for(var i = 0; i < 4; i++) {
        var today = new Date();
        var visina = getRandomInt(160, 210);
        var teza =   visina - (100);
        var temperatura = getRandomInt(36,41);
        var sys = getRandomInt(80,200);
        var dis = getRandomInt(50,140);
        var nasicenost = getRandomInt(30,99);
        var merilec = "Jožica Božiza";
        dodajMeritveVitalnihZnakov(ehrId,today,visina,teza,temperatura,sys,dis,nasicenost,merilec);
    }
}

function dodajMeritveVitalnihZnakov(ehrId, datum, visina, teza, temperatura, sys, dis, nasicenost, merilec) {
    if(!ehrId  || ehrId.trim().length == 0) return;
    setSessionId();
	var podatki = {
		// Struktura predloge je na voljo na naslednjem spletnem naslovu:
  // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
	    "ctx/language": "en",
	    "ctx/territory": "SI",
	    "ctx/time": datum,
	    "vital_signs/height_length/any_event/body_height_length": visina,
	    "vital_signs/body_weight/any_event/body_weight": teza,
	   	"vital_signs/body_temperature/any_event/temperature|magnitude": temperatura,
	    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
	    "vital_signs/blood_pressure/any_event/systolic": sys,
	    "vital_signs/blood_pressure/any_event/diastolic": dis,
	    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenost
	};
	
	var parametriZahteve = {
	    ehrId: ehrId,
	    templateId: 'Vital Signs',
	    format: 'FLAT',
	    committer: merilec
	};
	
	$.ajax({
	    url: baseUrl + "/composition?" + $.param(parametriZahteve),
	    type: 'POST',
	    contentType: 'application/json',
	    data: JSON.stringify(podatki),
	    success: function (res) {
	        console.log("Uspešno dodani vitalni znaki");
	    },
	    error: function(err) {
	        console.log("Error adding vital signs: " + JSON.parse(err.responseText).userMessage + "'!" );
	    }
	});
}



function pacientClick(pacient) {
    $("#patientContainerWrap").hide();
    $("#patient-add").hide();
    $("#vprasanja").hide();
    $("#master-detail").hide();
    $("#patient-detail").show();
    drawGeneralInfo(pacient);
}

function drawGeneralInfo(pacient) {
    $("#pacient-name").text(pacient.ime + "  " + pacient.priimek);
    $("#pacient-date").text("Datum rojstva:  " + pacient.datumRojstva);
    $("#pacient-ehrid").text("ehrId pacienta:  " + pacient.id);
}


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function setSessionId() {
    var sessionId = getSessionId();
    $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
	});
}


function getAlertDiv(type, text) {
    return '<div class="alert alert-' + type + ' alert-dismissible alert-messages" role="alert">' + 
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + 
            text +
            '</div';
}

function drawAlertDiv(type, text) {
    var alertDiv = getAlertDiv(type,text);
    var container = $("div.container-fluid");
    container.prepend(alertDiv);
    setTimeout(function(){
        $("div.alert-dismissible").remove();
    }, 2000);
}

function drawVprasanja() {
    var vprasanjaDiv = $("#vprasanjaContainer");
    vprasanjaDiv.empty();
    for(var i = 0; i < vprasanja.length; i++) {
        drawVprasanje(vprasanja[i])
    }
    if(vprasanja.length == 0) drawBrezVprasanj();
}

function drawBrezVprasanj() {
    var vprasanjaDiv = $("#vprasanjaContainer");
    vprasanjaDiv.append('<h2 class="margin-center">Trenutno nimate nobenih vprašanj. Poizkusite znova kasneje.</h2>')
}

function drawVprasanje(vprasanje) {
    var vprasanjaDiv = $("#vprasanjaContainer");
    var pac = vprasanje.patient;
    vprasanjaDiv.append('<div class="padding-small"><p><b>'+ pac.ime + " " + pac.priimek + '</b>:  ' + vprasanje.tekst + '</p><textarea class="form-control" id="form' + vprasanje.id + '" rows="3" placeholder="Vnesi odgovor"></textarea><button type="button" class="margin-small btn btn-success right-alignn" onclick="odgovoriClick(' + vprasanje.id + ')">Odgovori</button></div>');
}




function drawPatients(patients) {
    
    function dodajClicke(el, patient) {
        el.find("button").click(function(event) {
                        event.preventDefault();
                        zbrisi(patient);
                        console.log("cupa");
                        return false;
        });
        
        el.click(function(event) {
            event.preventDefault();
            pacientClick(patient);
            console.log("opa");
            return false;
        });
    }
    
    console.log(patients.length);
    var patientMenu = $("#patientContainer");
    patientMenu.empty();
    
    


    for(var i = 0; i < patients.length / 3; i++) {
        var ime = "row" + i;
        var row = '<div class="row top-margin" id="' + ime + '"></div>'
        patientMenu.append(row);
        var rowInsert = $("#row" + i);
        
        for(var j = i*3; j < i*3+3 && j < patients.length; j++) {
            var patient = patients[j];
            var image =  '<img src="profile.png" class="img-responsive margin-center" alt="Cinque Terre" width="100" height="100">'
            var divStart = '<div class="col-sm-3 btn btn-default';
            var trash = '<button type="button" class="btn btn-default right-align" aria-label="Left Align"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>'
            var podatki = '<p class="strong-text">' + patient.ime + " " + patient.priimek + '<p> Datum rojstva: ' + patient.datumRojstva + '<p class="light-text">' + patient.id + '</p></p></p></div>'

                
            var htmlLeft = divStart + '">' + trash + image + podatki;
            var htmlRight = divStart + ' col-md-offset-1">' + trash + image+ podatki;
            
            var left = jQuery(htmlLeft);
            var right = jQuery(htmlRight);
            dodajClicke(left, patient);
            dodajClicke(right, patient);
            
            
            if(j % 3 == 0)
                rowInsert.append(left);
            else 
                rowInsert.append(right);
        }  
    }
    
}



function sectionButtonClick(st) {
    if(st == 0) mojiPacienti();
    else if(st == 1) vprasanjaSection();
    else dodajanjePacientov();
    
    for(var i = 0; i < 3; i++) {
        var btn = $("#btn-"+i);
        if(i == st) 
            btn.addClass("selected-button");
        else
            btn.removeClass("selected-button");
            
    }
}



function najdiPacientaByEHRid() {
    setSessionId();
    var ehrId = $("#preberiEHRid").val();
    
    if (!ehrId || ehrId.trim().length == 0) {
        $("#preberiSporocilo").html("<span class='obvestilo label label-warning " +
      "fade-in'>Prosim vnesite zahtevan podatek!");
    } else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
	    	success: function (data) {
	    	    $("#preberiSporocilo").empty();
	    	    var party = data.party;
	    	    drawAlertDiv("success", "Dodan pacient: " + party.firstNames + " " + party.lastNames + ", rojen " + party.dateOfBirth);
				var patient = {ime: party.firstNames, priimek: party.lastNames + ", rojen " + party.dateOfBirth, id: ehrId};
				myPatients.push(patient);
				drawPatients(myPatients);
				
			},
			error: function(err) {
			    $("#preberiSporocilo").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
	}
}


function dodajanjePacientov() {
    $("#patientContainerWrap").hide();
    $("#vprasanja").hide();
    $("#patient-detail").hide();
    $("#master-detail").show();
    $("#patient-add").show();
    
}

function mojiPacienti() {
    $("#patient-detail").hide();
    $("#patient-add").hide();
    $("#vprasanja").hide();
    $("#master-detail").show();
    $("#patientContainerWrap").show();
    
}

function vprasanjaSection() {
    $("#patient-detail").hide();
    $("#patientContainerWrap").hide();
    $("#patient-add").hide();
    $("#vprasanja").show();
    $("#master-detail").show();
}


function kreirajEHRbutton() {
    setSessionId();
    var imePac = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var datumRojstva = $("#kreirajDatumRojstva").val();
	if (!imePac || !priimek || !datumRojstva || imePac.trim().length == 0 ||
      priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label " +
      "label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
	    var patient = {ime: imePac, priimek: priimek, datumRojstva: datumRojstva};
    	$("#kreirajSporocilo").empty();
	    
	    kreirajEHRuporabnika(patient);
	}
}


function kreirajEHRuporabnika(pacient) {
    
    function stepTwo(partyData, ehrId) {
         $.ajax({
            url: baseUrl + "/demographics/party",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(partyData),
            success: function (party) {
                if (party.action == 'CREATE') {
                    var patient = {ime: partyData.firstNames, priimek: partyData.lastNames, datumRojstva: partyData.dateOfBirth, id: ehrId};
                    myPatients.push(patient);
                    getPacients();
                    drawAlertDiv("success", "Uspešno generirani pacienti!");
                    dodajVitalneZnakePacientu(ehrId);
                }
                
            },
            error: function(err) {
                drawAlertDiv("danger", JSON.parse(err.responseText).userMessage + "'!")
            }
        });
    }
    
    setSessionId();
    $.ajax({
        url: baseUrl + "/ehr",
	    type: 'POST',
	    success: function (data) {
	        var ehrId = data.ehrId;
	        var partyData = {
	            firstNames: pacient.ime,
	            lastNames: pacient.priimek,
	            dateOfBirth: pacient.datumRojstva,
	            partyAdditionalInfo: [
	                {key: "ehrId", value: ehrId},
	                {key: "app_id", value: "eZdravnikBase"}
	            ]
	        };
	        stepTwo(partyData, ehrId);
        }
    });
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
 


function generirajUporabnike() {
    for(var i = 0; i < 3; i++) {
        kreirajEHRuporabnika(patientList[i]);
    }
    
}


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija
