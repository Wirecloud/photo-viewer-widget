/*
 *     (C) Copyright 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the photo-viewer widget.
 *
 *     photo-viewer is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or (at
 *     your option) any later version.
 *
 *     photo-viewer is distributed in the hope that it will be useful, but
 *     WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with photo-viewer. If not, see <http://www.gnu.org/licenses/>.
 *
 *     Linking this library statically or dynamically with other modules is
 *     making a combined work based on this library.  Thus, the terms and
 *     conditions of the GNU Affero General Public License cover the whole
 *     combination.
 *
 *     As a special exception, the copyright holders of this library give you
 *     permission to link this library with independent modules to produce an
 *     executable, regardless of the license terms of these independent
 *     modules, and to copy and distribute the resulting executable under
 *     terms of your choice, provided that you also meet, for each linked
 *     independent module, the terms and conditions of the license of that
 *     module.  An independent module is a module which is not derived from
 *     or based on this library.  If you modify this library, you may extend
 *     this exception to your version of the library, but you are not
 *     obligated to do so.  If you do not wish to do so, delete this
 *     exception statement from your version.
 *
 */

/*jshint browser:true white:true*/
/*global MashupPlatform */

(function () {

    "use strict";

    var PhotoViewer = function PhotoViewer() {
        MashupPlatform.wiring.registerCallback("urlSlot", this.setNewImage.bind(this));

        this.originalSizeX = 0;
        this.originalSizeY = 0;

        this.MAX_ZOOM = 200;
        this.MIN_ZOOM = 10;
        this.DEFAULT_ZOOM = 100;
        this.INC = 10;

        this.actualZoom = this.DEFAULT_ZOOM;

        this.widgetHeight = 0;
        this.widgetWidth = 0;

        this.image = {};
        this.defaultImage = "images/defaultPhoto.png";

        MashupPlatform.widget.context.registerCallback(function (new_values) {
                if (this.image && 'heightInPixels' in new_values) {
                    this.defaultZoom.call(this);
                }
            }.bind(this));
    };

    PhotoViewer.prototype.init = function init() {
        document.getElementById("fitZoom").addEventListener("click", this.defaultZoom.bind(this), false);
        document.getElementById("zoomIn").addEventListener("click", this.expandZoom.bind(this), false);
        document.getElementById("zoomOut").addEventListener("click", this.reduceZoom.bind(this), false);
        document.getElementById("originalSize").addEventListener("click", this.originalSizeZoom.bind(this), false);

        this.setNewImage.call(this, this.defaultImage);
    };

    PhotoViewer.prototype.setNewImage = function setNewImage(value) {
        if (value) {
            var divImageContainer = document.getElementById("imageContainer");
            var containerHasImage = divImageContainer.hasChildNodes();
            if (containerHasImage) {
                this.image = divImageContainer.getElementsByTagName('img')[0];
                divImageContainer.removeChild(this.image);
            }
            this.image = document.createElement('img');
            this.image.setAttribute('src', value);
            this.image.addEventListener("load", imgLoaded.bind(this), false);
            divImageContainer.appendChild(this.image);
            document.getElementById("zoomUtilities").setAttribute("style", "display:block");
        }
    };

    PhotoViewer.prototype.setSize = function setSize(value) {
        var lowestProportion;
        switch (value) {
        case 0: // Display image fit to the window //
            this.widgetHeight = MashupPlatform.widget.context.get('heightInPixels');
            this.widgetWidth = MashupPlatform.widget.context.get('widthInPixels');

            lowestProportion = this.lowestProportion.call(this);

            this.image.style.width = Math.floor(this.originalSizeX * lowestProportion) + 'px';
            this.image.style.height = Math.floor(this.originalSizeY * lowestProportion) + 'px';
            this.actualZoom = this.DEFAULT_ZOOM * lowestProportion;

            break;
        case 1: // Display image in original size //
            this.image.style.width = this.originalSizeX + 'px';
            this.image.style.height = this.originalSizeY + 'px';
            this.actualZoom = this.DEFAULT_ZOOM;
            break;
        default: // Zoom in or zoom out //
            this.image.style.width = (this.originalSizeX * value / 100) + 'px';
            this.image.style.height = (this.originalSizeY * value / 100) + 'px';
            break;
        }
    };

    PhotoViewer.prototype.lowestProportion = function lowestProportion() {
        var heightProportion;
        var widthProportion;
        var error = 0.01;

        widthProportion = this.widgetWidth / this.originalSizeX;
        heightProportion = this.widgetHeight / this.originalSizeY;
        widthProportion -= error;
        heightProportion -= error;

        return ((widthProportion < heightProportion) ? (widthProportion) : (heightProportion));
    };

    PhotoViewer.prototype.expandZoom = function expandZoom() {
        if ((this.actualZoom + this.INC) < this.MAX_ZOOM) {
            this.actualZoom += this.INC;
        } else {
            this.actualZoom = this.MAX_ZOOM;
        }
        this.setSize.call(this, this.actualZoom);
    };

    PhotoViewer.prototype.reduceZoom = function reduceZoom() {
        if ((this.actualZoom - this.INC) > this.MIN_ZOOM) {
            this.actualZoom -= this.INC;
        } else {
            this.actualZoom = this.MIN_ZOOM;
        }
        this.setSize.call(this, this.actualZoom);
    };

    PhotoViewer.prototype.defaultZoom = function defaultZoom() {
        this.setSize.call(this, 0);
    };

    PhotoViewer.prototype.originalSizeZoom = function originalSizeZoom() {
        this.setSize.call(this, 1);
    };

/****************************************************************************************/
/************************************ private *******************************************/
/****************************************************************************************/

    var imgLoaded = function imgLoaded() {
        this.originalSizeX = this.image.width;
        this.originalSizeY = this.image.height;
        this.defaultZoom.call(this);
        this.image.addEventListener("mousewheel", handlerMouseWheel.bind(this), false);
    };

    var handlerMouseWheel = function handlerMouseWheel(event) {
        event.preventDefault();
        if (event.wheelDelta < 0) {
            this.reduceZoom();
        } else if (event.wheelDelta > 0) {
            this.expandZoom();
        }
    };

    window.PhotoViewer =  PhotoViewer;

})();

var photoViewer = new PhotoViewer();

document.addEventListener("DOMContentLoaded", photoViewer.init.bind(photoViewer), false);
