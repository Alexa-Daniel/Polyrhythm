const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

const audioFiles = [
    "Notes/A2.wav", "Notes/B2.wav", "Notes/C2.wav", "Notes/D2.wav", "Notes/E2.wav", "Notes/F2.wav", "Notes/G2.wav",
    "Notes/A3.wav", "Notes/B3.wav", "Notes/C3.wav", "Notes/D3.wav", "Notes/E3.wav", "Notes/F3.wav", "Notes/G3.wav",
    "Notes/A4.wav", "Notes/B4.wav", "Notes/C4.wav", "Notes/D4.wav", "Notes/E4.wav", "Notes/F4.wav", "Notes/G4.wav"
];

let left_right_Offset = parseFloat(canvas.width) / 10.0;
let top_down_Offset = parseFloat(canvas.height) / 5.5;
let numberOfNotes = 21;
let beginningLeftLine = left_right_Offset;
let beginningLeftCirc = beginningLeftLine - 5;
let beginningTopCirc = top_down_Offset - 5;
let beginningTime = 5;
let beginningTop = top_down_Offset;
let endTop = canvas.height-top_down_Offset;
let lineXDiff = parseFloat(canvas.width-2*left_right_Offset)/21.0;
let timeDiff = 0.1;

let style = document.styleSheets[0];
style.insertRule(`
@keyframes travel-two 
{
    from
    {
        top: ${beginningTop + 1}px;
    }
    to
    {
        top: ${endTop - 1}px;
    }
}`, style.cssRules.length);



const gradients = [
    "#CC0000", "#FF0000", "#FF1A1A", "#FF3333", "#FF5050",
    "#FF3377", "#FF0099", "#FF00CC", "#FF00E6", "#E600FF",
    "#CC33FF", "#B266FF", "#9933FF", "#7F00FF", "#6600CC",
    "#4C00B0", "#0080FF", "#0066CC", "#004C99", "#003366", "#001F3F"
];

const line = new Array(numberOfNotes).fill("#808080"); // Initialize all lines as gray

function drawLines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 5;

    for (let i = 0; i < numberOfNotes; i++) {
        ctx.beginPath();
        ctx.strokeStyle = line[i];
        ctx.moveTo((beginningLeftLine - 1) + i * lineXDiff, beginningTop);
        ctx.lineTo((beginningLeftLine - 1) + i * lineXDiff, endTop);
        ctx.stroke();
    }
}

drawLines();

function drawCirclesAndStyles() {
    for (let i = 0; i < numberOfNotes; i++) {
        let div = document.createElement("div");
        div.className = "circle";
        div.id = `circ${i + 1}`;
        document.body.prepend(div);

        let style = document.styleSheets[0];
        let rule = `#circ${i + 1} {
        left: ${beginningLeftCirc + i * lineXDiff}px;
        top: ${beginningTopCirc}px;
        animation-duration: ${beginningTime - i * timeDiff}s;
    }`;
        style.insertRule(rule, style.cssRules.length);
    }
}

drawCirclesAndStyles();

const circles = document.querySelectorAll(".circle");

let playSound = false;
canvas.onclick = () => {
    let mute_icon = document.getElementById("muted");
    let unmute_icon = document.getElementById("unmuted");
    playSound = !playSound;
    unmute_icon.style.visibility = playSound ? "visible" : "hidden";
    mute_icon.style.visibility = playSound ? "hidden" : "visible";
};

document.onvisibilitychange = () => {
    let mute_icon = document.getElementById("muted");
    let unmute_icon = document.getElementById("unmuted");
    playSound = false;
    unmute_icon.style.visibility = playSound ? "visible" : "hidden";
    mute_icon.style.visibility = playSound ? "hidden" : "visible";
};

const percents = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const activeFades = new Array(numberOfNotes).fill(false); // Track active fades

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function fadeToGray(index, hex2, callback) {
    let red1 = parseInt(line[index].substring(1, 3), 16);
    let green1 = parseInt(line[index].substring(3, 5), 16);
    let blue1 = parseInt(line[index].substring(5, 7), 16);

    let red2 = parseInt(hex2.substring(1, 3), 16);
    let green2 = parseInt(hex2.substring(3, 5), 16);
    let blue2 = parseInt(hex2.substring(5, 7), 16);

    let stepIndex = 0;

    function fadeStep() {
        if (stepIndex >= percents.length) {
            //activeFades[index] = false; // Mark fade as complete
            if (callback) callback();
            return;
        }

        line[index] = rgbToHex(
            red1 + (red2 - red1) * percents[stepIndex],
            green1 + (green2 - green1) * percents[stepIndex],
            blue1 + (blue2 - blue1) * percents[stepIndex]
        );

        drawLines();
        stepIndex++;
        setTimeout(fadeStep, 100);
    }
    fadeStep();
}

circles.forEach((circle, i) => {
    circle.addEventListener("animationiteration", () => {
        if (playSound) {
            let audio = new Audio(audioFiles[i]);
            audio.volume = 1;
            audio.play().catch(err => console.log("Audio play error:", err));
            circle.style.transition = "none";
            circle.style.background = gradients[i];

            let lineIndex = numberOfNotes - i - 1;

            //if (!activeFades[lineIndex]) {
                //activeFades[lineIndex] = true; // Mark fade as active
                line[lineIndex] = gradients[i];
                drawLines();
                fadeToGray(lineIndex, "#808080", () => {
                    //activeFades[lineIndex] = false; // Unmark fade when done
                });
            //}

            setTimeout(() => {
                circle.style.transition = "background 1s ease-out";
                circle.style.background = "white";
            }, 500);
        }
    });
});