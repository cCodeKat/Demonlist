var playerId;
var playerName;
const stylesheetElement = document.createElement("style");

// Favicon Icons
document.head.innerHTML += `\
<link rel="apple-touch-icon" sizes="180x180" href="${chrome.runtime.getURL("icons/apple-touch-icon.png")}">\
<link rel="icon" type="image/png" sizes="32x32" href="${chrome.runtime.getURL("icons/favicon-32x32.png")}">\
<link rel="icon" type="image/png" sizes="16x16" href="${chrome.runtime.getURL("icons/favicon-16x16.png")}">\
<link rel="manifest" href="${chrome.runtime.getURL("icons/site.webmanifest")}"></link>`;

document.head.appendChild(stylesheetElement); // Hue Changer
const stylesheet = stylesheetElement.sheet;
var rules = stylesheet.cssRules || stylesheet.rules;

var isDemonlist = [
        "/demonlist/", "/demonlist", "/demonlist/?timemachine=true/", "/demonlist/?timemachine=true", "/demonlist/?submitter=true/", "/demonlist/?submitter=true"
    ].includes(document.location.pathname);
var isStatsViewer = [
        "/demonlist/statsviewer/", "demonlist/statsviewer"
    ].includes(document.location.pathname);
var levelCollectionParent = document.getElementsByClassName('left')[0];
var levelCollection = [...levelCollectionParent.children].slice(2);
var accountPanel = document.getElementsByClassName('nav-item hover white')[1].children[0]


function pointsFormula(position, progress, requirement) {
    if (progress < requirement || (position > 75 && progress !== 100)) {
        return 0;
    }
    let score;

    if (position >= 56 && position <= 150) {
        score = 1.039035131 * ((185.7 * Math.exp(-0.02715 * position)) + 14.84);
    } else if (position >= 36 && position <= 55) {
        score = 1.0371139743 * ((212.61 * Math.pow(1.036, 1 - position)) + 25.071);
    } else if (position >= 21 && position <= 35) {
        score = ((250 - 83.389) * Math.pow(1.0099685, 2 - position) - 31.152) * 1.0371139743;
    } else if (position >= 4 && position <= 20) {
        score = ((326.1 * Math.exp(-0.0871 * position)) + 51.09) * 1.037117142;
    } else if (position >= 1 && position <= 3) {
        score = (-18.2899079915 * position) + 368.2899079915;
    } else {
        score = 0.0;
    }

    if (progress !== 100) {
        return (score * Math.pow(5, (progress - requirement) / (100 - requirement))) / 10;
    } else {
        return score;
    }
}

function supporterText() {
    const x = document.getElementById('editors');
    x.innerHTML += '<div class="underlined"><h2>Demonlist+ Supporters</h2></div>'
    x.innerHTML += '<p>You should check out those people, they have some really cool content! People on this list have supported the development of the Demonlist+ extension!</p>'
    x.innerHTML += '<ul style="line-height: 30px" id="supporters">';
    const supportersURL = chrome.runtime.getURL("supporters.txt");
    fetch(supportersURL)
        .then((res) => res.text())
        .then((text) => {
            text = text.split('\n')
            text.forEach((line) => {
                line = line.split(' ');
                document.getElementById('supporters').innerHTML += `<li><a target="_blank" href="${line[1]}">${line[0]}</a></li>`;
            })
        })
        .then(() => {x.innerHTML += '</ul><a class="blue hover button" href="https://www.buymeacoffee.com/codekat" style="margin-top: 12px">Support Demonlist+!</a>';});
}

