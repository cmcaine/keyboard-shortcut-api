"use strict";
function createButton(context, func, name, timeout = 0) {
  const button = document.createElement("input");
  button.type = "button";
  button.value = name;
  button.onclick = (timeout > 0)
    ? () => {
      document.getElementById("lorem").focus();
      window.setTimeout(() => { func(); }, timeout); }
    : () => { func(); };
  context.appendChild(button);
}

window.onload = function() {
  console.log(browser);
  console.log(browser.keyboard_shortcut);
  const shortcuts = Object.getOwnPropertyNames(browser.keyboard_shortcut);
  let category = "";
  for (var i = 0; i < shortcuts.length; i++) {
    let name = shortcuts[i].toString(), func = browser.keyboard_shortcut[name];
    let temp, timeout;
    if ((temp = name.match(/^[a-z]+/)[0]) !== category) {
      category = temp;
      document.body.appendChild(document.createElement("br"));
    }
    if (category === "edit") { timeout = 2000;
    } else if (name === "tabSelect") {
      for (let j = 1; j < 9; j++) {
        createButton(
          document.body,
          () => { func.call(this, j); }, name + j, timeout);
      }
      continue;
    } else if (name === "toggleReaderMode") {
      func = () => {
        const url =
          prompt("URL (complete with scheme) to read.", "https://mozilla.org");
        if (url) {
          const tab = browser.tabs.create({'url':url});
          tab.then(window.setTimeout(
            () => { browser.keyboard_shortcut[name](); }, 4000));
        }
      }
      createButton(document.body,
        () => { func(); window.setTimeout(
          () => { browser.keyboard_shortcut[name](); }, 8000) },
        name + "AndExit",
        timeout);
    }
    createButton(document.body, func, name, timeout);
  };
  document.body.appendChild(document.createElement("br"));

  // For testing edit commands.

  const usage = document.createElement("p");
  document.body.appendChild(usage);
  const textbox = document.createElement("textarea");
  textbox.id = "lorem";
  textbox.value = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a erat purus. Aliquam accumsan, nulla id consectetur condimentum, magna erat egestas dolor, id gravida dolor ex sed lorem. Pellentesque condimentum dictum placerat. Integer non elementum sapien. Nulla et fermentum nisl. Curabitur ac scelerisque odio. Quisque sed hendrerit purus. In nec ante ligula. Cras mollis metus turpis, et mollis velit semper ac. Praesent ultrices mauris nibh, a feugiat elit finibus vel. In aliquam, dolor quis porta dapibus, enim ipsum venenatis risus, in luctus odio sem vel dui."
  textbox.style = "width: 100%; height: 200px;"
  document.body.appendChild(textbox);
  const mode = document.createElement("p");
  document.body.appendChild(mode);

  // Really rubbish VIM-mode.

  let INSERTMODE=false;
  function toggleMode() {
    INSERTMODE = !INSERTMODE;
    mode.innerHTML = INSERTMODE ? "INSERT" : "NORMAL";
  }
  toggleMode();

  // keyboard shortcuts for testing edit commands.
  const KEYMAP = {
    'y': browser.keyboard_shortcut.editCopy,
    'x': browser.keyboard_shortcut.editCut,
    'd': browser.keyboard_shortcut.editDelete,
    'p': browser.keyboard_shortcut.editPaste,
    'P': browser.keyboard_shortcut.editPasteAsPlainText,
    'R': browser.keyboard_shortcut.editRedo,
    'A': browser.keyboard_shortcut.editSelectAll,
    'u': browser.keyboard_shortcut.editUndo,
    'i': toggleMode
  }

  // Quick and dirty usage message (.name isn't set properly, so can't
  // introspect)
  let usagestr = `<br/>
    'y': browser.keyboard_shortcut.editCopy,<br/>
    'x': browser.keyboard_shortcut.editCut,<br/>
    'd': browser.keyboard_shortcut.editDelete,<br/>
    'p': browser.keyboard_shortcut.editPaste,<br/>
    'P': browser.keyboard_shortcut.editPasteAsPlainText,<br/>
    'R': browser.keyboard_shortcut.editRedo,<br/>
    'A': browser.keyboard_shortcut.editSelectAll,<br/>
    'u': browser.keyboard_shortcut.editUndo,<br/>
    'i': toggleMode<br/>
  `

  usage.innerHTML = "Keyboard shortcuts (NORMAL mode only): " + usagestr +
    "<br/>Use Escape to return to NORMAL mode from INSERT.";

  // Really bad VIM-mode parser.
  function dispatch(ke) {
    if (ke.target.type !== "textarea") {
      return
    }
    if (INSERTMODE) {
      if (ke.key === "Escape")
        toggleMode()
      return
    }
    else {
      // Bad hack: Assume that a key is unprintable if len > 1.
      // Permit unprintable characters for arrow keys, mostly.
      if (ke.key.length === 1) {
        ke.preventDefault()
      }
      if (ke.key in KEYMAP) {
        KEYMAP[ke.key]()
      }
    }
  }

  window.addEventListener("keydown", dispatch)
}
