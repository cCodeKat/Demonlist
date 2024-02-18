var playerId
var playerName
const stylesheetElement = document.createElement("style");
document.head.appendChild(stylesheetElement);
const stylesheet = stylesheetElement.sheet
var rules = stylesheet.cssRules || stylesheet.rules;

function pointsFormula(position, progress, requirement) {
    if (progress < requirement) {
        return 0;
    }
    let score;
  
    if (55 < position && position <= 150) {
        score = 56.191*Math.pow(2, (54.147-(position+3.2))*Math.log(50)/99)+6.273;
    } else if (35 < position && position <= 55) {
        score = 212.61*(Math.pow(1.036, 1-position))+25.071;
    } else if (20 < position && position <= 35) {
        score = (250-83.389)*(Math.pow(1.0099685, 2-position))-31.152
    } else if (0 < position && position <= 20) {
        score = (250-100.39)*(Math.pow(1.168, 1-position))+100.39
    } else {
        score = 0;
    }
  
    if (progress !== 100) {
        if (position > 75) { return 0; }
        score = (score * Math.pow(5, ((progress - requirement)/(100 - requirement))))/10;
    }
    return score;
}

function supporterText() {
    const x = document.getElementById('editors');
    x.innerHTML += '<div class="underlined"><h2>Demonlist+ Supporters</h2></div>'
    x.innerHTML += '<p>You should check out those people, they have some really cool content! People on this list have supported the development of the Demonlist+ extension!</p>'
    x.innerHTML += '<ul style="line-height: 30px" id="supporters">';
    const supportersURL = chrome.runtime.getURL("supporters.txt")
    fetch(supportersURL)
        .then((res) => res.text())
        .then((text) => {
            text = text.split('\n')
            text.forEach((line) => {
                line = line.split(' ');
                document.getElementById('supporters').innerHTML += `<li><a target="_blank" href="${line[1]}">${line[0]}</a></li>`;
            })
        })
        .then(() => {x.innerHTML += '</ul><a class="blue hover button" href="https://www.buymeacoffee.com/codekat" style="margin-top: 12px">Support Demonlist+!</a>';})
}

function customizeLevelPanel(record, demonlist, top) {
    if (record.demon.position > 150) {
        return 0;
    }

    listRequirement = top[record.demon.position - 1].requirement
    listPointsCalculated = pointsFormula(record.demon.position, record.progress, listRequirement).toFixed(2)
    listPointsMax = pointsFormula(record.demon.position, 100, listRequirement).toFixed(2)

    // For uncompleted levels
    if (record.progress === 0) {
        demonlist[record.demon.position - 1].id = 'uncompleted'
        if (document.getElementById('detailed-data').checked) {
            let flexbox = demonlist[record.demon.position - 1].children[0]
            if (playerName == "Manual ID" && flexbox.children.length > 2) {flexbox.children[2].remove(); flexbox.children[1].children[2].remove();}
            flexbox.innerHTML += `<div style="margin-left: auto; margin-right: 0em; margin-right: 15px"><h3 style="margin-bottom: 0px; text-align: right">List%: ${listRequirement}%</h3><h1 style="margin-top: 0px; margin-bottom: 0px; text-align: right">0%</h1></div>`
            flexbox.children[1].innerHTML += `<h3 style="text-align: left">0.00/${listPointsMax} List Points</h3>`
            demonlist[record.demon.position - 1].style.background = "#fff";
        }
        return
    }

    if (record.video != null && document.getElementById('submission-thumbnails').checked) {
        demonlist[record.demon.position - 1].children[0].children[0].children[0].href = `${record.video}`

        if (record.video.includes('youtu')) {
            videoUrlID = record.video.substr(record.video.lastIndexOf('/') + 1).replace('watch?v=', '')
            demonlist[record.demon.position - 1].children[0].children[0].style.setProperty('background-image', `url("https://i.ytimg.com/vi/${videoUrlID}/mqdefault.jpg")`)
            demonlist[record.demon.position - 1].children[0].children[0].setAttribute('data-property-value', `url("https://i.ytimg.com/vi/${videoUrlID}/mqdefault.jpg")`)
        }
    }

    if (record.progress === 100) {
        if (document.getElementById('colored-labels').checked) {
            demonlist[record.demon.position - 1].style.background = "#7aff9c65";
        } else {
            demonlist[record.demon.position - 1].style.background = "#fff";
        }

        demonlist[record.demon.position - 1].id = 'completed'
        // let flexbox = demonlist[record.demon.position - 1].children[0]
        // flexbox.innerHTML += `<div style="margin-left: auto; margin-right: 0em; margin-right: 15px"><h3 style="margin-bottom: 0px; text-align: right">List%: ${listRequirement}%</h3><h1 style="margin-top: 0px; margin-bottom: 0px; text-align: right">100%</h1></div>`
        // flexbox.children[1].innerHTML += `<h3 style="text-align: left">${listPointsMax}/${listPointsMax} List Points</h3>`

    } else {
        if (record.demon.position < 75 && document.getElementById('colored-labels').checked) {
            demonlist[record.demon.position - 1].style.background = "#f4ff8065";
        } else {
            demonlist[record.demon.position - 1].style.background = "#fff";
        }

        demonlist[record.demon.position - 1].id = 'listp'
        // let flexbox = demonlist[record.demon.position - 1].children[0]
        // flexbox.innerHTML += `<div style="margin-left: auto; margin-right: 0em; margin-right: 15px"><h3 style="margin-bottom: 0px; text-align: right">List%: ${listRequirement}%</h3><h1 style="margin-top: 0px; margin-bottom: 0px; text-align: right">${record.progress}%</h1></div>`
        // flexbox.children[1].innerHTML += `<h3 style="text-align: left">${listPointsCalculated}/${listPointsMax} List Points</h3>`
    }

    if (document.getElementById('detailed-data').checked) {
        let flexbox = demonlist[record.demon.position - 1].children[0]
        if (playerName == "Manual ID" && flexbox.children.length > 2) {flexbox.children[2].remove(); flexbox.children[1].children[2].remove();}
        flexbox.innerHTML += `<div style="margin-left: auto; margin-right: 0em; margin-right: 15px"><h3 style="margin-bottom: 0px; text-align: right">List%: ${listRequirement}%</h3><h1 style="margin-top: 0px; margin-bottom: 0px; text-align: right">${record.progress}%</h1></div>`
        flexbox.children[1].innerHTML += `<h3 style="text-align: left">${listPointsCalculated}/${listPointsMax} List Points</h3>`
    }

    return parseFloat(listPointsCalculated)
}

