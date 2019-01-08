/**
 * @author Pit Ogermann
 */

function loadScript(url){
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
}

// load engine:
loadScript('js/lib/stats.min.js');
loadScript('js/lib/FirstPersonControls.js');
loadScript('js/lib/computeCollision.js');
