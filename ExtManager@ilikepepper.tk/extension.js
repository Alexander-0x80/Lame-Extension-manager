/*
    Gnome-Shell Extension Manager - Extension :)
    Copyright (C) 2012  Alexander Ovchinnikov

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/


const St = imports.gi.St;
const Shell = imports.gi.Shell;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;
const Main = imports.ui.main;
const Lang = imports.lang;
const Util = imports.misc.util;
const GLib = imports.gi.GLib;

const ExtensionUtils = imports.misc.extensionUtils;
const mgr = ExtensionUtils.getCurrentExtension();

const ext = mgr.imports.manager;
const extManager = new ext.ExtManager;

function ManagerExtension() {
   this._init();
}

ManagerExtension.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,
   
    _init: function() {
        
        this.userExtensions = extManager.getAvailExtensions();
        this.userExtensionsStatus = [this.userExtensions.length];
        this._buildExtensionsInfo();

        PanelMenu.SystemStatusButton.prototype._init.call(this, 'system-run');
        this._buildPopupMenu();

    },
   
    enable: function() {
        this._buildExtensionsInfo();
        let _children = Main.panel._rightBox.get_children();
        Main.panel._rightBox.insert_child_at_index(this.actor,0);
        Main.panel._menus.addMenu(this.menu);
    },

    disable: function() {
        Main.panel._menus.removeMenu(this.menu);
        Main.panel._rightBox.remove_actor(this.actor);
    },

    _buildPopupMenu: function() {
       let popupTitle = new PopupMenu.PopupMenuItem(_("Installed Extensions"), {reactive: false});
       this.menu.addMenuItem(popupTitle);
       this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

       for each (extension in this.userExtensions) {
         this._buildMenuItem(extension,this.userExtensionsStatus[this.userExtensions.indexOf(extension)]);
        }
        
        
        // Bottom buttons
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // User extensions
        let userExtensionsButton = new PopupMenu.PopupMenuItem(_("User extensions..."));
        this.menu.addMenuItem(userExtensionsButton);
        userExtensionsButton.connect('activate', function(){
		Util.spawn(['nautilus', GLib.get_home_dir() + ext.EXTENSIONS_PATH]);
	});
        
        // System-wide extensions
        let swExtensionsButton = new PopupMenu.PopupMenuItem(_("System-wide extensions..."));
        this.menu.addMenuItem(swExtensionsButton);
        swExtensionsButton.connect('activate', function(){
		Util.spawn(['nautilus', ext.SW_EXTENSIONS_PATH]);
	});
    },

    _buildMenuItem: function(extName,init_val){
      let menuItem = new PopupMenu.PopupSwitchMenuItem(_(extName),init_val);
      this.menu.addMenuItem(menuItem);
      menuItem.connect('activate',Lang.bind(this,function () { this._extensionClick(this.userExtensions.indexOf(extName),
                                                               this.userExtensionsStatus[this.userExtensions.indexOf(extName)]); }));
    },

    _buildExtensionsInfo: function() {
      let enabledExtensions = extManager.getEnabledExtensions();
      for each (userExtension in this.userExtensions){
        for each(enabledExtension in enabledExtensions) {
          if (enabledExtension == userExtension) {
            this.userExtensionsStatus[this.userExtensions.indexOf(userExtension)] = true;
            break;
          } else { this.userExtensionsStatus[this.userExtensions.indexOf(userExtension)] = false; }
        }    
      }
    },

    _extensionClick: function(extIndex,extStatus) {
      if (extStatus) { 
          extManager.disableExtension(this.userExtensions[extIndex]); 
           //global.log("disabled:"+ this.userExtensions[extIndex]);
      }
      else { 
          extManager.enableExtension(this.userExtensions[extIndex]);
          //global.log("enabled:" + this.userExtensions[extIndex]);
      }
          this.userExtensionsStatus[extIndex] = !extStatus;   
    }, 
}


function init() {
    return new ManagerExtension();
}

