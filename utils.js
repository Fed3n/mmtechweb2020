function arrCmp(arr1, arr2) {
    if (arr1.length != arr2.length) return false;
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] != arr2[i]) return false;
    }
    return true;
}
//Compara due quest o subquest a seconda dell'attributo number
function questCmp(q1, q2) {
    return q1.number - q2.number;
}
//Finds index of arg2 element in arg1 array using comparison function fun
function myIndexOf(arg1, arg2, fun) {
    for (var i = 0; i < arg1.length; i++) {
        if (fun(arg1[i], arg2)) return i;
    }
    return -1;
}

//returns if the array is sorted
function arraySorted(arr) {
    let sorted = true;
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i+1]) {
            sorted = false;
            break;
        }
    }
    return sorted;
}

//converts from hex to rgba format
//non hex color code are ignored
function HextoRgb(color) {
    if (color.search('#') != -1) {
        color = color.replace('#', '');
        let r = parseInt(color.substring(0, 2), 16);
        let g = parseInt(color.substring(2, 4), 16);
        let b = parseInt(color.substring(4, 6), 16);
        let result = 'rgb(' + r + ',' + g + ',' + b + ')';
        return result;
    } else
        return color;
}

function resetDivScrolling() {
    divs = document.querySelectorAll("div");
    for (el of divs) {
        el.scrollTop = 0;
    }
}

function scrollToBottom(id) {
    el = document.getElementById(id);
    el.scrollTop = el.scrollHeight;
}
