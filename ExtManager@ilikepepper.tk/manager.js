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

const Signals = imports.signals;
const Lang = imports.lang;

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;


const EXTENSIONS_SCHEMA          = "org.gnome.shell";
const ENABLED_EXTENSIONS_KEY     = "enabled-extensions";
const EXTENSIONS_PATH            = "/.local/share/gnome-shell/extensions";
const SW_EXTENSIONS_PATH         = "/usr/share/gnome-shell/extensions"

function ExtManager () {
    this._init();
}

ExtManager.prototype = {
    _init: function() {

        this.availableExtensions = [];
       
        this.gSettings = new Gio.Settings({schema: EXTENSIONS_SCHEMA});
        this.extVariant = this.gSettings.get_value(ENABLED_EXTENSIONS_KEY);
        this.userHomeDir = GLib.get_home_dir();

        this.enabledExtensions = this.extVariant.get_strv();

        let extensionsPath = Gio.file_new_for_path(this.userHomeDir + EXTENSIONS_PATH);
        let installedUserExtensions = extensionsPath.enumerate_children(Gio.FILE_ATTRIBUTE_STANDARD_NAME,Gio.FileQueryInfoFlags.NONE,null);
        
        let swExtensionsPath = Gio.file_new_for_path(SW_EXTENSIONS_PATH);
        let installedSwExtensions = swExtensionsPath.enumerate_children(Gio.FILE_ATTRIBUTE_STANDARD_NAME,Gio.FileQueryInfoFlags.NONE,null);

        // User Extensions
        while((installedExtName = installedUserExtensions.next_file(null))) {
            let fileType = installedExtName.get_file_type();
            this.availableExtensions.push(installedExtName.get_name());
        }

        // System Wide Extensions
        while((installedSwExtName = installedSwExtensions.next_file(null))) {
            let fileType = installedSwExtName.get_file_type();
            this.availableExtensions.push(installedSwExtName.get_name());
        }
    },

    getEnabledExtensions: function() { 
      
        return this.enabledExtensions;  
        
    },

    getAvailExtensions: function() {
        
        return this.availableExtensions;
    },

    
    // Used for debugging in early stage development
    /*
    _printAvailExtensions: function() {
        print("Available User Extensions:");
        for each (let extension in this.availableExtensions) {
            print(extension);
        }
        print();
    },

    _printEnabledExtensions: function() {
        print("Enabled Extensions:")
        for each (let extension in this.enabledExtensions) {
            print(extension);
        }
        print();
    }, 
    */

    enableExtension: function(extensionName) {
        let extIndex = this.enabledExtensions.indexOf(extensionName);
        if (extIndex == -1) {
            this.enabledExtensions.push(extensionName);
            this._writeExtensionData();
        }
        
    },

    disableExtension: function(extensionName) {
        let extIndex = this.enabledExtensions.indexOf(extensionName);
        if (extIndex != -1) {
            this.enabledExtensions.splice(extIndex,1);
            this._writeExtensionData();
        }
    },

    _writeExtensionData: function() {
        this.gSettings.set_strv(ENABLED_EXTENSIONS_KEY,this.enabledExtensions);
    }
}

