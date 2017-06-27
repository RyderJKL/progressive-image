/**
 * Created by root on 17-6-27.
 */
class Progressive {
    constructor(option){
        this.el = option.el;
        this.lazyClass = option.lazyClass || 'lazy';
        this.removePreview = option.removePreview || false;
        this.Events = ['scroll','wheel','mousewheel','resize'];
        this.windowHasBind = false;
        this.Until = {
            throttle(fn,delay){
                let timeout = null;
                let lastRun = 0;

                return function () {
                    let now = + new Date() || new Date().now;
                    const elapsed = now -lastRun -delay;
                    const context = this;
                    const args = arguments;

                    if (elapsed >= 0) {
                        if (timeout) {
                            clearTimeout(timeout);
                            timeout = null;
                        }
                        lastRun = now;
                        fn.apply(context,args);
                    } else if (!timeout) {
                        timeout = setTimeout(function () {
                            timeout = null;
                            lastRun = now;
                            fn.apply(context,args)
                        },delay)
                    }
                }
            },

            on(el,type,handle){
                el.addEventListener(type,handle);
            },

            off(el,type,handle){
                el.removeEventListener(type,handle)
            },

        }
        this.lazy = this.Until.throttle(()=> {
            this.fire()
        },300)
        this.animationEvent = this.getAnimationEvent();
    }


    getAnimationEvent() {
        const el = document.createElement("fake");
        const animations = {
            "animation"      : "animationend",
            "OAnimation"     : "oAnimationEnd",
            "MozAnimation"   : "animationend",
            "WebkitAnimation": "webkitAnimationEnd"
        }

        for (let a in animations) {
            if(el.style[a] !== undefined) {
                return animations[a];
            }
        }
    }

    fire(){
        if(!this.windowHasBind){
            this.windowHasBind = true;
            this.events(window,true)
        }

        const lazys = document.querySelectorAll(`${this.el} img.${this.lazyClass}`);
        const len = lazys.length;
        if(len > 0) {
            Array.from(lazys).map(item=>{
                const rect = item.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0 && rect.left <window.innerWidth && rect.right > 0) {
                    console.log(item)
                    this.loadImage(item);
                }
            })
        } else {
            this.windowHasBind = false;
            this.events(window,false);
        }
    }

    loadImage(item){
        const img = new Image();
        if(item.dataset){
            item.dataset.srcset && (img.srcset = item.dataset.srcset);
            item.dataset.sizes && (img.sizes = item.dataset.sizes);
        }
        img.src = item.dataset.src;
        img.className = 'origin';
        item.classList.remove(`${this.lazyClass}`)
        img.onload = _ => this.mountImage(item, img)
        img.onerror = function () {
            item.classList.add(`${this.lazyClass}`)
        }
    }

    fuck(){
        console.log('fuck')
    }
    mountImage(preview, img) {

        const parent = preview.parentNode;
        parent.appendChild(img).addEventListener(this.animationEvent,e => {
            e.target.alt = preview.alt || '图片'
            preview.classList.add('hide');
            if(this.removePreview){
                console.log("remove")
                e.target.classList.remove('origin')
                parent.removeChild(preview)
            }

        })
    }

    events(el,bind){
        if(bind) {
            this.Events.forEach(type=>{
                this.Until.on(el,type,this.lazy);
            })
        } else {
            this.Events.forEach(type=>{
                this.Until.off(el,type,this.lazy)
            })
        }
    }
}

if (typeof exports !== 'undefined') {
    // 提供 CommonJS 和 Node.js 接口
    if (typeof module !== 'undefined' && module.exports)
    {
        // Support Node.js specific `module.exports` (which can be a function)
        exports = module.exports = Progressive
    }
    //  But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
    exports.Progressive = Progressive
} else if (typeof define === 'function' && define.amd)
    // 提供 AMD 接口
    define('Progressive', [], function() {
        return Progressive
    })
else
    // 提供原生 js 接口
    this.Progressive = Progressive