function customizeLevelPanel(record, demonlist, top) {
    if (record.demon.position > top.length) {
        return 0;
    }

    level_data = top[record.demon.position - 1];
    level_section = demonlist[record.demon.position - 1];

    listPointsCalculated = pointsFormula(record.demon.position, record.progress, level_data.requirement).toFixed(2);
    listPointsMax = pointsFormula(record.demon.position, 100, level_data.requirement).toFixed(2);

    // For uncompleted levels
    if (record.progress === 0) {
        level_section.id = 'uncompleted'
        if (document.getElementById('submission-thumbnails').checked) {
            try {
                level_section.children[0].children[0].children[0].href = `${level_data.video}`
                level_section.children[0].children[0].style.setProperty('background-image', `url("${level_data.thumbnail}")`);
                level_section.children[0].children[0].setAttribute('data-property-value', `url("${level_data.thumbnail}")`);
            } catch (e) {console.error("Failed to load video for " + record.demon.name + ". Video: " + record.video)}
        }
        if (document.getElementById('detailed-data').checked) {
            let flexbox = demonlist[record.demon.position - 1].children[0]
            if (flexbox.children.length > 2) {
                try {
                    flexbox.children[2].remove(); 
                    flexbox.children[1].children[2].remove();
                } catch (e) {}
            }
            flexbox.innerHTML += `<div style="margin-left: auto; margin-right: 0em; margin-right: 15px">\
            ${(record.demon.position <= 75) ? `<h3 style="margin-bottom: 0px; text-align: right">List%: ${level_data.requirement}%</h3>` : ''}\
            <h1 style="margin-top: 0px; margin-bottom: 0px; text-align: right">0%</h1></div>`

            if (record.demon.position <= 150) {flexbox.children[1].innerHTML += `<h3 style="text-align: left">0.00/${listPointsMax} List Points</h3>`}
        }
        return
    }

    if (record.video != null && document.getElementById('submission-thumbnails').checked) {
        try {
            level_section.children[0].children[0].children[0].href = `${record.video}`;

            if (record.video.includes('youtu')) {
                videoUrlID = record.video.substr(record.video.lastIndexOf('/') + 1).replace('watch?v=', '')
                level_section.children[0].children[0].style.setProperty('background-image', `url("https://i.ytimg.com/vi/${videoUrlID}/mqdefault.jpg")`);
                level_section.children[0].children[0].setAttribute('data-property-value', `url("https://i.ytimg.com/vi/${videoUrlID}/mqdefault.jpg")`);
            }
        } catch (e) {console.error("Failed to load video for " + record.demon.name + ". Video: " + record.video);}

        
    }

    if (record.progress === 100) {
        demonlist[record.demon.position - 1].id = 'completed'
    
        if (document.getElementById('colored-labels').checked) {
            demonlist[record.demon.position - 1].style.background = "#7aff9c65";
        }

    } else {
        demonlist[record.demon.position - 1].id = 'listp'

        if (record.demon.position <= 75 && !document.getElementById('colored-labels').checked) {
            demonlist[record.demon.position - 1].style.background = '#ccc'
        }

        demonlist[record.demon.position - 1].style.setProperty('background-color', '#ccc', '!important')

    }

    if (document.getElementById('detailed-data').checked) {
        let flexbox = demonlist[record.demon.position - 1].children[0]
        if (flexbox.children.length > 2) {
            try {
                flexbox.children[2].remove();
                flexbox.children[1].children[2].remove();
            } catch (e) {}
        }

        flexbox.innerHTML += `<div style="margin-left: auto; margin-right: 0em; margin-right: 15px">\
        ${(record.demon.position <= 75) ? `<h3 style="margin-bottom: 0px; text-align: right">List%: ${level_data.requirement}%</h3>` : ''}\
        <h1 style="margin-top: 0px; margin-bottom: 0px; text-align: right">${record.progress}%</h1></div>`

        if (record.demon.position <= 150) {flexbox.children[1].innerHTML += `<h3 style="text-align: left">${listPointsCalculated}/${listPointsMax} List Points</h3>`}
    }

    return parseFloat(listPointsCalculated)
}

async function personalizedDemonlistView() {
    let list_request = (await (await fetch(`https://pointercrate.com/api/v2/demons/listed/?limit=75`)).json()).slice(0, 75);
    list_request = (list_request.concat((await (await fetch(`https://pointercrate.com/api/v2/demons/listed/?after=75&limit=75`)).json()).slice(0, 75)));

    let demonlist = levelCollection;

    start = demonlist[demonlist.length - 1].children[0].children[1].children[0].textContent
    start = start.substring(1, start.indexOf(" "))
    let uncompletedPlacementArr = Array.from({length: start}, (value, index) => index + 1)

    for (let i = 0; i < (start - 150) / 100; i++) {
        list_request = list_request.concat((await (await fetch(`https://pointercrate.com/api/v2/demons/listed/?after=${150 + i * 100}&limit=100`)).json()).slice(0, 100))
    }
    levelCollection = [...levelCollectionParent.children].slice(2); // Update level collection

    let playerRequest = {"data": {"published": [], "records": [], "created": [], "verified": []}}

    if (playerId != -1) {
        playerRequest = await (await fetch(`https://pointercrate.com/api/v1/players/${playerId}`)).json()
    }

    records = playerRequest.data.records

    let listPoints = 0; 
    records.forEach((record) => {
        listPoints += customizeLevelPanel(record, demonlist, list_request);
        uncompletedPlacementArr = uncompletedPlacementArr.filter(n => n !== record.demon.position)
    });

    // For verified levels (Pointercrate's api treats those separately and with a different format)
    records_verified = playerRequest.data.verified
    records_verified.forEach((record) => {
        if (record.position > list_request.length) {
            return;
        }
        fixed_record = {"demon": record, "progress": 100, "video": `${list_request[record.position - 1].video}`}
        listPoints += customizeLevelPanel(fixed_record, demonlist, list_request);
        uncompletedPlacementArr = uncompletedPlacementArr.filter(n => n !== fixed_record.demon.position)
    });

    // For not completed levels :P
    uncompletedPlacementArr.forEach((placement) => {
        record = {"demon": {"position": placement}, "progress": 0, "video": null}
        customizeLevelPanel(record, demonlist, list_request)
    })

    // Updating User Area text with List Points
    if (playerId !== -1) {
        accountPanel.children[0].textContent = listPoints.toFixed(2) + " POINTS"; // `<span>${listPoints.toFixed(2)} POINTS</span>`;
        accountPanel.children[1].textContent = playerRequest.data.name; // `<span>${playerRequest.data.name}</span>`;
    }
}

