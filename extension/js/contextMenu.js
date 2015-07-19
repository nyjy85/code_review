// A generic onclick callback function.
function onClick(info, tab) {

  var colorChoice = info.menuItemId-info.parentMenuItemId-1;
  var color = colors[colorChoice];
  returnMessage(color, 'change-color');

}
 
var colors = ['#CEFF63','#FC1714','#FFA300', '#FEFF01', '#23CDFE', '#39FF14','#7C6EE6'];
// var parent = chrome.contextMenus.create({"title": "Add Comment", "contexts": ["all"], "onclick": onClick});

var parent = chrome.contextMenus.create({"title": "Change colors!"});

var defaultColor = chrome.contextMenus.create(
  {"title": "Default", "parentId": parent, "onclick": onClick});
var red = chrome.contextMenus.create(
  {"title": "Draw attention-Red", "parentId": parent, "onclick": onClick});
var orange = chrome.contextMenus.create(
  {"title": "Vitamin-C-Orange", "parentId": parent, "onclick": onClick});
var yellow = chrome.contextMenus.create(
  {"title": "Loud-Yellow", "parentId": parent, "onclick": onClick});
var blue = chrome.contextMenus.create(
  {"title": "Calming-Blue", "parentId": parent, "onclick": onClick});
var green = chrome.contextMenus.create(
  {"title": "Balanced-Green", "parentId": parent, "onclick": onClick});
var violet = chrome.contextMenus.create(
  {"title": "Express-Violet", "parentId": parent, "onclick": onClick});
