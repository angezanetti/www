﻿/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */

/**
 * Tabzilla global navigation for Mozilla projects
 *
 * This code is licensed under the Mozilla Public License 1.1.
 *
 * Event handling portions adapted from the YUI Event component used under
 * the following license:
 *
 *   Copyright © 2012 Yahoo! Inc. All rights reserved.
 *
 *   Redistribution and use of this software in source and binary forms,
 *   with or without modification, are permitted provided that the following conditions
 *   are met:
 *
 *   - Redistributions of source code must retain the above copyright notice,
 *     this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   - Neither the name of Yahoo! Inc. nor the names of YUI's contributors may
 *     be used to endorse or promote products derived from this software
 *     without specific prior written permission of Yahoo! Inc.
 *
 *   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *   TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Portions adapted from the jQuery Easing plugin written by Robert Penner and
 * used under the following license:
 *
 *   Copyright 2001 Robert Penner
 *   All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or without
 *   modification, are permitted provided that the following conditions are
 *   met:
 *
 *   - Redistributions of source code must retain the above copyright notice,
 *     this list of conditions and the following disclaimer.
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   - Neither the name of the author nor the names of contributors may be
 *     used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 *   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *   TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *
 * @copyright 2012 silverorange Inc.
 * @license   http://www.mozilla.org/MPL/MPL-1.1.html Mozilla Public License 1.1
 * @author    Michael Gauthier <mike@silverorange.com>
 * @author    Steven Garrity <steven@silverorange.com>
 */

function Tabzilla()
{
    if (typeof jQuery != 'undefined' && jQuery) {
        jQuery(document).ready(Tabzilla.init);
    } else {
        Tabzilla.run();
    }
}

Tabzilla.READY_POLL_INTERVAL = 40;
Tabzilla.readyInterval = null;
Tabzilla.jQueryCDNSrc =
    '//www.mozilla.org/media/js/libs/jquery-1.7.1.min.js';
Tabzilla.LINK_TITLE = {
    CLOSED: "Mozilla links",
    OPENED: "Close (Esc)"
}

Tabzilla.hasCSSTransitions = (function() {
    var div = document.createElement('div');
    div.innerHTML = '<div style="'
        + '-webkit-transition: color 1s linear;'
        + '-moz-transition: color 1s linear;'
        + '-ms-transition: color 1s linear;'
        + '-o-transition: color 1s linear;'
        + '"></div>';

    var hasTransitions = (
           (div.firstChild.style.webkitTransition !== undefined)
        || (div.firstChild.style.MozTransition !== undefined)
        || (div.firstChild.style.msTransition !== undefined)
        || (div.firstChild.style.OTransition !== undefined)
    );

    delete div;

    return hasTransitions;
})();

/**
 * Sets up the DOMReady event for Tabzilla
 *
 * Adapted from the YUI Event component. Defined in Tabzilla so we do not
 * depend on YUI or jQuery. The YUI DOMReady implementation is based on work
 * Dean Edwards, John Resig, Matthias Miller and Diego Perini.
 */
Tabzilla.run = function()
{
    var webkit = 0, isIE = false, ua = navigator.userAgent;
    var m = ua.match(/AppleWebKit\/([^\s]*)/);

    if (m && m[1]) {
        webkit = parseInt(m[1], 10);
    } else {
        m = ua.match(/Opera[\s\/]([^\s]*)/);
        if (!m || !m[1]) {
            m = ua.match(/MSIE\s([^;]*)/);
            if (m && m[1]) {
                isIE = true;
            }
        }
    }

    // Internet Explorer: use the readyState of a defered script.
    // This isolates what appears to be a safe moment to manipulate
    // the DOM prior to when the document's readyState suggests
    // it is safe to do so.
    if (isIE) {
        if (self !== self.top) {
            document.onreadystatechange = function() {
                if (document.readyState == 'complete') {
                    document.onreadystatechange = null;
                    Tabzilla.ready();
                }
            };
        } else {
            var n = document.createElement('p');
            Tabzilla.readyInterval = setInterval(function() {
                try {
                    // throws an error if doc is not ready
                    n.doScroll('left');
                    clearInterval(Tabzilla.readyInterval);
                    Tabzilla.readyInterval = null;
                    Tabzilla.ready();
                    n = null;
                } catch (ex) {
                }
            }, Tabzilla.READY_POLL_INTERVAL);
        }

    // The document's readyState in Safari currently will
    // change to loaded/complete before images are loaded.
    } else if (webkit && webkit < 525) {
        Tabzilla.readyInterval = setInterval(function() {
            var rs = document.readyState;
            if ('loaded' == rs || 'complete' == rs) {
                clearInterval(Tabzilla.readyInterval);
                Tabzilla.readyInterval = null;
                Tabzilla.ready();
            }
        }, Tabzilla.READY_POLL_INTERVAL);

    // FireFox and Opera: These browsers provide a event for this
    // moment.  The latest WebKit releases now support this event.
    } else {
        Tabzilla.addEventListener(document, 'DOMContentLoaded', Tabzilla.ready);
    }
};

