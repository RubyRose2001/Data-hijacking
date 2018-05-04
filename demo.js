

; (function (window){
  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  }

  function isArray(arr) {
    return arr instanceof Array;
  }

  function def (obj, key, value, enumerable) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  }

  var arrayProto = Array.prototype;
  var arrayMethods = Object.create(arrayProto);
  const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse',
  ];
  methodsToPatch.forEach(function (method){
    var original = arrayProto[method];
    def(arrayMethods, method, function mutator() {
      var args = [], len = arguments.length;
      while (len--) {
        args[len] = arguments[len];
      };
      var ob = this.__ob__;
      var result = original.apply(this, args); 
      var re;
      switch (method) {
        case 'push':
        case 'unshift':
          re = args;
          break;
        case 'splice':
          re = args.slice(2);
          break;
      }
      if (re) ob.observeArray(re);
      return result;
    });
  })

  var result = Object.getOwnPropertyNames(arrayMethods);
  var pro = '__proto__' in Object;
  var Observer = function Observer(obj) {
    def(obj, '__ob__', this);
    if (isArray(obj)) { // 数组
      var augment = pro
        ? argmeArray
        : null
      argmeArray(obj, arrayMethods);
      this.observeArray(obj);
    } else {
      this.walk(obj);
    }
  }

  function argmeArray(arr, src) {
    arr.__proto__ = src;
  }

  Observer.prototype.walk = function (obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }

  Observer.prototype.observeArray = function(arr) {
    for (var i = 0, l = arr.length; i < l; i++) {
      observe(arr[i]);
    }
  }

  function defineReactive(obj, key, val) {
    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {  //禁止修改值
      return
    }
    var getter = property && property.get;
    if (!getter && arguments.length === 2) {
      val = obj[key];
    }
    var setter = property && property.set;
    if (isObject(val)) observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function () {
        var value = getter ? getter.call(obj) : val;
        return value;
      },
      set: function reactiveSetter (newVal) {
        console.log(110);        
        if (setter) {
          setter.call(obj, newVal)
        } else {
          val = newVal;
        }
      }
    })
  }

  function observe(val) {
    // 非对象
    if (!isObject(val)) {
      return;
    }
    new Observer(val)
  }

  function render(el, html) {
    var htmlKeys = Object.keys(html)
    console.log(el, htmlKeys);
  }
  var Vue = function Vue(options) {
    this._data = options.data();
    this._created = options.created
    this.el = document.querySelector(options.el);
    this.html = options.components;
    var dataDef = {};
    dataDef.get = function () { return this._data };
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    observe(this._data);
    this._created();
    render(this.el, this.html);
  };
  window.Vue = Vue;
})(window)