function customizeSmallLevelPanel(record, demonlist, top) {

}

async function personalizedDemonlistView(scrapingResponse, accountPanel) {
    let top150 = await (await fetch(`https://pointercrate.com/api/v2/demons/listed/?limit=75`)).json();
    top150 = top150.concat(await (await fetch(`https://pointercrate.com/api/v2/demons/listed/?after=75&limit=75`)).json());
    let uncompletedPlacementArr = Array.from({length: 150}, (value, index) => index + 1)

    let playerRequest;
    if (playerId == -1) { // No player profile case
        playerRequest = {"data": {"published": [], "records": [], "created": [], "verified": []}}
    } else {
        playerRequest = await fetch(`https://pointercrate.com/api/v1/players/${playerId}`)
        playerRequest = await playerRequest.json()
    }
    records = playerRequest.data.records

    let demonlist = [...document.getElementsByClassName('left')[0].children];
    timeMachineCheck = demonlist[0].className == 'panel fade blue flex'
    demonlist = demonlist.slice(3 + (timeMachineCheck ? 1 : 0));

    let listPoints = 0; 
    records.forEach((record) => {
        listPoints += customizeLevelPanel(record, demonlist, top150);
        uncompletedPlacementArr = uncompletedPlacementArr.filter(n => n !== record.demon.position)
    });

    // For verified levels (Pointercrate's api treats those separately and with a different format)
    records_verified = playerRequest.data.verified
    records_verified.forEach((record) => {
        fixed_record = {"demon": record, "progress": 100, "video": `${top150[record.position - 1].video}`}
        listPoints += customizeLevelPanel(fixed_record, demonlist, top150);
        uncompletedPlacementArr = uncompletedPlacementArr.filter(n => n !== fixed_record.demon.position)
    });

    // For not completed levels :P
    uncompletedPlacementArr.forEach((placement) => {
        record = {"demon": {"position": placement}, "progress": 0, "video": null}
        customizeLevelPanel(record, demonlist, top150)
    })

    // Updating User Area text with List Points
    if (playerId !== 1) {accountPanel.children[0].children[0].innerHTML = `<span>${listPoints.toFixed(2)} POINTS</span>`;}

    if (playerName == "Manual ID") {
        playerName = playerRequest.data.name
        accountPanel.children[0].children[1].innerHTML = `<span>${playerName}</span>`
    }
}

