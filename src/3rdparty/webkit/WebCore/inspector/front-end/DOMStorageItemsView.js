/*
 * Copyright (C) 2008 Nokia Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.DOMStorageItemsView = function(domStorage)
{
    WebInspector.View.call(this);

    this.domStorage = domStorage;

    this.element.addStyleClass("storage-view");
    this.element.addStyleClass("table");

    this.deleteButton = new WebInspector.StatusBarButton(WebInspector.UIString("Delete"), "delete-storage-status-bar-item");
    this.deleteButton.visible = false;
    this.deleteButton.addEventListener("click", this._deleteButtonClicked.bind(this), false);

    this.refreshButton = new WebInspector.StatusBarButton(WebInspector.UIString("Refresh"), "refresh-storage-status-bar-item");
    this.refreshButton.addEventListener("click", this._refreshButtonClicked.bind(this), false);
}

WebInspector.DOMStorageItemsView.prototype = {
    get statusBarItems()
    {
        return [this.refreshButton.element, this.deleteButton.element];
    },

    show: function(parentElement)
    {
        WebInspector.View.prototype.show.call(this, parentElement);
        this.update();
    },

    hide: function()
    {
        WebInspector.View.prototype.hide.call(this);
        this.deleteButton.visible = false;
    },

    update: function()
    {
        this.element.removeChildren();
        var callback = this._showDOMStorageEntries.bind(this);
        this.domStorage.getEntries(callback);
    },

    _showDOMStorageEntries: function(entries) 
    {
        if (entries.length > 0) {
            this._dataGrid = this._dataGridForDOMStorageEntries(entries);
            this.element.appendChild(this._dataGrid.element);
            this._dataGrid.updateWidths();
            this.deleteButton.visible = true;
        } else {
            var emptyMsgElement = document.createElement("div");
            emptyMsgElement.className = "storage-table-empty";
            if (this.domStorage)
                emptyMsgElement.textContent = WebInspector.UIString("This storage is empty.");
            this.element.appendChild(emptyMsgElement);
            this._dataGrid = null;
            this.deleteButton.visible = false;
        }
    },

    resize: function()
    {
        if (this._dataGrid)
            this._dataGrid.updateWidths();
    },

    _dataGridForDOMStorageEntries: function(entries)
    {
        var columns = {};
        columns[0] = {};
        columns[1] = {};
        columns[0].title = WebInspector.UIString("Key");
        columns[0].width = columns[0].title.length;
        columns[1].title = WebInspector.UIString("Value");
        columns[1].width = columns[1].title.length;

        var nodes = [];

        var keys = [];
        var length = entries.length;
        for (var i = 0; i < entries.length; i++) {
            var data = {};

            var key = entries[i][0];
            data[0] = key;
            if (key.length > columns[0].width)
                columns[0].width = key.length;

            var value = entries[i][1];
            data[1] = value;
            if (value.length > columns[1].width)
                columns[1].width = value.length;
            var node = new WebInspector.DataGridNode(data, false);
            node.selectable = true;
            nodes.push(node);
            keys.push(key);
        }

        var totalColumnWidths = columns[0].width + columns[1].width;
        var width = Math.round((columns[0].width * 100) / totalColumnWidths);
        const minimumPrecent = 10;
        if (width < minimumPrecent)
            width = minimumPrecent;
        if (width > 100 - minimumPrecent)
            width = 100 - minimumPrecent;
        columns[0].width = width;
        columns[1].width = 100 - width;
        columns[0].width += "%";
        columns[1].width += "%";

        var dataGrid = new WebInspector.DOMStorageDataGrid(columns, this.domStorage, keys);
        var length = nodes.length;
        for (var i = 0; i < length; ++i)
            dataGrid.appendChild(nodes[i]);
        dataGrid.addCreationNode(false);
        if (length > 0)
            nodes[0].selected = true;
        return dataGrid;
    },

    _deleteButtonClicked: function(event)
    {
        if (this._dataGrid) {
            this._dataGrid.deleteSelectedRow();
            
            this.show();
        }
    },

    _refreshButtonClicked: function(event)
    {
        this.update();
    }
}

WebInspector.DOMStorageItemsView.prototype.__proto__ = WebInspector.View.prototype;
