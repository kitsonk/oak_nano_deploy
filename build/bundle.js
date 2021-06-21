const tick = typeof Promise == 'function' ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;
const removeAllChildNodes = (parent)=>{
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
};
const strToHash = (s)=>{
    let hash = 0;
    for(let i = 0; i < s.length; i++){
        const chr = s.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return Math.abs(hash).toString(32);
};
const appendChildren = (element, children)=>{
    if (!Array.isArray(children)) {
        appendChildren(element, [
            children
        ]);
        return;
    }
    if (typeof children === 'object') children = Array.prototype.slice.call(children);
    children.forEach((child)=>{
        if (Array.isArray(child)) appendChildren(element, child);
        else {
            let c = _render(child);
            if (typeof c !== 'undefined') {
                if (Array.isArray(c)) appendChildren(element, c);
                else element.appendChild(c.nodeType == null ? document.createTextNode(c.toString()) : c);
            }
        }
    });
};
const SVG = (props)=>{
    const child = props.children[0];
    const attrs = child.attributes;
    const svg = hNS('svg');
    for(let i = attrs.length - 1; i >= 0; i--){
        svg.setAttribute(attrs[i].name, attrs[i].value);
    }
    svg.innerHTML = child.innerHTML;
    return svg;
};
const hydrate = (component, parent = null, removeChildNodes = true)=>{
    return render(component, parent, removeChildNodes);
};
const render = (component, parent = null, removeChildNodes = true)=>{
    let el = _render(component);
    if (Array.isArray(el)) {
        el = el.map((e)=>_render(e)
        );
        if (el.length === 1) el = el[0];
    }
    if (!!parent) {
        if (removeChildNodes) removeAllChildNodes(parent);
        if (el && parent.id && parent.id === el.id && parent.parentElement) {
            parent.parentElement.replaceChild(el, parent);
        } else {
            if (Array.isArray(el)) el.forEach((e)=>{
                appendChildren(parent, _render(e));
            });
            else appendChildren(parent, _render(el));
        }
        if (parent.ssr) return parent.ssr;
        return parent;
    } else {
        if (typeof isSSR === 'boolean' && isSSR === true && !Array.isArray(el)) return [
            el
        ];
        return el;
    }
};
const _render = (comp)=>{
    if (typeof comp === 'undefined') return [];
    if (comp == null) return [];
    if (typeof comp === 'string') return comp;
    if (typeof comp === 'number') return comp.toString();
    if (comp.tagName && comp.tagName.toLowerCase() === 'svg') return SVG({
        children: [
            comp
        ]
    });
    if (comp.tagName) return comp;
    if (comp && comp.component && comp.component.prototype && comp.component.prototype.constructor && /^class\s/.test(Function.prototype.toString.call(comp.component))) return renderClassComponent(comp);
    if (comp.component && typeof comp.component === 'function') return renderFunctionalComponent(comp);
    if (Array.isArray(comp)) return comp.map((c)=>_render(c)
    ).flat();
    if (typeof comp === 'function') return _render(comp());
    if (comp.component && comp.component.tagName && typeof comp.component.tagName === 'string') return _render(comp.component);
    if (Array.isArray(comp.component)) return _render(comp.component);
    if (comp.component) return _render(comp.component);
    if (typeof comp === 'object') return [];
    console.warn('Something unexpected happened with:', comp);
};
const renderFunctionalComponent = (fncComp)=>{
    const { component , props  } = fncComp;
    let el = component(props);
    return _render(el);
};
const renderClassComponent = (classComp)=>{
    const { component , props  } = classComp;
    const hash = strToHash(component.toString());
    component.prototype._getHash = ()=>hash
    ;
    const Component = new component(props);
    Component.willMount();
    let el = Component.render();
    el = _render(el);
    Component.elements = el;
    if (props && props.ref) props.ref(Component);
    if (typeof isSSR === 'undefined') tick(()=>{
        Component._didMount();
    });
    return el;
};
const renderComponent = (_component)=>{
    console.warn('DEPRECATED: renderComponent() is deprecated, use _render() instead!');
};
const hNS = (tag)=>document.createElementNS('http://www.w3.org/2000/svg', tag)
;
const h = (tagNameOrComponent, props, ...children)=>{
    if (typeof tagNameOrComponent !== 'string') return {
        component: tagNameOrComponent,
        props: {
            ...props,
            children: children
        }
    };
    let ref;
    const element = tagNameOrComponent === 'svg' ? hNS('svg') : document.createElement(tagNameOrComponent);
    const isEvent = (el, p)=>{
        if (0 !== p.indexOf('on')) return false;
        if (el.ssr) return true;
        return typeof el[p] === 'object' || typeof el[p] === 'function';
    };
    for(const p in props){
        if (p === 'style' && typeof props[p] === 'object') {
            const styles = Object.keys(props[p]).map((k)=>`${k}:${props[p][k]}`
            ).join(';').replace(/[A-Z]/g, (match)=>`-${match.toLowerCase()}`
            );
            props[p] = styles + ';';
        }
        if (p === 'ref') ref = props[p];
        else if (isEvent(element, p.toLowerCase())) element.addEventListener(p.toLowerCase().substring(2), (e)=>props[p](e)
        );
        else if (/className/i.test(p)) console.warn('You can use "class" instead of "className".');
        else element.setAttribute(p, props[p]);
    }
    appendChildren(element, children);
    if (ref) ref(element);
    if (element.ssr) return element.ssr;
    return element;
};
const VERSION = '0.0.18';
const nodeToString = (node)=>{
    const tmpNode = document.createElement('div');
    tmpNode.appendChild(node.cloneNode(true));
    return tmpNode.innerHTML;
};
const isDescendant = (desc, root)=>{
    return !!desc && (desc === root || isDescendant(desc.parentNode, root));
};
const onNodeRemove = (element, callback)=>{
    let observer = new MutationObserver((mutationsList)=>{
        mutationsList.forEach((mutation)=>{
            mutation.removedNodes.forEach((removed)=>{
                if (isDescendant(element, removed)) {
                    callback();
                    if (observer) {
                        observer.disconnect();
                        observer = undefined;
                    }
                }
            });
        });
    });
    observer.observe(document, {
        childList: true,
        subtree: true
    });
    return observer;
};
const printVersion = ()=>{
    const info = `Powered by nano JSX v${VERSION}`;
    console.log(`%c %c %c %c %c ${info} %c http://nanojsx.io`, 'background: #ff0000', 'background: #ffff00', 'background: #00ff00', 'background: #00ffff', 'color: #fff; background: #000000;', 'background: none');
};
const _state = new Map();
const _clearState = ()=>{
    _state.clear();
};
class Component {
    props;
    id;
    _elements = [];
    _skipUnmount = false;
    _hasUnmounted = false;
    constructor(props){
        this.props = props || {
        };
        this.id = this._getHash();
    }
    setState(state, shouldUpdate = false) {
        const isObject = typeof state === 'object' && state !== null;
        if (isObject && this.state !== undefined) this.state = {
            ...this.state,
            ...state
        };
        else this.state = state;
        if (shouldUpdate) this.update();
    }
    set state(state) {
        _state.set(this.id, state);
    }
    get state() {
        return _state.get(this.id);
    }
    set initState(state) {
        if (this.state === undefined) this.state = state;
    }
    get elements() {
        return this._elements;
    }
    set elements(elements) {
        if (!Array.isArray(elements)) elements = [
            elements
        ];
        elements.forEach((element)=>{
            this._elements.push(element);
        });
    }
    _addNodeRemoveListener() {
        if (/^[^{]+{\s+}$/gm.test(this.didUnmount.toString())) return;
        onNodeRemove(this.elements[0], ()=>{
            if (!this._skipUnmount) this._didUnmount();
        });
    }
    _didMount() {
        this._addNodeRemoveListener();
        this.didMount();
    }
    _didUnmount() {
        if (this._hasUnmounted) return;
        this.didUnmount();
        this._hasUnmounted = true;
    }
    willMount() {
    }
    didMount() {
    }
    didUnmount() {
    }
    render(_update) {
    }
    update(update) {
        this._skipUnmount = true;
        const oldElements = [
            ...this.elements
        ];
        this._elements = [];
        let el = this.render(update);
        el = _render(el);
        this.elements = el;
        const parent = oldElements[0].parentElement;
        if (!parent) console.warn('Component needs a parent element to get updated!');
        this.elements.forEach((child)=>{
            parent.insertBefore(child, oldElements[0]);
        });
        oldElements.forEach((child)=>{
            child.remove();
            child = null;
        });
        this._addNodeRemoveListener();
        tick(()=>{
            this._skipUnmount = false;
            if (!this.elements[0].isConnected) this._didUnmount();
        });
    }
    _getHash() {
    }
}
class Comments extends Component {
    render() {
        return h("ul", null, this.props.comments.map((comment)=>h("li", null, comment)
        ));
    }
}
const comments = [
    "client side comment one",
    "client side comment two"
];
function start() {
    hydrate(h(Comments, {
        comments: comments
    }), document.getElementById("comments"));
}
addEventListener("load", ()=>start()
);

//# sourceMappingURL=./bundle.js.map