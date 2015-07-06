// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

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
// // Create one test item for each context type.
// var contexts = ["page","selection","link","editable","image","video",
//                 "audio"];
// for (var i = 0; i < contexts.length; i++) {
//   var context = contexts[i];
//   var title = "Test '" + context + "' menu item";
//   var id = chrome.contextMenus.create({"title": title, "contexts":[context],
//                                        "onclick": genericOnClick});
//   console.log("'" + context + "' item:" + id);
// }


// // Create a parent item and two children.
// var parent = chrome.contextMenus.create({"title": "Test parent item"});
// var child2 = chrome.contextMenus.create(
//   {"title": "Child 2", "parentId": parent, "onclick": genericOnClick});
// console.log("parent:" + parent + " child1:" + child1 + " child2:" + child2);


// // Create some radio items.
// function radioOnClick(info, tab) {
//   console.log("radio item " + info.menuItemId +
//               " was clicked (previous checked state was "  +
//               info.wasChecked + ")");
// }
// var radio1 = chrome.contextMenus.create({"title": "Radio 1", "type": "radio",
//                                          "onclick":radioOnClick});
// var radio2 = chrome.contextMenus.create({"title": "Radio 2", "type": "radio",
//                                          "onclick":radioOnClick});
// console.log("radio1:" + radio1 + " radio2:" + radio2);


// // Create some checkbox items.
// function checkboxOnClick(info, tab) {
//   console.log(JSON.stringify(info));
//   console.log("checkbox item " + info.menuItemId +
//               " was clicked, state is now: " + info.checked +
//               "(previous state was " + info.wasChecked + ")");

// }
// var checkbox1 = chrome.contextMenus.create(
//   {"title": "Checkbox1", "type": "checkbox", "onclick":checkboxOnClick});
// var checkbox2 = chrome.contextMenus.create(
//   {"title": "Checkbox2", "type": "checkbox", "onclick":checkboxOnClick});
// console.log("checkbox1:" + checkbox1 + " checkbox2:" + checkbox2);


// // Intentionally create an invalid item, to show off error checking in the
// // create callback.
// console.log("About to try creating an invalid item - an error about " +
//             "item 999 should show up");
// chrome.contextMenus.create({"title": "Oops", "parentId":999}, function() {
//   if (chrome.extension.lastError) {
//     console.log("Got expected error: " + chrome.extension.lastError.message);
//   }
// });