function hueModifier() {
    document.getElementsByClassName('nav-icon nav-nohide')[0].children[0].children[0].id = "pointercrate-image"
    stylesheet.insertRule(`.blue, .world-map, #world-map, .information-stripe, .tab-active, .pointercrate-image {filter: hue-rotate(0deg) !important; transition: filter 0.0s ease-in-out;}`)

    navbarSpot = document.getElementsByClassName("center collapse underlined see-through")[0].children[0]
    navbarSpot.insertAdjacentHTML('afterend', '<div class="nav-group"><a class="nav-item white" style="cursor: default"><span style="display:flex; flex-direction:column;"><span style="font-size: 50%">HUE SLIDER</span><div class="slidecontainer"><input type="range" min="0" max="360" value="0" class="slider" id="colorSlider"></div></a></div></div>')

    var slider = document.getElementById("colorSlider");
    chrome.storage.local.get("hueValue", function(data) {
        if(data.hueValue !== undefined) {
            slider.value = data.hueValue;
            // Apply the filter using the retrieved value
            slider.dispatchEvent(new Event('input'));
        }
    });

    document.getElementsByTagName('body')[0].children[0].style.setProperty('filter', `hue-rotate${slider.value}deg`)
    try {document.getElementById('world-map').style.setProperty('filter', `hue-rotate(${slider.value}deg)`)} catch (error) {}

    slider.oninput = function() {
        document.getElementsByTagName('body')[0].children[0].style.setProperty('filter', `hue-rotate(${slider.value}deg)`)
        document.getElementById('pointercrate-image').style.setProperty('filter', `hue-rotate(${slider.value}deg)`)
        rules[0].style.filter = `hue-rotate(${slider.value}deg)`;
        try {document.getElementById('world-map').style.setProperty('filter', `hue-rotate(${slider.value}deg)`)} catch (error) {}
        chrome.storage.local.set({"hueValue": slider.value}, function(){});
    }
}

function footerFix() {
    footer = document.getElementsByTagName('footer')[0]
    footer.children[2].style.setProperty('justify-content', 'center')
    footer.children[1].children[2].innerHTML = ""
    footer.children[1].children[0].innerHTML = ""
    stylesheet.insertRule('footer > span {font-size: 20px}')
    stylesheet.insertRule('footer > div {font-size: 14px}')
    stylesheet.insertRule('footer .flex>* {max-width: 75%}')
    stylesheet.insertRule('footer div:last-of-type {margin-bottom: 24px}')
    footer.style.setProperty('box-shadow', '0 0 20px 0 rgba(0,0,0,.1)')
    footer.style.setProperty('border', '1px #d3d3d3 dashed;')
    footer.style.setProperty('padding-left', 'calc(50% - 1072px/2)')
    footer.style.setProperty('padding-right', 'calc(50% - 1072px/2)')
}

// function initializeTimeMachine() {
//     let formHtml = document.getElementById("time-machine-form");
//     if (formHtml === null)
//         return;
//     var timeMachineForm = new Form(formHtml);
//     var inputs = ['year', 'month', 'day', 'hour', 'minute', 'second'].map(name=>timeMachineForm.input("time-machine-" + name));
//     for (let input of inputs) {
//         input.addValidator(input=>input.dropdown.selected !== undefined, "Please specify a value");
//     }
//     var offset = new Date().getTimezoneOffset();
//     var offsetHours = Math.abs(offset) / 60;
//     var offsetMinutes = Math.abs(offset) % 60;
//     const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ];
//     timeMachineForm.onSubmit(()=>{
//         let when = inputs[0].value + "-" + ("" + (MONTHS.indexOf(inputs[1].value) + 1)).padStart(2, '0') + "-" + ("" + inputs[2].value).padStart(2, '0') + "T" + ("" + inputs[3].value).padStart(2, '0') + ":" + ("" + inputs[4].value).padStart(2, '0') + ":" + ("" + inputs[5].value).padStart(2, '0') + (offsetHours < 0 ? "%2B" : "-") + (offsetHours + "").padStart(2, "0") + ":" + (offsetMinutes + "").padStart(2, "0");
//         document.cookie = "when=" + when;
//         gtag('event', 'time-machine-usage', {
//             'event-category': 'demonlist',
//             'label': when
//         });
//         window.location = "/demonlist/";
//     }
//     )
// }

// function fixTimeMachine() {
//     document.getElementById("time-machine-form").children[2].innerHTML = ""
//     document.getElementById("time-machine-form").children[2].innerHTML = ""
// }