function hueModifier() {
    document.getElementsByTagName('header')[0].children[0].children[0].children[0].children[0].id = "pointercrate-image"
    stylesheet.insertRule(`.blue, .world-map, #world-map, .information-stripe, .tab-active, .pointercrate-image {filter: hue-rotate(0deg) !important; transition: filter 0.0s ease-in-out;}`)

    navbarSpot = document.getElementsByClassName("center collapse underlined see-through")[0].children[0]
    navbarSpot.insertAdjacentHTML('afterend', '\
        <div class="nav-group">\
        <a class="nav-item white hover" style="cursor: default">\
        <span style="display:flex; flex-direction:column;">\
        <span style="font-size: 50%">HUE SLIDER</span>\
        <div class="slidecontainer">\
        <input type="range" min="0" max="360" value="0" class="slider" id="colorSlider">\
        </div></a></div></div>')

    var slider = document.getElementById("colorSlider");
    chrome.storage.local.get("hueValue", function(data) {
        if(data.hueValue !== undefined) {
            slider.value = data.hueValue;
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
    footer.children[1].children[2].textContent = ""
    footer.children[1].children[0].textContent = ""
    footer.style.setProperty('box-shadow', '0 0 20px 0 rgba(0,0,0,.1)')
    footer.style.setProperty('border', '1px #d3d3d3 dashed;')
    footer.style.setProperty('padding-left', 'calc(50% - 1072px/2)')
    footer.style.setProperty('padding-right', 'calc(50% - 1072px/2)')
}

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
    let demonlist
    if (checkboxId.substring(0, 4) == "view") {
        if (checkboxId == "view-uncompleted") {
            handleLevelView("uncompleted", isChecked, levelCollection);
        } else if (checkboxId == "view-listp") {
            handleLevelView("listp", isChecked, levelCollection);
        } else if (checkboxId == "view-completed") {
            handleLevelView("completed", isChecked, levelCollection);
        }
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

        <label class="ccontainer"><p>Dark Mode</p><input type="checkbox" checked="." id="darkmode" value="Dark Mode">
        <span class="ccheckmark"></span></label>

    </div>\
    <div style="display: flex; flex-direction: column; margin-top: 20px">
        <div style="display: flex; align-items: center;">
            <input type="text" onFocus="document.getElementById('playerIdInputList').classList.add('show');" onBlur="setTimeout(() => {document.getElementById('playerIdInputList').classList.remove('show');}, 100);" id="playerIdInput" placeholder="Enter Player..." style="display: block; flex: 1; height: 38px;">
            <button class="blue hover button" id="runPersonalizedView" style="display: block; margin-left: 7px; font: 16px montserrat, sans-serif">Apply</button>
        </div>
        <ul id="playerIdInputList"></ul>
    </div>
    
    <p style="margin-bottom: 0px;">If the setting doesn't apply instantly, try reloading the page!</p>`
    )

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

    document.getElementById("runPersonalizedView").addEventListener("click", function() {
        playerId = document.getElementById("playerIdInput").getAttribute('data-id');
        if (playerId === null || playerId === -1) {playerId = -1; return;}
        playerName = document.getElementById("playerIdInput").value;
        response = `claimed-player" data-id="${playerId}">${playerName}</i> profile-display-name">${playerName}<`
        personalizedDemonlistView();
    });

    let playerList = document.getElementById("playerIdInputList");
    let playerSelector = document.getElementById("playerIdInput");
    let debounceTimeout;

    playerSelector.addEventListener("input", async (input) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            player_request = await ((await fetch(`https://pointercrate.com/api/v1/players/ranking/?limit=10&name_contains=${playerSelector.value}`)).json());

            while (playerList.firstChild) {
                playerList.removeChild(playerList.firstChild);
            }

            player_request.forEach(player => {
                let listItem = document.createElement('li');
                listItem.textContent = `#${player.rank} ${player.name}`;
                listItem.setAttribute('data-id', player.id);
                playerList.appendChild(listItem);
            });
        }, 300);
    });

    playerList.addEventListener("click", (event) => {
        let player = event.target;
        let id = player.getAttribute("data-id");
        let text = player.innerText;
        if (player && (id || id === 0)) {
            playerList.classList.remove("show");
            playerSelector.setAttribute("data-id", id);
            playerSelector.value = text.substring(text.indexOf(" ")+1, text.length);
        };
    })
}