Tabzilla.ready = function()
{
    if (!Tabzilla.DOMReady) {
        Tabzilla.DOMReady = true;

        var onLoad = function() {
            Tabzilla.init();
            Tabzilla.removeEventListener(
                document,
                'DOMContentLoaded',
                Tabzilla.ready
            );
        };

        // if we don't have jQuery, dynamically load jQuery from CDN
        if (typeof jQuery == 'undefined') {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = Tabzilla.jQueryCDNSrc;
            document.getElementsByTagName('body')[0].appendChild(script);

            if (script.readyState) {
                // IE
                script.onreadystatechange = function() {
                    if (   script.readyState == 'loaded'
                        || script.readyState == 'complete'
                    ) {
                        onLoad();
                    }
                };
            } else {
                // Others
                script.onload = onLoad;
            }
        } else {
            onLoad();
        }
    }
};

Tabzilla.init = function()
{
    if (!Tabzilla.hasCSSTransitions) {
        // add easing functions
        jQuery.extend(jQuery.easing, {
            'easeInOut':  function (x, t, b, c, d) {
                if (( t /= d / 2) < 1) {
                    return c / 2 * t * t + b;
                }
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        });
    }

    Tabzilla.link  = document.getElementById('tabzilla');
    Tabzilla.panel = Tabzilla.buildPanel();

    // add panel as first element of body element
    var body = document.getElementsByTagName('body')[0];
    body.insertBefore(Tabzilla.panel, body.firstChild);

    // set up event listeners for link
    Tabzilla.addEventListener(Tabzilla.link, 'click', function(e) {
        Tabzilla.preventDefault(e);
        Tabzilla.toggle();
    });

    Tabzilla.$panel = jQuery(Tabzilla.panel);
    Tabzilla.$link  = jQuery(Tabzilla.link);

    Tabzilla.$panel.addClass('tabzilla-closed');
    Tabzilla.$link.addClass('tabzilla-closed');
    Tabzilla.$panel.removeClass('tabzilla-opened');
    Tabzilla.$link.removeClass('tabzilla-opened');

    Tabzilla.$panel.attr("tabindex","-1");
    Tabzilla.$link.attr({
        "role": "button",
        "aria-expanded": "false",
        "aria-controls": Tabzilla.$panel.attr("id"),
        "title": Tabzilla.LINK_TITLE.CLOSED
    });

    Tabzilla.opened = false;

    jQuery(document).keydown(function(e) {
        if (e.which === 27 && Tabzilla.opened) {
            Tabzilla.toggle();
        }
    });
    Tabzilla.$link.keypress(function(e) {
        if (e.which === 32) {
            Tabzilla.toggle();
            Tabzilla.preventDefault(e);
        }
    });
    Tabzilla.$panel.keypress(function(e) {
        if (e.which === 13) {
            Tabzilla.toggle();
            Tabzilla.$link.focus();
        }
    });
};

Tabzilla.buildPanel = function()
{
    var panel = document.createElement('div');
    panel.id = 'tabzilla-panel';
    panel.innerHTML = Tabzilla.content;
    return panel;
};

Tabzilla.addEventListener = function(el, ev, handler)
{
    if (typeof el.attachEvent != 'undefined') {
        el.attachEvent('on' + ev, handler);
    } else {
        el.addEventListener(ev, handler, false);
    }
};

Tabzilla.removeEventListener = function(el, ev, handler)
{
    if (typeof el.detachEvent != 'undefined') {
        el.detachEvent('on' + ev, handler);
    } else {
        el.removeEventListener(ev, handler, false);
    }
};

Tabzilla.toggle = function()
{
    if (Tabzilla.opened) {
        Tabzilla.close();
    } else {
        Tabzilla.open();
    }
};

Tabzilla.open = function()
{
    if (Tabzilla.opened) {
        return;
    }

    if (Tabzilla.hasCSSTransitions) {
        Tabzilla.$panel.addClass('tabzilla-opened');
        Tabzilla.$link.addClass('tabzilla-opened');
        Tabzilla.$panel.removeClass('tabzilla-closed');
        Tabzilla.$link.removeClass('tabzilla-closed');
    } else {
        // jQuery animation fallback
        jQuery(Tabzilla.panel).animate({ height: 200 }, 200, 'easeInOut').toggleClass("open");;
    }

    Tabzilla.$link.attr({
        "aria-expanded": "true",
        "title": Tabzilla.LINK_TITLE.OPENED
    });
    Tabzilla.$panel.focus();
    Tabzilla.opened = true;
};

Tabzilla.close = function()
{
    if (!Tabzilla.opened) {
        return;
    }

    if (Tabzilla.hasCSSTransitions) {
        Tabzilla.$panel.removeClass('tabzilla-opened');
        Tabzilla.$link.removeClass('tabzilla-opened');
        Tabzilla.$panel.addClass('tabzilla-closed');
        Tabzilla.$link.addClass('tabzilla-closed');
    } else {
        // jQuery animation fallback
        jQuery(Tabzilla.panel).animate({ height: 0 }, 200, 'easeInOut', function(){
            $(this).toggleClass("open");
        });

    }

    Tabzilla.$link.attr({
        "aria-expanded": "false",
        "title": Tabzilla.LINK_TITLE.CLOSED
    });
    Tabzilla.opened = false;
};

Tabzilla.preventDefault = function(ev)
{
    if (ev.preventDefault) {
        ev.preventDefault();
    } else {
        ev.returnValue = false;
    }
};

Tabzilla.content =
    '<div id="tabzilla-contents">'
    + '  <div id="tabzilla-promo">'
    + '    <div class="snippet" id="tabzilla-promo-beta">'
    + '    <a href="https://www.mozilla.org/fr/firefox/beta/">'
    + '      <b>Téléchargez<br/>Firefox Bêta</b> Donnez-nous votre avis et aidez-nous à'
    + '      améliorer Firefox.</a>'
    + '    </div>'
    + '  </div>'
    + '  <div id="tabzilla-nav">'
    + '    <ul>'
    + '      <li><h2>MozFR</h2>'
    + '        <ul>'
    + '          <li><a href="http://mozfr.org/manifesto">Mission</a></li>'
    + '          <li><a href="http://planete.mozfr.org/">Nouvelles en français</a></li>'
    + '          <li><a href="http://blog.mozfr.org/">Blog généraliste</a></li>'
    + '          <li><a href="http://tech.mozfr.org/">Blog technique</a></li>'
    + '          <li><a href="http://wiki.mozfr.org/MozFR:Accueil">Tous les projets</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li><h2>Projets</h2>'
    + '        <ul>'
    + '          <li><a href="http://wiki.mozfr.org/Contribuer_aux_traductions">Traduction</a></li>'
    + '          <li><a href="http://wiki.mozfr.org/Cat%C3%A9gorie:Devops">Développement</a></li>'
    + '          <li><a href="http://forums.mozfr.org/">Forums d\'assistance</a></li>'
    + '          <li><a href="http://wiki.mozfr.org/Cat%C3%A9gorie:Techno">Éducation et promotion technique</a></li>'
    + '          <li><a href="http://wiki.mozfr.org/Cat%C3%A9gorie:Communication">Communication</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li><h2>Logiciels</h2>'
    + '        <ul>'
    + '          <li><a href="https://www.mozilla.org/fr/firefox/fx/">Firefox</a></li>'
    + '          <li><a href="https://www.mozilla.org/fr/thunderbird/">Thunderbird</a></li>'
    + '          <li><a href="https://wiki.mozilla.org/B2G">Firefox OS</a></li>'
    + '          <li><a href="https://addons.mozilla.org/fr/">Extensions</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li><h2>Participer</h2>'
    + '        <ul>'
    + '          <li><a href="http://mozfr.org/mailman/listinfo/moz-fr">Liste de discussion</a></li>'
    + '          <li><a href="http://mozfr.org/participer">Comment participer</a></li>'
    + '          <li><a href="http://wiki.mozfr.org/MozFR:Actualit%C3%A9s">Agenda</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li id="tabzilla-search">'
    + '        <form title="Rechercher sur les sites Mozilla" role="search" action="http://www.google.com/cse">'
    + '          <input type="hidden" value="012979626855902919476:dbllh5qyali" name="cx">'
    + '          <input type="hidden" value="FORID:0" name="cof">'
    + '          <label for="q">Recherche</label>'
    + '          <input type="search" placeholder="Recherche" id="q" name="q">'
    + '        </form>'
    + '      </li>'
    + '    </ul>'
    + '  </div>'
    + '</div>';

Tabzilla();