function handleLevelView(elementId, state, demonlist) {
    if (!state) {
        demonlist.forEach(element => {
            if (element.id == elementId) {element.style.setProperty('display', 'none')}
        });
    } else {
        demonlist.forEach(element => {
            if (element.id == elementId) {element.style.setProperty('display', 'block')}
        });
    }
}

function handleCheckboxChange(event) {
    const checkboxId = event.target.id;
    const isChecked = event.target.checked;
    chrome.storage.local.set({ [checkboxId]: isChecked });
    // console.log(event.target.value + ' checkbox is now ' + (isChecked ? 'checked' : 'unchecked'));
    let demonlist
    if (checkboxId.substring(0, 4) == "view") {
        demonlist = [...document.getElementsByClassName('left')[0].children];
        demonlist = demonlist.slice(3);
        if (checkboxId == "view-uncompleted") {handleLevelView("uncompleted", isChecked, demonlist)
        } else if (checkboxId == "view-listp") {handleLevelView("listp", isChecked, demonlist)
        } else if (checkboxId == "view-completed") {handleLevelView("completed", isChecked, demonlist)}
    }
}

function controlBox() {
    a = document.getElementById("editors")
    a.insertAdjacentHTML('afterend', '<section class="panel fade js-scroll-anim" id="control-box" data-anim="fade" style="opacity: 1;"><h2 class="underlined pad">Demonlist+ Settings</h2></section>')
    controlBoxElement = document.getElementById("control-box")
    controlBoxElement.children[0].insertAdjacentHTML('afterend', `\
    <div id="view-checkboxes" style="text-align: left">\
        <p style="font-size: 18px; font-weight: bold; margin-bottom: 0px">Level View</p>\

        <label class="ccontainer"><p>View Completed</p><input type="checkbox" checked="true" id="view-completed" value="View Completed">
        <span class="ccheckmark"></span></label>

        <label class="ccontainer"><p>View List%</p><input type="checkbox" checked="true" id="view-listp" value="View List%">
        <span class="ccheckmark"></span></label>

        <label class="ccontainer"><p>View Uncompleted</p><input type="checkbox" checked="true" id="view-uncompleted" value="View Uncompleted">
        <span class="ccheckmark"></span></label>
    </div>\
    <div id="other-checkboxes" style="text-align: left">\
        <p style="font-size: 18px; font-weight: bold; margin-bottom: 0px">Other</p>\

        <label class="ccontainer"><p>Submission Videos</p><input type="checkbox" checked="." id="submission-thumbnails" value="Submission Videos">
        <span class="ccheckmark"></span></label>

        <label class="ccontainer"><p>Colored Labels</p><input type="checkbox" checked="." id="colored-labels" value="Colored Labels">
        <span class="ccheckmark"></span></label>

        <label class="ccontainer"><p>Detailed Data</p><input type="checkbox" checked="." id="detailed-data" value="Detailed Data">
        <span class="ccheckmark"></span></label>

    </div>\
    <div style="display: flex; align-items: center; margin-top: 20px">
        <input type="text" id="playerIdInput" placeholder="Player ID" style="display: block; flex: 1; height: 38px;">
        <button class="blue hover button" id="runPersonalizedView" style="display: block; margin-left: 7px; font: 16px montserrat, sans-serif">Apply</button>
    </div>
    <p style="margin-bottom: 0px;">If the setting doesn't apply instantly, try reloading the page!</p>`
    )

    stylesheet.insertRule('.ccontainer {\
        display: block;\
        position: relative;\
        padding-left: 24px;\
        margin-bottom: 12px;\
        cursor: pointer;\
        font-size: 17px;\
        -webkit-user-select: none;\
        -moz-user-select: none;\
        -ms-user-select: none;\
        user-select: none;\
      }')
      
    stylesheet.insertRule('.ccontainer input {\
        position: absolute;\
        opacity: 0;\
        cursor: pointer;\
        height: 0;\
        width: 0;\
    }')
      
    stylesheet.insertRule('.ccheckmark {\
        position: absolute;\
        top: 0;\
        left: 0;\
        height: 18px;\
        width: 18px;\
        background-color: #fff;\
        margin: 0\
        border: 3px solid #444446;\
        border-radius: 2px;\
      }')
      
    stylesheet.insertRule('.ccontainer:hover input ~ .ccheckmark {\
        filter: brightness(0.75);\
      }')
      
    stylesheet.insertRule('.ccontainer input:checked ~ .ccheckmark {\
        background-color: #444446;\
      }')
      
    stylesheet.insertRule('.ccheckmark:after {\
        display: none;\
        content: "";\
        position: absolute;\
        border-color: #444446;\
      }')
      
    stylesheet.insertRule('.ccontainer input:checked ~ .ccheckmark:after {\
        display: block;\
      }')
      
    stylesheet.insertRule('.ccontainer .ccheckmark:after {\
        left: 3.6px;\
        top: 0.8px;\
        width: 4px;\
        height: 8px;\
        border: solid white;\
        border-width: 0 3px 3px 0;\
        -webkit-transform: rotate(45deg);\
        -ms-transform: rotate(45deg);\
        transform: rotate(45deg);\
    }')

    stylesheet.insertRule('.ccontainer span {\
        border: 2px solid #444446; border-radius: 2px; box-sizing: border-box;\
    }')


    var checkboxes = document.querySelectorAll('#control-box input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', handleCheckboxChange);
        chrome.storage.local.get(checkbox.id, function(result) {
            if (result[checkbox.id] === undefined) {
                checkbox.checked = 'checked';
                chrome.storage.local.set({ [checkbox.id]: 'checked' });
            } else {
                if (checkbox.id.substring(0, 4) == 'view') {
                    checkbox.setAttribute('checked', true); 
                    checkbox.checked = true
                } else {
                    checkbox.setAttribute('checked', result[checkbox.id]); 
                    checkbox.checked = result[checkbox.id];
                }
            }
        });
    });

    // challenging...
    document.getElementById("runPersonalizedView").addEventListener("click", function() {
        playerId = document.getElementById("playerIdInput").value;
        playerName = "Manual ID"
        console.log(playerId)
        response = `claimed-player" data-id="${playerId}">Manual ID</i> profile-display-name">Manual ID<`
        console.log(response)
        accountPanel.children[0].children[0].innerHTML = '<span>LOGGED IN</span>';
        accountPanel.children[0].children[1].innerHTML = `<span>Manual ID</span>`
        personalizedDemonlistView(response, document.getElementsByClassName('nav-item hover white')[1]);
    });
}