async function loadLegacy() {
    document.getElementsByTagName('footer')[0].insertAdjacentHTML('beforebegin', '\
    <section class="panel fade js-scroll-anim" id="load-legacy" data-anim="fade" style="opacity: 1; width: 600px; margin-left: auto; margin-right: auto">\
    <div class="underlined"><h2>Load Legacy</h2></div>\
    <p>Do you want to see levels further off the extended list? Click this button to load in 100 more levels!</p>\
    <a class="blue hover button" id="load-legacy-button">Load more levels!</a></section>')

    document.getElementById("load-legacy-button").addEventListener("click", async function() {
        var last_panel = levelCollection[levelCollection.length - 1];
        start = last_panel.children[0].children[1].children[0].textContent;
        start = start.substring(1, start.indexOf(" "));
        let level_request = (await (await fetch(`https://pointercrate.com/api/v2/demons/listed/?after=${start}&limit=100`)).json()).slice(0, 100);
        level_request.forEach(level => {
            panel = last_panel.cloneNode(true);
            panel_data = panel.children[0].children;
            panel_data[0].style.backgroundImage = `url("${level.thumbnail}")`;
            panel_data[0].setAttribute('data-property-value', `url("${level.thumbnail}")`);
            panel_data[0].children[0].href = level.video;
            panel_data[1].children[0].children[0].textContent = `#${level.position} - ${level.name}`;
            panel_data[1].children[1].children[0].textContent = level.publisher.name;
            try {panel_data[1].children[2].style.display = 'none';} catch (e) {}
            levelCollectionParent.appendChild(panel);
        });

        personalizedDemonlistView();
    });
}

function darkModeToggle(bool) {
    if (bool === true) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'demonlist-style-dark';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL('demonlist-style.css');
        document.head.appendChild(link);
    } else {
        try {
            var cssNode = document.getElementById('demonlist-style-dark');
            cssNode && cssNode.parentNode.removeChild(cssNode);
        } catch (error) {}
    }
}

function sortedStatsViewer(isNations) {
    if (isNations) {return;}
    let statsViewerBody = document.getElementById('beaten').parentNode.parentNode.parentNode;
    let playerSelector = document.querySelectorAll('.selection-list');
    playerSelector.addEventListener('click', async (event) => {
        let player = event.target;
        let id = player.getAttribute("data-id");
        let playerRequest = await (await fetch(`https://pointercrate.com/api/v1/players/${id}`)).json();


    });
}

async function main() {
    chrome.storage.local.get('darkmode', function(result) {
        darkModeToggle(result.darkmode)
    })

    if (isDemonlist) {
        supporterText();
        controlBox();
        loadLegacy();
    };

    footerFix();
    hueModifier();

    document.getElementsByClassName('nav-hover-dropdown')[0].innerHTML += '\
    <li><a class="white hover" href="https://list-calc.finite-weeb.xyz/">List Points Calculator</a></li>'

    document.getElementsByClassName('nav-item hover white')[1].children[0].children[1].textContent = 'Docs'

    response = "<!DOCTYPE html><html "
    try {response = await (await fetch("https://pointercrate.com/account")).text();} catch (e) {}
    playerId = -1

    try {
        playerName = response.substring(response.indexOf("profile-display-name") + 22, response.indexOf('<', response.indexOf("profile-display-name")))
        if (playerName === "<!DOCTYPE html><html ") {
            playerName = "LOGIN"
        }
        accountPanel.children[1].textContent = playerName;
        accountPanel.children[0].textContent = '0.00 POINTS';

        chrome.storage.local.get("player_id", function(result) {
            if (result.player_id != undefined) {
                playerId = result.player_id;
            }
        })

        if (response.indexOf("claimed-player") != -1) {
            playerId = response.substring(response.indexOf('data-id="') + 9, response.indexOf('"', response.indexOf('data-id="') + 9))
            chrome.storage.local.set({"player_id": playerId}, function(){});
        }
    } catch (e) {console.error("Failed to load user. " + playerName + " " + playerId);}

    if (isDemonlist) {
        personalizedDemonlistView(); 
    } else if (isStatsViewer) {
        sortedStatsViewer(["/demonlist/statsviewer/nations", "demonlist/statsviewer/nations/"].includes(document.location.pathname));
    }

    // Poopstain's request :3
    if (document.location.pathname === "/demonlist/69") {
        var footer = document.getElementsByTagName("footer")[0]; 
        footer.insertAdjacentHTML('beforeend', '<img src="https://i.postimg.cc/MHv6DPFn/GIF-221116-170304.gif" />');
    };
}

main();