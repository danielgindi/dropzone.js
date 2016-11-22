'use strict';

/**
 * @typedef {Object} DropZone~Options
 * @property {string|Element|undefined|null} [append=null] - selector expression/element to append to the dropzone
 * @property {function(dataTransfer):Boolean} [allowDrop] - A function that determines whether we allow dropping or not
 */

/** @type {DropZone~Options} */
let defaultOptions = {
    append: null,
};

function createFragment(html) {
    const frag = document.createDocumentFragment();
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const childNodes = tmp.childNodes;
    while (childNodes.length) {
        frag.appendChild(childNodes[0]);
    }
    return frag;
}

class DropZone {
    /**
     * @param {Element} el
     * @param {DropZone~Options} options
     */
    constructor(el, options) {
        /** @type {DropZone~Options} */
        options = { ...defaultOptions, ...options };

        const p = this._p = {
            el: el,
            options: options,
        };

        if (!(el instanceof Element))
            throw new Error('DropZone constructor requires a valid DOM Element.');

        let globalDragCounter = 0,
            innerDragCounter = 0;

        const appendEl = typeof options.append === 'string'
            ? createFragment(options.append)
            : options.append instanceof Element
                ? options.append
                : null;

        p.innerDragOver = event => {
            if (typeof options.allowDrop === 'function'
                && !options.allowDrop(event.dataTransfer)) return;

            event.preventDefault();
        };

        p.innerDragEnter = event => {
            if (typeof options.allowDrop === 'function'
                && !options.allowDrop(event.dataTransfer)) {
                event.preventDefault();
                return;
            }

            if (typeof event !== 'undefined') {
                innerDragCounter++;
                if (innerDragCounter !== 1) {
                    return;
                }
            }

            el.classList.add('drop-over');

            if (appendEl) {
                appendEl.classList.add('drop-over');
            }
        };

        p.innerDragLeave = () => {
            if (typeof event !== 'undefined') {
                innerDragCounter = Math.max(innerDragCounter - 1, 0);
                if (innerDragCounter > 0) {
                    return;
                }
            } else {
                innerDragCounter = 0;
            }

            el.classList.remove('drop-over');

            if (appendEl) {
                appendEl.classList.remove('drop-over');
            }
        };

        p.innerDragDrop = () => {
            p.endGlobalDrag();
        };

        p.startGlobalDrag = event => {
            if (typeof options.allowDrop === 'function'
                && !options.allowDrop(event.dataTransfer)) {
                event.preventDefault();
                return;
            }

            if (typeof event !== 'undefined') {
                globalDragCounter++;
                if (globalDragCounter !== 1) {
                    return;
                }
            }

            el.classList.add('drop-available');

            if (appendEl) {
                el.append(appendEl);
            }

            (appendEl || el).addEventListener('dragover', p.innerDragOver);
            (appendEl || el).addEventListener('dragenter', p.innerDragEnter);
            (appendEl || el).addEventListener('dragleave', p.innerDragLeave);
            (appendEl || el).addEventListener('drop', p.innerDragDrop);
        };

        p.allowGlobalDrag = event => {
            if (typeof options.allowDrop === 'function'
                && !options.allowDrop(event.dataTransfer)) return;

            event.preventDefault();
        };

        p.endGlobalDrag = function (event) {
            if (typeof event !== 'undefined') {
                globalDragCounter = Math.max(globalDragCounter - 1, 0);
                if (globalDragCounter > 0) {
                    return;
                }
            } else {
                globalDragCounter = 0;
            }

            el.classList.remove('drop-available');

            if (appendEl) {
                appendEl.remove();
            }

            (appendEl || el).removeEventListener('dragover', p.innerDragOver);
            (appendEl || el).removeEventListener('dragenter', p.innerDragEnter);
            (appendEl || el).removeEventListener('dragleave', p.innerDragLeave);
            (appendEl || el).removeEventListener('drop', p.innerDragDrop);

            p.innerDragLeave();
        };

        p.globalDrop = _event => {
            setTimeout(p.endGlobalDrag, 0);
        };

        window.addEventListener('dragover', p.allowGlobalDrag);
        window.addEventListener('dragenter', p.startGlobalDrag);
        window.addEventListener('dragleave', p.endGlobalDrag);
        window.addEventListener('drop', p.globalDrop);
    }

    destroy() {
        const p = this._p;
        if (!p || !p.el) return;

        window.removeEventListener('dragover', p.allowGlobalDrag);
        window.removeEventListener('dragenter', p.startGlobalDrag);
        window.removeEventListener('dragleave', p.endGlobalDrag);
        window.removeEventListener('drop', p.globalDrop);

        p.endGlobalDrag();

        this.p = null;
    }
}

export default DropZone;
