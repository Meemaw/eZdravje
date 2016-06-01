
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
    generirajUporabnike();
    drawVprasanja();
}) ;

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
    vprasanjaDiv.append('<div class="padding-small"><p><b>'+ pac.ime + " " + pac.priimek + '</b>:  ' + vprasanje.tekst + '</p><textarea class="form-control" id="form' + vprasanje.id + '" rows="3" placeholder="Vnesi odgovor"></textarea><button type="button" class="margin-small btn btn-success right-align" onclick="odgovoriClick(' + vprasanje.id + ')">Odgovori</button></div>');
}

function drawPatients(patients) {
    var patientMenu = $("#patientContainer");
    patientMenu.empty();


    for(var i = 0; i < patients.length / 3; i++) {
        var ime = "row" + i;
        var row = '<div class="row top-margin" id="' + ime + '"></div>'
        patientMenu.append(row);
        var rowInsert = $("#row" + i);
        
        for(var j = i*3; j < i*3+3; j++) {
            var patient = patients[j];
            var image =  '<img src="profile.png" class="img-responsive margin-center" alt="Cinque Terre" width="100" height="100">'
            if(j % 3 == 0)
                rowInsert.append('<div class="col-sm-3 btn btn-default">' + image + '<p class="strong-text">' + patient.ime + " " + patient.priimek + '<p> Datum rojstva: ' + patient.datumRojstva + '<p class="light-text">' + patient.id + '</p></p></p></div>');
            else 
                rowInsert.append('<div class="col-sm-3 col-md-offset-1 btn btn-default">' + image + '<p class="strong-text">' + patient.ime + " " + patient.priimek + '<p> Datum rojstva: ' + patient.datumRojstva +'<p class="light-text">' + patient.id + '</p></p></p></div>');
                
            
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


function drawDropdownMenu(patients) {
    var menu = $("ul.dropdown-menu");
    menu.empty();
    for(var i = 0; i < patients.length; i++) {
        var patient = patients[i];
        menu.append('<li><a href="#">' + patient.ime + " " + patient.priimek + '</a></li>');
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
	    	    console.log("success");
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
    $("#patient-add").show();
    $("#vprasanja").hide();
}

function mojiPacienti() {
    $("#patientContainerWrap").show();
    $("#patient-add").hide();
    $("#vprasanja").hide();
}

function vprasanjaSection() {
    $("#patientContainerWrap").hide();
    $("#patient-add").hide();
    $("#vprasanja").show();
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
                    drawDropdownMenu(myPatients);
                    drawAlertDiv("success", "Uspešno generirani pacienti!");
                    drawPatients(myPatients);
                    kreiranjeUspelo = true;
                    console.log(ehrId);
                }
                
            },
            error: function(err) {
                drawAlertDiv("danger", JSON.parse(err.responseText).userMessage + "'!")
                kreiranjeUspelo = false;
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
		                {key: "app_id", value: "eZdravnik"}
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