async function loadLegacy() {
    document.getElementsByTagName('footer')[0].insertAdjacentHTML('beforebegin', '\
    <section class="panel fade js-scroll-anim" id="load-legacy" data-anim="fade" style="opacity: 1; width: 600px; margin-left: auto; margin-right: auto">\
    <div class="underlined"><h2>Load Legacy (disabled)</h2></div>\
    <p>Do you want to see the levels further off the extended list? Click this button to load in 100 more levels!</p>\
    <a class="blue hover button" id="load-legacy-button">Load more levels!</a></section>')
}

async function main() {
    accountPanel = document.getElementsByClassName('nav-item hover white')[1]
    isDemonlist = document.location.pathname.includes("/demonlist/") && !document.location.pathname.includes("/statsviewer/")

    if (isDemonlist) {
        supporterText();
        controlBox();
        loadLegacy();
    };

    footerFix();
    hueModifier();

    listPointsCalculatorElement = '<li><a class="white hover" href="https://list-calc.finite-weeb.xyz/">List Points Calculator</a></li>'
    document.getElementsByClassName('nav-hover-dropdown')[0].innerHTML += listPointsCalculatorElement

    let response = await fetch("https://pointercrate.com/account")
    response = await response.text();
    // response = 'claimed-player" data-id="53408">Zoink</i> profile-display-name">Zoink<'; // Debug line (cries in 0 list points)
    // response = 'claimed-player" data-id="50381">Slijee</i> profile-display-name">Slijee<'; // Debug line (cries in 0 list points)

    // Checking whether the user is logged in
    let notLoggedInCheck = response.indexOf("Log in to an existing pointercrate account. ")
    if (notLoggedInCheck != -1) { 
        console.log("not logged in"); 
    } else {
        // Checking whether the user has a claimed account   53290 36915
        playerName = response.substring(response.indexOf("profile-display-name") + 22, response.indexOf('<', response.indexOf("profile-display-name")))
        accountPanel.children[0].children[1].innerHTML = `<span>${playerName}</span>`

        if (response.indexOf("claimed-player") != -1) {
            playerId = response.substring(response.indexOf('data-id="') + 9, response.indexOf('"', response.indexOf('data-id="') + 9))
        } else {
            accountPanel.children[0].children[0].innerHTML = '<span>LOGGED IN</span>';
            playerId = -1
        if (isDemonlist) { personalizedDemonlistView(response, accountPanel) }
        }
    }

    if (document.location.pathname === "/demonlist/?timemachine=true/") {fixTimeMachine()};
}

main();